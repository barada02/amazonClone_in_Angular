import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private baseUrl = 'https://angulartest-93e44-default-rtdb.asia-southeast1.firebasedatabase.app/';
  private cartItemsSubject = new BehaviorSubject<Product[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private authService: AuthService, private http: HttpClient) {
    // Initialize cart from current user
    this.authService.currentUser$.subscribe(user => {
      if (user && user.cart) {
        this.cartItemsSubject.next(user.cart);
      } else {
        this.cartItemsSubject.next([]);
      }
    });
  }

  getCartItems(): Observable<Product[]> {
    return this.cartItems$;
  }

  getCartTotal(): Observable<number> {
    return this.cartItems$.pipe(
      map(items => items.reduce((total, item) => {
        // Use offer price if available, otherwise use regular price
        const price = item.offerPrice || item.price;
        return total + price;
      }, 0))
    );
  }

  getCartCount(): Observable<number> {
    return this.cartItems$.pipe(
      map(items => items.length)
    );
  }

  addToCart(product: Product): Observable<User> {
    return this.authService.currentUser$.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Check if product already exists in cart
        const currentCart = user.cart || [];
        const updatedCart = [...currentCart, product];
        const updatedUser = { ...user, cart: updatedCart };

        // Update the user in the database
        return this.http.put<User>(
          `${this.baseUrl}/users/${user.id}.json`,
          updatedUser
        ).pipe(
          tap(() => {
            // Update local cart
            this.cartItemsSubject.next(updatedCart);
            // Update local storage
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            // Update auth service
            this.authService.updateUserState(updatedUser);
          }),
          map(() => updatedUser)
        );
      })
    );
  }

  removeFromCart(productId: string): Observable<User> {
    return this.authService.currentUser$.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          throw new Error('User not authenticated');
        }

        const currentCart = user.cart || [];
        const updatedCart = currentCart.filter(item => item.id !== productId);
        const updatedUser = { ...user, cart: updatedCart };

        // Update the user in the database
        return this.http.put<User>(
          `${this.baseUrl}/users/${user.id}.json`,
          updatedUser
        ).pipe(
          tap(() => {
            // Update local cart
            this.cartItemsSubject.next(updatedCart);
            // Update local storage
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            // Update auth service
            this.authService.updateUserState(updatedUser);
          }),
          map(() => updatedUser)
        );
      })
    );
  }

  clearCart(): Observable<User> {
    return this.authService.currentUser$.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          throw new Error('User not authenticated');
        }

        const updatedUser = { ...user, cart: [] };

        // Update the user in the database
        return this.http.put<User>(
          `${this.baseUrl}/users/${user.id}.json`,
          updatedUser
        ).pipe(
          tap(() => {
            // Update local cart
            this.cartItemsSubject.next([]);
            // Update local storage
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            // Update auth service
            this.authService.updateUserState(updatedUser);
          }),
          map(() => updatedUser)
        );
      })
    );
  }

  checkout(): Observable<User> {
    return this.authService.currentUser$.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          throw new Error('User not authenticated');
        }

        const currentCart = user.cart || [];
        if (currentCart.length === 0) {
          throw new Error('Cart is empty');
        }

        // Create a purchase record with timestamp
        const purchase = {
          items: currentCart,
          total: currentCart.reduce((sum, item) => sum + (item.offerPrice || item.price), 0),
          date: new Date().toISOString(),
          orderId: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        };

        // Add purchase to user's purchases array
        const updatedPurchases = [...(user.purchases || []), purchase];
        const updatedUser = { 
          ...user, 
          purchases: updatedPurchases,
          cart: [] // Clear the cart after purchase
        };

        // Update the user in the database
        return this.http.put<User>(
          `${this.baseUrl}/users/${user.id}.json`,
          updatedUser
        ).pipe(
          tap(() => {
            // Update local cart
            this.cartItemsSubject.next([]);
            // Update local storage
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            // Update auth service
            this.authService.updateUserState(updatedUser);
          }),
          map(() => updatedUser)
        );
      })
    );
  }
}
