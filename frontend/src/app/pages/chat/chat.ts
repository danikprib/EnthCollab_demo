import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';

@Component({
  selector: 'app-chat',
  imports: [RouterLink, LucideArrowLeft],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  id = input.required<string>();
}
