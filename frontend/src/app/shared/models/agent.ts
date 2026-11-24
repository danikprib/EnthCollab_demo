export type ChatMessageRole = 'User' | 'Agent';

export interface SuggestedTicketDto {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Advanced' | string;
}

export interface RecommendedProjectDto {
  projectId: number;
  name: string;
  reason: string;
}

export interface RecommendedUserDto {
  userId: number;
  username: string;
  reason: string;
}

export interface AgentStructuredReplyDto {
  reply: string;
  suggestedName?: string | null;
  suggestedDescription?: string | null;
  suggestedHazard?: string | null;
  estimatedDuration?: string | null;
  suggestedTags: string[];
  suggestedTickets: SuggestedTicketDto[];
  recommendedProjects: RecommendedProjectDto[];
  recommendedUsers: RecommendedUserDto[];
}

export interface AgentChatRequestDto {
  message: string;
  projectId?: number | null;
  currentTitle?: string | null;
  currentDescription?: string | null;
  currentHazard?: string | null;
  currentTags?: string[];
}

export interface AgentMessageDto {
  id?: number;
  role: ChatMessageRole;
  content: string;
  structuredData?: AgentStructuredReplyDto | null;
  createdAt?: string;
}

export interface ProjectDraftState {
  name: string;
  description: string;
  hazard: string;
  estimatedDuration: string;
  tags: string[];
  tickets: SuggestedTicketDto[];
}