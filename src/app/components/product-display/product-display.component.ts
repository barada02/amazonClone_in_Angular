import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models';
import { CartService } from '../../services/cart.service';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-display.component.html',
  styleUrls: ['./product-display.component.css']
})
export class ProductDisplayComponent implements OnChanges {
  @Input() selectedCategory: string = 'all';
  @Input() searchQuery: string = '';
  
  products: Product[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  private routeSubscription: Subscription | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Initial load of products
    this.loadProducts();
    
    // Subscribe to route query params to handle direct navigation
    this.routeSubscription = this.route.queryParams.subscribe(params => {
      const category = params['category'] || 'all';
      const search = params['search'] || '';
      
      // Only update if different from current values
      if (this.selectedCategory !== category || this.searchQuery !== search) {
        this.selectedCategory = category;
        this.searchQuery = search;
        this.loadProducts();
      }
    });
  }
  
  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('ProductDisplayComponent - ngOnChanges:', changes);
    
    // Check if either selectedCategory or searchQuery changed
    if (
      (changes['selectedCategory'] && !changes['selectedCategory'].firstChange) ||
      (changes['searchQuery'] && !changes['searchQuery'].firstChange)
    ) {
      this.loadProducts();
    }
  }

  loadProducts() {
    this.isLoading = true;
    this.error = null;
    
    console.log(`Loading products for category: ${this.selectedCategory}, search: ${this.searchQuery}`);
    
    // If we have a search query, use search method
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      this.productService.getProductsBySearch(this.searchQuery, this.selectedCategory)
        .subscribe({
          next: (products) => {
            this.products = products;
            this.isLoading = false;
            console.log(`Loaded ${products.length} products from search`);
          },
          error: (err) => {
            console.error('Error loading products:', err);
            this.error = 'Failed to load products. Please try again.';
            this.isLoading = false;
          }
        });
    } 
    // Otherwise use category filter method
    else {
      this.productService.getProductsByCategory(this.selectedCategory)
        .subscribe({
          next: (products) => {
            this.products = products;
            this.isLoading = false;
            console.log(`Loaded ${products.length} products from category`);
          },
          error: (err) => {
            console.error('Error loading products:', err);
            this.error = 'Failed to load products. Please try again.';
            this.isLoading = false;
          }
        });
    }
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product).subscribe({
      next: () => {
        console.log('Product added to cart successfully');
      },
      error: (error) => {
        console.error('Error adding product to cart:', error);
      }
    });
  }

  getDiscountPercentage(product: Product): number {
    if (product.offerPrice && product.price > product.offerPrice) {
      return Math.round(((product.price - product.offerPrice) / product.price) * 100);
    }
    return 0;
  }
}
