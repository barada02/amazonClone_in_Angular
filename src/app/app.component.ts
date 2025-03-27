import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";
import { ProductDisplayComponent } from "./components/product-display/product-display.component";
import { CategoryNavComponent } from "./components/category-nav/category-nav.component";
import { OfferSliderComponent } from "./components/offer-slider/offer-slider.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    ProductDisplayComponent,
    CategoryNavComponent,
    OfferSliderComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'amazonClone';
  selectedCategory: string = 'all';
  searchQuery: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Subscribe to query parameter changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.route.queryParams.subscribe(params => {
        console.log('Query params:', params);
        
        // Handle category selection
        if (params['category']) {
          this.selectedCategory = params['category'];
          console.log(`Category selected: ${this.selectedCategory}`);
        } else {
          this.selectedCategory = 'all';
          console.log('No category selected, defaulting to "all"');
        }
        
        // Handle search query
        if (params['search']) {
          this.searchQuery = params['search'];
          console.log(`Search query: ${this.searchQuery}`);
        } else {
          this.searchQuery = '';
        }
      });
    });
  }

  onCategorySelected(category: string) {
    console.log('AppComponent - Category selected:', category);
    this.selectedCategory = category;
    
    // Use query parameters to pass the category to the home route
    if (this.router.url === '/' || this.router.url === '') {
      console.log('On home route, navigating with query params');
      const navigationExtras: any = {
        queryParams: { category: category },
        queryParamsHandling: 'merge'
      };
      
      this.router.navigate([''], navigationExtras);
    } else {
      console.log('Not on home route, current route:', this.router.url);
      // If not on home route, navigate to home with the category
      this.router.navigate([''], { queryParams: { category: category } });
    }
  }
  
  isCartRoute(): boolean {
    return this.router.url.includes('/cart');
  }
}
