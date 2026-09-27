import { Component, inject, signal } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';
import {
  LucideSun,
  LucideMoon,
  LucideSearch,
  LucideX,
  LucideMenu
} from '@lucide/angular';
import { RouterLink } from '@angular/router';




@Component({
  selector: 'app-header',
  imports: [
    LucideSun,
    LucideMoon,
    LucideSearch,
    LucideX,
    LucideMenu,
    RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  theme = inject(ThemeService);

  mobileMenuOpened = signal(false);

  toggleMobileMenu() {
    this.mobileMenuOpened.update(value => !value);
  }
}
