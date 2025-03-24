import { Routes } from '@angular/router';
import { CartComponent } from './components/cart/cart.component';
import { ProductDisplayComponent } from './components/product-display/product-display.component';

export const routes: Routes = [
  { path: 'cart', component: CartComponent },
  { path: '', component: ProductDisplayComponent },
  { path: '**', redirectTo: '/' }
];
