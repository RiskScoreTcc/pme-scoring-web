import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { RouterModule } from '@angular/router';

import { MetricsStateService } from '../../core/services/matric/metrics-state-service';
import { JwtDecoderService } from '../../core/services/jwt-decoder/jwt-decoder-service';
import { DashboardReportService } from '../../core/services/dashboard/dashboard-report-service';

type RiskFilter = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';

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
  private readonly dashboardReportService = inject(DashboardReportService)

  protected readonly companyMetrics =
    this.metricsState.metricsCompany;

  protected readonly occurrenceMetrics =
    this.metricsState.metricsOccurrence;


  protected readonly isDownloadDialogOpen = signal(false);

  protected readonly selectedRisk = signal<RiskFilter>('ALL');

  protected readonly isDownloading = signal(false);

  protected readonly downloadError = signal<string | null>(null);


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


  protected openDownloadDialog(): void {
    this.selectedRisk.set('ALL');
    this.downloadError.set(null);
    this.isDownloadDialogOpen.set(true);
  }

  protected closeDownloadDialog(): void {
    if (this.isDownloading()) {
      return;
    }

    this.isDownloadDialogOpen.set(false);
    this.downloadError.set(null);
  }

  protected onRiskChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    if (
      value === 'ALL' ||
      value === 'HIGH' ||
      value === 'MEDIUM' ||
      value === 'LOW'
    ) {
      this.selectedRisk.set(value);
      this.downloadError.set(null);
    }
  }

  protected confirmDashboardDownload(): void {
    if (this.isDownloading()) {
      return;
    }

    const risk = this.selectedRisk();

    this.isDownloading.set(true);
    this.downloadError.set(null);

    this.dashboardReportService
      .downloadDashboard(risk === 'ALL' ? undefined : risk)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');

          link.href = url;
          link.download = 'relatorio-dashboard.csv';

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          window.URL.revokeObjectURL(url);

          this.isDownloading.set(false);
          this.isDownloadDialogOpen.set(false);
        },
        error: (error) => {
          console.error('Erro ao baixar o relatório:', error);

          this.downloadError.set(
            'Não foi possível baixar o relatório. Tente novamente.'
          );

          this.isDownloading.set(false);
        }
      });
  }

}
