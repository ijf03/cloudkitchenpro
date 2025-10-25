import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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

  constructor(private inv: InventoryService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.errorMsg = '';
    this.inv.getAll().subscribe({
      next: (data) => { this.items = data || []; this.loading = false; },
      error: () => { this.errorMsg = 'Failed to load inventory.'; this.loading = false; }
    });
  }

  get filteredItems() {
    const q = (this.filterText || '').toLowerCase();
    if (!q) return this.items;
    return this.items.filter(i => (i.ingredientName || '').toLowerCase().includes(q));
  }

  delete(item: InventoryItem) {
    if (!item._id) return;
    if (!confirm(`Delete "${item.ingredientName}"?`)) return; // simple confirm (class style)
    this.inv.delete(item._id).subscribe({
      next: () => this.load(),
      error: () => alert('Delete failed.')
    });
  }

  trackById = (_: number, it: InventoryItem) => it._id ?? it.ingredientName;
}
