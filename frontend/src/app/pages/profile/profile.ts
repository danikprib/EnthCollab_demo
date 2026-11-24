import { Component, inject, OnInit, signal, computed } from '@angular/core';
import {
  LucideUser,
  LucideCircleUserRound,
  LucideTriangle,
  LucideCircleCheckBig,
  LucideCirclePause,
  LucideSquareX,
  LucideMail,
  LucideIdCard,
  LucideThumbsUp,
  LucideHeart,
  LucideMessagesSquare,
  LucideCalendar,
  LucideHammer,
  LucideCirclePlus,
  LucideCopy,
  LucideCheck
} from '@lucide/angular';
import { Project, ProjectStatus, ProjectVisibility } from '../../shared/models/project';
import { Tag } from '../../shared/models/tag';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { ProjectService } from '../../core/services/project.service';
import { User } from '../../shared/models/user';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    DatePipe,
    RouterLink,
    LucideUser,
    LucideCircleUserRound,
    LucideTriangle,
    LucideCircleCheckBig,
    LucideCirclePause,
    LucideSquareX,
    LucideMail,
    LucideIdCard,
    LucideThumbsUp,
    LucideHeart,
    LucideMessagesSquare,
    LucideCalendar,
    LucideHammer,
    LucideCirclePlus,
    LucideCopy,
    LucideCheck
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private projectService = inject(ProjectService);

  readonly profile = signal<User | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  readonly usernameInput = signal<string>('');
  readonly firstNameInput = signal<string>('');
  readonly lastNameInput = signal<string>('');
  readonly bioInput = signal<string>('');
  readonly isSaving = signal<boolean>(false);
  readonly saveSuccess = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);

  readonly allTags = signal<Tag[]>([]);
  selectedTagIds: number[] = [];

  readonly copiedKey = signal<'id' | 'username' | 'email' | 'identity' | null>(null);
  private copyTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly ProjectStatus = ProjectStatus;
  readonly ProjectVisibility = ProjectVisibility;
  activeTab = 'account';
  readonly projects = signal<Project[]>([]);

  // My Projects search, sort & filter state
  readonly projectSearchQuery = signal<string>('');
  readonly projectSortOrder = signal<'newest' | 'oldest'>('newest');
  readonly selectedProjectStatus = signal<string>('ALL');
  readonly selectedProjectVisibility = signal<string>('ALL');
  readonly selectedProjectTagNames = signal<Set<string>>(new Set());

  readonly projectStatusOptions = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'WIP', value: ProjectStatus.WIP },
    { label: 'Finished', value: ProjectStatus.Finished },
    { label: 'Frozen', value: ProjectStatus.Frozen },
    { label: 'Cancelled', value: ProjectStatus.Cancelled }
  ];

  readonly projectVisibilityOptions = [
    { label: 'All Visibilities', value: 'ALL' },
    { label: 'Public', value: ProjectVisibility?.Public ?? 'Public' },
    { label: 'Private', value: ProjectVisibility?.Private ?? 'Private' }
  ];

  readonly availableProjectTags = computed<string[]>(() => {
    const names = new Set<string>();
    for (const tag of this.allTags()) {
      if (tag?.name) names.add(tag.name);
    }
    for (const project of this.projects()) {
      for (const rawTag of project.tags ?? []) {
        const tagName = typeof rawTag === 'string' ? rawTag : rawTag?.name;
        if (tagName) names.add(tagName);
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  });

  readonly filteredProjects = computed<Project[]>(() => {
    const query = this.projectSearchQuery().trim().toLowerCase();
    const statusFilter = this.selectedProjectStatus();
    const visibilityFilter = this.selectedProjectVisibility();
    const activeTags = this.selectedProjectTagNames();
    const sortOrder = this.projectSortOrder();

    const matches = this.projects().filter((project) => {
      const nameMatch = !query || (project.name ?? '').toLowerCase().includes(query);

      const statusMatch =
        statusFilter === 'ALL' ||
        String(project.status ?? '').toLowerCase() === String(statusFilter).toLowerCase();

      const visibilityMatch =
        visibilityFilter === 'ALL' ||
        String(project.visibility ?? '').toLowerCase() === String(visibilityFilter).toLowerCase();

      const projectTagNames = (project.tags ?? [])
        .map((t: unknown) => (typeof t === 'string' ? t : (t as { name?: string })?.name ?? ''))
        .filter(Boolean);

      const tagMatch =
        activeTags.size === 0 ||
        projectTagNames.some((tagName) => activeTags.has(tagName));

      return nameMatch && statusMatch && visibilityMatch && tagMatch;
    });

    return [...matches].sort((a, b) => {
      const aRec = a as Project & { createdAt?: string; createdDate?: string };
      const bRec = b as Project & { createdAt?: string; createdDate?: string };
      const aDate = Date.parse(aRec.createdAt ?? aRec.createdDate ?? '') || a.id || 0;
      const bDate = Date.parse(bRec.createdAt ?? bRec.createdDate ?? '') || b.id || 0;
      return sortOrder === 'newest' ? bDate - aDate : aDate - bDate;
    });
  });

  toggleProjectTag(tagName: string): void {
    const next = new Set(this.selectedProjectTagNames());
    if (next.has(tagName)) {
      next.delete(tagName);
    } else {
      next.add(tagName);
    }
    this.selectedProjectTagNames.set(next);
  }

  clearProjectFilters(): void {
    this.projectSearchQuery.set('');
    this.projectSortOrder.set('newest');
    this.selectedProjectStatus.set('ALL');
    this.selectedProjectVisibility.set('ALL');
    this.selectedProjectTagNames.set(new Set());
  }


  copyField(key: 'id' | 'username' | 'email', value: string | number | undefined): void {
    if (value === undefined || value === null) return;
    this.writeToClipboard(key, String(value));
  }

  copyIdentity(): void {
    const user = this.profile();
    if (!user) return;

    const text = [
      `ID: ${user.id}`,
      `Username: ${user.username}`,
      `Email: ${user.email}`
    ].join('\n');

    this.writeToClipboard('identity', text);
  }

  private writeToClipboard(
    key: 'id' | 'username' | 'email' | 'identity',
    text: string
  ): void {
    if (!navigator.clipboard?.writeText) {
      console.warn('Clipboard API unavailable in this browser context.');
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      this.copiedKey.set(key);
      if (this.copyTimeout) {
        clearTimeout(this.copyTimeout);
      }
      this.copyTimeout = setTimeout(() => {
        this.copiedKey.set(null);
      }, 1500);
    }).catch((err) => {
      console.error('Failed to copy to clipboard:', err);
    });
  }

  ngOnInit(): void {
    const currentUserId = this.authService.currentUser()?.userId;

    if (!currentUserId) {
      this.errorMessage.set('User is not logged in.');
      this.isLoading.set(false);
      return;
    }

    // 1. Fetch User Profile Info
    this.userService.getUser(currentUserId).subscribe({
      next: (data) => {
        this.profile.set(data);
        this.usernameInput.set(data.username ?? '');
        this.firstNameInput.set(data.firstName ?? '');
        this.lastNameInput.set(data.lastName ?? '');
        this.bioInput.set(data.bio ?? '');
        this.syncSelectedTagIdsFromProfile();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch user profile:', err);
        this.errorMessage.set('Failed to load user profile information.');
        this.isLoading.set(false);
      }
    });

    this.projectService.getProjectsByUser(currentUserId).subscribe({
      next: (projectsData) => {
        this.projects.set(projectsData);
      },
      error: (err) => {
        console.error('Failed to fetch user projects:', err);
      }
    });

    this.fetchTags();
  }

  // tag section
  fetchTags() {
    this.http.get<Tag[]>('https://localhost:7036/api/Tags').subscribe({
      next: (tags) => {
        console.log('Tags fetched successfully:', tags);
        this.allTags.set(tags);
        this.syncSelectedTagIdsFromProfile();
      },
      error: (err) => {
        console.error('Failed to load tags from backend. Check CORS or backend URL.', err);
      }
    });
  }

  private syncSelectedTagIdsFromProfile(): void {
    const currentProfile = this.profile() as (User & { tagIds?: number[] }) | null;
    const catalog = this.allTags();
    if (!currentProfile || catalog.length === 0) return;

    const validCatalogIds = new Set(catalog.map((t) => t.id));

    // Prefer numeric tagIds from the API if present
    if (Array.isArray(currentProfile.tagIds)) {
      const ids = currentProfile.tagIds
        .map((id) => Number(id))
        .filter((id) => validCatalogIds.has(id));
      this.selectedTagIds = Array.from(new Set(ids));
      return;
    }

    // Fallback: map tag names (string[]) to catalog IDs
    const userTags = currentProfile.tags ?? [];
    const tagNameToId = new Map<string, number>(
      catalog.map((t) => [t.name.toLowerCase(), t.id])
    );

    const resolvedIds = userTags
      .map((name) => tagNameToId.get(name.toLowerCase()))
      .filter((id): id is number => typeof id === 'number');

    this.selectedTagIds = Array.from(new Set(resolvedIds));
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

  saveChanges(): void {
    const currentUser = this.profile();
    if (!currentUser || this.isSaving()) return;

    const trimmedUsername = this.usernameInput().trim();
    if (!trimmedUsername) {
      this.saveError.set('Username cannot be empty.');
      this.saveSuccess.set(null);
      return;
    }

    const numericTagIds = this.selectedTagIds
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);

    this.isSaving.set(true);
    this.saveSuccess.set(null);
    this.saveError.set(null);

    const payload = {
      username: trimmedUsername,
      firstName: this.firstNameInput().trim(),
      lastName: this.lastNameInput().trim(),
      bio: this.bioInput(),
      tagIds: numericTagIds
    };

    this.http.put<User & { tagIds?: number[] }>(
      `https://localhost:7036/api/Users/${currentUser.id}`,
      payload
    ).subscribe({
      next: (updatedUser) => {
        const resolvedIds = Array.isArray(updatedUser.tagIds)
          ? updatedUser.tagIds.map((id) => Number(id))
          : numericTagIds;

        const updatedTagNames = resolvedIds
          .map((id) => this.allTags().find((t) => t.id === id)?.name)
          .filter((name): name is string => Boolean(name));

        const mergedUser: User & { tagIds?: number[] } = {
          ...currentUser,
          ...updatedUser,
          tagIds: resolvedIds,
          tags: updatedUser.tags ?? updatedTagNames
        };

        this.profile.set(mergedUser);
        if (mergedUser.username) {
          this.authService.updateCurrentUserUsername(mergedUser.username);
        }
        this.usernameInput.set(mergedUser.username ?? '');
        this.firstNameInput.set(mergedUser.firstName ?? '');
        this.lastNameInput.set(mergedUser.lastName ?? '');
        this.bioInput.set(mergedUser.bio ?? '');
        this.selectedTagIds = resolvedIds;
        this.isSaving.set(false);
        this.saveSuccess.set('Profile changes saved.');
      },
      error: (err) => {
        console.error('Failed to update profile:', err);
        this.isSaving.set(false);
        this.saveError.set(err?.error?.message ?? 'Failed to save changes.');
      }
    });
  }
}