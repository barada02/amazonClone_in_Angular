import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models';
import { Observable, map } from 'rxjs';
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
  isPaymentVerified = false; // For card and UPI payment verification
  
  // Card payment fields
  cardNumber = '';
  cardExpiry = '';
  cardCvv = '';
  cardName = '';
  
  // UPI payment fields
  upiId = '';
  isVerifying = false;

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
    if (this.shippingAddress.trim()) {
      this.checkoutStep = 2;
      // Reset payment verification when moving to payment step
      this.isPaymentVerified = false;
    }
  }

  // Method to verify UPI payment when user clicks the verify button
  verifyUpiPayment(): void {
    if (!this.upiId || this.upiId.trim() === '') {
      alert('Please enter a valid UPI ID');
      return;
    }
    
    // Check if UPI ID has a valid format (contains @)
    if (!this.upiId.includes('@')) {
      alert('Please enter a valid UPI ID (e.g., yourname@upi)');
      return;
    }
    
    this.isVerifying = true;
    
    // Simulate verification process
    setTimeout(() => {
      this.isPaymentVerified = true;
      this.isVerifying = false;
      alert('UPI ID verified successfully!');
    }, 1500);
  }

  // Method to verify card payment when user fills all fields and proceeds
  verifyCardPayment(): void {
    // Basic validation for card details
    if (!this.cardNumber || this.cardNumber.replace(/\s/g, '').length < 16) {
      alert('Please enter a valid card number');
      return;
    }
    
    if (!this.cardExpiry || !this.cardExpiry.includes('/')) {
      alert('Please enter a valid expiry date (MM/YY)');
      return;
    }
    
    if (!this.cardCvv || this.cardCvv.length < 3) {
      alert('Please enter a valid CVV');
      return;
    }
    
    if (!this.cardName || this.cardName.trim() === '') {
      alert('Please enter the name on card');
      return;
    }
    
    this.isProcessing = true;
    
    // Simulate card verification process
    setTimeout(() => {
      this.isPaymentVerified = true;
      this.isProcessing = false;
      alert('Card verified successfully!');
    }, 1500);
  }

  confirmOrder(): void {
    // If payment method is card and not verified, verify it first
    if (this.paymentMethod === 'card' && !this.isPaymentVerified) {
      this.verifyCardPayment();
      return;
    }
    
    // If payment method is UPI and not verified, verify it first
    if (this.paymentMethod === 'upi' && !this.isPaymentVerified) {
      if (this.upiId && this.upiId.includes('@')) {
        this.verifyUpiPayment();
      } else {
        alert('Please verify your UPI ID first');
      }
      return;
    }

    this.isProcessing = true;
    setTimeout(() => {
      this.cartService.clearCart().subscribe({
        next: () => {
          this.checkoutStep = 3;
          this.isProcessing = false;
        },
        error: (error) => {
          console.error('Error processing order:', error);
          this.isProcessing = false;
          alert('Error processing your order. Please try again.');
        }
      });
    }, 2000);
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
