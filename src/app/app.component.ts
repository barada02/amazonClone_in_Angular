import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CategoryNavComponent } from "./components/category-nav/category-nav.component";
import { HeaderComponent } from "./components/header/header.component";
import { OfferSliderComponent } from "./components/offer-slider/offer-slider.component";
import { ProductDisplayComponent } from "./components/product-display/product-display.component";
import { FooterComponent } from "./components/footer/footer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CategoryNavComponent, HeaderComponent, OfferSliderComponent, ProductDisplayComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'amazonClone';
}
