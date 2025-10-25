import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const SID = '34095756';
const API = 'http://localhost:8080';

@Injectable({ providedIn: 'root' })
export class Auth {
  constructor(private http: HttpClient) {}

  login(form: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${API}/api/login-${SID}`, form);
  }

  register(form: { email: string; password: string; name: string }): Observable<any> {
    return this.http.post<any>(`${API}/api/register-${SID}`, form);
  }

  setSession(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getSession() {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  clearSession() {
    localStorage.removeItem('user');
  }

  currentUser() {
    return this.getSession();
  }

  isLoggedIn(): boolean {
    return !!this.getSession();
  }

  logout() {
    this.clearSession();
    window.location.href = '/login';
  }
}
