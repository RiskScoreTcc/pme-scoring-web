import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap, catchError } from 'rxjs/operators';
import { combineLatest, of } from 'rxjs';
import { Occurrence } from '../../core/models/occurences/occurrence';
import { OccurrenceStatus } from '../../core/models/occurences/occurrence-status';
import { ModalTypeOccurrence } from '../../core/models/occurences/modal-type-occurrence';
import { OccurrenceService } from '../../core/services/occurences/occurrence-service';
import { CompanyService } from '../../core/services/companies/company-service';
import { OccurrenceCreate } from '../../core/models/occurences/occurrence-create';
import { Company } from '../../core/models/companies/company';
import { NotificationService } from '../../shared/services/notification/notification-service';
import { Page } from '../../core/models/Page';


@Component({
  selector: 'app-occurrences',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './occurrences.html',
  styleUrl: './occurrences.css'
})
export class Occurrences implements OnInit {

  private readonly occurrenceService = inject(OccurrenceService);
  private readonly companyService = inject(CompanyService);
  private readonly fb = inject(FormBuilder);
  private readonly notificationService = inject(NotificationService);

  protected readonly isLoading = signal(false);
  protected readonly currentPage = signal(0);
  protected readonly pageSize = signal(20);
  
  private readonly forceReload$ = new BehaviorSubject<number>(0);

  private readonly currentPage$ = toObservable(this.currentPage);
  private readonly pageSize$ = toObservable(this.pageSize);


