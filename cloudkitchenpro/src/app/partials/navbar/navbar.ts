import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './navbar.html',
  styleUrl:'./navbar.css',
  standalone: true,
})
export class Navbar {
  constructor(private auth: Auth) {}

  get isLoggedIn() {return this.auth.isLoggedIn(); }
  get userRole() {return this.auth.currentUser()?.role ?? ''; }
  get userFullName() {return this.auth.currentUser()?.fullName ?? ''; }
  
  logout() {
    this.auth.logout();
  }
}
