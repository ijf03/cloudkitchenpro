import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Home, DashboardStats } from '../../services/home/home';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  standalone: true,
})
export class Dashboard implements OnInit {
  stats?: DashboardStats;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.load();
  }
  constructor(private home: Home) {}

  load() {
    this.loading = true;
    this.home.getStats().subscribe({
      next: (s: DashboardStats) => {
        this.stats = s;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load dashboard.';
        this.loading = false;
      }
    });
  }

  get isChef() { return this.stats?.role === 'chef'; }
  get isLoggedIn() { return !!this.stats?.currentUserName; }
  get isAdmin() { return this.stats?.role === 'admin'; }
}
