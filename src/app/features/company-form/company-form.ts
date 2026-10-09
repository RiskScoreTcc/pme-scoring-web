import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { CompanyService } from '../../core/services/companies/company-service';
import { CompanyCreate } from '../../core/models/companies/company-create';
import { JwtDecoderService } from '../../core/services/jwt-decoder/jwt-decoder-service';
import { NotificationService } from '../../shared/services/notification/notification-service';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './company-form.html',
  styleUrl: './company-form.css'
})
export class CompanyForm {

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly companyService = inject(CompanyService);
  private readonly jwtService = inject(JwtDecoderService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isSubmitting = signal(false);

  readonly companyForm = this.fb.group({
    cnpj: [
      '',
      [
        Validators.required
      ]
    ],

    registeredCompanyName: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(255)
      ]
    ],

    averageRevenue: [
      0,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],

    ageInMonths: [
      0,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],

    numberOfEmployees: [
      0,
      [
        Validators.required,
        Validators.min(0)
      ]
    ]
  });

  onCnpjInput(event: Event): void {

    const input = event.target as HTMLInputElement;

    const digits = input.value
      .replace(/\D/g, '')
      .slice(0, 14);

    const formatted = this.formatCnpj(digits);

    input.value = formatted;

    this.companyForm.controls.cnpj.setValue(
      digits,
      {
        emitEvent: false
      }
    );

    this.companyForm.controls.cnpj.markAsDirty();

    this.companyForm.controls.cnpj.updateValueAndValidity({
      emitEvent: false
    });
  }

  onSubmit(): void {

    if (this.isSubmitting()) {
      return;
    }

    if (this.companyForm.invalid) {

      this.companyForm.markAllAsTouched();

      this.focusFirstInvalidField();

      return;
    }

    const userId = this.jwtService.getUser()?.id;

    if (!userId) {

      this.notification.error(
        'Sessão inválida',
        'Não foi possível identificar o usuário responsável pelo cadastro.'
      );

      return;
    }

    const formValue = this.companyForm.getRawValue();

    const companyData: CompanyCreate = {
      cnpj: formValue.cnpj,
      registeredCompanyName:
        formValue.registeredCompanyName.trim(),

      averageRevenue: Number(
        formValue.averageRevenue
      ),

      ageInMonths: Number(
        formValue.ageInMonths
      ),

      numberOfEmployees: Number(
        formValue.numberOfEmployees
      ),

      userId
    };

    this.isSubmitting.set(true);

    this.companyService.create(companyData).subscribe({

      next: (company) => {

        this.isSubmitting.set(false);

        this.notification.success(
          'Empresa cadastrada',
          `A empresa ${company.registeredCompanyName} foi cadastrada com sucesso.`
        );

        const returnUrl =
          this.route.snapshot.queryParams['returnUrl']
          || '/companies';

        this.router.navigateByUrl(returnUrl);
      },

      error: (error: Error) => {

        this.isSubmitting.set(false);

        console.error(
          'Erro ao cadastrar empresa:',
          error
        );

        this.notification.error(
          'Falha no cadastro',
          error.message ||
          'Não foi possível cadastrar a empresa.'
        );
      }
    });
  }

  isInvalid(controlName: string): boolean {

    const control = this.companyForm.get(controlName);

    return !!control &&
      control.invalid &&
      control.touched;
  }

  private focusFirstInvalidField(): void {

    requestAnimationFrame(() => {

      const firstInvalid =
        document.querySelector<HTMLElement>(
          '.company-form input[aria-invalid="true"]'
        );

      firstInvalid?.focus();
    });
  }

  private formatCnpj(value: string): string {

    const digits = value
      .replace(/\D/g, '')
      .slice(0, 14);

    if (digits.length <= 2) {
      return digits;
    }

    if (digits.length <= 5) {
      return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    }

    if (digits.length <= 8) {
      return (
        `${digits.slice(0, 2)}.` +
        `${digits.slice(2, 5)}.` +
        `${digits.slice(5)}`
      );
    }

    if (digits.length <= 12) {
      return (
        `${digits.slice(0, 2)}.` +
        `${digits.slice(2, 5)}.` +
        `${digits.slice(5, 8)}/` +
        `${digits.slice(8)}`
      );
    }

    return (
      `${digits.slice(0, 2)}.` +
      `${digits.slice(2, 5)}.` +
      `${digits.slice(5, 8)}/` +
      `${digits.slice(8, 12)}-` +
      `${digits.slice(12, 14)}`
    );
  }


}