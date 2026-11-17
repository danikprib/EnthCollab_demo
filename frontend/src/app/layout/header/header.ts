import { Component, inject, signal } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';
import {
  LucideSun,
  LucideMoon,
  LucideX,
  LucideMenu
} from '@lucide/angular';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [
    LucideSun,
    LucideMoon,
    LucideX,
    LucideMenu,
    RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  theme = inject(ThemeService);
  auth = inject(AuthService)

  mobileMenuOpened = signal(false);

  toggleMobileMenu() {
    this.mobileMenuOpened.update(value => !value);
  }
}
