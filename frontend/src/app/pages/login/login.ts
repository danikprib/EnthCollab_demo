import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LucideEye, LucideEyeOff } from '@lucide/angular';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink,
    LucideEye,
    LucideEyeOff
  ],
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  
  readonly showPassword = signal<boolean>(false);

  togglePasswordVisibility(): void {
    this.showPassword.update((prev) => !prev);
  }

  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.errorMessage.set(null);

    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.errorMessage.set(
          err.error?.title ?? 'Something went wrong.'
        );
      },
    });
  }
}