import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-nav.component.html',
  styleUrls: ['./category-nav.component.css']
})
export class CategoryNavComponent {
  @Output() categorySelected = new EventEmitter<string>();
  
  categories = ['all', 'electronics', 'sweets'];
  activeCategory: string = 'all';
  
  selectCategory(category: string) {
    this.activeCategory = category;
    this.categorySelected.emit(category);
  }
}
