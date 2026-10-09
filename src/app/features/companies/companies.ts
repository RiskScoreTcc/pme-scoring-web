import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  debounceTime,
  distinctUntilChanged,
  switchMap
} from 'rxjs/operators';

import {
  BehaviorSubject,
  combineLatest,
  of
} from 'rxjs';

import {
  takeUntilDestroyed,
  toObservable
} from '@angular/core/rxjs-interop';

import { Router, RouterLink } from '@angular/router';

import { Company } from '../../core/models/companies/company';
import { CompanyService } from '../../core/services/companies/company-service';

import { ClassificationType } from '../../core/models/classification-type';

import { Occurrence } from '../../core/models/occurences/occurrence';
import { OccurrenceService } from '../../core/services/occurences/occurrence-service';

import { ScoreService } from '../../core/services/scores/score-service';

import { Page } from '../../core/models/Page';

import { NotificationService } from '../../shared/services/notification/notification-service';

import { MetricsStateService } from '../../core/services/matric/metrics-state-service';

import { FirmWithScore } from '../../core/models/companies/firm-with-score';

import { CalculatedScore } from '../../core/models/score/calculated-score';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './companies.html',
  styleUrl: './companies.css'
})
export class Companies implements OnInit {

  // =========================================================
  // SERVICES
  // =========================================================

  private readonly companyService = inject(CompanyService);

  private readonly scoreService = inject(ScoreService);

  private readonly occurrenceService = inject(OccurrenceService);

  private readonly notificationService =
    inject(NotificationService);

  private readonly metricsState =
    inject(MetricsStateService);

  private readonly fb =
    inject(FormBuilder);

  private readonly destroyRef =
    inject(DestroyRef);

  private readonly router = inject(Router);


  // =========================================================
  // FILTROS
  // =========================================================

  protected readonly searchTerm = signal('');


  protected readonly selectedRisk =
    signal<ClassificationType | null>(null);


  // =========================================================
  // PAGINAÇÃO
  // =========================================================

  protected readonly currentPage =
    signal(0);

  protected readonly pageSize =
    signal(10);


  // =========================================================
  // CONTROLE DE RELOAD
  // =========================================================

  private readonly forceReload$ =
    new BehaviorSubject<number>(0);


  private readonly searchTerm$ =
    toObservable(this.searchTerm);

  private readonly selectedRisk$ =
    toObservable(this.selectedRisk);

  private readonly currentPage$ =
    toObservable(this.currentPage);

  private readonly pageSize$ =
    toObservable(this.pageSize);


  // =========================================================
  // ESTADO
  // =========================================================

  protected readonly isLoading =
    signal(false);

  protected readonly isActionLoading =
    signal(false);

  protected readonly isEditing =
    signal(false);

  protected readonly isSaving =
    signal(false);


  // =========================================================
  // RESULTADO DA BUSCA
  // =========================================================

  readonly companiesSearchResults =
    signal<Page<FirmWithScore> | null>(null);


  // =========================================================
  // EMPRESA SELECIONADA
  // =========================================================

  selectedCompany:
    FirmWithScore | null = null;


  // =========================================================
  // SCORE SELECIONADO
  // =========================================================

  selectedScore:
    CalculatedScore | null = null;


  // =========================================================
  // OCORRÊNCIAS
  // =========================================================

  selectedOccurrences:
    Occurrence[] = [
      {
        id: 1,
        firm: {
          id: 1,
          cnpj: '12345656565',
          companyName: 'dasdasdsdas'
        },
        type: 'ACTIVE',
        dateOccurrence: '20/10/2026',
        averageRevenue: 55656,
        description: 'dasdasdasdasd ew',
        statusResolved: true,
        creationDate: '20/10/2006'
      }

    ];


  // =========================================================
  // MODAL
  // =========================================================

  activeModal:
    'details'
    | 'score'
    | 'occurrences'
    | 'new-occurrence'
    | 'delete'
    | null = null;


  // =========================================================
  // FORMULÁRIO DE EDIÇÃO
  // =========================================================

