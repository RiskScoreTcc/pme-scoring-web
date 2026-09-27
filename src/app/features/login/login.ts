import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth-service';
import { AuthCredentials } from '../../core/models/auth/auth-credentials';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly showPassword = signal(false);
  readonly isLoading = signal(false);
  readonly loginError = signal(false);

  readonly loginForm = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8)
      ]
    ],

    rememberMe: [false]
  });

  isInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);

    return !!control &&
      control.invalid &&
      control.touched;
  }

  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  onSubmit(): void {
    this.loginError.set(false);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const formValue = this.loginForm.getRawValue();

    const authCredentials: AuthCredentials = {
      email: formValue.email!,
      password: formValue.password!
    };

    this.authService.login(authCredentials)
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          // Redirecionar para a página principal após login bem-sucedido
        },
        error: () => {
          this.loginError.set(true);
          this.isLoading.set(false);
        }
      });
  }
}