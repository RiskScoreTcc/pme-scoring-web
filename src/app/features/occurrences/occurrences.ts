import {
  Component,
  inject,
  signal,
  OnInit,
  computed,
  DestroyRef
} from '@angular/core';

import {
  FormControl,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
  tap,
  catchError
} from 'rxjs/operators';

import {
  combineLatest,
  of,
  BehaviorSubject
} from 'rxjs';

import {
  toObservable,
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import { Occurrence } from '../../core/models/occurences/occurrence';
import { OccurrenceUpdate } from '../../core/models/occurences/occurrence-update';
import { ModalTypeOccurrence } from '../../core/models/occurences/modal-type-occurrence';
import { OccurrenceService } from '../../core/services/occurences/occurrence-service';
import { CompanyService } from '../../core/services/companies/company-service';
import { OccurrenceCreate } from '../../core/models/occurences/occurrence-create';
import { Company } from '../../core/models/companies/company';
import { NotificationService } from '../../shared/services/notification/notification-service';
import { Page } from '../../core/models/Page';
import { MetricsStateService } from '../../core/services/matric/metrics-state-service';

@Component({
  selector: 'app-occurrences',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './occurrences.html',
  styleUrl: './occurrences.css'
})
export class Occurrences implements OnInit {

  /*
   * =========================================================
   * SERVICES
   * =========================================================
   */

  private readonly occurrenceService = inject(OccurrenceService);
  private readonly companyService = inject(CompanyService);
  private readonly fb = inject(FormBuilder);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly metricsState = inject(MetricsStateService)
  private readonly router = inject(Router);

  private readonly navigationState = this.router.currentNavigation()?.extras
    .state as
    | {
      openNewOccurrence?: boolean;
      company?: Pick<
        Company,
        'id' | 'registeredCompanyName' | 'cnpj'
      >;
    }
    | undefined;

  /*
   * =========================================================
   * PAGINATION / LOADING
   * =========================================================
   */

  protected readonly isLoading = signal(false);

  /**
   * Página atual.
   *
   * O backend trabalha com índice iniciado em 0.
   */
  protected readonly currentPage = signal(0);

  /**
   * Quantidade de registros por página.
   */
  protected readonly pageSize = signal(10);


  /*
   * =========================================================
   * RELOAD
   * =========================================================
   */

  private readonly forceReload$ = new BehaviorSubject<number>(0);


  private readonly currentPage$ =
    toObservable(this.currentPage);

  private readonly pageSize$ =
    toObservable(this.pageSize);


  /*
   * =========================================================
   * RESULTADOS
   * =========================================================
   */

  readonly occurrencesSearchResults =
    signal<Page<Occurrence> | null>(null);

  protected readonly occurrenceMetrics = this.metricsState.metricsOccurrence;



  /*
   * =========================================================
   * COMPANY SEARCH
   * =========================================================
   */

  readonly companySearchControl =
    new FormControl('');

  readonly companySearchResults =
    signal<Company[]>([]);

  readonly isSearchingCompanies =
    signal<boolean>(false);

  readonly showCompanyDropdown =
    signal<boolean>(false);

  readonly totalCompaniesFound =
    signal<number>(0);

  readonly hasMoreResults =
    computed(
      () =>
        this.totalCompaniesFound() >
        this.companySearchResults().length
    );


  /*
   * =========================================================
   * FORM
   * =========================================================
   */

  readonly occurrenceForm =
    this.fb.group({

      id: [
        '',
        Validators.required
      ],

      averageRevenue: [
        '',
        [
          Validators.required,
          Validators.min(0.01),
          Validators.max(999999999.99)
        ]
      ],

      date: [
        '',
        Validators.required
      ],

      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500)
        ]
      ]

    });


  /*
   * =========================================================
   * MODAL / SELECTION
   * =========================================================
   */

  selectedOccurrence: Occurrence | null = null;

  activeModal: ModalTypeOccurrence = null;


  /*
   * =========================================================
   * FILTERS
   * =========================================================
   */

  protected readonly searchTerm = signal('');

  /**
   * null = Todos
   * false = Aberta
   * true = Resolvida
   */
  protected readonly selectedStatus =
    signal<boolean | null>(null);

  private readonly searchTerm$ = toObservable(this.searchTerm);
  private readonly selectedStatus$ = toObservable(this.selectedStatus);

  /*
   * =========================================================
   * COMPANIES
   * =========================================================
   */

  protected readonly companies =
    signal<Page<Company> | null>(null);


  /*
   * =========================================================
   * LIFECYCLE
   * =========================================================
   */

  ngOnInit(): void {

    this.setupCompanySearch();

    this.setupOccurrenceSearch();
    const { openNewOccurrence, company } = this.navigationState ?? {};

    if (openNewOccurrence && company) {
      this.openNewOccurrence();
      this.selectCompany(company as Company);
    }

  }


  /*
   * =========================================================
   * OCCURRENCE SEARCH
   * =========================================================
   */

  private setupOccurrenceSearch(): void {

    combineLatest([
      this.searchTerm$,
      this.selectedStatus$,
      this.currentPage$,
      this.pageSize$,
      this.forceReload$
    ])
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        switchMap(
          ([searchTerm, selectedStatus, page, size]) => {

            this.isLoading.set(true);

            const filter = {
              query: searchTerm || undefined,
              statusResolved: selectedStatus !== null ? selectedStatus : undefined
            }

            return this.occurrenceService
              .searchOccurrences(
                page,
                size,
                filter,
                'dateOccurrence,desc'
              );

          }
        ),

        takeUntilDestroyed(
          this.destroyRef
        )

      )
      .subscribe({

        next: (pageResponse) => {

          this.occurrencesSearchResults
            .set(pageResponse);

          this.isLoading.set(false);

        },

        error: (error) => {

          this.isLoading.set(false);

          this.notificationService.error(
            'Falha ao carregar ocorrências',
            error?.message ||
            'Não foi possível carregar a lista de ocorrências.'
          );

        }

      });

  }


  /*
   * =========================================================
   * RELOAD
   * =========================================================
   */

  private reloadUsersManually(): void {

    this.metricsState.loadOccurrenceMetrics().subscribe();

    this.forceReload$.next(
      Date.now()
    );

  }


  /*
   * =========================================================
   * COMPANY SEARCH
   * =========================================================
   */

  private setupCompanySearch(): void {
    this.companySearchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(term => {
          if (!term || term.length < 2) {
            this.companySearchResults.set([]);
            this.showCompanyDropdown.set(false);
            this.occurrenceForm.patchValue({ id: null });
            this.occurrenceForm.get('id')?.markAsDirty();
          } else {
            this.isSearchingCompanies.set(true);
          }
        }),
        filter((term): term is string => !!term && term.length >= 2),
        switchMap(term => {
          const filter = { query: term };

          return this.companyService.searchCompanies(filter, 0, 10).pipe(
            catchError(() =>
              of({
                content: [],
                totalElements: 0
              })
            )
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(page => {
        const companies = page.content.map(item => item.firm);

        this.companySearchResults.set(companies);
        this.isSearchingCompanies.set(false);
        this.totalCompaniesFound.set(page.totalElements);
        this.showCompanyDropdown.set(true);
      });
  }


  /*
   * =========================================================
   * SELECT COMPANY
   * =========================================================
   */

  selectCompany(
    company: Company
  ): void {

    this.occurrenceForm.patchValue({
      id: company.id.toString()
    });

    this.occurrenceForm
      .get('id')
      ?.markAsDirty();

    this.companySearchControl.setValue(
      `${company.registeredCompanyName} — ${company.cnpj}`,
      {
        emitEvent: false
      }
    );

    this.showCompanyDropdown
      .set(false);

  }


  /*
   * =========================================================
   * SUMMARY
   * =========================================================
   */

  protected readonly totalOccurrences = computed(() => this.occurrenceMetrics()?.activeOccurrencesCount ?? 0);
  protected readonly openOccurrences = computed(() => this.occurrenceMetrics()?.openOccurrencesCount ?? 0);


  protected readonly recentOccurrences =
    computed(() => {

      const occurrences =
        this.occurrencesSearchResults()
          ?.content ?? [];

      return occurrences.filter(
        (occurrence: Occurrence) =>
          occurrence.creationDate !== undefined &&
          occurrence.creationDate >= '2026-08-24'
      ).length;

    });


  /*
   * =========================================================
   * PAGINATION
   * =========================================================
   */

  goToPage(
    page: number
  ): void {

    const totalPages =
      this.occurrencesSearchResults()
        ?.totalPages ?? 0;

    if (
      page < 0 ||
      page >= totalPages
    ) {
      return;
    }

    this.currentPage.set(page);

    this.scrollToResults();

  }


  goToPreviousPage(): void {

    if (this.currentPage() > 0) {

      this.currentPage.update(
        page => page - 1
      );

      this.scrollToResults();

    }

  }


  goToNextPage(): void {

    const totalPages =
      this.occurrencesSearchResults()
        ?.totalPages ?? 0;

    if (
      this.currentPage() <
      totalPages - 1
    ) {

      this.currentPage.update(
        page => page + 1
      );

      this.scrollToResults();

    }

  }


  getPaginationPages(): number[] {

    const totalPages =
      this.occurrencesSearchResults()
        ?.totalPages ?? 0;

    const currentPage =
      this.currentPage();


    if (totalPages <= 5) {

      return Array.from(
        {
          length: totalPages
        },
        (_, index) => index
      );

    }


    let start =
      Math.max(
        0,
        currentPage - 2
      );

    let end =
      Math.min(
        totalPages,
        start + 5
      );


    if (
      end - start < 5
    ) {

      start =
        Math.max(
          0,
          end - 5
        );

    }


    return Array.from(
      {
        length: end - start
      },
      (_, index) =>
        start + index
    );

  }


  getFirstItemIndex(): number {

    const page =
      this.occurrencesSearchResults();


    if (
      !page ||
      page.totalElements === 0
    ) {
      return 0;
    }


    return (
      page.number *
      page.size
    ) + 1;

  }


  getLastItemIndex(): number {

    const page =
      this.occurrencesSearchResults();


    if (
      !page ||
      page.totalElements === 0
    ) {
      return 0;
    }


    return Math.min(
      (
        page.number + 1
      ) * page.size,

      page.totalElements
    );

  }


  /*
   * =========================================================
   * SCROLL
   * =========================================================
   */

  private scrollToResults(): void {

    setTimeout(() => {

      const results =
        document.querySelector(
          '.results-section'
        );

      results?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

    });

  }


  /*
   * =========================================================
   * DETAILS
   * =========================================================
   */

  openDetails(
    occurrence: Occurrence
  ): void {

    this.selectedOccurrence =
      occurrence;

    this.activeModal =
      'details';

  }


  /*
   * =========================================================
   * NEW OCCURRENCE
   * =========================================================
   */

  openNewOccurrence(): void {

    this.selectedOccurrence = null;

    this.companySearchControl.setValue(
      '',
      {
        emitEvent: false
      }
    );


    this.occurrenceForm.reset({

      id: '',

      averageRevenue: '',

      date:
        new Date()
          .toISOString()
          .split('T')[0],

      description: ''

    });


    this.companySearchControl.enable();

    this.activeModal =
      'new-occurrence';

  }


  /*
   * =========================================================
   * EDIT
   * =========================================================
   */

  openEdit(
    occurrence: Occurrence
  ): void {

    this.selectedOccurrence =
      occurrence;

    this.activeModal =
      'edit';


    const rawObj =
      occurrence as any;


    const rawAmount =
      rawObj.amountDue ??
      rawObj.amount_due ??
      rawObj.averageRevenue ??
      rawObj.average_revenue ??
      rawObj.amount ??
      0;


    this.companySearchControl.setValue(
      `${occurrence.firm?.companyName} — ${occurrence.firm?.cnpj}`,
      {
        emitEvent: false
      }
    );


    this.companySearchControl.disable();


    this.occurrenceForm.patchValue({

      id:
        occurrence.id
          ?.toString() ?? '',

      averageRevenue:
        rawAmount ?? 0,

      date:
        occurrence.creationDate,

      description:
        occurrence.description

    });

  }


  /*
   * =========================================================
   * DELETE
   * =========================================================
   */

  openDeleteConfirmation(
    occurrence: Occurrence
  ): void {

    this.selectedOccurrence =
      occurrence;

    this.activeModal =
      'delete';

  }


  /*
   * =========================================================
   * CLOSE MODAL
   * =========================================================
   */

  closeModal(): void {

    this.activeModal = null;

    this.selectedOccurrence = null;

    this.companySearchControl.enable();

  }


  /*
   * =========================================================
   * FILTERS
   * =========================================================
   */

  clearFilters(): void {

    this.searchTerm.set('');

    this.selectedStatus.set(null);
  }


  /*
   * =========================================================
   * FORM VALIDATION
   * =========================================================
   */

  isInvalid(
    controlName: string
  ): boolean {

    const control =
      this.occurrenceForm
        .get(controlName);

    return !!control &&
      control.invalid &&
      control.touched;

  }


  /*
   * =========================================================
   * CREATE
   * =========================================================
   */

  onSubmit(): void {

    if (
      this.occurrenceForm.invalid
    ) {

      this.occurrenceForm
        .markAllAsTouched();

      return;

    }


    const formValue =
      this.occurrenceForm
        .getRawValue();


    const occurrenceData:
      OccurrenceCreate = {

      firmId:
        Number(formValue.id),

      amountDue:
        Number(formValue.averageRevenue),

      dateOccurrence:
        formValue.date ?? '',

      description:
        formValue.description ?? ''

    };


    this.occurrenceService
      .create(occurrenceData)
      .subscribe({

        next: async () => {

          await this.notificationService.success(
            'Sucesso!',
            'Ocorrência cadastrada com sucesso.'
          );


          this.currentPage.set(0);

          this.reloadUsersManually();

          this.closeModal();

        },


        error: (error) => {

          console.error(
            'Failed to create occurrence:',
            error
          );


          this.notificationService.error(
            'Erro no Cadastro',
            error?.message ||
            'Não foi possível cadastrar a ocorrência.'
          );

        }

      });

  }


  /*
   * =========================================================
   * UPDATE OCCURRENCE
   * =========================================================
   */

  updateOccurrence(): void {

    if (
      !this.selectedOccurrence ||
      !this.selectedOccurrence.id
    ) {
      return;
    }


    if (
      this.occurrenceForm.invalid
    ) {

      this.occurrenceForm
        .markAllAsTouched();

      return;

    }


    const formValue =
      this.occurrenceForm
        .getRawValue();


    const updateOccurrence:
      OccurrenceUpdate = {

      dateOccurrence:
        formValue.date ?? '',

      amountDue:
        Number(formValue.averageRevenue),

      description:
        formValue.description ?? ''

    };


    const id =
      this.selectedOccurrence.id
        .toString();


    this.occurrenceService
      .update(
        id,
        updateOccurrence
      )
      .subscribe({

        next: async () => {

          await this.notificationService.success(
            'Sucesso!',
            'Ocorrência atualizada com sucesso.'
          );


          this.reloadUsersManually();

          this.closeModal();

        },


        error: (error) => {

          console.error(
            'Failed to update occurrence:',
            error
          );


          this.notificationService.error(
            'Erro na Atualização',
            error?.message ||
            'Não foi possível atualizar a ocorrência.'
          );

        }

      });

  }


  /*
   * =========================================================
   * STATUS
   * =========================================================
   *
   * false -> true  = Resolvida
   * true  -> false = Aberta novamente
   */

  toggleOccurrenceStatus(
    occurrence: Occurrence
  ): void {

    if (!occurrence.id) {
      return;
    }


    const newStatus =
      occurrence.statusResolved !== true;


    this.occurrenceService
      .updateStatus(
        occurrence.id.toString(),
        newStatus
      )
      .subscribe({

        next: async () => {

          /*
           * Atualização imediata da linha.
           */
          occurrence.statusResolved =
            newStatus;


          /*
           * Se o modal de detalhes estiver
           * aberto para a mesma ocorrência,
           * atualiza também.
           */
          if (
            this.selectedOccurrence?.id ===
            occurrence.id
          ) {

            this.selectedOccurrence =
            {
              ...this.selectedOccurrence,
              statusResolved:
                newStatus
            };

          }


          await this.notificationService.success(
            'Sucesso!',

            newStatus
              ? 'Ocorrência marcada como resolvida.'
              : 'Ocorrência reaberta com sucesso.'
          );


          /*
           * Mantém os dados sincronizados
           * com o backend.
           */
          this.reloadUsersManually();

        },


        error: (error) => {

          console.error(
            'Failed to update occurrence status:',
            error
          );


          this.notificationService.error(
            'Erro na atualização',

            error?.message ||
            'Não foi possível atualizar o status da ocorrência.'
          );

        }

      });

  }


  /*
   * =========================================================
   * DELETE
   * =========================================================
   */

  deleteOccurrence(): void {

    if (
      !this.selectedOccurrence ||
      !this.selectedOccurrence.id
    ) {
      return;
    }


    const id =
      this.selectedOccurrence.id
        .toString();


    this.occurrenceService
      .delete(id)
      .subscribe({

        next: async () => {

          await this.notificationService.success(
            'Sucesso!',
            'Ocorrência excluída com sucesso.'
          );


          const page =
            this.occurrencesSearchResults();


          /*
           * Se deletar o último item da
           * última página, volta uma página.
           */
          if (
            page &&
            page.content.length === 1 &&
            this.currentPage() > 0
          ) {

            this.currentPage.update(
              current =>
                current - 1
            );

          }


          this.reloadUsersManually();

          this.closeModal();

        },


        error: (error) => {

          console.error(
            'Failed to delete occurrence:',
            error
          );


          this.notificationService.error(
            'Erro no Delete',

            error?.message ||
            'Não foi possível excluir a ocorrência.'
          );

        }

      });

  }


  /*
   * =========================================================
   * STATUS LABEL
   * =========================================================
   */

  getStatusLabel(
    status: boolean | null
  ): string {

    if (status === null) {
      return 'Sem status';
    }

    return status
      ? 'Resolvida'
      : 'Aberta';

  }


  /*
   * =========================================================
   * STATUS CLASS
   * =========================================================
   */

  getStatusClass(
    status: boolean | null
  ): string {

    if (status === null) {
      return 'status-null';
    }

    return `status-${status
      ? 'resolved'
      : 'open'
      }`;

  }

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

  isSentinelValue(
    value: unknown
  ): boolean {

    return Number(value)
      === 1073741824;

  }

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

}