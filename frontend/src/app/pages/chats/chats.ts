import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { LucideUser } from '@lucide/angular';


@Component({
  selector: 'app-chats',
  imports: [
    RouterLink, RouterOutlet,
    LucideUser
  ],
  templateUrl: './chats.html',
  styleUrl: './chats.css',
})
export class Chats {

  private route = inject(ActivatedRoute);

  readonly chats = [
    { id: 1, name: 'Alice', isActive: true },
    { id: 2, name: 'Bob', isActive: false },
    { id: 3, name: 'Charlie', isActive: false },
    { id: 4, name: 'Delta', isActive: false },
    { id: 5, name: 'Echo', isActive: false },
    { id: 6, name: 'Hotel', isActive: false },
    { id: 7, name: 'Fox', isActive: false },
    { id: 8, name: 'Zulu', isActive: false },
    { id: 9, name: 'Romeo', isActive: false },
    { id: 10, name: 'Oscar', isActive: false },
  ];

  get isChatSelected(): boolean {
    return this.route.firstChild !== null;
  }

}
