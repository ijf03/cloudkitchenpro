import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../services/auth/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
  standalone: true,
})
export class Register {
  roles: string[] = [];
  error = '';
  saving = false;

  model = {
    fullName: '',
    email: '',
    phone: '',
    role: '',
    password: ''
  };


  nameRx = "^[A-Za-z\\s'-]{2,100}$";
  phoneRx = "^(\\+?\\d[\\d\\s-]{6,})?$";
  pwRx    = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$";

  constructor(private auth: Auth, private router: Router) {
    this.auth.getRoles().subscribe({ next: r => this.roles = r.roles || [] });
  }

  submit(f: NgForm) {
    if (f.invalid) return;
    this.saving = true;
    this.error = '';

    this.auth.register(this.model).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err: any) => {
        this.error = err?.error?.message || 'Registration failed.';
        this.saving = false;
      }
    });
  }
}
