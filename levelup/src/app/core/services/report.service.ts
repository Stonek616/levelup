import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResponse } from '../models/api-response.model';
import {
  CreateReportRequest,
  ReportItem,
  ReportStatus,
  UpdateReportRequest,
} from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);

  submitReport(request: CreateReportRequest): Observable<ReportItem> {
    return this.http.post<ReportItem>(`${environment.apiUrl}/reports`, request);
  }

  getReports(
    status?: ReportStatus,
    page = 0,
    size = 20,
  ): Observable<PagedResponse<ReportItem>> {
    const params: Record<string, string | number> = { page, size };
    if (status) params['status'] = status;
    return this.http.get<PagedResponse<ReportItem>>(
      `${environment.apiUrl}/admin/reports`,
      { params },
    );
  }

  updateReport(
    id: string,
    request: UpdateReportRequest,
  ): Observable<ReportItem> {
    return this.http.patch<ReportItem>(
      `${environment.apiUrl}/admin/reports/${id}`,
      request,
    );
  }
}
