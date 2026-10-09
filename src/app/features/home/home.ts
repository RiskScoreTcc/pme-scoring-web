import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject
} from '@angular/core';
import { RouterModule } from '@angular/router';

import { MetricsStateService } from '../../core/services/matric/metrics-state-service';
import { JwtDecoderService } from '../../core/services/jwt-decoder/jwt-decoder-service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

  private readonly metricsState = inject(MetricsStateService);
  private readonly jwtDecoderService = inject(JwtDecoderService);

  protected readonly companyMetrics =
    this.metricsState.metricsCompany;

  protected readonly occurrenceMetrics =
    this.metricsState.metricsOccurrence;

  protected readonly isAdmin = computed(
    () => this.jwtDecoderService.getUser()?.role === 'ADMIN'
  );

  protected readonly totalCompanies = computed(() =>
    this.companyMetrics()?.totalEvaluatedFirms ?? 0
  );

  protected readonly lowRiskCount = computed(() =>
    this.companyMetrics()?.lowRiskCount ?? 0
  );

  protected readonly mediumRiskCount = computed(() =>
    this.companyMetrics()?.mediumRiskCount ?? 0
  );

  protected readonly highRiskCount = computed(() =>
    this.companyMetrics()?.highRiskCount ?? 0
  );

  protected readonly openOccurrences = computed(() =>
    this.occurrenceMetrics()?.openOccurrencesCount ?? 0
  );

  protected readonly activeOccurrences = computed(() =>
    this.occurrenceMetrics()?.activeOccurrencesCount ?? 0
  );

  protected readonly riskTotal = computed(() =>
    this.lowRiskCount() +
    this.mediumRiskCount() +
    this.highRiskCount()
  );

  protected readonly lowRiskPercentage = computed(() =>
    this.calculateRiskPercentage(this.lowRiskCount())
  );

  protected readonly mediumRiskPercentage = computed(() =>
    this.calculateRiskPercentage(this.mediumRiskCount())
  );

  protected readonly highRiskPercentage = computed(() =>
    this.calculateRiskPercentage(this.highRiskCount())
  );

  protected readonly hasMetrics = computed(() =>
    this.companyMetrics() !== null ||
    this.occurrenceMetrics() !== null
  );

  protected readonly lastUpdate = computed(() =>
    new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date())
  );

  private calculateRiskPercentage(amount: number): number {
    const total = this.riskTotal();

    if (total === 0) {
      return 0;
    }

    return Number(((amount / total) * 100).toFixed(1));
  }

  protected downloadDashboardReport(): void {
    const generatedAt = new Date();

    const rows: string[][] = [
      ['Relatório PME Scoring', ''],
      ['Data de geração', generatedAt.toLocaleString('pt-BR')],
      ['', ''],
      ['Indicador', 'Quantidade'],
      ['Empresas avaliadas', String(this.totalCompanies())],
      ['Empresas de baixo risco', String(this.lowRiskCount())],
      ['Empresas de médio risco', String(this.mediumRiskCount())],
      ['Empresas de alto risco', String(this.highRiskCount())],
      ['Ocorrências abertas', String(this.openOccurrences())],
      ['Ocorrências ativas', String(this.activeOccurrences())],
      ['Total de empresas classificadas', String(this.riskTotal())],
      ['', ''],
      ['Classificação de risco', 'Percentual'],
      ['Baixo risco', `${this.lowRiskPercentage()}%`],
      ['Médio risco', `${this.mediumRiskPercentage()}%`],
      ['Alto risco', `${this.highRiskPercentage()}%`]
    ];

    const csv = rows
      .map(row =>
        row.map(value => this.escapeCsv(value)).join(';')
      )
      .join('\r\n');

    const blob = new Blob(
      ['\uFEFF', csv],
      { type: 'text/csv;charset=utf-8;' }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = generatedAt.toISOString().slice(0, 10);

    link.href = url;
    link.download = `pme-scoring-relatorio-${date}.csv`;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  private escapeCsv(value: string): string {
    return `"${String(value ?? '').replace(/"/g, '""')}"`;
  }
}
