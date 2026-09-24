import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClassificationType } from '../../core/models/classification-type';
import { ModalTypeCompanie } from '../../core/models/companies/modal-type-companie';
import { Occurrence } from '../../core/models/occurences/occurrence';
import { Company } from '../../core/models/companies/company';

@Component({
  selector: 'app-companies',
  imports: [RouterLink],
  templateUrl: './companies.html',
  styleUrl: './companies.css'
})
export class Companies {

  readonly companies: Company[] = [
    {
      id: 1,
      legalName: 'Alfa Comércio Ltda.',
      tradeName: 'Alfa Comércio',
      cnpj: '12.345.678/0001-90',
      sector: 'Comércio varejista',
      score: 824,
      risk: 'low',
      status: 'active',
      lastScoreDate: '21/09/2026 às 14:32',
      occurrences: [
        {
          id: 1,
          type: 'Atraso de pagamento',
          description: 'Registro de atraso em obrigação financeira.',
          date: '18/09/2026',
          severity: 'medium'
        },
        {
          id: 2,
          type: 'Consulta realizada',
          description: 'Consulta registrada no histórico da empresa.',
          date: '12/09/2026',
          severity: 'low'
        },
        {
          id: 3,
          type: 'Pendência financeira',
          description: 'Pendência registrada durante análise financeira.',
          date: '05/09/2026',
          severity: 'high'
        }
      ]
    },

    {
      id: 2,
      legalName: 'Beta Serviços S.A.',
      tradeName: 'Beta Serviços',
      cnpj: '23.456.789/0001-81',
      sector: 'Serviços empresariais',
      score: 641,
      risk: 'medium',
      status: 'active',
      lastScoreDate: '20/09/2026 às 10:15',
      occurrences: [
        {
          id: 4,
          type: 'Atraso de pagamento',
          description: 'Pagamento realizado após o vencimento.',
          date: '17/09/2026',
          severity: 'medium'
        },
        {
          id: 5,
          type: 'Consulta realizada',
          description: 'Nova consulta registrada no histórico.',
          date: '10/09/2026',
          severity: 'low'
        }
      ]
    },

    {
      id: 3,
      legalName: 'Gamma Indústria Ltda.',
      tradeName: 'Gamma Indústria',
      cnpj: '34.567.890/0001-72',
      sector: 'Indústria',
      score: 312,
      risk: 'high',
      status: 'active',
      lastScoreDate: '19/09/2026 às 16:48',
      occurrences: [
        {
          id: 6,
          type: 'Pendência financeira',
          description: 'Pendência identificada durante análise financeira.',
          date: '19/09/2026',
          severity: 'high'
        },
        {
          id: 7,
          type: 'Atraso de pagamento',
          description: 'Obrigação financeira em atraso.',
          date: '15/09/2026',
          severity: 'high'
        },
        {
          id: 8,
          type: 'Restrição identificada',
          description: 'Restrição identificada durante consulta.',
          date: '08/09/2026',
          severity: 'high'
        }
      ]
    },

    {
      id: 4,
      legalName: 'Delta Tecnologia Ltda.',
      tradeName: 'Delta Tecnologia',
      cnpj: '45.678.901/0001-63',
      sector: 'Tecnologia da informação',
      score: 756,
      risk: 'low',
      status: 'active',
      lastScoreDate: '18/09/2026 às 09:21',
      occurrences: [
        {
          id: 9,
          type: 'Consulta realizada',
          description: 'Consulta registrada no histórico da empresa.',
          date: '18/09/2026',
          severity: 'low'
        }
      ]
    },

    {
      id: 5,
      legalName: 'Epsilon Logística S.A.',
      tradeName: 'Epsilon Logística',
      cnpj: '56.789.012/0001-54',
      sector: 'Transporte e logística',
      score: 587,
      risk: 'medium',
      status: 'active',
      lastScoreDate: '17/09/2026 às 11:40',
      occurrences: [
        {
          id: 10,
          type: 'Atraso de pagamento',
          description: 'Atraso identificado em obrigação financeira.',
          date: '16/09/2026',
          severity: 'medium'
        },
        {
          id: 11,
          type: 'Consulta realizada',
          description: 'Consulta registrada no histórico.',
          date: '11/09/2026',
          severity: 'low'
        }
      ]
    }
  ];

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

    console.log(
      'Calculando score da empresa:',
      this.selectedCompany.legalName
    );

    this.closeAllModals();
  }

  registerOccurrence(): void {
    if (!this.selectedCompany) {
      return;
    }

    console.log(
      'Registrando nova ocorrência para:',
      this.selectedCompany.legalName
    );

    this.closeAllModals();
  }

  deleteCompany(): void {
    if (!this.selectedCompany) {
      return;
    }

    console.log(
      'Excluindo empresa:',
      this.selectedCompany.legalName
    );

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

  getOccurrenceSeverityClass(
    severity: Occurrence['severity']
  ): string {
    switch (severity) {
      case 'low':
        return 'occurrence-low';

      case 'medium':
        return 'occurrence-warning';

      case 'high':
        return 'occurrence-danger';
        
      default:
      throw new Error(`Severidade de ocorrência inválida: ${severity}`);
    }
  }

  private selectCompany(companyId: number): void {
    this.selectedCompany =
      this.companies.find(company => company.id === companyId) ?? null;

    this.openActionMenu = null;
  }
}