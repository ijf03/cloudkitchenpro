import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipesService, Recipe } from '../../../services/rec/recipes';

@Component({
  selector: 'app-recipe-edit',
  imports: [CommonModule, FormsModule],
  templateUrl: './recipe-edit.html',
  styleUrl: './recipe-edit.css',
  standalone: true
})
export class RecipeEdit implements OnInit {
  titleText = 'Edit Recipe';
  error = '';

  mealOpts: string[] = [];
  cuisineOpts: string[] = [];
  difficultyOpts: string[] = [];

  id = '';
  model: Partial<Recipe> = {};
  ingredientsText = '';
  instructionsText = '';

  // current user (shown in the checkbox label like A2)
  currentUserName = '';
  isMine = false;

  constructor(
    private svc: RecipesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // load meta options
    this.svc.getMeta().subscribe({
      next: (meta) => {
        this.mealOpts = meta.mealTypes || [];
        this.cuisineOpts = meta.cuisines || [];
        this.difficultyOpts = meta.difficulties || [];
      },
    });

    // get current user name from localStorage (same pattern as class)
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        this.currentUserName = u?.fullName || u?.name || '';
      }
    } catch { /* ignore */ }

    // load the recipe
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.svc.getOne(this.id).subscribe({
      next: (r) => {
        this.model = { ...r };
        this.ingredientsText = (r.ingredients || []).join('\n');
        this.instructionsText = (r.instructions || []).join('\n');

        // pre-check "isMine" if the chef already equals current user
        if (this.currentUserName && r.chef === this.currentUserName) {
          this.isMine = true;
        }
      },
      error: (err) => (this.error = err?.error?.message || 'Failed to load recipe'),
    });
  }

  // when user toggles "This recipe is mine (X)"
  setMine(checked: boolean) {
    this.isMine = checked;
    if (checked && this.currentUserName) {
      this.model.chef = this.currentUserName;
    }
  }

  save(f: NgForm) {
    if (f.invalid) return;

    const payload: Partial<Recipe> = {
      ...this.model,
      ingredients: this.ingredientsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      instructions: this.instructionsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      prepTime: Number(this.model.prepTime || 0),
      servings: Number(this.model.servings || 1),
    };

    this.svc.update(this.id, payload).subscribe({
      next: () => this.router.navigate(['/recipes']),
      error: (err) => (this.error = err?.error?.message || 'Update failed'),
    });
  }
}