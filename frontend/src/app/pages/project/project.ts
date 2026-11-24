import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {
  LucideAlertTriangle,
  LucideHammer,
  LucideIdCard,
  LucideUser,
  LucideThumbsUp,
  LucideCircleCheckBig,
  LucideCirclePause,
  LucideTriangle,
  LucideSquareX,
  LucideDoorOpen,
  LucideDoorClosed,
  LucideTrash,
  LucideCopy,
  LucideCheck
} from '@lucide/angular';
import {
  Project as ProjectModel,
  ProjectStatus,
  ProjectTag,
  ProjectVisibility
} from '../../shared/models/project';
import { Tag } from '../../shared/models/tag';
import { Ticket, TicketDifficulty, TicketStatus } from '../../shared/models/ticket';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';

type CopyKey = 'identity' | 'name' | 'description' | 'hazard';

@Component({
  selector: 'app-project',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    LucideHammer,
    LucideIdCard,
    LucideUser,
    LucideThumbsUp,
    LucideCircleCheckBig,
    LucideCirclePause,
    LucideTriangle,
    LucideSquareX,
    LucideDoorOpen,
    LucideDoorClosed,
    LucideTrash,
    LucideCopy,
    LucideCheck,
    LucideAlertTriangle
  ],
  templateUrl: './project.html',
  styleUrl: './project.css',
})
export class Project implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);

  readonly ProjectStatus = ProjectStatus;
  readonly ProjectVisibility = ProjectVisibility;
  readonly TicketStatus = TicketStatus;
  readonly TicketDifficulty = TicketDifficulty;

  readonly project = signal<ProjectModel | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  activeTab: 'details' | 'tickets' | 'settings' = 'details';

  readonly isOwner = computed<boolean>(() => {
    const currentUserId = this.authService.currentUser()?.userId;
    const ownerId = this.project()?.createdByUserId;
    return currentUserId !== undefined && ownerId !== undefined && currentUserId === ownerId;
  });

  readonly nameInput = signal<string>('');
  readonly descriptionInput = signal<string>('');
  readonly statusInput = signal<ProjectStatus>(ProjectStatus.WIP);
  readonly hazardInput = signal<string>('');
  readonly allTags = signal<Tag[]>([]);
  selectedTagIds: number[] = [];

  readonly isSaving = signal<boolean>(false);
  readonly saveSuccess = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);

  readonly isUpdatingVisibility = signal<boolean>(false);
  readonly isDeleting = signal<boolean>(false);
  readonly isTogglingLike = signal<boolean>(false);

  readonly copiedKey = signal<CopyKey | null>(null);
  private copyTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly statusOptions = [
    { label: 'Work In Progress', value: ProjectStatus.WIP },
    { label: 'Finished', value: ProjectStatus.Finished },
    { label: 'Frozen', value: ProjectStatus.Frozen },
    { label: 'Cancelled', value: ProjectStatus.Cancelled }
  ];

  readonly tickets = signal<Ticket[]>([]);

  ngOnInit(): void {
    this.fetchTags();

    this.route.paramMap.subscribe((params) => {
      const rawId = params.get('projectId') ?? params.get('id');
      const projectId = Number(rawId);

      if (!rawId || !Number.isInteger(projectId) || projectId <= 0) {
        this.errorMessage.set('Invalid project ID.');
        this.isLoading.set(false);
        return;
      }

      this.isLoading.set(true);
      this.errorMessage.set(null);
      this.saveSuccess.set(null);
      this.saveError.set(null);

      this.projectService.getProjectById(projectId).subscribe({
        next: (data) => {
          this.project.set(data);
          this.populateFormFromProject(data);

          if (!this.isOwner() && this.activeTab === 'settings') {
            this.activeTab = 'details';
          }

          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load project:', err);
          this.errorMessage.set(
            err?.status === 404 ? 'Project not found.' : 'Failed to load project.'
          );
          this.isLoading.set(false);
        }
      });
    });
  }

  private fetchTags(): void {
    this.http.get<Tag[]>('https://localhost:7036/api/Tags').subscribe({
      next: (tags) => {
        this.allTags.set(tags);
        const current = this.project();
        if (current) {
          this.syncSelectedTagIds(current);
        }
      },
      error: (err) => console.error('Failed to load tags:', err)
    });
  }

  private populateFormFromProject(proj: ProjectModel): void {
    this.nameInput.set(proj.name ?? '');
    this.descriptionInput.set(proj.description ?? '');
    this.statusInput.set(proj.status ?? ProjectStatus.WIP);
    this.hazardInput.set(proj.hazard ?? '');
    this.syncSelectedTagIds(proj);
  }

  private syncSelectedTagIds(proj: ProjectModel): void {
    const catalog = this.allTags();
    if (catalog.length === 0) return;

    const nameToId = new Map<string, number>(
      catalog.map((t) => [t.name.toLowerCase(), t.id])
    );

    const ids = (proj.tags ?? [])
      .map((t) => (typeof t === 'string' ? nameToId.get(t.toLowerCase()) : t.id))
      .filter((id): id is number => typeof id === 'number');

    this.selectedTagIds = Array.from(new Set(ids));
  }

  getProjectTagName(tag: ProjectTag): string {
    return typeof tag === 'string' ? tag : tag.name;
  }

  get availableTags(): Tag[] {
    return this.allTags().filter((t) => !this.selectedTagIds.includes(t.id));
  }

  getTagNameById(id: number): string {
    return this.allTags().find((t) => t.id === id)?.name ?? '';
  }

  copyIdentity(): void {
    const proj = this.project();
    if (!proj) return;

    const text = [
      `ID: ${proj.id}`,
      `Name: ${proj.name}`
    ].join('\n');

    this.writeToClipboard('identity', text);
  }

  copyName(): void {
    const proj = this.project();
    const value = this.isOwner() ? this.nameInput() : (proj?.name ?? '');
    if (!value) return;
    this.writeToClipboard('name', value);
  }

  copyDescription(): void {
    const proj = this.project();
    const value = this.isOwner() ? this.descriptionInput() : (proj?.description ?? '');
    if (!value) return;
    this.writeToClipboard('description', value);
  }

  copyHazard(): void {
    const proj = this.project();
    const value = this.isOwner() ? this.hazardInput() : (proj?.hazard ?? '');
    if (!value) return;
    this.writeToClipboard('hazard', value);
  }

  private writeToClipboard(key: CopyKey, text: string): void {
    if (!navigator.clipboard?.writeText) return;

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

  addTag(event: Event): void {
    if (!this.isOwner()) return;
    const select = event.target as HTMLSelectElement;
    const tagId = Number(select.value);
    if (tagId && !this.selectedTagIds.includes(tagId)) {
      this.selectedTagIds.push(tagId);
      select.value = '';
    }
  }

  removeTag(tagId: number): void {
    if (!this.isOwner()) return;
    this.selectedTagIds = this.selectedTagIds.filter((id) => id !== tagId);
  }

  clearTags(): void {
    if (!this.isOwner()) return;
    this.selectedTagIds = [];
  }

  saveChanges(): void {
    const current = this.project();
    if (!current || !this.isOwner() || this.isSaving()) return;

    const trimmedName = this.nameInput().trim();
    if (!trimmedName) {
      this.saveError.set('Project name cannot be empty.');
      this.saveSuccess.set(null);
      return;
    }

    this.isSaving.set(true);
    this.saveSuccess.set(null);
    this.saveError.set(null);

    const payload = {
      name: trimmedName,
      description: this.descriptionInput().trim(),
      status: this.statusInput(),
      visibility: current.visibility,
      hazard: this.hazardInput().trim(),
      tagIds: this.selectedTagIds
    };

    this.projectService.updateProject(current.id, payload).subscribe({
      next: (updated) => {
        const resolvedTagNames = this.selectedTagIds
          .map((id) => this.allTags().find((t) => t.id === id)?.name)
          .filter((n): n is string => Boolean(n));

        const merged: ProjectModel = {
          ...current,
          ...updated,
          name: trimmedName,
          description: payload.description,
          status: payload.status,
          hazard: payload.hazard,
          tags: updated.tags ?? resolvedTagNames
        };

        this.project.set(merged);
        this.isSaving.set(false);
        this.saveSuccess.set('Project changes saved.');
      },
      error: (err) => {
        console.error('Failed to update project:', err);
        this.isSaving.set(false);
        this.saveError.set(err?.error?.message ?? 'Failed to save changes.');
      }
    });
  }

  toggleVisibility(): void {
    const current = this.project();
    if (!current || !this.isOwner() || this.isUpdatingVisibility()) return;

    const nextVisibility =
      current.visibility === ProjectVisibility.Private
        ? ProjectVisibility.Public
        : ProjectVisibility.Private;

    this.isUpdatingVisibility.set(true);

    const tagIds =
      this.selectedTagIds.length > 0
        ? this.selectedTagIds
        : (current.tags ?? [])
          .map((t) =>
            typeof t === 'string'
              ? this.allTags().find((cat) => cat.name.toLowerCase() === t.toLowerCase())?.id
              : t.id
          )
          .filter((id): id is number => typeof id === 'number');

    this.projectService
      .updateProject(current.id, {
        name: current.name,
        description: current.description ?? '',
        status: current.status,
        visibility: nextVisibility,
        hazard: current.hazard ?? '',
        tagIds
      })
      .subscribe({
        next: () => {
          this.project.set({ ...current, visibility: nextVisibility });
          this.isUpdatingVisibility.set(false);
        },
        error: (err) => {
          console.error('Failed to change visibility:', err);
          this.isUpdatingVisibility.set(false);
        }
      });
  }

  deleteProject(): void {
    const current = this.project();
    if (!current || !this.isOwner() || this.isDeleting()) return;

    this.isDeleting.set(true);
    this.projectService.deleteProject(current.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        console.error('Failed to delete project:', err);
        this.isDeleting.set(false);
      }
    });
  }

  toggleLike(): void {
    const current = this.project();
    if (!current || this.isTogglingLike()) return;

    const currentlyLiked = Boolean(current.likedByMe);
    const request$ = currentlyLiked
      ? this.projectService.unlikeProject(current.id)
      : this.projectService.likeProject(current.id);

    this.isTogglingLike.set(true);
    request$.subscribe({
      next: () => {
        const delta = currentlyLiked ? -1 : 1;
        this.project.set({
          ...current,
          likedByMe: !currentlyLiked,
          likesCount: Math.max(0, (current.likesCount ?? 0) + delta)
        });
        this.isTogglingLike.set(false);
      },
      error: (err) => {
        console.error('Failed to toggle like:', err);
        this.isTogglingLike.set(false);
      }
    });
  }
}