import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-product-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-display.component.html',
  styleUrls: ['./product-display.component.css']
})
export class ProductDisplayComponent implements OnInit, OnChanges {
  @Input() selectedCategory: string = 'all';
  products: Product[] = [];
  loading: boolean = true;
  error: string | null = null;
  currentUser: User | null = null;
  
  constructor(private productService: ProductService, private authService: AuthService) {}
  
  ngOnInit() {
    this.loadProducts();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedCategory']) {
      this.loadProducts();
    }
  }
  
  loadProducts() {
    this.loading = true;
    this.error = null;
    console.log('Loading products for category:', this.selectedCategory);
    
    if (this.selectedCategory === 'all') {
      this.productService.getAllProducts().subscribe({
        next: (data) => {
          this.products = data;
          this.loading = false;
          console.log('Loaded all products:', data);
        },
        error: (err) => {
          this.error = 'Failed to load products. Please try again later.';
          this.loading = false;
          console.error('Error fetching products:', err);
        }
      });
    } else {
      this.productService.getProductsByCategory(this.selectedCategory).subscribe({
        next: (data) => {
          this.products = data;
          this.loading = false;
          console.log('Loaded products for category:', this.selectedCategory, data);
        },
        error: (err) => {
          this.error = 'Failed to load products. Please try again later.';
          this.loading = false;
          console.error('Error fetching products:', err);
        }
      });
    }
  }
  
  retryLoading() {
    this.loadProducts();
  }
  
  addToCart(product: Product) {
    if (!this.currentUser) {
      // Trigger authentication flow - this could be emitting an event or using a service
      alert('Please sign in to add items to your cart');
      return;
    }
    
    // Add the product to the user's cart using the AuthService
    this.authService.addToCart(product).subscribe({
      next: (updatedUser) => {
        console.log('Product added to cart successfully');
        // You could show a success message here
        alert(`${product.name} has been added to your cart!`);
      },
      error: (error) => {
        console.error('Error adding product to cart:', error);
        alert('Failed to add product to cart. Please try again.');
      }
    });
  }
  
  getImagePath(product: Product): string {
    // Default placeholder if no image path is provided
    if (!product.imagePath) {
      return 'assets/placeholder-product.jpg';
    }
    
    // For Firebase stored images that might be full URLs
    if (product.imagePath.startsWith('http')) {
      return product.imagePath;
    }
    
    // For relative paths in the assets folder
    // Based on our file search, we know the images exist in the assets folder
    // but the paths might not match exactly
    
    // Extract the filename from the path
    const parts = product.imagePath.split('/');
    const filename = parts[parts.length - 1];
    
    // Check if it's in the electronics category
    if (product.category === 'electronics') {
      return `assets/electronics/${filename}`;
    }
    
    // Check if it's in the sweets category
    if (product.category === 'sweets') {
      return `assets/sweets/${filename}`;
    }
    
    // If we can't determine the category, return the original path
    return product.imagePath;
  }
  
  calculateDiscount(originalPrice: number, offerPrice: number): number {
    if (originalPrice <= 0 || offerPrice <= 0 || offerPrice >= originalPrice) {
      return 0;
    }
    
    const discount = ((originalPrice - offerPrice) / originalPrice) * 100;
    return Math.round(discount);
  }
}
