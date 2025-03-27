import { Component, OnInit, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-display.component.html',
  styleUrls: ['./product-display.component.css']
})
export class ProductDisplayComponent implements OnInit, OnChanges, OnDestroy {
  private _selectedCategory: string = 'all';
  private queryParamSubscription: Subscription | null = null;
  
  @Input() set selectedCategory(value: string) {
    console.log('ProductDisplayComponent - selectedCategory setter called with:', value);
    this._selectedCategory = value;
    // Load products when the category changes via the setter
    if (this.initialized) {
      this.loadProducts();
    }
  }
  
  get selectedCategory(): string {
    return this._selectedCategory;
  }
  
  products: Product[] = [];
  loading: boolean = true;
  error: string | null = null;
  currentUser: User | null = null;
  initialized: boolean = false;
  
  constructor(
    private productService: ProductService, 
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit() {
    console.log('ProductDisplayComponent - ngOnInit, initial category:', this.selectedCategory);
    // Clear the cache to ensure we get fresh data
    this.productService.clearCache();
    
    // Subscribe to query parameter changes
    this.queryParamSubscription = this.route.queryParams.subscribe(params => {
      if (params['category']) {
        console.log('ProductDisplayComponent - Query param category detected:', params['category']);
        this._selectedCategory = params['category'];
        this.loadProducts();
      }
    });
    
    this.loadProducts();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.initialized = true;
  }
  
  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.queryParamSubscription) {
      this.queryParamSubscription.unsubscribe();
    }
  }
  
  ngOnChanges(changes: SimpleChanges) {
    console.log('ProductDisplayComponent - ngOnChanges fired with changes:', changes);
    if (changes['selectedCategory']) {
      console.log('Category changed from', changes['selectedCategory'].previousValue, 'to', changes['selectedCategory'].currentValue);
      this.loadProducts();
    }
  }
  
  loadProducts() {
    this.loading = true;
    this.error = null;
    console.log('ProductDisplayComponent - Loading products for category:', this.selectedCategory);
    
    if (this.selectedCategory === 'all') {
      this.productService.getAllProducts().subscribe({
        next: (data) => {
          this.products = data;
          this.loading = false;
          console.log('Loaded all products:', data.length);
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
          console.log('Loaded products for category:', this.selectedCategory, data.length);
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
