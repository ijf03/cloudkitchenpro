import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './navbar.html',
  styleUrl:'./navbar.css',
  standalone: true,
})
export class Navbar {
  isLoggedIn = true; //test
  userRole: 'chef' | 'admin' | '' = 'chef'; //test
  userFullName = 'Test'; //test

  logout() {}
}
