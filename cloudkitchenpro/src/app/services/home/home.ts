import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  userCount: number;
  recipeCount: number;
  inventoryCount: number;
  inventoryValue: number;
  expiringSoonCount: number;
  myRecipeCount: number | null;
  role: string | null;
  currentUserName: string | null;
}

const SID  = '34095756';
const API  = 'http://localhost:8080';
const DASH = `${API}/api/dashboard-${SID}`;

@Injectable({
  providedIn: 'root'
})
export class Home {
  constructor(private http: HttpClient) {}
  getStats() {
    let userId = '';
    try {
      const raw = localStorage.getItem('user');
      const u = raw ? JSON.parse(raw) : null;
      userId = u?.userId || '';
    } catch {}

    // pass userId to the server
    if (userId) {
      return this.http.get<DashboardStats>(DASH, { params: { userId } });
    }
    return this.http.get<DashboardStats>(DASH);
  }

}