import { Tag } from "./tag";

export enum ProjectStatus {
  WIP = 'WIP',
  Finished = 'Finished',
  Cancelled = 'Cancelled',
  Frozen = 'Frozen'
}

export enum ProjectVisibility {
  Public = 'Public',
  Private = 'Private'
}

export interface Project {
  id: number;
  name: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  description: string;
  hazard: string;
  createdByUserId: number;
  tags: Tag[];
}

export interface ProjectSummary {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  ownerUsername: string;
  likesCount: number;
  likedByMe: boolean;
  tags: string[];
}