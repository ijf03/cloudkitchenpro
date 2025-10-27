import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const SID  = '34095756';
const API  = 'http://localhost:8080';
const BASE = `${API}/api/recipes-${SID}`;
const META = `${API}/api/recipes-meta-${SID}`;

export interface Recipe {
  _id?: string;
  recipeId: string;
  userId?: string;
  title: string;
  chef: string;
  ingredients: string[];
  instructions: string[];
  mealType: string;
  cuisineType: string;
  prepTime: number;
  difficulty: string;
  servings: number;
  createdDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecipesService {
  constructor(private http: HttpClient) {}

  getMeta() {
    return this.http.get<{mealTypes:string[];cuisines:string[];difficulties:string[]}>(META);
  }

  list(filters?: { q?: string; meal?: string; cuisine?: string; difficulty?: string }): Observable<Recipe[]> {
    let params = new HttpParams();
    if (filters?.q) params = params.set('q', filters.q);
    if (filters?.meal) params = params.set('meal', filters.meal);
    if (filters?.cuisine) params = params.set('cuisine', filters.cuisine);
    if (filters?.difficulty) params = params.set('difficulty', filters.difficulty);
    return this.http.get<Recipe[]>(BASE, { params });
  }

  getOne(recipeId: string) {
    return this.http.get<Recipe>(`${BASE}/${recipeId}`);
  }

  create(payload: Partial<Recipe>) {
    return this.http.post<Recipe>(BASE, payload);
  }

  update(recipeId: string, payload: Partial<Recipe>) {
    return this.http.put<Recipe>(`${BASE}/${recipeId}`, payload);
  }

  delete(recipeId: string) {
    return this.http.delete(`${BASE}/${recipeId}`);
  }
}
