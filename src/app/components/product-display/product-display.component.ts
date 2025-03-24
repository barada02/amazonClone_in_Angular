import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../services/product.service';

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
  
  constructor(private productService: ProductService) {}
  
  ngOnInit() {
    this.loadProducts();
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedCategory']) {
      this.loadProducts();
    }
  }
  
  loadProducts() {
    this.loading = true;
    this.error = null;
    
    if (this.selectedCategory === 'all') {
      this.productService.getAllProducts().subscribe({
        next: (data) => {
          this.products = data;
          this.loading = false;
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
        },
        error: (err) => {
          this.error = 'Failed to load products. Please try again later.';
          this.loading = false;
          console.error('Error fetching products:', err);
        }
      });
    }
  }
}
