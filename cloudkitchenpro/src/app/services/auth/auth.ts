import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const SID = '34095756';
const API = '';

@Injectable({ providedIn: 'root' })
export class Auth {
  constructor(private http: HttpClient) {}

  login(form: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${API}/api/login-${SID}`, form);
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

  
getRoles() {
  return this.http.get<{roles: string[]}>(`${API}/api/roles-${SID}`);
}

register(payload: {
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  password: string;
}) {
  return this.http.post<{ok: boolean; user?: any; message?: string}>(
    `${API}/api/register-${SID}`,
    payload
  );
}
}
