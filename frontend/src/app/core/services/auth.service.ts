import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
}

export interface CurrentUser {
  userId: number;
  username: string;
}

const TOKEN_KEY = 'enthcollab_token';
const USER_KEY = 'enthcollab_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private baseUrl = 'https://localhost:7036/api/auth';

  private _currentUser = signal<CurrentUser | null>(this.loadUser());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);

  register(username: string, email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, { username, email, password })
      .pipe(tap(res => this.saveSession(res)));
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(tap(res => this.saveSession(res)));
  }

  logout() {
    this.clearSession();
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && this.isExpired(token)) {
      this.clearSession();
      this._currentUser.set(null);
      return null;
    }
    return token;
  }

  private saveSession(res: AuthResponse) {
    const user: CurrentUser = { userId: res.userId, username: res.username };
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._currentUser.set(user);
  }

  private clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private loadUser(): CurrentUser | null {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    if (!token || !raw || this.isExpired(token)) {
      this.clearSession();
      return null;
    }
    return JSON.parse(raw) as CurrentUser;
  }

  private isExpired(token: string): boolean {
    try {
      const payload = JSON.parse(
        atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
      );
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }


  updateCurrentUserUsername(username: string): void {
    const current = this._currentUser();
    if (!current) return;

    const updated: CurrentUser = { ...current, username };
    this._currentUser.set(updated);

    if (localStorage.getItem(TOKEN_KEY)) {
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
    }
  }

  
}