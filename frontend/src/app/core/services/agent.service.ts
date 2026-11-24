import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AgentChatRequestDto,
  AgentMessageDto,
  AgentStructuredReplyDto,
  ProjectDraftState,
} from '../../shared/models/agent';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:7036/api/Agent';

  private readonly pendingDraftSignal = signal<ProjectDraftState | null>(null);
  readonly pendingDraft = this.pendingDraftSignal.asReadonly();

  getCurrentConversation(): Observable<AgentMessageDto[]> {
    return this.http.get<AgentMessageDto[]>(`${this.baseUrl}/current`);
  }

  sendMessage(request: AgentChatRequestDto): Observable<AgentStructuredReplyDto> {
    return this.http.post<AgentStructuredReplyDto>(`${this.baseUrl}/chat`, request);
  }

  clearCurrentConversation(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/current`);
  }

  setPendingDraft(draft: ProjectDraftState): void {
    this.pendingDraftSignal.set(draft);
  }

  consumePendingDraft(): ProjectDraftState | null {
    const draft = this.pendingDraftSignal();
    this.pendingDraftSignal.set(null);
    return draft;
  }
}