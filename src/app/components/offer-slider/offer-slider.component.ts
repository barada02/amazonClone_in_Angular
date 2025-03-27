import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface OfferSlide {
  id: number;
  title: string;
  description: string;
  backgroundImage: string;
  category: string;
}

@Component({
  selector: 'app-offer-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offer-slider.component.html',
  styleUrls: ['./offer-slider.component.css']
})
export class OfferSliderComponent implements OnInit, OnDestroy {
  slides: OfferSlide[] = [
    {
      id: 1,
      title: 'Amazing Electronics Deals',
      description: 'Up to 30% off on the latest gadgets and devices',
      backgroundImage: 'assets/banners/electronics.jpg',
      category: 'electronics'
    },
    {
      id: 2,
      title: 'Sweet Treats for Everyone',
      description: 'Delicious sweets at special prices',
      backgroundImage: 'assets/banners/sweets.jpg',
      category: 'sweets'
    },
    {
      id: 3,
      title: 'Refreshing Beverages',
      description: 'Cool drinks for hot summer days',
      backgroundImage: 'assets/banners/beverages.jpg',
      category: 'beverges'
    },
    {
      id: 4,
      title: 'Premium Dry Fruits',
      description: 'Healthy and nutritious options for snacking',
      backgroundImage: 'assets/banners/dryfruits.jpg',
      category: 'dry-fruits'
    },
    {
      id: 5,
      title: 'Grocery Essentials',
      description: 'Everyday items at the best prices',
      backgroundImage: 'assets/banners/grocery.jpg',
      category: 'grocery'
    },
    {
      id: 6,
      title: 'Delicious Snacks',
      description: 'Satisfy your cravings with our tasty snacks',
      backgroundImage: 'assets/banners/snacks.jpg',
      category: 'snacks'
    }
  ];

  currentSlideIndex = 0;
  autoSlideInterval: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  nextSlide() {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index: number) {
    this.currentSlideIndex = index;
  }

  shopNow(category: string) {
    this.router.navigate([''], { queryParams: { category: category } });
  }
}
