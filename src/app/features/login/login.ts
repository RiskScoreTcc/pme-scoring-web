import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private readonly fb = inject(FormBuilder);

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

    console.log('Login:', {
      email: formValue.email,
      password: formValue.password,
      rememberMe: formValue.rememberMe
    });

    /*
     * Futuramente:
     *
     * this.authService.login({
     *   email: formValue.email!,
     *   password: formValue.password!
     * }).subscribe({
     *   next: () => {
     *     this.router.navigate(['/overview']);
     *   },
     *   error: () => {
     *     this.loginError.set(true);
     *     this.isLoading.set(false);
     *   }
     * });
     */

    setTimeout(() => {
      this.isLoading.set(false);

      // Apenas demonstração visual.
      // Remover quando integrar com a API.
      this.loginError.set(false);
    }, 1000);
  }
}