import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReportItem, ReportStatus } from '../../../core/models/report.model';
import { ReportService } from '../../../core/services/report.service';

@Component({
  selector: 'app-admin-reports-page',
  imports: [DatePipe, LowerCasePipe, FormsModule, RouterLink],
  templateUrl: './admin-reports-page.component.html',
  styleUrl: './admin-reports-page.component.scss'
})
export class AdminReportsPageComponent implements OnInit {
  private reportService = inject(ReportService);

  reports = signal<ReportItem[]>([]);
  loading = signal(true);
  hasMore = signal(false);
  activeFilter = signal<ReportStatus | undefined>(undefined);
  notesInput: Record<string, string> = {};
  deleteContent: Record<string, boolean> = {};
  private page = 0;

  readonly filters: { label: string; value: ReportStatus | undefined }[] = [
    { label: 'All', value: undefined },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Resolved', value: 'RESOLVED' },
    { label: 'Dismissed', value: 'DISMISSED' },
  ];

  ngOnInit(): void {
    this.load();
  }

  setFilter(value: ReportStatus | undefined): void {
    if (this.activeFilter() === value) return;
    this.activeFilter.set(value);
    this.page = 0;
    this.reports.set([]);
    this.hasMore.set(false);
    this.load();
  }

  load(): void {
    if (this.loading() && this.page > 0) return;
    this.loading.set(true);
    this.reportService.getReports(this.activeFilter(), this.page, 20).subscribe({
      next: (res) => {
        this.reports.update(existing => [...existing, ...res.content]);
        this.hasMore.set(!res.last);
        this.page++;
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  resolve(report: ReportItem): void {
    this.reportService.updateReport(report.id, {
      status: 'RESOLVED',
      notes: this.notesInput[report.id] || undefined,
      deleteContent: this.deleteContent[report.id] ?? false
    }).subscribe({
      next: (updated) => this.replaceReport(updated)
    });
  }

  dismiss(report: ReportItem): void {
    this.reportService.updateReport(report.id, {
      status: 'DISMISSED',
      notes: this.notesInput[report.id] || undefined
    }).subscribe({
      next: (updated) => this.replaceReport(updated)
    });
  }

  private replaceReport(updated: ReportItem): void {
    this.reports.update(list => list.map(r => r.id === updated.id ? updated : r));
  }

  targetLink(report: ReportItem): string[] {
    switch (report.targetType) {
      case 'REVIEW': return ['/reviews', report.targetId];
      case 'USER': return ['/profile', report.targetId];
      default: return ['/reviews', report.targetId];
    }
  }

  formatReason(reason: string): string {
    return reason.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
}
