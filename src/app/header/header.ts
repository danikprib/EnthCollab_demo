import { Component, inject } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import {
  LucideSun,
  LucideMoon,
} from '@lucide/angular';




@Component({
  selector: 'app-header',
  imports: [
    LucideSun,
    LucideMoon],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  theme = inject(ThemeService);
}
