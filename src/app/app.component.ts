import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryNavComponent } from "./components/category-nav/category-nav.component";
import { HeaderComponent } from "./components/header/header.component";
import { OfferSliderComponent } from "./components/offer-slider/offer-slider.component";
import { ProductDisplayComponent } from "./components/product-display/product-display.component";
import { FooterComponent } from "./components/footer/footer.component";
import { RouterModule, Router } from '@angular/router';

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
    this.currentCategory = category;
    // If we're on the product display route, update the component
    if (this.router.url === '/' || this.router.url === '') {
      const productDisplayComponent = this.router.routerState.root.firstChild?.component;
      if (productDisplayComponent instanceof ProductDisplayComponent) {
        productDisplayComponent.selectedCategory = category;
      }
    }
  }
  
  isCartRoute(): boolean {
    return this.router.url.includes('/cart');
  }
}
