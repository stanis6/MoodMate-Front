import { Injectable }       from '@angular/core';
import { HttpClient }       from '@angular/common/http';
import { Observable }       from 'rxjs';
import { ChildReportDto }   from '../models/child-report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private baseUrl = 'http://localhost:8080/api/teacher';

  constructor(private http: HttpClient) {}

  getChildReport(childId: string, date: string): Observable<ChildReportDto> {
    return this.http.get<ChildReportDto>(
      `${this.baseUrl}/report?childId=${childId}&date=${date}`
    );
  }

  getAllReports(childId: string): Observable<ChildReportDto[]> {
    return this.http.get<ChildReportDto[]>(
      `${this.baseUrl}/report/all?childId=${childId}`
    );
  }

  downloadReportPdf(childId: string, date: string): Observable<Blob> {
    const url = `${this.baseUrl}/report/pdf?childId=${childId}&date=${date}`;
    return this.http.get(url, {
      responseType: 'blob',
    });
  }

  sendReportEmail(childId: string, date: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/report/email?childId=${childId}&date=${date}`,
      {}
    );
  }
}
