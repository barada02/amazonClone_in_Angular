import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { Product } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = environment.databaseURL;

  constructor(private http: HttpClient) {}

  // Get all products from Firebase
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products.json`).pipe(
      map(response => {
        if (!response) {
          return [];
        }
        return Object.values(response);
      })
    );
  }

  // Search products by query string
  searchProducts(query: string, category: string = 'all'): Observable<Product[]> {
    if (!query || query.trim() === '') {
      return of([]);
    }

    // Normalize the search query
    const normalizedQuery = query.toLowerCase().trim();
    
    return this.getAllProducts().pipe(
      map(products => {
        // Filter products by search query
        let results = products.filter(product => 
          product.name.toLowerCase().includes(normalizedQuery) || 
          (product.description && product.description.toLowerCase().includes(normalizedQuery))
        );
        
        // Further filter by category if specified
        if (category && category !== 'all') {
          results = results.filter(product => 
            product.category && product.category.toLowerCase() === category.toLowerCase()
          );
        }
        
        return results;
      })
    );
  }

  // Get search suggestions based on product names
  getSearchSuggestions(query: string): Observable<string[]> {
    if (!query || query.trim() === '') {
      return of([]);
    }

    const normalizedQuery = query.toLowerCase().trim();
    
    return this.getAllProducts().pipe(
      map(products => {
        // Get product names that match the query
        const suggestions = products
          .filter(product => product.name.toLowerCase().includes(normalizedQuery))
          .map(product => product.name)
          // Limit to 5 suggestions
          .slice(0, 5);
        
        return suggestions;
      })
    );
  }
}