  readonly companyForm = this.fb.group({

    cnpj: [
      '',
      [
        Validators.required,
        Validators.minLength(14),
        Validators.maxLength(14)
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
        Validators.min(0),
        Validators.max(999999999999.99)
      ]
    ],

    ageInMonths: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(1200)
      ]
    ],

    numberOfEmployees: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(999999)
      ]
    ]

  });


  // =========================================================
  // MÉTRICAS
  // =========================================================

  protected readonly CompanyMetrics =
    this.metricsState.metricsCompany;


  protected readonly totalCompanieSearch =
    signal(0);


  protected readonly totalPage =
    signal(0);


  protected readonly lowRiskCount =
    computed(() =>
      this.CompanyMetrics()?.lowRiskCount ?? 0
    );


  protected readonly mediumRiskCount =
    computed(() =>
      this.CompanyMetrics()?.mediumRiskCount ?? 0
    );


  protected readonly highRiskCount =
    computed(() =>
      this.CompanyMetrics()?.highRiskCount ?? 0
    );


  protected readonly totalCompanies = this.totalCompanieSearch;


  protected readonly unclassified =
    computed(() =>
      Math.max(
        0,
        this.totalCompanies()
        - (
          this.lowRiskCount()
          + this.mediumRiskCount()
          + this.highRiskCount()
        )
      )
    );


  // =========================================================
  // FILTRO ATIVO
  // =========================================================

  protected readonly hasActiveFilter =
    computed(() => {

      return !!(
        this.searchTerm().trim()
        || this.selectedRisk() !== null
      );

    });


  // =========================================================
  // CICLO DE VIDA
  // =========================================================

  ngOnInit(): void {

    this.setupCompanySearch();

  }


  // =========================================================
  // BUSCA DE EMPRESAS
  // =========================================================

  private setupCompanySearch(): void {

    combineLatest([
      this.searchTerm$,
      this.selectedRisk$,
      this.currentPage$,
      this.pageSize$,
      this.forceReload$
    ])
      .pipe(

        debounceTime(300),

        distinctUntilChanged(
          (previous, current) =>
            JSON.stringify(previous)
            ===
            JSON.stringify(current)
        ),

        switchMap(
          ([
            searchTerm,
            selectedRisk,
            page,
            size
          ]) => {

            this.isLoading.set(true);

            const filter = {

              query:
                searchTerm.trim()
                || undefined,

              riskBand:
                selectedRisk
                ?? undefined

            };

            return this.companyService
              .searchCompanies(
                filter,
                page,
                size
              );

          }
        ),

        takeUntilDestroyed(this.destroyRef)

      )
      .subscribe({

        next: pageResponse => {

          this.companiesSearchResults
            .set(pageResponse);

          if (!this.hasActiveFilter()) {
            this.totalCompanieSearch
              .set(pageResponse.totalElements);
          }

          this.totalPage
            .set(pageResponse.totalPages);

          this.isLoading.set(false);

        },

        error: error => {

          this.isLoading.set(false);

          this.notificationService.error(
            'Falha ao carregar empresas',
            error?.message
            ||
            'Não foi possível carregar a lista de empresas.'
          );

        }

      });

  }


  // =========================================================
  // DETALHES
  // =========================================================

  openCompanyDetails(
    company: FirmWithScore
  ): void {

    this.selectedCompany = company;

    this.selectedScore =
      company.calculatedScore ?? null;

    this.selectedOccurrences = [];

    this.isEditing.set(false);

    this.patchCompanyForm(company);

    this.activeModal = 'details';

  }


  // =========================================================
  // EDITAR NA MESMA TELA
  // =========================================================

  enableCompanyEdit(): void {

    if (!this.selectedCompany) {
      return;
    }

    this.patchCompanyForm(
      this.selectedCompany
    );

    this.isEditing.set(true);

    this.companyForm.enable();

  }


  // =========================================================
  // CANCELAR EDIÇÃO
  // =========================================================

  cancelCompanyEdit(): void {

    if (!this.selectedCompany) {
      return;
    }

    this.patchCompanyForm(
      this.selectedCompany
    );

    this.isEditing.set(false);

    this.companyForm.disable();

  }


  // =========================================================
  // SALVAR ALTERAÇÕES
  // =========================================================

  saveCompanyChanges(): void {

    if (!this.selectedCompany) {
      return;
    }

    if (this.companyForm.invalid) {

      this.companyForm.markAllAsTouched();

      return;

    }

    const companyId =
      this.selectedCompany.firm.id;


    const formValue =
      this.companyForm.getRawValue();


    const payload = {

      cnpj:
        this.onlyNumbers(
          formValue.cnpj ?? ''
        ),

      registeredCompanyName:
        formValue.registeredCompanyName?.trim() ?? '',

      averageRevenue:
        this.normalizeMoney(
          formValue.averageRevenue
        ),

      ageInMonths:
        Number(
          formValue.ageInMonths
        ),

      numberOfEmployees:
        Number(
          formValue.numberOfEmployees
        )

    };


    this.isSaving.set(true);


    /*
     * =======================================================
     * INTEGRAÇÃO COM API
     * =======================================================
     *
     * Use aqui o método de atualização existente
     * no seu CompanyService.
     *
     * Exemplo:
     *
     * this.companyService.update(companyId, payload)
     *
     

    this.companyService
      .update(companyId, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: updatedCompany => {

          this.isSaving.set(false);



          if (this.selectedCompany) {

            this.selectedCompany = {

              ...this.selectedCompany,

              firm: {

                ...this.selectedCompany.firm,

                ...updatedCompany

              }

            };

          }


          this.patchCompanyForm(
            this.selectedCompany!
          );


          this.isEditing.set(false);

          this.companyForm.disable();


          this.notificationService.success(
            'Empresa atualizada',
            'Os dados da empresa foram atualizados com sucesso.'
          );


          this.reloadCompanies();

        },

        error: error => {

          this.isSaving.set(false);

          this.notificationService.error(
            'Falha ao atualizar empresa',
            error?.message
            ||
            'Não foi possível atualizar os dados da empresa.'
          );

        }

      });
*/
  }


  // =========================================================
  // PREENCHER FORMULÁRIO
  // =========================================================

  private patchCompanyForm(
    company: FirmWithScore
  ): void {

    this.companyForm.patchValue({

      cnpj:
        this.formatCnpj(
          company.firm.cnpj
        ),

      registeredCompanyName:
        company.firm.registeredCompanyName,

      averageRevenue:
        this.isSentinelValue(
          company.firm.averageRevenue
        )
          ? 0
          : Number(
            company.firm.averageRevenue ?? 0
          ),

      ageInMonths:
        this.isSentinelValue(
          company.firm.ageInMonths
        )
          ? 0
          : Number(
            company.firm.ageInMonths ?? 0
          ),

      numberOfEmployees:
        this.isSentinelValue(
          company.firm.numberOfEmployees
        )
          ? 0
          : Number(
            company.firm.numberOfEmployees ?? 0
          )

    });

    this.companyForm.disable();

  }


  // =========================================================
  // SCORE
  // =========================================================

  openScore(
    company: FirmWithScore
  ): void {

    this.selectedCompany = company;

    this.selectedScore =
      company.calculatedScore ?? null;

    this.activeModal = 'score';

    this.openActionMenu = null;

  }


  // =========================================================
  // CALCULAR SCORE
  // =========================================================

  openScoreCalculation(
    company: FirmWithScore
  ): void {

    this.selectedCompany = company;

    this.selectedScore =
      company.calculatedScore ?? null;

    this.activeModal = 'score';

    this.openActionMenu = null;

  }


  calculateScore(): void {

    if (!this.selectedCompany) {
      return;
    }

    const companyId =
      this.selectedCompany.firm.id;

    this.isActionLoading.set(true);


    this.scoreService
      .calculateScore(companyId)
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: score => {

          this.isActionLoading.set(false);

          this.notificationService.success(
            'Score calculado',
            'O score da empresa foi calculado com sucesso.'
          );

          this.reloadCompanies();

        },

        error: error => {

          this.isActionLoading.set(false);

          this.notificationService.error(
            'Falha ao calcular score',
            error?.message
            ||
            'Não foi possível calcular o score da empresa.'
          );

        }

      });

  }


  // =========================================================
  // OCORRÊNCIAS
  // =========================================================

  openOccurrences(
    company: FirmWithScore
  ): void {

    this.selectedCompany = company;

    this.activeModal = 'occurrences';

    this.selectedOccurrences = [];

    this.isActionLoading.set(true);


    /*
     * A assinatura abaixo deve corresponder ao
     * OccurrenceService existente.
     */

    this.occurrenceService
      .searchOccurrences(
        0,
        50,
        undefined,
        'dateOccurrence,desc'
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: response => {

          const companyId =
            company.firm.id;

          this.selectedOccurrences =
            response.content.filter(
              occurrence =>
                occurrence.firm?.id
                ===
                companyId
            );

          this.isActionLoading.set(false);

        },

        error: error => {

          this.isActionLoading.set(false);

          this.notificationService.error(
            'Falha ao carregar ocorrências',
            error?.message
            ||
            'Não foi possível carregar as ocorrências da empresa.'
          );

        }

      });

  }


  // =========================================================
  // NOVA OCORRÊNCIA
  // =========================================================

