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

type UserWithTagIds = User & { tagIds?: number[] };

@Component({
  selector: 'app-users',
  imports: [CommonModule, RouterLink, FormsModule, LucideSlidersHorizontal, LucideX],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  private http = inject(HttpClient);

  readonly isFilterMobileOpen = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly selectedTagNames = signal<Set<string>>(new Set());

  readonly activeFilterCount = computed(() => this.selectedTagNames().size);

  readonly tagOptions = signal<Tag[]>([]);
  readonly users = signal<UserWithTagIds[]>([]);

  ngOnInit(): void {
    this.fetchTags();
    this.fetchUsers();
  }

  fetchTags(): void {
    this.http.get<Tag[]>('https://localhost:7036/api/Tags').subscribe({
      next: (tags) => this.tagOptions.set(tags),
      error: (err) => console.error('Failed to load tags:', err)
    });
  }

  fetchUsers(): void {
    this.http.get<UserWithTagIds[]>('https://localhost:7036/api/Users').subscribe({
      next: (data) => this.users.set(data),
      error: (err) => console.error('Failed to load users:', err)
    });
  }

  getUserTagNames(user: UserWithTagIds): string[] {
    if (Array.isArray(user.tags) && user.tags.length > 0) {
      return user.tags;
    }

    if (Array.isArray(user.tagIds) && user.tagIds.length > 0) {
      const catalog = this.tagOptions();
      return user.tagIds
        .map((id) => catalog.find((t) => t.id === id)?.name)
        .filter((name): name is string => Boolean(name));
    }

    return [];
  }

  getFullName(user: UserWithTagIds): string {
    return [user.firstName?.trim(), user.lastName?.trim()].filter(Boolean).join(' ');
  }

  readonly filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const activeTags = this.selectedTagNames();

    return this.users().filter((user) => {
      const bioText = (user.bio ?? '').toLowerCase();
      const fullName = this.getFullName(user).toLowerCase();
      const userTags = this.getUserTagNames(user);

      const matchesSearch =
        !query ||
        user.username.toLowerCase().includes(query) ||
        String(user.id).includes(query) ||
        fullName.includes(query) ||
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