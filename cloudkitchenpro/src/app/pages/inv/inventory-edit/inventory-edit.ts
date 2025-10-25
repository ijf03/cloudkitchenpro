import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { InventoryService, InventoryItem } from '../../../services/inv/inventory';

@Component({
  selector: 'app-inventory-edit',
  imports: [FormsModule, RouterLink, NgIf],
  templateUrl: './inventory-edit.html',
  styleUrl: './inventory-edit.css',
  standalone: true,
})
export class InventoryEdit implements OnInit {
  id = '';
  form?: InventoryItem;
  loading = false;
  submitting = false;
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private inv: InventoryService,
    private router: Router
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    if (!this.id) { this.errorMsg = 'Invalid id.'; return; }
    this.loading = true;
    this.inv.getOne(this.id).subscribe({
      next: (data) => { this.form = data; this.loading = false; },
      error: () => { this.errorMsg = 'Failed to load item.'; this.loading = false; }
    });
  }

  onSubmit() {
    if (!this.form || this.submitting) return;
    this.submitting = true;
    this.errorMsg = '';
    this.inv.update(this.id, this.form).subscribe({
      next: () => this.router.navigate(['/inventory']),
      error: () => { this.errorMsg = 'Update failed.'; this.submitting = false; }
    });
  }
}
