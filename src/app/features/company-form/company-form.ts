import { Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CompanyService } from '../../core/services/companies/company-service';
import { CompanyCreate } from '../../core/models/companies/company-create';

@Component({
  selector: 'app-company-form',
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

  readonly companyForm = this.fb.group({
    userId: [
      1,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

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

  onSubmit(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    const formValue = this.companyForm.getRawValue();

    const companyData: CompanyCreate = {
      ...formValue,
      userId: 1
    };

    this.companyService.create(formValue).subscribe({
      next: (company) => {
        console.log('Empresa criada:', company);
      },
      error: (error) => {
        console.error('Erro ao cadastrar empresa:', error);
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.companyForm.get(controlName);

    return !!control && control.invalid && control.touched;
  }
}