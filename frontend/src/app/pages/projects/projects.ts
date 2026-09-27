import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideCircleCheckBig,
  LucideCirclePause,
  LucideTriangle,
  LucideSquareX,
  LucideSlidersHorizontal,
  LucideX
} from '@lucide/angular';
import { Project, ProjectStatus } from '../../shared/models/project';
import { Tags } from '../../shared/models/tags';

@Component({
  selector: 'app-projects',
  imports: [
    RouterLink,
    LucideCircleCheckBig,
    LucideCirclePause,
    LucideTriangle,
    LucideSquareX,
    LucideSlidersHorizontal,
    LucideX
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects {
  readonly ProjectStatus = ProjectStatus;
  readonly Tags = Tags;

  readonly isFilterMobileOpen = signal<boolean>(false);

  readonly selectedStatuses = signal<Set<ProjectStatus>>(new Set());
  readonly selectedTags = signal<Set<Tags>>(new Set());

  readonly activeFilterCount = computed(
    () => this.selectedStatuses().size + this.selectedTags().size
  );

  readonly statusOptions = [
    { label: 'Work In Progress', value: ProjectStatus.WIP },
    { label: 'Finished', value: ProjectStatus.Finished },
    { label: 'Frozen', value: ProjectStatus.Frozen },
    { label: 'Cancelled', value: ProjectStatus.Cancelled },
  ];

  readonly tagOptions = Object.values(Tags);

  readonly projects: Project[] = [
    {
      id: 1,
      name: 'Autonomous UAV Drone',
      status: ProjectStatus.WIP,
      visibility: 'Public',
      description: 'Custom STM32 flight controller with computer vision tracking.',
      tags: [Tags.CPP, Tags.STM32, Tags.ComputerVision],
    },
    {
      id: 2,
      name: 'Solana Escrow Protocol',
      status: ProjectStatus.Finished,
      visibility: 'Public',
      description: 'DeFi smart contracts for trustless milestone payouts.',
      tags: [Tags.Documentation],
    },
    {
      id: 3,
      name: 'Solana Escrow Protocol',
      status: ProjectStatus.Finished,
      visibility: 'Public',
      description: 'DeFi smart contracts for trustless milestone payouts.',
      tags: [Tags.Documentation],
    },
    {
      id: 4,
      name: 'Solana Escrow Protocol',
      status: ProjectStatus.Finished,
      visibility: 'Public',
      description: 'DeFi smart contracts for trustless milestone payouts.',
      tags: [Tags.Documentation],
    },
    {
      id: 5,
      name: 'Solana Escrow Protocol',
      status: ProjectStatus.Finished,
      visibility: 'Public',
      description: 'DeFi smart contracts for trustless milestone payouts.',
      tags: [Tags.Documentation],
    },
  ];

  readonly filteredProjects = computed(() => {
    const activeStatuses = this.selectedStatuses();
    const activeTags = this.selectedTags();

    return this.projects.filter((project) => {
      const matchesStatus =
        activeStatuses.size === 0 || activeStatuses.has(project.status);

      const matchesTag =
        activeTags.size === 0 ||
        project.tags.some((tag) => activeTags.has(tag));

      return matchesStatus && matchesTag;
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

  toggleTag(tag: Tags): void {
    const current = new Set(this.selectedTags());

    if (current.has(tag)) {
      current.delete(tag);
    } else {
      current.add(tag);
    }

    this.selectedTags.set(current);
  }

  clearStatusFilter(): void {
    this.selectedStatuses.set(new Set());
  }

  clearTagFilter(): void {
    this.selectedTags.set(new Set());
  }

  clearAllFilters(): void {
    this.clearStatusFilter();
    this.clearTagFilter();
  }
}
