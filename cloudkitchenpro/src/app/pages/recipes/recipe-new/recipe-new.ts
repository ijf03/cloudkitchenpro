import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RecipesService, Recipe } from '../../../services/rec/recipes';

@Component({
  selector: 'app-recipes-new',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recipe-new.html',
  styleUrl: './recipe-new.css',
  standalone: true
})
export class RecipeNew {
  titleText = 'Add New Recipe';
  error = '';

  mealOpts: string[] = [];
  cuisineOpts: string[] = [];
  difficultyOpts: string[] = [];

  model: Partial<Recipe> = {
    title: '',
    chef: '',
    ingredients: [],
    instructions: [],
    mealType: '',
    cuisineType: '',
    prepTime: 0,
    difficulty: '',
    servings: 1
  };

  ingredientsText = '';
  instructionsText = '';

  constructor(private svc: RecipesService, private router: Router) {
    this.svc.getMeta().subscribe(meta => {
      this.mealOpts = meta.mealTypes || [];
      this.cuisineOpts = meta.cuisines || [];
      this.difficultyOpts = meta.difficulties || [];
    });
  }

  save(f: NgForm) {
    if (f.invalid) return;
    const payload: Partial<Recipe> = {
      ...this.model,
      ingredients: this.ingredientsText.split('\n').map(s => s.trim()).filter(Boolean),
      instructions: this.instructionsText.split('\n').map(s => s.trim()).filter(Boolean),
      prepTime: Number(this.model.prepTime || 0),
      servings: Number(this.model.servings || 1),
    };
    this.svc.create(payload).subscribe({
      next: () => this.router.navigate(['/recipes']),
      error: err => this.error = err?.error?.message || 'Create failed'
    });
  }
}
