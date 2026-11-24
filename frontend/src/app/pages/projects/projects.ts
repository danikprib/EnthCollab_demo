import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {
  LucideCircleCheckBig,
  LucideCirclePause,
  LucideTriangle,
  LucideSquareX,
  LucideSlidersHorizontal,
  LucideX,
  LucideCirclePlus
} from '@lucide/angular';
import { ProjectSummary, ProjectStatus } from '../../shared/models/project';
import { Tag } from '../../shared/models/tag';


@Component({
  selector: 'app-projects',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    LucideCircleCheckBig,
    LucideCirclePause,
    LucideTriangle,
    LucideSquareX,
    LucideSlidersHorizontal,
    LucideX,
    LucideCirclePlus,
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects implements OnInit {
  private http = inject(HttpClient);

  readonly ProjectStatus = ProjectStatus;

  readonly isFilterMobileOpen = signal<boolean>(false);

  readonly searchQuery = signal<string>('');

  readonly selectedStatuses = signal<Set<ProjectStatus>>(new Set());
  readonly selectedTagNames = signal<Set<string>>(new Set());

  readonly activeFilterCount = computed(
    () => this.selectedStatuses().size + this.selectedTagNames().size
  );

  readonly statusOptions = [
    { label: 'Work In Progress', value: ProjectStatus.WIP },
    { label: 'Finished', value: ProjectStatus.Finished },
    { label: 'Frozen', value: ProjectStatus.Frozen },
    { label: 'Cancelled', value: ProjectStatus.Cancelled },
  ];

  // Fetched from database
  readonly tagOptions = signal<Tag[]>([]);
  readonly projects = signal<ProjectSummary[]>([]);

  ngOnInit(): void {
    this.fetchTags();
    this.fetchProjects();
  }

  fetchTags(): void {
    this.http.get<Tag[]>('https://localhost:7036/api/tags').subscribe({
      next: (tags) => this.tagOptions.set(tags),
      error: (err) => console.error('Failed to load tags:', err)
    });
  }

  fetchProjects(): void {
    this.http.get<ProjectSummary[]>('https://localhost:7036/api/Projects').subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.error('Failed to load projects:', err)
    });
  }

  readonly filteredProjects = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const activeStatuses = this.selectedStatuses();
    const activeTags = this.selectedTagNames();

    return this.projects().filter((project:ProjectSummary) => {

      const matchesSearch =
        !query ||
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query);

      const matchesStatus =
        activeStatuses.size === 0 || activeStatuses.has(project.status);

      const matchesTag =
        activeTags.size === 0 ||
        project.tags.some((tagName) => activeTags.has(tagName));

      return matchesSearch && matchesStatus && matchesTag;
    });
  });

  toggleMobileFilter(): void {
    this.isFilterMobileOpen.update((value) => !value);
  }

  toggleStatus(status: ProjectStatus): void {
    const current = new Set(this.selectedStatuses());
    if (current.has(status)) {
      current.delete(status);
    } else {
      current.add(status);
    }
    this.selectedStatuses.set(current);
  }

  toggleTag(tagName: string): void {
    const current = new Set(this.selectedTagNames());
    if (current.has(tagName)) {
      current.delete(tagName);
    } else {
      current.add(tagName);
    }
    this.selectedTagNames.set(current);
  }

  clearStatusFilter(): void {
    this.selectedStatuses.set(new Set());
  }

  clearTagFilter(): void {
    this.selectedTagNames.set(new Set());
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  clearAllFilters(): void {
    this.clearStatusFilter();
    this.clearTagFilter();
    this.clearSearch();
  }
}
