import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { InventoryService, InventoryItem } from '../../../services/inv/inventory';

@Component({
  selector: 'app-inventory-new',
  imports: [FormsModule, RouterLink, NgIf],
  templateUrl: './inventory-new.html',
  styleUrl: './inventory-new.css',
  standalone: true,
})
export class InventoryNew {
  form: InventoryItem = {
    ingredientName: '',
    quantity: 0,
    unit: '',
    category: '',
    purchaseDate: '',
    expirationDate: '',
    location: '',
    cost: 0
  };
  submitting = false;
  errorMsg = '';

  constructor(private inv: InventoryService, private router: Router) {}

  onSubmit() {
    if (this.submitting) return;
    this.submitting = true;
    this.errorMsg = '';
    this.inv.create(this.form).subscribe({
      next: () => this.router.navigate(['/inventory']),
      error: () => { this.errorMsg = 'Create failed.'; this.submitting = false; }
    });
  }
}
