import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Tag } from '../../shared/models/tag';
import { ProjectStatus, ProjectVisibility } from '../../shared/models/project';
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideUpload,
  LucideAlertTriangle,
  LucidePlus,
  LucideX
} from '@lucide/angular';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-create-project',
  imports: [
    CommonModule,
    FormsModule,
    LucideChevronLeft,
    LucideChevronRight,
    LucideUpload,
    LucideAlertTriangle,
    LucidePlus,
    LucideX
  ],
  templateUrl: './create-project.html',
  styleUrl: './create-project.css',
})
export class CreateProject implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  projectName = '';
  projectStatus = ProjectStatus.WIP;
  projectVisibility = ProjectVisibility.Public;
  description = '';
  hazard = '';

  readonly statusOptions = [
    { label: 'Work In Progress', value: ProjectStatus.WIP },
    { label: 'Finished', value: ProjectStatus.Finished },
    { label: 'Frozen', value: ProjectStatus.Frozen },
    { label: 'Cancelled', value: ProjectStatus.Cancelled },
  ];

  readonly visibilityOptions = [
    { label: 'Public', value: ProjectVisibility.Public },
    { label: 'Private', value: ProjectVisibility.Private },
  ];

  // Use a signal so the template reacts immediately when data arrives from the API
  readonly allTags = signal<Tag[]>([]);
  selectedTagIds: number[] = [];

  ngOnInit() {
    this.fetchTags();
  }

  fetchTags() {
    this.http.get<Tag[]>('https://localhost:7036/api/Tags').subscribe({
      next: (tags) => {
        console.log('Tags fetched successfully:', tags);
        this.allTags.set(tags);
      },
      error: (err) => {
        console.error('Failed to load tags from backend. Check CORS or backend URL.', err);
      }
    });
  }

  get availableTags(): Tag[] {
    return this.allTags().filter(tag => !this.selectedTagIds.includes(tag.id));
  }

  getTagName(id: number): string {
    const tag = this.allTags().find(t => t.id === id);
    return tag ? tag.name : '';
  }

  addTag(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const tagId = Number(selectElement.value);

    if (tagId && !this.selectedTagIds.includes(tagId)) {
      this.selectedTagIds.push(tagId);
      selectElement.value = '';
    }
  }

  removeTag(tagIdToRemove: number) {
    this.selectedTagIds = this.selectedTagIds.filter(id => id !== tagIdToRemove);
  }

  clearTags() {
    this.selectedTagIds = [];
  }

  onSubmit() {
    const payload = {
      name: this.projectName,
      status: this.projectStatus,
      visibility: this.projectVisibility,
      description: this.description,
      hazard: this.hazard,
      tagIds: this.selectedTagIds
    };

    this.http.post('https://localhost:7036/api/Projects', payload).subscribe({
      next: (response) => {
        console.log('Project created successfully!', response);
        this.router.navigate(['/projects']);
      },
      error: (err) => {
        console.error('Error creating project:', err);
        alert(err.error?.title || 'Failed to create project.');
      }
    });
  }
}
