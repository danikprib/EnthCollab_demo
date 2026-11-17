import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../../shared/models/project';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7036/api/Projects';

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseUrl);
  }

  getProjectsByUser(userId: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/user/${userId}`);
  }

  createProject(dto: any): Observable<Project> {
    return this.http.post<Project>(this.baseUrl, dto);
  }
}