import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InventoryService, InventoryItem } from '../../../services/inv/inventory';

@Component({
  selector: 'app-inventory-view',
  imports: [CommonModule, RouterLink],
  templateUrl: './inventory-view.html',
  styleUrl: './inventory-view.css',
  standalone: true
})
export class InventoryView implements OnInit {
  item?: InventoryItem;
  error = '';

  constructor(private route: ActivatedRoute, private inv: InventoryService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.inv.getOne(id).subscribe({
      next: (doc) => this.item = doc,
      error: (err) => this.error = err?.error?.message || 'Item not found'
    });
  }
}

