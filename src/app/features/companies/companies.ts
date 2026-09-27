import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalTypeCompanie } from '../../core/models/companies/modal-type-companie';
import { Company } from '../../core/models/companies/company';
import { ClassificationType } from '../../core/models/classification-type';
import { Occurrence } from '../../core/models/occurences/occurrence';
import { CompanyService } from '../../core/services/companies/company-service';
import { ScoreService } from '../../core/services/scores/score-service';
import { OccurrenceService } from '../../core/services/occurences/occurrence-service';

@Component({
  selector: 'app-companies',
  imports: [RouterLink],
  templateUrl: './companies.html',
  styleUrl: './companies.css'
})
export class Companies {

  private readonly companyService = inject(CompanyService);
  private readonly scoreService = inject(ScoreService);
  private readonly occurrenceService = inject(OccurrenceService);

  readonly companies: Company[] = this.companyService.getAll();

  openActionMenu: number | null = null;

  selectedCompany: Company | null = null;

  activeModal: ModalTypeCompanie = null;

  toggleActionMenu(companyId: number): void {
    if (this.openActionMenu === companyId) {
      this.openActionMenu = null;
      return;
    }

    this.openActionMenu = companyId;
  }

  openCompanyDetails(companyId: number): void {
    this.selectCompany(companyId);
    this.activeModal = 'details';
  }

  openScore(companyId: number): void {
    this.selectCompany(companyId);
    this.activeModal = 'score';
  }

  openScoreCalculation(companyId: number): void {
    this.selectCompany(companyId);
    this.activeModal = 'score';
  }

  openOccurrences(companyId: number): void {
    this.selectCompany(companyId);
    this.activeModal = 'occurrences';
  }

  openNewOccurrence(companyId: number): void {
    this.selectCompany(companyId);
    this.activeModal = 'new-occurrence';
  }

  openDeleteConfirmation(companyId: number): void {
    this.selectCompany(companyId);
    this.activeModal = 'delete';
  }

  closeAllModals(): void {
    this.activeModal = null;
    this.selectedCompany = null;
    this.openActionMenu = null;
  }

  closeModal(): void {
    this.activeModal = null;
  }

  calculateScore(): void {
    if (!this.selectedCompany) {
      return;
    }

    this.scoreService.calculateScore(this.selectedCompany.id);

    this.closeAllModals();
  }

  registerOccurrence(): void {
    if (!this.selectedCompany) {
      return;
    }
    
    /*

    this.occurrenceService.create(this.selectedCompany.id);
    */
    this.closeAllModals();
  }

  deleteCompany(): void {
    if (!this.selectedCompany) {
      return;
    }

    this.companyService.delete(this.selectedCompany.id);

    this.closeAllModals();
  }

  getRiskLabel(risk: ClassificationType | null): string {
    switch (risk) {
      case 'low':
        return 'Baixo risco';

      case 'medium':
        return 'Médio risco';

      case 'high':
        return 'Alto risco';

      default:
        return 'Não avaliado';
    }
  }

  getRiskClass(risk: ClassificationType | null): string {
    switch (risk) {
      case 'low':
        return 'risk-low';

      case 'medium':
        return 'risk-medium';

      case 'high':
        return 'risk-high';

      default:
        return '';
    }
  }

  private selectCompany(companyId: number): void {
    this.selectedCompany = this.companyService.getById(companyId);
    this.openActionMenu = null;
  }
}