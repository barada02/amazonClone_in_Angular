import { Component, EventEmitter, Output } from '@angular/core';
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
  activeCategory: string = 'all';
  
  selectCategory(category: string) {
    this.activeCategory = category;
    this.categorySelected.emit(category);
    console.log('Category selected:', category);
  }
}
