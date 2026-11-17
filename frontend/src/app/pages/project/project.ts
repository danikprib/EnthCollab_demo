import { Component } from '@angular/core';
import {
  LucideHammer,
  LucideCircleCheckBig,
  LucideDoorOpen,
  LucideDoorClosed,
  LucideTrash
} from '@lucide/angular';
import { Ticket, TicketDifficulty, TicketStatus } from '../../shared/models/ticket';
import { Tag } from '../../shared/models/tag';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-project',
  imports: [
    LucideHammer,
    LucideCircleCheckBig,
    LucideDoorOpen,
    LucideDoorClosed,
    LucideTrash,
    RouterLink
  ],
  templateUrl: './project.html',
  styleUrl: './project.css',
})
export class Project {

  activeTab = 'tickets'; // details | tickets | settings (visible only to owner)

  readonly TicketStatus = TicketStatus;
  readonly TicketDifficulty = TicketDifficulty;

  readonly tickets: Ticket[] = [
    
  ]

}
