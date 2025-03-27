import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, of, catchError, tap } from 'rxjs';

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
        tap(response => console.log('Raw Firebase response structure:', Object.keys(response))),
        map(response => {
          const products: Product[] = [];
          console.log('Raw Firebase response:', response);
          
          // Check if response exists and has the expected structure
          if (response) {
            // Process all categories in the response
            const categories = ['electronics', 'sweets', 'beverges', 'dry-fruits', 'grocery', 'snacks'];
            
            categories.forEach(category => {
              if (response[category]) {
                console.log(`Found category: ${category} with keys:`, Object.keys(response[category]));
                Object.keys(response[category]).forEach(key => {
                  if (response[category][key]) {
                    const product = {
                      ...response[category][key],
                      id: response[category][key].id || key,
                      category: category // Ensure category is set correctly
                    };
                    console.log(`Adding product from ${category}:`, product.name);
                    products.push(product);
                  }
                });
              }
            });
            
            // If no products found with the nested structure, try a flat structure
            if (products.length === 0) {
              console.log('No products found in category structure, trying flat structure');
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
          console.log('Processed products:', products.length);
          console.log('Product categories:', products.map(p => p.category));
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
        if (category === 'all') {
          return products;
        }
        console.log(`Filtering for category '${category}' from ${products.length} products`);
        console.log('Available categories:', [...new Set(products.map(p => p.category))]);
        
        const filtered = products.filter(product => {
          const match = product.category && product.category.toLowerCase() === category.toLowerCase();
          console.log(`Product ${product.name} category: ${product.category}, match: ${match}`);
          return match;
        });
        
        console.log(`Filtered products for category '${category}':`, filtered.length);
        return filtered;
      })
    );
  }
  
  clearCache() {
    this.productsCache = null;
    console.log('Product cache cleared');
  }
}
