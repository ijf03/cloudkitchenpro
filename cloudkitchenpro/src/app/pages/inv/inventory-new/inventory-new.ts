import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InventoryService, InventoryItem } from '../../../services/inv/inventory';

@Component({
  selector: 'app-inventory-new',
  imports: [FormsModule, CommonModule],
  templateUrl: './inventory-new.html',
  styleUrls: ['./inventory-new.css'],
  standalone: true,
})
export class InventoryNew implements OnInit {
  title = 'Add New Item';

  model: Partial<InventoryItem> = {
    ingredientName: '',
    quantity: 0,
    unit: '',
    category: '',
    purchaseDate: '',
    expirationDate: '',
    location: '',
    cost: 0
  };

  unitOpts: string[] = [];
  catOpts:  string[] = [];
  locOpts:  string[] = [];
  error = '';

  constructor(private inv: InventoryService, private router: Router) {}

  ngOnInit(): void {
    this.inv.getMeta().subscribe({
      next: meta => {
        this.unitOpts = meta.units || [];
        this.catOpts  = meta.categories || [];
        this.locOpts  = meta.locations || [];
      },
      error: () => { this.error = 'Failed to load options'; }
    });
  }

  save(f: NgForm) {
    if (f.invalid) return;

    const payload: Partial<InventoryItem> = {
      ...this.model,
      quantity: Number(this.model.quantity || 0),
      cost: Number(this.model.cost || 0),
    };

    this.inv.create(payload).subscribe({
      next: () => this.router.navigate(['/inventory']),
      error: err => this.error = err?.error?.message || 'Create failed'
    });
  }
}