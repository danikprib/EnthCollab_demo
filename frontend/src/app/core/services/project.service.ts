import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, ProjectStatus, ProjectVisibility } from '../../shared/models/project';

export interface UpdateProjectPayload {
  name: string;
  description: string;
  status: ProjectStatus;
  visibility?: ProjectVisibility;
  hazard?: string;
  tagIds: number[];
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7036/api/Projects';

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseUrl);
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/${id}`);
  }

  getLikedProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/liked`);
  }

  getProjectsByUser(userId: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/user/${userId}`);
  }

  createProject(dto: unknown): Observable<Project> {
    return this.http.post<Project>(this.baseUrl, dto);
  }

  updateProject(id: number, dto: UpdateProjectPayload): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/${id}`, dto);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  likeProject(projectId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${projectId}/like`, {});
  }

  unlikeProject(projectId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${projectId}/like`);
  }
}