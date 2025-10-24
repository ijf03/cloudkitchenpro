import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

const BASE_URL = 'http://localhost:8080';
const LOGIN_URL = BASE_URL + '/login-34095756';
const REGISTER_URL = BASE_URL + '/register-34095756';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private LS_KEY = 'a3_current_user';
  constructor(private http: HttpClient, private router: Router) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.LS_KEY);
  }

  currentUser(): UserInfo | null {
    const raw = localStorage.getItem(this.LS_KEY);
    return raw ? JSON.parse(raw) as UserInfo : null;
  }

  login(payload: { email: string; password: string }) {
    return this.http.post<UserInfo>(LOGIN_URL, payload, httpOptions);
  }

  register(payload: { fullName: string; email: string; password: string }) {
    return this.http.post<UserInfo>(REGISTER_URL, payload, httpOptions);
  }

  setSession(user: UserInfo) {
    localStorage.setItem(this.LS_KEY, JSON.stringify(user));
  }

  logout() {
    localStorage.removeItem(this.LS_KEY);
    this.router.navigate(['/login']);
  }
}

export interface UserInfo {
  _id: string;
  fullName: string;
  role: 'chef' | 'admin' | 'user';
}
