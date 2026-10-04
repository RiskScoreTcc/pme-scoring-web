import { Component, computed, inject, signal, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormulaType } from '../../core/models/weights/formula-type';
import { toSignal } from '@angular/core/rxjs-interop';
import { NotificationService } from '../../shared/services/notification/notification-service';
import { WeightsService } from '../../core/services/weights/weights-service';
import { WeightRequest } from '../../core/models/weights/weight-request';
import { JwtDecoderService } from '../../core/services/jwt-decoder/jwt-decoder-service';

@Component({
  selector: 'app-weights',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './weights.html',
  styleUrl: './weights.css'
})
export class Weights implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly weightsService = inject(WeightsService);
  private readonly notificationService = inject(NotificationService);
  private readonly jwtDecoderService = inject(JwtDecoderService);

  readonly currentConfiguration = signal({
    formulaType: '' as FormulaType,

    revenueWeight: 0.00,
    timeWeight: 0.00,
    defaultWeight: 0.00,

    maxRevenueReference: 0,
    maxTimeReferenceMonths: 0,

    lowRiskThreshold: 0,
    mediumRiskThreshold: 0,

    updatedByUserId: 0,
    creationDate: '0000-00-00'
  });

  readonly formulaOptions: Array<{ value: FormulaType; label: string }> = [
    {
      value: 'LINEAR_WEIGHTED_V1',
      label: 'Média Ponderada Linear (v1)'
    }
  ];

  readonly weightsForm = this.fb.group({
    formulaType: [
      'LINEAR_WEIGHTED_V1' as FormulaType,
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
      750,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(1000)
      ]
    ],

    mediumRiskThreshold: [
      500,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(1000)
      ]
    ]
  });

  readonly formValues = toSignal(
    this.weightsForm.valueChanges,
    { initialValue: this.weightsForm.getRawValue() }
  );

  readonly totalWeight = computed(() => {
    const val = this.formValues();
    const rev = Number(val.revenueWeight || 0);
    const time = Number(val.timeWeight || 0);
    const def = Number(val.defaultWeight || 0);

    return rev + time + def;
  });

  readonly weightsAreValid = computed(() => {
    return Math.abs(this.totalWeight() - 1) < 0.0001;
  });

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.weightsService.searchWeightsActive().subscribe({
      next: (response) => {
        this.currentConfiguration.set(response);
        this.resetForm();
      },
      error: (error) => {
        console.error('Error fetching active weight configuration:', error);

        this.notificationService.error(
          'Falha ao carregar a configuração',
          'Não foi possível carregar a configuração de pesos ativa.'
        );
      }
    });
  }

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

    const formValue = this.weightsForm.getRawValue();

    const request: WeightRequest = {
      formulaType: formValue.formulaType ?? 'LINEAR_WEIGHTED_V1',
      revenueWeight: formValue.revenueWeight ?? 0,
      timeWeight: formValue.timeWeight ?? 0,
      defaultWeight: formValue.defaultWeight ?? 0,
      maxRevenueReference: formValue.maxRevenueReference ?? 0,
      maxTimeReferenceMonths: formValue.maxTimeReferenceMonths ?? 0,
      lowRiskThreshold: formValue.lowRiskThreshold ?? 0,
      mediumRiskThreshold: formValue.mediumRiskThreshold ?? 0,
      updatedByUserId: this.jwtDecoderService.getUser()?.id ?? 1
    };

    this.weightsService.saveConfiguration(request).subscribe({
      next: (response) => {
        this.currentConfiguration.set(response);
        this.resetForm();
        this.notificationService.success(
          'Configuração salva',
          'A nova configuração de pesos foi salva com sucesso.'
        );
      },
      error: (error) => {
        console.error('Error saving weight configuration:', error);

        this.notificationService.error(
          'Falha ao salvar a configuração',
          'Não foi possível salvar a nova configuração de pesos.'
        );
      }
    });

  }

  resetForm(): void {
    const configuration = this.currentConfiguration();
    if (!configuration) {
      this.weightsForm.reset();
      return;
    }


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

  readonly formattedWeights = computed(() => {
    const config = this.currentConfiguration();

    if (!config) {
      return '0% · 0% · 0%';
    }

    const rev = Math.round((config.revenueWeight ?? 0) * 100);
    const time = Math.round((config.timeWeight ?? 0) * 100);
    const def = Math.round((config.defaultWeight ?? 0) * 100);

    return `${rev}% · ${time}% · ${def}%`;


  });
}