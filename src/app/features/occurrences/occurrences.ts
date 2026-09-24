import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ClassificationType } from '../../core/models/classification-type';
import { Occurrence } from '../../core/models/occurences/occurrence';
import { OccurrenceStatus } from '../../core/models/occurences/occurrence-status';
import { ModalTypeOccurrence } from '../../core/models/occurences/modal-type-occurrence';


@Component({
  selector: 'app-occurrences',
  imports: [ReactiveFormsModule,FormsModule,CommonModule],
  templateUrl: './occurrences.html',
  styleUrl: './occurrences.css'
})
export class Occurrences {

  private readonly fb = inject(FormBuilder);

  readonly occurrences: Occurrence[] = [
    {
      id: 1,
      companyId: 1,
      companyName: 'Alfa Comércio Ltda.',
      cnpj: '12.345.678/0001-90',
      type: 'Atraso de pagamento',
      description: 'Pagamento de obrigação financeira realizado após o prazo estabelecido.',
      severity: 'medium',
      status: 'resolved',
      date: '2026-09-18',
      notes: 'Ocorrência regularizada pela empresa.'
    },
    {
      id: 2,
      companyId: 3,
      companyName: 'Gamma Indústria Ltda.',
      cnpj: '34.567.890/0001-72',
      type: 'Restrição financeira',
      description: 'Identificada restrição financeira associada ao CNPJ da empresa.',
      severity: 'high',
      status: 'in_analysis',
      date: '2026-09-20',
      notes: 'Aguardando análise complementar.'
    },
    {
      id: 3,
      companyId: 2,
      companyName: 'Beta Serviços S.A.',
      cnpj: '23.456.789/0001-81',
      type: 'Atraso de pagamento',
      description: 'Registro de atraso em obrigação financeira.',
      severity: 'low',
      status: 'resolved',
      date: '2026-09-12',
      notes: 'Pagamento identificado posteriormente.'
    },
    {
      id: 4,
      companyId: 5,
      companyName: 'Epsilon Logística S.A.',
      cnpj: '56.789.012/0001-54',
      type: 'Inconsistência cadastral',
      description: 'Informação cadastral divergente identificada durante análise.',
      severity: 'medium',
      status: 'open',
      date: '2026-09-21',
      notes: 'Necessário validar informações cadastrais.'
    },
    {
      id: 5,
      companyId: 4,
      companyName: 'Delta Tecnologia Ltda.',
      cnpj: '45.678.901/0001-63',
      type: 'Documento pendente',
      description: 'Documento necessário para análise de risco ainda não foi disponibilizado.',
      severity: 'low',
      status: 'open',
      date: '2026-09-22'
    },
    {
      id: 6,
      companyId: 3,
      companyName: 'Gamma Indústria Ltda.',
      cnpj: '34.567.890/0001-72',
      type: 'Atraso de pagamento',
      description: 'Atraso identificado em obrigação financeira da empresa.',
      severity: 'high',
      status: 'open',
      date: '2026-09-22'
    }
  ];

  readonly occurrenceForm = this.fb.group({
    companyId: ['', Validators.required],
    type: ['', Validators.required],
    severity: ['medium' as ClassificationType, Validators.required],
    date: ['', Validators.required],
    description: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]
    ],
    notes: ['', Validators.maxLength(500)]
  });

  selectedOccurrence: Occurrence | null = null;

  activeModal: ModalTypeOccurrence = null;

  searchTerm = '';
  selectedSeverity = '';
  selectedStatus = '';
  selectedType = '';

  // Futuramente esses valores virão da API.
  readonly companies = [
    {
      id: 1,
      legalName: 'Alfa Comércio Ltda.',
      cnpj: '12.345.678/0001-90'
    },
    {
      id: 2,
      legalName: 'Beta Serviços S.A.',
      cnpj: '23.456.789/0001-81'
    },
    {
      id: 3,
      legalName: 'Gamma Indústria Ltda.',
      cnpj: '34.567.890/0001-72'
    },
    {
      id: 4,
      legalName: 'Delta Tecnologia Ltda.',
      cnpj: '45.678.901/0001-63'
    },
    {
      id: 5,
      legalName: 'Epsilon Logística S.A.',
      cnpj: '56.789.012/0001-54'
    }
  ];

  get filteredOccurrences(): Occurrence[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.occurrences.filter(occurrence => {

      const matchesSearch =
        !term ||
        occurrence.companyName?.toLowerCase().includes(term) ||
        occurrence.cnpj?.includes(term) ||
        occurrence.type?.toLowerCase().includes(term);

      const matchesSeverity =
        !this.selectedSeverity ||
        occurrence.severity === this.selectedSeverity;

      const matchesStatus =
        !this.selectedStatus ||
        occurrence.status === this.selectedStatus;

      const matchesType =
        !this.selectedType ||
        occurrence.type === this.selectedType;

      return (
        matchesSearch &&
        matchesSeverity &&
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

  get highSeverityOccurrences(): number {
    return this.occurrences.filter(
      occurrence => occurrence.severity === 'high'
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
      type: '',
      severity: 'medium',
      date: new Date().toISOString().split('T')[0],
      description: '',
      notes: ''
    });

    this.activeModal = 'new-occurrence';
  }

  openEdit(occurrence: Occurrence): void {
    this.selectedOccurrence = occurrence;

    this.occurrenceForm.patchValue({
      companyId: occurrence.companyId?.toString() ?? '',
      type: occurrence.type,
      severity: occurrence.severity,
      date: occurrence.date,
      description: occurrence.description,
      notes: occurrence.notes ?? ''
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
    this.selectedSeverity = '';
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

    /*
      Futuramente:

      this.occurrenceService.create(formValue)
        .subscribe({
          next: () => {
            this.closeModal();
            this.loadOccurrences();
          }
        });
    */

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

  getSeverityLabel(severity: ClassificationType): string {
    const labels: Record<ClassificationType, string> = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta'
    };

    return labels[severity];
  }

  getSeverityClass(severity: ClassificationType): string {
    return `severity-${severity}`;
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