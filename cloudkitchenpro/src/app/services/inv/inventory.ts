import {Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {Auth} from '../../services/auth/auth';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

const INVENTORY_BASE = '/api/inventory-34095756';

export interface InventoryItem {
  _id?: string;
  inventoryId?: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  category: string;
  purchaseDate: string;
  expirationDate: string;
  location: string;
  cost: number;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(private http: HttpClient, private auth: Auth) {}

  private withUser() {
    const u = this.auth.currentUser();
    const params = new HttpParams({ fromObject: { userId: u?.userId || '' } });
    return { ...httpOptions, params };
  }

  getAll() {
    return this.http.get<InventoryItem[]>(INVENTORY_BASE, this.withUser());
  }

  getOne(inventoryId: string) {
    return this.http.get<InventoryItem>(`${INVENTORY_BASE}/${inventoryId}`, this.withUser());
  }

  create(data: InventoryItem) {
    const payload = { ...data, quantity: +data.quantity, cost: +data.cost };
    return this.http.post<InventoryItem>(INVENTORY_BASE, payload, this.withUser());
  }

  update(inventoryId: string, data: InventoryItem) {
    const payload = { ...data, quantity: +data.quantity, cost: +data.cost };
    return this.http.put<InventoryItem>(`${INVENTORY_BASE}/${inventoryId}`, payload, this.withUser());
  }

  delete(inventoryId: string) {
    return this.http.delete(`${INVENTORY_BASE}/${inventoryId}`, this.withUser());
  }
}
