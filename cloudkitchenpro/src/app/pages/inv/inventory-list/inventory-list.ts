import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router} from '@angular/router';
import { InventoryService, InventoryItem } from '../../../services/inv/inventory';

@Component({
  selector: 'app-inventory-list',
  imports: [NgIf, NgFor, FormsModule, RouterLink],
  templateUrl: './inventory-list.html',
  styleUrl: './inventory-list.css',
  standalone: true,
})
export class InventoryList implements OnInit {
  items: InventoryItem[] = [];
  loading = false;
  errorMsg = '';
  filterText = '';

  constructor(private inv: InventoryService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.errorMsg = '';
    this.inv.list().subscribe({
      next: (data: InventoryItem[]) => {
        this.items = data || [];
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load inventory.';
        this.loading = false;
      }
    });
  }

  get filteredItems() {
    const q = (this.filterText || '').toLowerCase();
    if (!q) return this.items;
    return this.items.filter(i => (i.ingredientName || '').toLowerCase().includes(q));
  }

 edit(it: any) {
    this.router.navigate(['/inventory/edit', it.inventoryId]);
  }

  delete(it: any) {
    if (!it?.inventoryId) return;
    if (!confirm(`Delete "${it.ingredientName}"?`)) return;
    this.inv.delete(it.inventoryId).subscribe({
      next: () => this.load(),
      error: err => alert(err?.error?.message || 'Delete failed')
    });
  }

  trackById = (_: number, it: InventoryItem) => it._id ?? it.ingredientName;
}