  readonly occurrencesSearchResults = signal<Page<Occurrence> | null>(null);
  readonly companySearchControl = new FormControl('');
  readonly companySearchResults = signal<Company[]>([]);
  readonly isSearchingCompanies = signal<boolean>(false);
  readonly showCompanyDropdown = signal<boolean>(false);
  readonly totalCompaniesFound = signal<number>(0);
  readonly hasMoreResults = computed(() => this.totalCompaniesFound() > this.companySearchResults().length);
  readonly occurrenceForm = this.fb.group({
    companyId: ['', Validators.required],
    averageRevenue: ['', Validators.required, Validators.min(0.01)],
    date: ['', Validators.required],
    description: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]
    ],
  });

  selectedOccurrence: Occurrence | null = null;

  activeModal: ModalTypeOccurrence = null;

  searchTerm = signal('');
  selectedStatus = signal('');
  selectedType = signal('');

  protected readonly companies = signal<Page<Company> | null>(null);

  ngOnInit(): void {
    this.setupCompanySearch();
  }

  private setupOccurrenceSearch(): void {
    combineLatest([
      this.currentPage$,
      this.pageSize$,
      this.forceReload$
    ]).pipe(
      switchMap(([page, size]) => {
        /* Liga o loading da tabela
        this.isLoading.set(true);*/
        return this.occurrenceService.searchOccurrences(page, size, 'dateOccurrence,desc');
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (pageResponse) => {
        // Atualiza o Signal da tabela com os dados do banco
        this.occurrencesSearchResults.set(pageResponse);
        /*this.isLoading.set(false);*/

=
        this.notificationService.success(
          'Dados carregados',
          'A lista de ocorrências foi carregada com sucesso.'
        );
      },
      error: (error) => {
        /*this.isLoading.set(false);*/

        this.notificationService.error(
          'Falha ao carregar ocorrências',
          error.message || 'Não foi possível carregar a lista de ocorrências.'
        );
      }
    });
  }

  private setupCompanySearch(): void {
    this.companySearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(term => {
        if (!term || term.length < 2) {
          this.companySearchResults.set([]);
          this.showCompanyDropdown.set(false);
          this.occurrenceForm.patchValue({ companyId: null });
          this.occurrenceForm.get('companyId')?.markAsDirty();
        } else {
          this.isSearchingCompanies.set(true);
        }
      }),
      filter((term): term is string => !!term && term.length >= 2),
      switchMap(term =>

        this.companyService.searchCompanies(term, 0, 10).pipe(
          catchError(() => of({ content: [], totalElements: 0 }))
        )

      )
    ).subscribe(page => {
      this.companySearchResults.set(page.content);
      this.isSearchingCompanies.set(false);
      this.totalCompaniesFound.set(page.totalElements);
      this.showCompanyDropdown.set(true);
    });
  }

  selectCompany(company: Company): void {
    // Atualiza o ID no formulário principal
    this.occurrenceForm.patchValue({ companyId: company.id.toString() });
    this.occurrenceForm.get('companyId')?.markAsDirty();

    // Preenche o campo visual com o nome formatado e fecha a lista
    this.companySearchControl.setValue(`${company.registeredCompanyName} — ${company.cnpj}`, { emitEvent: false });
    this.showCompanyDropdown.set(false);
  }


  protected readonly filteredOccurrences = computed(() => {

    const term = this.searchTerm().trim().toLowerCase();
    const currentStatus = this.selectedStatus();
    const currentType = this.selectedType();

    const occurrences = this.occurrencesSearchResults()?.content || [];

    return occurrences.filter((occurrence: Occurrence) => {

      const matchesSearch =
        !term ||
        occurrence.firm?.companyName?.toLowerCase().includes(term) ||
        occurrence.firm?.cnpj?.includes(term) ||
        occurrence.type?.toLowerCase().includes(term);

      const matchesStatus =
        !currentStatus ||
        occurrence.status === currentStatus;

      const matchesType =
        !currentType ||
        occurrence.type === currentType;

      return matchesSearch && matchesStatus && matchesType;
    });
  });

  get totalOccurrences(): number {
    return this.occurrencesSearchResults()?.content.length || 0;
  }

  protected readonly openOccurrences = computed(() => {
    const occurrences = this.occurrencesSearchResults()?.content ?? [];

    return occurrences.filter(
      (occurrence: Occurrence) => occurrence.status === 'open'
    ).length;
  });

  protected readonly recentOccurrences = computed(() => {
    const occurrences = this.occurrencesSearchResults()?.content ?? [];

    return occurrences.filter(
      (occurrence: Occurrence) =>
        occurrence.date !== undefined &&
        occurrence.date >= '2026-08-24'
    ).length;
  });


  openDetails(occurrence: Occurrence): void {
    this.selectedOccurrence = occurrence;
    this.activeModal = 'details';
  }

  openNewOccurrence(): void {
    this.selectedOccurrence = null;
    this.occurrenceForm.reset({
      companyId: '',
      averageRevenue: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });

    this.activeModal = 'new-occurrence';
  }

  openEdit(occurrence: Occurrence): void {
    this.selectedOccurrence = occurrence;

    this.occurrenceForm.patchValue({
      companyId: occurrence.firm?.id.toString() ?? '',
      averageRevenue: occurrence.averageRevenue?.toString() ?? '',
      date: occurrence.date,
      description: occurrence.description,
    });

    this.activeModal = 'edit';
  }

  openDeleteConfirmation(occurrence: Occurrence): void {
    this.selectedOccurrence = occurrence;
    this.activeModal = 'delete';
  }

  closeModal(): void {
    this.activeModal = null;
    this.selectedOccurrence = null;
  }

  clearFilters(): void {
    this.searchTerm = signal('');
    this.selectedStatus = signal('');
    this.selectedType = signal('');
  }

  isInvalid(controlName: string): boolean {
    const control = this.occurrenceForm.get(controlName);

    return !!control && control.invalid && control.touched;
  }

  onSubmit(): void {
    if (this.occurrenceForm.invalid) {
      this.occurrenceForm.markAllAsTouched();
      return;
    }

    const formValue = this.occurrenceForm.getRawValue();

    console.log('Ocorrência:', formValue);

    const occurrenceData: OccurrenceCreate = {
      companyId: Number(formValue.companyId),
      averageRevenue: Number(formValue.averageRevenue),
      date: formValue.date ?? '',
      description: formValue.description ?? ''
    };

    this.occurrenceService.create(occurrenceData).subscribe({
      next: (occurrence) => {
        console.log('Ocorrência criada:', occurrence);
      },
      error: (error) => {
        console.error('Erro ao cadastrar ocorrência:', error);
      }
    });


    this.closeModal();
  }

  updateOccurrence(): void {
    if (!this.selectedOccurrence) {
      return;
    }

    if (this.occurrenceForm.invalid) {
      this.occurrenceForm.markAllAsTouched();
      return;
    }

    const formValue = this.occurrenceForm.getRawValue();

    console.log(
      'Atualizar ocorrência:',
      this.selectedOccurrence.id,
      formValue
    );

    /*
      Futuramente:

      this.occurrenceService.update(
        this.selectedOccurrence.id,
        formValue
      ).subscribe(...)
    */

    this.closeModal();
  }

  deleteOccurrence(): void {
    if (!this.selectedOccurrence) {
      return;
    }

    console.log(
      'Excluir ocorrência:',
      this.selectedOccurrence.id
    );

    /*
      Futuramente:

      this.occurrenceService.delete(
        this.selectedOccurrence.id
      ).subscribe(...)
    */

    this.closeModal();
  }



  getStatusLabel(status: OccurrenceStatus): string {
    const labels: Record<OccurrenceStatus, string> = {
      open: 'Aberta',
      in_analysis: 'Em análise',
      resolved: 'Resolvida'
    };

    return labels[status];
  }

  getStatusClass(status: OccurrenceStatus): string {
    return `status-${status}`;
  }
}