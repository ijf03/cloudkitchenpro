import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RecipesService, Recipe } from '../../../services/rec/recipes';

@Component({
  selector: 'app-recipe-view',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recipe-view.html',
  styleUrl: './recipe-view.css',
  standalone: true
})
export class RecipeView implements OnInit {
  item?: Recipe;
  error = '';

  // servings scaler
  baseServings = 1;
  servings = 1;
  scaledIngredients: string[] = [];

  constructor(private route: ActivatedRoute, private svc: RecipesService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.svc.getOne(id).subscribe({
      next: (doc) => {
        this.item = doc;
        this.baseServings = Number(doc.servings || 1);
        this.servings = this.baseServings;
        this.scaledIngredients = [...(doc.ingredients || [])];
      },
      error: (err) => (this.error = err?.error?.message || 'Item not found'),
    });
  }

  inc() { this.servings = Math.max(1, Math.floor(this.servings) + 1); }
  dec() { this.servings = Math.max(1, Math.floor(this.servings) - 1); }

  reset() {
    this.servings = this.baseServings;
    this.scaledIngredients = [...(this.item?.ingredients || [])];
  }

  get displayInstructions(): string[] {
    const rx = /^\s*\d+[\).\s]+/;
    return (this.item?.instructions || []).map(s => s.replace(rx, '').trim());
  }

  applyScale() {
    const target = Math.max(1, Math.floor(Number(this.servings) || this.baseServings));
    const factor = target / (this.baseServings || 1);
    const src = (this.item?.ingredients || []).slice();

    const formatQty = (x: number) => {
      if (!isFinite(x)) return '';
      const r = Math.round(x * 100) / 100;
      return Math.abs(r - Math.round(r)) < 1e-9 ? String(Math.round(r)) : String(r);
    };

    const scaleLine = (text: string) => {
      let s = text;

      // mixed number a b/c
      s = s.replace(/\b(\d+)\s+(\d+)\/(\d+)\b/g, (_m, a, b, c) => {
        const val = (Number(a) + Number(b) / Number(c)) * factor;
        return formatQty(val);
      });

      // simple fraction a/b
      s = s.replace(/\b(\d+)\/(\d+)\b/g, (_m, a, b) => {
        const val = (Number(a) / Number(b)) * factor;
        return formatQty(val);
      });

      // decimals/ints
      s = s.replace(/(\d+(?:\.\d+)?)(?=[^\d]|$)/g, (_m, n) => formatQty(Number(n) * factor));

      return s;
    };

    this.scaledIngredients = factor === 1 ? src : src.map(scaleLine);
    this.servings = target;
  }
}