import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {
  LucideSlidersHorizontal,
  LucideX
} from '@lucide/angular';
import { Tag } from '../../shared/models/tag';
import { User } from '../../shared/models/user';




@Component({
  selector: 'app-users',
  imports: [CommonModule,
    RouterLink,
    FormsModule,
    LucideSlidersHorizontal,
    LucideX,],
  templateUrl: './users.html',
  styleUrl: './users.css',
})

export class Users implements OnInit {
  private http = inject(HttpClient);

  readonly isFilterMobileOpen = signal<boolean>(false);

  readonly searchQuery = signal<string>('');

  readonly selectedTagNames = signal<Set<string>>(new Set());

  readonly activeFilterCount = computed(
    () => this.selectedTagNames().size
  );

  // Fetched from database
  readonly tagOptions = signal<Tag[]>([]);
  readonly users = signal<User[]>([]);

  ngOnInit(): void {
    this.fetchTags();
    this.fetchUsers();
  }

  fetchTags(): void {
    this.http.get<Tag[]>('https://localhost:7036/api/tags').subscribe({
      next: (tags) => this.tagOptions.set(tags),
      error: (err) => console.error('Failed to load tags:', err)
    });
  }

  fetchUsers(): void {
    this.http.get<User[]>('https://localhost:7036/api/Users').subscribe({
      next: (data) => this.users.set(data),
      error: (err) => console.error('Failed to load users:', err)
    });
  }

  readonly filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const activeTags = this.selectedTagNames();

    return this.users().filter((user: User) => {
      const bioText = (user.bio ?? '').toLowerCase();
      const userTags = user.tags ?? [];

      const matchesSearch =
        !query ||
        user.username.toLowerCase().includes(query) ||
        bioText.includes(query);

      const matchesTag =
        activeTags.size === 0 ||
        userTags.some((tagName) => activeTags.has(tagName));

      return matchesSearch && matchesTag;
    });
  });

  toggleMobileFilter(): void {
    this.isFilterMobileOpen.update((value) => !value);
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

  clearTagFilter(): void {
    this.selectedTagNames.set(new Set());
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  clearAllFilters(): void {
    this.clearTagFilter();
    this.clearSearch();
  }
}
