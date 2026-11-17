import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LucideEye, LucideEyeOff } from '@lucide/angular';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink,
    LucideEye,
    LucideEyeOff
  ],
  templateUrl: './signup.html',
})
export class Signup {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly showPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);

  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  togglePasswordVisibility(): void {
    this.showPassword.update((prev) => !prev);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((prev) => !prev);
  }

  // Same rules as RegisterDto on the backend.
  form = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(32)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch }
  );

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // reveals all error messages at once
      return;
    }

    const { username, email, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.errorMessage.set(null);

    this.auth.register(username, email, password).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        // The backend sends plain text for 409 ("Email already registered.")
        this.errorMessage.set(
          typeof err.error === 'string' ? err.error : 'Something went wrong. Please try again.'
        );
      },
    });
  }
}