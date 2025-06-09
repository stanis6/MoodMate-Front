import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { ClassroomService }              from '../../../shared/services/classroom.service';
import { AuthService }                   from '../../../shared/services/auth.service';
import { Classroom }                     from '../../../shared/models/classroom.model';
import { saveAs }                        from 'file-saver';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { NgIf, NgFor, NgClass }          from '@angular/common';
import { Subject }                       from 'rxjs';
import { HeaderComponent }               from '../header/header.component';
import { ReportService }                 from '../../../shared/services/report.service';
import { ChildReportDto }                from '../../../shared/models/child-report.model';

// Direct Chart.js import
import { Chart, registerables }          from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-classroom',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, HeaderComponent, NgClass],
  templateUrl: './classroom.component.html',
})
export class ClassroomComponent implements OnInit, OnDestroy, AfterViewInit {
  classroom?: Classroom;

  isAddChildModalOpen = false;
  addChildForm: FormGroup;
  successMsg = '';
  errorMsg = '';

  isReportModalOpen = false;
  selectedChildId: string | null = null;
  selectedChildName = '';
  allReports: ChildReportDto[] = [];
  reportDate = new Date().toISOString().substring(0, 10);
  reportData: ChildReportDto | null = null;
  reportError: string | null = null;
  today = new Date().toISOString().substring(0, 10);

  emailSuccessMsg: string | null = null;
  emailErrorMsg: string | null = null;

  private destroy$ = new Subject<void>();
  private sse?: EventSource;

  // Reference to the canvas element
  @ViewChild('scoreChart', { static: false })
  private scoreChartRef!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  constructor(
    private classroomService: ClassroomService,
    private reportService: ReportService,
    private authService: AuthService,
    fb: FormBuilder
  ) {
    this.addChildForm = fb.group({
      parentEmail:    ['', [Validators.required, Validators.email]],
      childFirstName: ['', Validators.required],
      childLastName:  ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.load();
    if (this.authService.getToken()) {
      this.openSse();
    }
  }

  ngAfterViewInit(): void {
    // Chart will be initialized when data is ready in openReport()
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.sse?.close();
    this.chart?.destroy();
  }

  private load() {
    this.classroomService.getClassroom().subscribe({
      next: data => {
        this.classroom = data;
      },
      error: err => console.error('Error fetching classroom:', err)
    });
  }

  openAddChildModal() {
    this.isAddChildModalOpen = true;
    this.successMsg = '';
    this.errorMsg = '';
    this.addChildForm.reset();
  }

  closeAddChildModal() {
    this.isAddChildModalOpen = false;
    this.addChildForm.reset();
    this.successMsg = '';
    this.errorMsg = '';
  }

  onSubmit() {
    if (this.addChildForm.invalid) return;

    this.classroomService.createChild(this.addChildForm.value).subscribe({
      next: () => {
        this.successMsg = 'Confirmation email sent!';
        this.errorMsg = '';
        this.closeAddChildModal();
      },
      error: err => {
        this.errorMsg = 'Failed to send email.';
        this.successMsg = '';
        console.error(err);
      }
    });
  }

  private openSse() {
    const token = this.authService.getToken();
    this.sse = new EventSource(
      `http://localhost:8080/api/teacher/classroom/stream?token=${token}`
    );

    this.sse.onopen = () => console.log('SSE connection opened');
    this.sse.onerror = err => console.error('SSE error', err);

    this.sse.addEventListener('new-child', (_: MessageEvent) => {
      this.load();
    });
  }

  openReport(child: any) {
    this.selectedChildId = child.id;
    this.selectedChildName = `${child.firstName} ${child.lastName}`;
    this.allReports = [];
    this.reportError = null;
    this.reportData = null;
    this.reportDate = this.today;
    this.emailSuccessMsg = null;
    this.emailErrorMsg   = null;
    this.isReportModalOpen = true;

    // Clean up any existing chart
    this.chart?.destroy();

    this.reportService.getAllReports(child.id).subscribe({
      next: (reports) => {
        this.allReports = reports;

        // Build labels (dates) and data (scores)
        const labels: string[] = [];
        const data: number[]   = [];
        this.allReports.forEach(r => {
          labels.push(r.date);
          data.push(r.score);
        });

        // Initialize Chart.js line chart
        setTimeout(() => {
          // Wait for the canvas to exist
          const ctx = this.scoreChartRef.nativeElement.getContext('2d');
          if (!ctx) return;

          this.chart = new Chart(ctx, {
            type: 'line',
            data: {
              labels,
              datasets: [
                {
                  label: 'Scor',
                  data,
                  fill: false,
                  borderColor: '#34495e',
                  backgroundColor: '#34495e',
                  tension: 0.3,
                  pointRadius: 5,
                  pointHoverRadius: 7
                }
              ]
            },
            options: {
              responsive: true,
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Data'
                  },
                  ticks: {
                    autoSkip: true,
                    maxRotation: 0,
                    minRotation: 0
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: 'Scor'
                  },
                  beginAtZero: true
                }
              },
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    label: (tooltipItem) => `Scor: ${tooltipItem.parsed.y}`
                  }
                }
              }
            }
          });
        }, 0);

        // Show today’s or first available report
        const today = this.reportDate;
        const todayReport = this.allReports.find(r => r.date === today);

        if (todayReport) {
          this.reportData = todayReport;
        } else if (this.allReports.length > 0) {
          this.reportData = this.allReports[0];
          this.reportDate = this.allReports[0].date;
        } else {
          this.reportData = {
            childId:   child.id,
            childName: this.selectedChildName,
            date:      today,
            answers:   [],
            score:     0
          };
        }
      },
      error: (err) => {
        console.error(err);
        this.reportError = err.error?.message || 'Nu am putut încărca raportul.';
      }
    });
  }

  closeReportModal() {
    this.isReportModalOpen = false;
    this.selectedChildId = null;
    this.selectedChildName = '';
    this.allReports = [];
    this.reportData = null;
    this.reportError = null;
    this.reportDate = this.today;
    this.emailSuccessMsg = null;
    this.emailErrorMsg   = null;

    this.chart?.destroy();
  }

  onDateChange(newDate: string) {
    this.reportDate = newDate;
    const match = this.allReports.find(r => r.date === newDate);
    if (match) {
      this.reportData = match;
      this.reportError = null;
    } else {
      this.reportData = {
        childId:   this.selectedChildId!,
        childName: this.selectedChildName,
        date:      newDate,
        answers:   [],
        score:     0
      };
      this.reportError = null;
    }
  }

  downloadPdf() {
    if (!this.selectedChildId || !this.reportData) return;

    const nameUnderscored = this.reportData.childName.replace(/\s+/g, '_');
    const date = this.reportData.date;

    this.reportService.downloadReportPdf(this.selectedChildId, date).subscribe({
      next: (blob: Blob) => {
        const filename = `report_${nameUnderscored}_${date}.pdf`;
        saveAs(blob, filename);
      },
      error: (err) => {
        console.error('PDF download error:', err);
      }
    });
  }

  sendReportEmail() {
    if (!this.selectedChildId || !this.reportDate) return;

    this.emailSuccessMsg = null;
    this.emailErrorMsg   = null;

    this.reportService.sendReportEmail(this.selectedChildId, this.reportDate)
      .subscribe({
        next: () => {
          this.emailSuccessMsg =
            `Raportul a fost trimis la ${this.selectedChildName}.`;
        },
        error: (err) => {
          console.error('Email error:', err);
          this.emailErrorMsg =
            err.error?.message || 'Eroare la trimiterea email-ului.';
        }
      });
  }
}
