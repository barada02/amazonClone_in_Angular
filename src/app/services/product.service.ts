import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, of, catchError } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  price: number;
  offerPrice: number;
  description: string;
  imagePath: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Using the exact Firebase URL from your memory
  private baseUrl = 'https://angulartest-93e44-default-rtdb.asia-southeast1.firebasedatabase.app';
  private productsCache: Product[] | null = null;
  
  constructor(private http: HttpClient) {}
  
  getAllProducts(): Observable<Product[]> {
    // Return cached data if available
    if (this.productsCache) {
      return of(this.productsCache);
    }
    
    // First, try to fetch from the nested structure as seen in products-data.json
    return this.http.get<any>(`${this.baseUrl}/products.json`)
      .pipe(
        map(response => {
          const products: Product[] = [];
          console.log('Raw Firebase response:', response);
          
          // Check if response exists and has the expected structure
          if (response) {
            // Try the nested structure first (products/electronics and products/sweets)
            if (response.electronics) {
              Object.keys(response.electronics).forEach(key => {
                if (response.electronics[key]) {
                  products.push({
                    ...response.electronics[key],
                    id: response.electronics[key].id || key
                  });
                }
              });
            }
            
            if (response.sweets) {
              Object.keys(response.sweets).forEach(key => {
                if (response.sweets[key]) {
                  products.push({
                    ...response.sweets[key],
                    id: response.sweets[key].id || key
                  });
                }
              });
            }
            
            // If no products found with the nested structure, try a flat structure
            if (products.length === 0) {
              Object.keys(response).forEach(key => {
                if (typeof response[key] === 'object' && response[key] !== null) {
                  products.push({
                    ...response[key],
                    id: response[key].id || key
                  });
                }
              });
            }
          }
          
          // Cache the results
          this.productsCache = products;
          console.log('Processed products:', products);
          return products;
        }),
        catchError(error => {
          console.error('Error fetching products:', error);
          return of([]);
        }),
        shareReplay(1)
      );
  }
  
  getProductsByCategory(category: string): Observable<Product[]> {
    return this.getAllProducts().pipe(
      map(products => {
        const filtered = products.filter(product => 
          product.category && product.category.toLowerCase() === category.toLowerCase()
        );
        console.log(`Filtered products for category '${category}':`, filtered);
        return filtered;
      })
    );
  }
  
  clearCache() {
    this.productsCache = null;
    console.log('Product cache cleared');
  }
}
