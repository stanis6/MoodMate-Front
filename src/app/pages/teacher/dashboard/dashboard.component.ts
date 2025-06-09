import { Component, OnInit }        from '@angular/core';
import { DashboardService }          from '../../../shared/services/dashboard.service';
import { HeaderComponent }           from '../header/header.component';
import { NgIf, NgFor }               from '@angular/common';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, HeaderComponent, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  recentActivities: string[] = [];
  notifications:    string[] = [];
  loading = true;
  error: string | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (dto) => {
        this.recentActivities = dto.recentActivities;
        this.notifications    = dto.notifications;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load dashboard:', err);
        this.error = 'Nu am putut încărca datele de pe dashboard.';
        this.loading = false;
      }
    });
  }
}
