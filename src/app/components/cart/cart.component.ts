import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models';
import { Observable, map, of } from 'rxjs';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems$!: Observable<Product[]>;
  cartTotal$!: Observable<number>;
  cartCount$!: Observable<number>;
  isProcessing = false;
  checkoutStep = 0; // 0: cart, 1: address, 2: payment, 3: confirmation
  shippingAddress = '';
  paymentMethod = 'cod'; // Default to Cash on Delivery

  constructor(private cartService: CartService, private router: Router) { }

  ngOnInit(): void {
    // Get cart items with a default empty array if null
    this.cartItems$ = this.cartService.getCartItems().pipe(
      map(items => items || [])
    );
    
    // Get cart total with a default of 0 if null
    this.cartTotal$ = this.cartService.getCartTotal().pipe(
      map(total => total || 0)
    );
    
    // Get cart count with a default of 0 if null
    this.cartCount$ = this.cartService.getCartCount().pipe(
      map(count => count || 0)
    );
  }

  removeFromCart(productId: string): void {
    this.cartService.removeFromCart(productId).subscribe({
      next: () => {
        console.log('Product removed from cart');
      },
      error: (error) => {
        console.error('Error removing product from cart:', error);
        alert('Failed to remove product from cart. Please try again.');
      }
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => {
        console.log('Cart cleared');
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
        alert('Failed to clear cart. Please try again.');
      }
    });
  }

  proceedToCheckout(): void {
    this.checkoutStep = 1;
  }

  proceedToPayment(): void {
    if (!this.shippingAddress.trim()) {
      alert('Please enter a shipping address');
      return;
    }
    this.checkoutStep = 2;
  }

  confirmOrder(): void {
    this.isProcessing = true;
    
    this.cartService.checkout().subscribe({
      next: (user) => {
        console.log('Order placed successfully');
        this.isProcessing = false;
        this.checkoutStep = 3; // Show confirmation
      },
      error: (error) => {
        console.error('Error placing order:', error);
        this.isProcessing = false;
        alert('Failed to place order. Please try again.');
      }
    });
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }

  getDiscountPercentage(product: Product): number {
    if (product.offerPrice && product.price > product.offerPrice) {
      return Math.round(((product.price - product.offerPrice) / product.price) * 100);
    }
    return 0;
  }
}
