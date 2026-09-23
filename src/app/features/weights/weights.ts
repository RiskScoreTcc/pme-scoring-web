import { Component, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';


type FormulaType = 'WEIGHTED_AVERAGE';

@Component({
  selector: 'app-weights',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './weights.html',
  styleUrl: './weights.css'
})
export class Weights {

  private readonly fb = inject(FormBuilder);

  readonly currentConfiguration = signal({
    formulaType: 'WEIGHTED_AVERAGE' as FormulaType,

    revenueWeight: 0.40,
    timeWeight: 0.30,
    defaultWeight: 0.30,

    maxRevenueReference: 500000,
    maxTimeReferenceMonths: 60,

    lowRiskThreshold: 75,
    mediumRiskThreshold: 50,

    updatedByUserId: 1,
    updatedAt: '2026-09-20'
  });

  readonly weightsForm = this.fb.group({
    formulaType: [
      'WEIGHTED_AVERAGE' as FormulaType,
      Validators.required
    ],

    revenueWeight: [
      0.40,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(1)
      ]
    ],

    timeWeight: [
      0.30,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(1)
      ]
    ],

    defaultWeight: [
      0.30,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(1)
      ]
    ],

    maxRevenueReference: [
      500000,
      [
        Validators.required,
        Validators.min(0.01)
      ]
    ],

    maxTimeReferenceMonths: [
      60,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    lowRiskThreshold: [
      75,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(100)
      ]
    ],

    mediumRiskThreshold: [
      50,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(100)
      ]
    ]
  });

  readonly totalWeight = computed(() => {
    const value = this.weightsForm.getRawValue();

    return (
      Number(value.revenueWeight ?? 0) +
      Number(value.timeWeight ?? 0) +
      Number(value.defaultWeight ?? 0)
    );
  });

  readonly weightsAreValid = computed(() => {
    return Math.abs(this.totalWeight() - 1) < 0.0001;
  });

  isInvalid(controlName: string): boolean {
    const control = this.weightsForm.get(controlName);

    return !!control && control.invalid && control.touched;
  }

  getWeightPercentage(value: number | null | undefined): number {
    return Number(value ?? 0) * 100;
  }

  onSubmit(): void {
    if (this.weightsForm.invalid) {
      this.weightsForm.markAllAsTouched();
      return;
    }

    if (!this.weightsAreValid()) {
      this.weightsForm.markAllAsTouched();
      return;
    }

    const formValue = this.weightsForm.getRawValue();

    const request = {
      ...formValue,

      /*
       * Este valor futuramente deverá vir
       * do usuário autenticado.
       */
      updatedByUserId: 1
    };

    console.log('Nova configuração de pesos:', request);

    /*
     * Futuramente:
     *
     * this.weightConfigurationService
     *   .create(request)
     *   .subscribe({
     *      next: configuration => {
     *        ...
     *      }
     *   });
     */
  }

  resetForm(): void {
    const configuration = this.currentConfiguration();

    this.weightsForm.reset({
      formulaType: configuration.formulaType,

      revenueWeight: configuration.revenueWeight,
      timeWeight: configuration.timeWeight,
      defaultWeight: configuration.defaultWeight,

      maxRevenueReference:
        configuration.maxRevenueReference,

      maxTimeReferenceMonths:
        configuration.maxTimeReferenceMonths,

      lowRiskThreshold:
        configuration.lowRiskThreshold,

      mediumRiskThreshold:
        configuration.mediumRiskThreshold
    });
  }
}