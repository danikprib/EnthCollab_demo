import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideBot,
  LucideSend,
  LucideTrash2,
  LucideSparkles,
  LucideArrowUpRight,
  LucideClock,
  LucideAlertTriangle,
  LucideCheckSquare,
  LucideFolderKanban,
  LucideUsers,
} from '@lucide/angular';
import { AgentService } from '../../core/services/agent.service';
import {
  AgentMessageDto,
  AgentStructuredReplyDto,
  ProjectDraftState,
} from '../../shared/models/agent';

@Component({
  selector: 'app-agent',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideBot,
    LucideSend,
    LucideTrash2,
    LucideSparkles,
    LucideArrowUpRight,
    LucideClock,
    LucideAlertTriangle,
    LucideCheckSquare,
    LucideFolderKanban,
    LucideUsers,
  ],
  templateUrl: './agent.html',
  styles: [],
})
export class Agent implements OnInit {
  private readonly agentService = inject(AgentService);
  private readonly router = inject(Router);


  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;

  readonly maxPromptLength = 5000;
  readonly messages = signal<AgentMessageDto[]>([]);
  readonly promptInput = signal('');
  readonly isLoadingHistory = signal(true);
  readonly isSending = signal(false);
  readonly isClearing = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly starterPrompts: string[] = [
    'Suggest a feasible hobbyist project idea based on my profile skills',
    'What open WIP projects on EnthCollab match my tags?',
    'Find open projects that match my tags',
    'Find users with matching skills for my projects',
    'Help me turn a rough idea into a full project plan',
    'Break down my project into actionable tickets and estimate duration',
    'What safety hazards or technical risks should I consider for my idea?',
  ];

  readonly isClearConfirmOpen = signal(false);

  openClearConfirm(): void {
    if (this.isClearing() || this.messages().length === 0) return;
    this.isClearConfirmOpen.set(true);
  }

  cancelClearConfirm(): void {
    this.isClearConfirmOpen.set(false);
  }

  confirmClearChat(): void {
    this.isClearConfirmOpen.set(false);
    this.clearChat();
  }


  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoadingHistory.set(true);
    this.errorMessage.set(null);

    this.agentService.getCurrentConversation().subscribe({
      next: (history) => {
        this.messages.set(history ?? []);
        this.isLoadingHistory.set(false);
        this.scrollToBottom();
      },
      error: () => {
        this.errorMessage.set('Could not load conversation history.');
        this.isLoadingHistory.set(false);
      },
    });
  }

  useStarterPrompt(prompt: string): void {
    if (this.isSending()) return;
    this.promptInput.set(prompt);
    this.sendMessage();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    const text = this.promptInput().trim();
    if (!text || this.isSending()) return;

    this.errorMessage.set(null);
    this.promptInput.set('');
    this.isSending.set(true);

    const optimisticUserMsg: AgentMessageDto = {
      role: 'User',
      content: text,
      createdAt: new Date().toISOString(),
    };
    this.messages.update((prev) => [...prev, optimisticUserMsg]);
    this.scrollToBottom();

    this.agentService.sendMessage({ message: text }).subscribe({
      next: (response) => {
        const agentMsg: AgentMessageDto = {
          role: 'Agent',
          content: response.reply,
          structuredData: response,
          createdAt: new Date().toISOString(),
        };
        this.messages.update((prev) => [...prev, agentMsg]);
        this.isSending.set(false);
        this.scrollToBottom();
      },
      error: (err) => {
        const fallback =
          err?.status === 429
            ? 'AI rate limit reached. Please wait a moment and try again.'
            : 'Failed to get a response from the AI assistant.';
        this.errorMessage.set(fallback);
        this.isSending.set(false);
      },
    });
  }

  clearChat(): void {
    if (this.isClearing() || this.messages().length === 0) return;

    this.isClearing.set(true);
    this.errorMessage.set(null);

    this.agentService.clearCurrentConversation().subscribe({
      next: () => {
        this.messages.set([]);
        this.isClearing.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to clear messages.');
        this.isClearing.set(false);
      },
    });
  }

  hasProjectDraft(data?: AgentStructuredReplyDto | null): boolean {
    if (!data) return false;
    return Boolean(
      data.suggestedName ||
      data.suggestedDescription ||
      data.suggestedHazard ||
      data.estimatedDuration ||
      data.suggestedTags?.length ||
      data.suggestedTickets?.length
    );
  }

  useInCreateProject(data: AgentStructuredReplyDto): void {
    const draft: ProjectDraftState = {
      name: data.suggestedName ?? '',
      description: data.suggestedDescription ?? '',
      hazard: data.suggestedHazard ?? '',
      estimatedDuration: data.estimatedDuration ?? '',
      tags: data.suggestedTags ?? [],
      tickets: data.suggestedTickets ?? [],
    };

    this.agentService.setPendingDraft(draft);
    this.router.navigate(['/create-project'], { state: { draft } });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.messagesContainer?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 30);
  }
}