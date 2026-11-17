import { Component, inject, OnInit, signal } from '@angular/core';
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
  LucideCirclePlus
} from '@lucide/angular';
import { Project, ProjectStatus, ProjectVisibility } from '../../shared/models/project';
import { Tag } from '../../shared/models/tag';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile } from '../../shared/models/user-profile';
import { ProjectService } from '../../core/services/project.service';


@Component({
  selector: 'app-profile',
  imports: [CommonModule, DatePipe,
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
    RouterLink
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
private userService = inject(UserService);
  private authService = inject(AuthService);
  private projectService = inject(ProjectService);

  ngOnInit(): void {
    const currentUserId = this.authService.currentUser()?.userId;

    if (!currentUserId) {
      this.errorMessage.set('User is not logged in.');
      this.isLoading.set(false);
      return;
    }

    // 1. Fetch User Profile Info
    this.userService.getUserProfile(currentUserId).subscribe({
      next: (data) => {
        this.profile.set(data);
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
  }

  readonly profile = signal<UserProfile | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  readonly ProjectStatus = ProjectStatus;

  activeTab = 'projects';

  readonly projects = signal<Project[]>([]);
}
