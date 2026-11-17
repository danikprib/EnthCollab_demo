import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tag } from '../../shared/models/tag';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7036/api/Tags';

  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(this.baseUrl);
  }
}