openNewOccurrence(company: FirmWithScore): void {
  this.router.navigate(['/occurrences'], {
    state: {
      openNewOccurrence: true,
      company: {
        id: company.firm.id,
        registeredCompanyName:
          company.firm.registeredCompanyName,
        cnpj: company.firm.cnpj
      }
    }
  });
}


  // =========================================================
  // EXCLUSÃO
  // =========================================================

  openDeleteConfirmation(
    company: FirmWithScore
  ): void {

    this.selectedCompany = company;

    this.activeModal = 'delete';

  }


  deleteCompany(): void {

    if (!this.selectedCompany) {
      return;
    }

    const companyId =
      this.selectedCompany.firm.id;

    this.isActionLoading.set(true);


    this.companyService
      .deleteCompany(companyId)
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: () => {

          this.isActionLoading.set(false);

          this.closeAllModals();

          this.notificationService.success(
            'Empresa excluída',
            'A empresa foi excluída com sucesso.'
          );

          this.reloadCompanies();

        },

        error: error => {

          this.isActionLoading.set(false);

          this.notificationService.error(
            'Falha ao excluir empresa',
            error?.message
            ||
            'Não foi possível excluir a empresa.'
          );

        }

      });

  }


  // =========================================================
  // FECHAR MODAL
  // =========================================================

  closeAllModals(): void {

    this.activeModal = null;

    this.selectedCompany = null;

    this.selectedScore = null;

    this.selectedOccurrences = [];

    this.isEditing.set(false);

    this.isSaving.set(false);

    this.companyForm.reset();

    this.companyForm.disable();

  }


  // =========================================================
  // RELOAD
  // =========================================================

  private reloadCompanies(): void {

    this.metricsState
      .loadCompanyMetrics()
      .subscribe();

    this.forceReload$
      .next(Date.now());

  }


  // =========================================================
  // FILTROS
  // =========================================================

  clearFilters(): void {

    this.searchTerm.set('');

    this.selectedRisk.set(null);

    this.currentPage.set(0);

  }


  // =========================================================
  // PAGINAÇÃO
  // =========================================================

  goToPage(page: number): void {

    if (page < 0) {
      return;
    }

    if (
      this.totalPage() > 0
      &&
      page >= this.totalPage()
    ) {
      return;
    }

    this.currentPage.set(page);

  }


  // =========================================================
  // FORMATAÇÃO DE CNPJ
  // =========================================================

  formatCnpj(
    value: string | null | undefined
  ): string {

    const digits =
      this.onlyNumbers(
        value ?? ''
      ).slice(0, 14);


    if (digits.length <= 2) {
      return digits;
    }

    if (digits.length <= 5) {
      return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    }

    if (digits.length <= 8) {
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    }

    if (digits.length <= 12) {
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    }

    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;

  }


  // =========================================================
  // SOMENTE NÚMEROS
  // =========================================================

  private onlyNumbers(
    value: string
  ): string {

    return value.replace(/\D/g, '');

  }


  // =========================================================
  // CNPJ DIGITADO PELO USUÁRIO
  // =========================================================

  onCnpjInput(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    const digits =
      this.onlyNumbers(
        input.value
      ).slice(0, 14);

    input.value =
      this.formatCnpj(digits);

    this.companyForm
      .controls
      .cnpj
      .setValue(
        digits,
        {
          emitEvent: false
        }
      );

  }


  // =========================================================
  // VALORES MONETÁRIOS
  // =========================================================

  normalizeMoney(
    value: number | string | null
  ): number {

    if (
      value === null
      ||
      value === ''
    ) {
      return 0;
    }

    const numericValue =
      Number(value);

    if (
      !Number.isFinite(numericValue)
      ||
      numericValue < 0
    ) {
      return 0;
    }

    return Number(
      Math.min(
        numericValue,
        999999999999.99
      ).toFixed(2)
    );

  }


  // =========================================================
  // FORMATAÇÃO MONETÁRIA
  // =========================================================

  formatCurrency(
    value: number | null | undefined
  ): string {

    if (
      value === null
      ||
      value === undefined
      ||
      this.isSentinelValue(value)
    ) {
      return 'Não informado';
    }

    return new Intl.NumberFormat(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    ).format(
      this.normalizeMoney(value)
    );

  }


  // =========================================================
  // FORMATAR DATA
  // =========================================================

  formatDate(
    value: string | null | undefined
  ): string {

    if (!value) {
      return 'Não informado';
    }

    const date =
      new Date(
        `${value}T00:00:00`
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return new Intl.DateTimeFormat(
      'pt-BR'
    ).format(date);

  }


  // =========================================================
  // SENTINELA
  // =========================================================

  isSentinelValue(
    value: unknown
  ): boolean {

    return Number(value)
      === 1073741824;

  }


  // =========================================================
  // RISCO
  // =========================================================

  getRiskLabel(
    risk: ClassificationType | string | null | undefined
  ): string {

    switch (risk) {

      case 'LOW':
      case 'LOW_RISK':
        return 'Baixo risco';

      case 'MEDIUM':
      case 'MEDIUM_RISK':
        return 'Médio risco';

      case 'HIGH':
      case 'HIGH_RISK':
        return 'Alto risco';

      default:
        return 'Não avaliado';

    }

  }


  getRiskClass(
    risk: ClassificationType | string | null | undefined
  ): string {

    switch (risk) {

      case 'LOW':
      case 'LOW_RISK':
        return 'risk-low';

      case 'MEDIUM':
      case 'MEDIUM_RISK':
        return 'risk-medium';

      case 'HIGH':
      case 'HIGH_RISK':
        return 'risk-high';

      default:
        return 'risk-none';

    }

  }


  // =========================================================
  // STATUS
  // =========================================================

  getStatusLabel(
    status: string | null | undefined
  ): string {

    return status === 'ACTIVE'
      ? 'Ativa'
      : 'Inativa';

  }


  getStatusClass(
    status: string | null | undefined
  ): string {

    return status === 'ACTIVE'
      ? 'status-active'
      : 'status-inactive';

  }


  // =========================================================
  // PORCENTAGEM
  // =========================================================

  riskPercentageCalculation(
    amount: number
  ): number {

    const total =
      this.totalCompanieSearch();

    if (
      !total
      ||
      total <= 0
    ) {
      return 0;
    }

    return Number(
      (
        amount / total * 100
      ).toFixed(1)
    );

  }


  // =========================================================
  // VALIDAÇÃO
  // =========================================================

  isInvalid(
    controlName: string
  ): boolean {

    const control =
      this.companyForm.get(
        controlName
      );

    return !!(
      control
      &&
      control.invalid
      &&
      control.touched
    );

  }


  // =========================================================
  // CONTROLE DO MENU
  // =========================================================

  openActionMenu:
    number | null = null;


  toggleActionMenu(
    companyId: number
  ): void {

    if (
      this.openActionMenu
      ===
      companyId
    ) {

      this.openActionMenu = null;

      return;

    }

    this.openActionMenu =
      companyId;

  }


}