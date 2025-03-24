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
  private baseUrl = 'https://angulartest-93e44-default-rtdb.asia-southeast1.firebasedatabase.app/';
  private productsCache: Product[] | null = null;
  
  constructor(private http: HttpClient) {}
  
  getAllProducts(): Observable<Product[]> {
    // Return cached data if available
    if (this.productsCache) {
      return of(this.productsCache);
    }
    
    return this.http.get<{[key: string]: Product}>(`${this.baseUrl}/products.json`)
      .pipe(
        map(response => {
          const products: Product[] = [];
          for (const key in response) {
            if (response.hasOwnProperty(key)) {
              products.push({...response[key], id: key});
            }
          }
          // Cache the results
          this.productsCache = products;
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
      map(products => products.filter(product => product.category.toLowerCase() === category.toLowerCase()))
    );
  }
  
  clearCache() {
    this.productsCache = null;
  }
}
