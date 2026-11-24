import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
  LucideCalendar,
  LucideHammer,
  LucideCopy,
  LucideCheck
} from '@lucide/angular';
import { Project, ProjectStatus } from '../../shared/models/project';
import { Tag } from '../../shared/models/tag';
import { User as UserModel } from '../../shared/models/user';
import { UserService } from '../../core/services/user.service';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-user',
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
    LucideCalendar,
    LucideHammer,
    LucideCopy,
    LucideCheck
  ],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);

  readonly profile = signal<(UserModel & { tagIds?: number[] }) | null>(null);
  readonly projects = signal<Project[]>([]);
  readonly visibleProjects = computed<Project[]>(() => {
    const all = this.projects();
    if (this.isOwnProfile()) {
      return all;
    }

    return all.filter(
      (project) => String(project.visibility ?? '').toLowerCase() === 'public'
    );
  });
  readonly allTags = signal<Tag[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly isOwnProfile = signal<boolean>(false);

  readonly ProjectStatus = ProjectStatus;
  activeTab: 'overview' | 'projects' = 'overview';

  readonly copiedKey = signal<'id' | 'username' | 'email' | 'identity' | null>(null);
  private copyTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.fetchTags();

    this.route.paramMap.subscribe((params) => {
      const rawId = params.get('userId');
      const targetUserId = Number(rawId);

      if (!rawId || !Number.isInteger(targetUserId) || targetUserId <= 0) {
        this.errorMessage.set('Invalid user ID.');
        this.isLoading.set(false);
        return;
      }

      const loggedInId = this.authService.currentUser()?.userId;
      this.isOwnProfile.set(loggedInId !== undefined && loggedInId === targetUserId);

      this.isLoading.set(true);
      this.errorMessage.set(null);

      this.userService.getUser(targetUserId).subscribe({
        next: (data) => {
          this.profile.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load user:', err);
          this.errorMessage.set(err?.status === 404 ? 'User not found.' : 'Failed to load user profile.');
          this.isLoading.set(false);
        }
      });

      this.projectService.getProjectsByUser(targetUserId).subscribe({
        next: (projectsData) => this.projects.set(projectsData),
        error: (err) => console.error('Failed to load user projects:', err)
      });
    });
  }

  private fetchTags(): void {
    this.http.get<Tag[]>('https://localhost:7036/api/Tags').subscribe({
      next: (tags) => this.allTags.set(tags),
      error: (err) => console.error('Failed to load tags:', err)
    });
  }

  getProjectTagName(tag: Tag | string): string {
    return typeof tag === 'string' ? tag : tag.name;
  }

  readonly displayTagNames = signal<string[]>([]);

  getResolvedTagNames(): string[] {
    const user = this.profile();
    if (!user) return [];

    if (Array.isArray(user.tags) && user.tags.length > 0) {
      return user.tags;
    }

    if (Array.isArray(user.tagIds) && user.tagIds.length > 0) {
      const catalog = this.allTags();
      return user.tagIds
        .map((id) => catalog.find((t) => t.id === id)?.name)
        .filter((name): name is string => Boolean(name));
    }

    return [];
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
    if (!navigator.clipboard?.writeText) return;

    navigator.clipboard.writeText(text).then(() => {
      this.copiedKey.set(key);
      if (this.copyTimeout) clearTimeout(this.copyTimeout);
      this.copyTimeout = setTimeout(() => this.copiedKey.set(null), 1500);
    }).catch((err) => console.error('Failed to copy:', err));
  }
}