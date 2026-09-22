import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';

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

  private readonly fb = inject(FormBuilder);

  readonly companyForm = this.fb.group({
    companyData: this.fb.group({
      legalName: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ],

      tradeName: [
        ''
      ],

      cnpj: [
        '',
        [
          Validators.required
        ]
      ],

      legalNature: [
        '',
        [
          Validators.required
        ]
      ],

      businessSector: [
        '',
        [
          Validators.required
        ]
      ],

      openingDate: [
        '',
        [
          Validators.required
        ]
      ]
    }),

    address: this.fb.group({
      zipCode: [
        '',
        [
          Validators.required
        ]
      ],

      state: [
        '',
        [
          Validators.required
        ]
      ],

      city: [
        '',
        [
          Validators.required
        ]
      ],

      neighborhood: [
        '',
        [
          Validators.required
        ]
      ],

      street: [
        '',
        [
          Validators.required
        ]
      ],

      number: [
        '',
        [
          Validators.required
        ]
      ]
    }),

    contact: this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      phone: [
        '',
        [
          Validators.required
        ]
      ]
    }),

    additional: this.fb.group({
      notes: [
        '',
        [
          Validators.maxLength(500)
        ]
      ]
    })
  });

  onSubmit(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    const formValue = this.companyForm.getRawValue();

    console.log('Dados da empresa:', formValue);

    /*
      Futuramente:

      this.companyService.create(formValue).subscribe({
        next: () => {
          ...
        },
        error: () => {
          ...
        }
      });
    */
  }

  isInvalid(controlPath: string): boolean {
    const control = this.companyForm.get(controlPath);

    return !!control && control.invalid && control.touched;
  }
}