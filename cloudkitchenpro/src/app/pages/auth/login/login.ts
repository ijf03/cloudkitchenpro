import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../services/auth/auth';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgIf, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true,
})
export class Login {
  form = { email: '', password: '' };
  submitting = false;
  errorMsg = '';

  constructor(private auth: Auth, private router: Router) {}

  onSubmit() {
    if (this.submitting) return;
    this.submitting = true;
    this.errorMsg = '';
    this.auth.login(this.form).subscribe({
      next: (user) => {
        this.auth.setSession(user);
        this.router.navigate(['/dashboard']);
        this.submitting = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || (err?.status ? `Login failed (${err.status})` : 'Login failed.');
        this.submitting = false;
      }
    });
  }
}
