using System.Text;
using System.Text.Json;
using EnthCollab.Api.Dtos;
using EnthCollab.Data;
using EnthCollab.Data.Constants;
using EnthCollab.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnthCollab.Api.Services;

public interface IAgentService
{
    Task<List<AgentMessageDto>> GetCurrentConversationAsync(int userId, CancellationToken ct = default);
    Task<AgentStructuredReplyDto> ChatAsync(int userId, AgentChatRequestDto request, CancellationToken ct = default);
    Task ClearCurrentConversationAsync(int userId, CancellationToken ct = default);
}

public class GeminiAgentService(
    IHttpClientFactory httpClientFactory,
    IConfiguration config,
    EnthCollabDbContext db,
    ILogger<GeminiAgentService> logger) : IAgentService
{
    private const int MaxStoredMessages = 200;
    private const int GeminiContextWindow = 16;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task<List<AgentMessageDto>> GetCurrentConversationAsync(int userId, CancellationToken ct = default)
    {
        var conversation = await db.AgentConversations
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.UserId == userId, ct);

        if (conversation is null)
        {
            return [];
        }

        var entities = await db.AgentMessages
            .AsNoTracking()
            .Where(m => m.ConversationId == conversation.Id)
            .OrderByDescending(m => m.CreatedAt)
            .ThenByDescending(m => m.Id)
            .Take(MaxStoredMessages)
            .ToListAsync(ct);

        entities.Reverse();

        return entities.Select(m => new AgentMessageDto
        {
            Id = m.Id,
            Role = m.Role,
            Content = m.Content,
            StructuredData = TryDeserializeStructured(m.StructuredPayloadJson),
            CreatedAt = m.CreatedAt
        }).ToList();
    }

    public async Task ClearCurrentConversationAsync(int userId, CancellationToken ct = default)
    {
        await db.AgentConversations
            .Where(c => c.UserId == userId)
            .ExecuteDeleteAsync(ct);
    }

    public async Task<AgentStructuredReplyDto> ChatAsync(
        int userId,
        AgentChatRequestDto request,
        CancellationToken ct = default)
    {
        var apiKey = config["Gemini:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException("Gemini:ApiKey is not configured. Set it via dotnet user-secrets.");
        }
            

        var model = config["Gemini:Model"] ?? "gemini-3.5-flash-lite";
        var trimmedPrompt = request.Message.Trim();

        // 1. Load or create the single persistent conversation for this user
        var conversation = await db.AgentConversations
            .FirstOrDefaultAsync(c => c.UserId == userId, ct);

        if (conversation is null)
        {
            conversation = new AgentConversation
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.AgentConversations.Add(conversation);
            await db.SaveChangesAsync(ct);
        }

        // 2. Load the latest 16 messages for Gemini's sliding context window
        var recentHistory = await db.AgentMessages
            .AsNoTracking()
            .Where(m => m.ConversationId == conversation.Id)
            .OrderByDescending(m => m.CreatedAt)
            .ThenByDescending(m => m.Id)
            .Take(GeminiContextWindow)
            .ToListAsync(ct);

        recentHistory.Reverse();

        // 3. Query database context: current user, valid tags, candidate open projects & members
        var currentUser = await db.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new
            {
                u.Username,
                u.Bio,
                Tags = u.Tags.Select(t => t.Name).ToList()
            })
            .FirstOrDefaultAsync(ct);

        var availableTags = await db.Tags
            .AsNoTracking()
            .OrderBy(t => t.Name)
            .Select(t => t.Name)
            .ToListAsync(ct);

        var userTagSet = currentUser?.Tags.ToHashSet(StringComparer.OrdinalIgnoreCase) ?? [];

        var rawProjects = await db.Projects
            .AsNoTracking()
            .Where(p => p.Visibility == ProjectVisibility.Public &&
                        p.Status == ProjectStatus.WIP &&
                        p.CreatedByUserId != userId)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Description,
                Tags = p.Tags.Select(t => t.Name).ToList()
            })
            .Take(60)
            .ToListAsync(ct);

        var candidateProjects = rawProjects
            .OrderByDescending(p => p.Tags.Count(t => userTagSet.Contains(t)))
            .ThenByDescending(p => p.Id)
            .Take(20)
            .ToList();

        var candidateUsers = await db.Users
            .AsNoTracking()
            .Where(u => u.Id != userId)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Bio,
                Tags = u.Tags.Select(t => t.Name).ToList()
            })
            .Take(25)
            .ToListAsync(ct);

        // 4. Optional project/draft context
        var projectContext = await BuildProjectContextAsync(request, ct);

        // 5. Assemble Gemini payload (systemInstruction + contents + JSON responseSchema)
        var systemInstruction = BuildSystemInstruction(
            currentUser?.Username,
            currentUser?.Bio,
            currentUser?.Tags ?? [],
            availableTags,
            candidateProjects.Select(p => (p.Id, p.Name, p.Description, p.Tags)),
            candidateUsers.Select(u => (u.Id, u.Username, u.Bio, u.Tags)));

        var contents = new List<object>();

        if (!string.IsNullOrWhiteSpace(projectContext))
        {
            contents.Add(new
            {
                role = "user",
                parts = new[] { new { text = projectContext } }
            });
            contents.Add(new
            {
                role = "model",
                parts = new[]
                {
                    new
                    {
                        text = "{\"reply\":\"Active project context loaded.\",\"suggestedTags\":[],\"suggestedTickets\":[],\"recommendedProjects\":[],\"recommendedUsers\":[]}"
                    }
                }
            });
        }

        foreach (var turn in recentHistory)
        {
            var geminiRole = turn.Role == AgentMessageRoles.Agent ? "model" : "user";
            contents.Add(new
            {
                role = geminiRole,
                parts = new[] { new { text = turn.Content } }
            });
        }

        contents.Add(new
        {
            role = "user",
            parts = new[] { new { text = trimmedPrompt } }
        });

        var payload = new
        {
            systemInstruction = new
            {
                parts = new[] { new { text = systemInstruction } }
            },
            contents,
            generationConfig = new
            {
                responseMimeType = "application/json",
                responseSchema = BuildResponseSchema()
            }
        };

        // 6. Send to Gemini and validate returned IDs & tags against DB
        var structuredReply = await SendToGeminiAsync(apiKey, model, payload, ct);

        var validProjectsById = candidateProjects.ToDictionary(p => p.Id);
        structuredReply.RecommendedProjects = structuredReply.RecommendedProjects
            .Where(rp => validProjectsById.ContainsKey(rp.ProjectId))
            .Select(rp => new RecommendedProjectDto
            {
                ProjectId = rp.ProjectId,
                Name = validProjectsById[rp.ProjectId].Name,
                Reason = rp.Reason
            })
            .ToList();

        var validUsersById = candidateUsers.ToDictionary(u => u.Id);
        structuredReply.RecommendedUsers = structuredReply.RecommendedUsers
            .Where(ru => validUsersById.ContainsKey(ru.UserId))
            .Select(ru => new RecommendedUserDto
            {
                UserId = ru.UserId,
                Username = validUsersById[ru.UserId].Username,
                Reason = ru.Reason
            })
            .ToList();

        var validTagLookup = availableTags.ToDictionary(t => t, StringComparer.OrdinalIgnoreCase);
        structuredReply.SuggestedTags = structuredReply.SuggestedTags
            .Where(t => validTagLookup.ContainsKey(t))
            .Select(t => validTagLookup[t])
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        // 7. Save User & Agent messages and enforce 200-message PostgreSQL cap
        var now = DateTime.UtcNow;
        db.AgentMessages.AddRange(
            new AgentMessage
            {
                ConversationId = conversation.Id,
                Role = AgentMessageRoles.User,
                Content = trimmedPrompt,
                CreatedAt = now
            },
            new AgentMessage
            {
                ConversationId = conversation.Id,
                Role = AgentMessageRoles.Agent,
                Content = structuredReply.Reply,
                StructuredPayloadJson = JsonSerializer.Serialize(structuredReply),
                CreatedAt = now.AddMilliseconds(1)
            });

        conversation.UpdatedAt = now;
        await db.SaveChangesAsync(ct);

        await EnforceMessageCapAsync(conversation.Id, ct);

        return structuredReply;
    }

    private async Task<string?> BuildProjectContextAsync(AgentChatRequestDto request, CancellationToken ct)
    {
        if (request.ProjectId.HasValue)
        {
            var proj = await db.Projects
                .AsNoTracking()
                .Where(p => p.Id == request.ProjectId.Value)
                .Select(p => new
                {
                    p.Name,
                    p.Description,
                    p.Hazard,
                    p.EstimatedDuration,
                    Status = p.Status.ToString(),
                    Tags = p.Tags.Select(t => t.Name).ToList()
                })
                .FirstOrDefaultAsync(ct);

            if (proj is not null)
            {
                return $"Active Existing Project Context: Name='{proj.Name}', Status='{proj.Status}', " +
                       $"EstimatedDuration='{proj.EstimatedDuration}', Tags=[{string.Join(", ", proj.Tags)}], " +
                       $"Description='{proj.Description}', Hazard='{proj.Hazard}'.";
            }
        }

        if (!string.IsNullOrWhiteSpace(request.CurrentTitle) ||
            !string.IsNullOrWhiteSpace(request.CurrentDescription) ||
            !string.IsNullOrWhiteSpace(request.CurrentHazard) ||
            request.CurrentTags.Count > 0)
        {
            return $"Active Draft Project Context: Name='{request.CurrentTitle}', " +
                   $"Tags=[{string.Join(", ", request.CurrentTags)}], " +
                   $"Description='{request.CurrentDescription}', Hazard='{request.CurrentHazard}'.";
        }

        return null;
    }

    private static string BuildSystemInstruction(
        string? username,
        string? bio,
        List<string> userTags,
        List<string> availableTags,
        IEnumerable<(int Id, string Name, string Description, List<string> Tags)> projects,
        IEnumerable<(int Id, string Username, string? Bio, List<string> Tags)> users)
    {
        var sb = new StringBuilder();
        sb.AppendLine("You are the EnthCollab AI Assistant for programming and electronics hobbyist projects.");
        sb.AppendLine("Help users brainstorm feasible project ideas, draft structured descriptions, identify technical/safety hazards, estimate realistic durations as readable text (e.g., '2-3 weeks', '~10 days'), suggest actionable tickets, and recommend matching projects or collaborators.");
        sb.AppendLine("Rules:");
        sb.AppendLine("- Respond strictly in JSON matching the provided schema.");
        sb.AppendLine("- Only populate suggestedName, suggestedDescription, suggestedHazard, estimatedDuration, suggestedTags, or suggestedTickets when drafting or refining a project.");
        sb.AppendLine("- Only choose suggestedTags from Available Platform Tags.");
        sb.AppendLine("- Only populate recommendedProjects or recommendedUsers when asked to discover projects or collaborators, using ONLY IDs from the provided lists.");
        sb.AppendLine();
        sb.AppendLine($"Current User: Username='{username ?? "Member"}', Tags=[{string.Join(", ", userTags)}], Bio='{Truncate(bio, 200)}'");
        sb.AppendLine($"Available Platform Tags: [{string.Join(", ", availableTags)}]");
        sb.AppendLine();
        sb.AppendLine("Candidate Open Projects:");
        foreach (var p in projects)
        {
            sb.AppendLine($"- ID={p.Id} | Name='{p.Name}' | Tags=[{string.Join(", ", p.Tags)}] | Desc='{Truncate(p.Description, 180)}'");
        }
        sb.AppendLine();
        sb.AppendLine("Candidate Platform Members:");
        foreach (var u in users)
        {
            sb.AppendLine($"- ID={u.Id} | Username='{u.Username}' | Tags=[{string.Join(", ", u.Tags)}] | Bio='{Truncate(u.Bio, 150)}'");
        }

        return sb.ToString();
    }

    private static object BuildResponseSchema() => new
    {
        type = "OBJECT",
        properties = new
        {
            reply = new { type = "STRING" },
            suggestedName = new { type = "STRING", nullable = true },
            suggestedDescription = new { type = "STRING", nullable = true },
            suggestedHazard = new { type = "STRING", nullable = true },
            estimatedDuration = new { type = "STRING", nullable = true },
            suggestedTags = new
            {
                type = "ARRAY",
                items = new { type = "STRING" }
            },
            suggestedTickets = new
            {
                type = "ARRAY",
                items = new
                {
                    type = "OBJECT",
                    properties = new
                    {
                        title = new { type = "STRING" },
                        description = new { type = "STRING" },
                        difficulty = new { type = "STRING" }
                    },
                    required = new[] { "title", "description", "difficulty" }
                }
            },
            recommendedProjects = new
            {
                type = "ARRAY",
                items = new
                {
                    type = "OBJECT",
                    properties = new
                    {
                        projectId = new { type = "INTEGER" },
                        name = new { type = "STRING" },
                        reason = new { type = "STRING" }
                    },
                    required = new[] { "projectId", "name", "reason" }
                }
            },
            recommendedUsers = new
            {
                type = "ARRAY",
                items = new
                {
                    type = "OBJECT",
                    properties = new
                    {
                        userId = new { type = "INTEGER" },
                        username = new { type = "STRING" },
                        reason = new { type = "STRING" }
                    },
                    required = new[] { "userId", "username", "reason" }
                }
            }
        },
        required = new[]
        {
            "reply",
            "suggestedTags",
            "suggestedTickets",
            "recommendedProjects",
            "recommendedUsers"
        }
    };

    private async Task<AgentStructuredReplyDto> SendToGeminiAsync(
        string apiKey,
        string model,
        object payload,
        CancellationToken ct)
    {
        var client = httpClientFactory.CreateClient();
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent";

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, url);
        httpRequest.Headers.Add("x-goog-api-key", apiKey);
        httpRequest.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        using var response = await client.SendAsync(httpRequest, ct);
        var rawBody = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)  
        {
            logger.LogWarning("Gemini API returned {StatusCode}: {Body}", response.StatusCode, rawBody);
            throw new HttpRequestException(
                $"Gemini API request failed with status {(int)response.StatusCode}.",
                null,
                response.StatusCode);
        }

        using var doc = JsonDocument.Parse(rawBody);
        var structuredJsonText = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        if (string.IsNullOrWhiteSpace(structuredJsonText))
            return new AgentStructuredReplyDto { Reply = "No structured response was returned." };

        return JsonSerializer.Deserialize<AgentStructuredReplyDto>(structuredJsonText, JsonOptions)
               ?? new AgentStructuredReplyDto { Reply = structuredJsonText };
    }

    private async Task EnforceMessageCapAsync(int conversationId, CancellationToken ct)
    {
        var staleIds = await db.AgentMessages
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.CreatedAt)
            .ThenByDescending(m => m.Id)
            .Skip(MaxStoredMessages)
            .Select(m => m.Id)
            .ToListAsync(ct);

        if (staleIds.Count > 0)
        {
            await db.AgentMessages
                .Where(m => staleIds.Contains(m.Id))
                .ExecuteDeleteAsync(ct);
        }
    }

    private static AgentStructuredReplyDto? TryDeserializeStructured(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return null;

        try
        {
            return JsonSerializer.Deserialize<AgentStructuredReplyDto>(json, JsonOptions);
        }
        catch
        {
            return null;
        }
    }

    private static string Truncate(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
            return string.Empty;

        var clean = value.Replace('\n', ' ').Replace('\r', ' ').Trim();
        return clean.Length <= maxLength ? clean : $"{clean[..maxLength]}...";
    }
}