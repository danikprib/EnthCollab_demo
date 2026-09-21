import { Tags } from "./tags";

export enum ProjectStatus {
  WIP = 'WIP',
  Finished = 'Finished',
  Cancelled = 'Cancelled',
  Frozen = 'Frozen'
}

export interface Project {
  id: number;
  name: string;
  status: ProjectStatus;
  visibility: 'Public' | 'Private';
  description: string;
  tags: Tags[];
}