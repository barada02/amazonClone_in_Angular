import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryNavComponent } from "./components/category-nav/category-nav.component";
import { HeaderComponent } from "./components/header/header.component";
import { OfferSliderComponent } from "./components/offer-slider/offer-slider.component";
import { ProductDisplayComponent } from "./components/product-display/product-display.component";
import { FooterComponent } from "./components/footer/footer.component";
import { RouterModule, Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CategoryNavComponent, HeaderComponent, OfferSliderComponent, ProductDisplayComponent, FooterComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'amazonClone';
  currentCategory: string = 'all';
  
  constructor(private router: Router) {}
  
  onCategorySelected(category: string) {
    console.log('AppComponent - Category selected:', category);
    this.currentCategory = category;
    
    // Use query parameters to pass the category to the home route
    if (this.router.url === '/' || this.router.url === '') {
      console.log('On home route, navigating with query params');
      const navigationExtras: NavigationExtras = {
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
