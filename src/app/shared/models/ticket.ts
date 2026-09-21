import { Tags } from "./tags";

export enum TicketStatus {
  Open = 'Open',
  Taken = 'Taken',
  Done = 'Done',
}

export enum TicketDifficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export interface Ticket {
  id: number;
  name: string;
  status: TicketStatus;
  difficulty: TicketDifficulty,
  description: string;
  tags: Tags[];
}