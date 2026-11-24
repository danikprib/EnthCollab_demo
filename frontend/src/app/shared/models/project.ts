import { Tag } from './tag';

export enum ProjectStatus {
  WIP = 'WIP',
  Finished = 'Finished',
  Cancelled = 'Cancelled',
  Frozen = 'Frozen',
}

export enum ProjectVisibility {
  Public = 'Public',
  Private = 'Private',
}

export type ProjectTag = Tag | string;

export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  visibility?: ProjectVisibility;
  hazard?: string;
  createdByUserId?: number;
  ownerUsername?: string;
  likesCount?: number;
  likedByMe?: boolean;
  tags: ProjectTag[];
}