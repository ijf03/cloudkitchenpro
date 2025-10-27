import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const SID = '34095756';
const API = '';
const BASE = `${API}/api/inventory-${SID}`;
const META = `${API}/api/inventory-meta-${SID}`;

export interface InventoryItem {
  _id?: string;
  inventoryId?: string;
  userId?: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  category: string;
  purchaseDate: string;
  expirationDate: string;
  location: string;
  cost: number;
  createdDate?: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(private http: HttpClient) {}

  list(q = ''): Observable<InventoryItem[]> {
    const params = q ? new HttpParams().set('q', q) : undefined;
    return this.http.get<InventoryItem[]>(BASE, { params });
  }

  getOne(inventoryId: string): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${BASE}/${inventoryId}`);
  }

  create(payload: Partial<InventoryItem>) {
    return this.http.post<InventoryItem>(BASE, payload);
  }

  update(inventoryId: string, payload: Partial<InventoryItem>) {
    return this.http.put<InventoryItem>(`${BASE}/${inventoryId}`, payload);
  }

  delete(inventoryId: string) {
    return this.http.delete<{ ok: boolean }>(`${BASE}/${inventoryId}`);
  }

  getMeta() {
    return this.http.get<{units:string[];categories:string[];locations:string[];lowStockThreshold:number}>(META);
  }
}
