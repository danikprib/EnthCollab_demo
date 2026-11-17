import { Tag } from "./tag";

export enum TicketStatus {
  Open = 'Open',
  Taken = 'Taken',
  Done = 'Done',
}

export enum TicketDifficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
  Advanced = 'Advanced',
}

export interface Ticket {
  id: number;
  name: string;
  status: TicketStatus;
  difficulty: TicketDifficulty;
  description: string;
  projectId: number;
  tags: Tag[];
}