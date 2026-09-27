import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Occurrence } from '../../core/models/occurences/occurrence';
import { OccurrenceStatus } from '../../core/models/occurences/occurrence-status';
import { ModalTypeOccurrence } from '../../core/models/occurences/modal-type-occurrence';
import { OccurrenceService } from '../../core/services/occurences/occurrence-service';
import { CompanyService } from '../../core/services/companies/company-service';
import { OccurrenceCreate } from '../../core/models/occurences/occurrence-create';

@Component({
  selector: 'app-occurrences',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './occurrences.html',
  styleUrl: './occurrences.css'
})
export class Occurrences {

  private readonly occurrenceService = inject(OccurrenceService);
  private readonly companyService = inject(CompanyService);
  private readonly fb = inject(FormBuilder);
  readonly occurrences: Occurrence[] = this.occurrenceService.getAll();

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
  readonly companies = this.companyService.getAll();

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