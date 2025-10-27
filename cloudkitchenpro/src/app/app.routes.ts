import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { RecipeList } from './pages/recipes/recipes-list/recipes-list';
import { RecipeNew} from './pages/recipes/recipe-new/recipe-new';
import { RecipeEdit } from './pages/recipes/recipe-edit/recipe-edit';
import { RecipeView} from './pages/recipes/recipe-view/recipe-view'
import { InventoryList } from './pages/inv/inventory-list/inventory-list';
import { InventoryNew } from './pages/inv/inventory-new/inventory-new';
import { InventoryEdit} from './pages/inv/inventory-edit/inventory-edit';
import { Login} from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { NotFound } from './pages/not-found/not-found';
import { InventoryView } from './pages/inv/inventory-view/inventory-view';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  { path: 'dashboard', component: Dashboard},

  { path: 'recipes', component:RecipeList},
  { path: 'recipes/new', component: RecipeNew },
  { path: 'recipes/edit/:id', component: RecipeEdit},
  { path: 'recipes/:id', component: RecipeView }, 

  { path: 'inventory', component:InventoryList},
  { path: 'inventory/new', component:InventoryNew },
  { path: 'inventory/edit/:id', component: InventoryEdit},
  { path: 'inventory/:id', component: InventoryView },

  { path: 'login', component: Login},
  { path: 'register', component: Register},

  { path: '**', component: NotFound}
];
