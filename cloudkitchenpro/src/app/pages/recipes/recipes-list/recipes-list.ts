import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RecipesService, Recipe } from '../../../services/rec/recipes';

@Component({
  selector: 'app-recipes-list',
  imports: [CommonModule, FormsModule, RouterLink, NgFor, NgIf],
  templateUrl: './recipes-list.html',
  styleUrl: './recipes-list.css',
  standalone: true
})
export class RecipeList implements OnInit {
  items: Recipe[] = [];
  loading = false;
  error = '';

  // filters
  q = '';
  meal = '';
  cuisine = '';
  difficulty = '';

  mealOpts: string[] = [];
  cuisineOpts: string[] = [];
  difficultyOpts: string[] = [];

  constructor(private svc: RecipesService) {}

  ngOnInit(): void {
    this.svc.getMeta().subscribe(meta => {
      this.mealOpts = meta.mealTypes || [];
      this.cuisineOpts = meta.cuisines || [];
      this.difficultyOpts = meta.difficulties || [];
    });
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.svc.list({ q: this.q, meal: this.meal, cuisine: this.cuisine, difficulty: this.difficulty })
      .subscribe({
        next: data => { this.items = data || []; this.loading = false; },
        error: () => { this.error = 'Failed to load recipes.'; this.loading = false; }
      });
  }

  clear() {
    this.q = this.meal = this.cuisine = this.difficulty = '';
    this.load();
  }

  remove(r: Recipe) {
    if (!r?.recipeId) return;
    if (!confirm(`Delete "${r.title}"?`)) return;

    this.svc.delete(r.recipeId).subscribe({
      next: () => this.load(),
      error: (err: any) => alert(err?.error?.message || 'Delete failed')
    });
  }
}
