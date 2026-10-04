import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Occurrence } from '../../core/models/occurences/occurrence';
import { OccurrenceStatus } from '../../core/models/occurences/occurrence-status';
import { ModalTypeOccurrence } from '../../core/models/occurences/modal-type-occurrence';
import { OccurrenceService } from '../../core/services/occurences/occurrence-service';
import { CompanyService } from '../../core/services/companies/company-service';
import { OccurrenceCreate } from '../../core/models/occurences/occurrence-create';
import { Company } from '../../core/models/companies/company';
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

  readonly occurrences: Occurrence[] = this.occurrenceService.getAll();
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

  searchTerm = '';
  selectedStatus = '';
  selectedType = '';

  // Futuramente esses valores virão da API.
  protected readonly companies = signal<Page<Company> | null>(null);

  ngOnInit(): void {
    this.setupCompanySearch();
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


  get filteredOccurrences(): Occurrence[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.occurrences.filter(occurrence => {

      const matchesSearch =
        !term ||
        occurrence.companyName?.toLowerCase().includes(term) ||
        occurrence.cnpj?.includes(term) ||
        occurrence.type?.toLowerCase().includes(term);


      const matchesStatus =
        !this.selectedStatus ||
        occurrence.status === this.selectedStatus;

      const matchesType =
        !this.selectedType ||
        occurrence.type === this.selectedType;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }

  get totalOccurrences(): number {
    return this.occurrences.length;
  }

  get openOccurrences(): number {
    return this.occurrences.filter(
      occurrence => occurrence.status === 'open'
    ).length;
  }

  get recentOccurrences(): number {
    return this.occurrences.filter(
      occurrence =>
        occurrence.date !== undefined &&
        occurrence.date >= '2026-08-24'
    ).length;
  }

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
      companyId: occurrence.companyId?.toString() ?? '',
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
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedType = '';
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