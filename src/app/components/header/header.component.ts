import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SearchService } from '../../services/search.service';
import { User } from '../../models/user.model';
import { AuthModalComponent } from '../auth/auth-modal/auth-modal.component';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { Product } from '../../models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, AuthModalComponent, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  showAuthModal = false;
  
  // Search related properties
  searchQuery = '';
  selectedCategory = 'all';
  searchResults: Product[] = [];
  showSearchResults = false;
  searchSuggestions: string[] = [];
  showSuggestions = false;
  isSearching = false;
  
  private searchTerms = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService, 
    private searchService: SearchService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    // Set up search with debounce
    this.searchTerms.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.isSearching = true;
        return this.searchService.getSearchSuggestions(term);
      })
    ).subscribe(suggestions => {
      this.searchSuggestions = suggestions;
      this.showSuggestions = suggestions.length > 0;
      this.isSearching = false;
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openAuthModal(): void {
    this.showAuthModal = true;
  }

  closeAuthModal(): void {
    this.showAuthModal = false;
  }

  logout(): void {
    this.authService.logout();
  }
  
  // Search related methods
  onSearchInput(term: string): void {
    if (term.trim()) {
      this.searchTerms.next(term);
    } else {
      this.searchSuggestions = [];
      this.showSuggestions = false;
    }
  }
  
  onSearchFocus(): void {
    if (this.searchQuery.trim() && this.searchSuggestions.length > 0) {
      this.showSuggestions = true;
    }
  }
  
  onSearchBlur(): void {
    // Use setTimeout to allow click events on suggestions to fire first
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }
  
  selectSuggestion(suggestion: string): void {
    this.searchQuery = suggestion;
    this.showSuggestions = false;
    this.performSearch();
  }
  
  performSearch(): void {
    if (!this.searchQuery.trim()) {
      return;
    }
    
    this.isSearching = true;
    this.searchService.searchProducts(this.searchQuery, this.selectedCategory)
      .subscribe(results => {
        this.searchResults = results;
        this.isSearching = false;
        
        // Navigate to results page with search parameters
        this.router.navigate([''], {
          queryParams: {
            search: this.searchQuery,
            category: this.selectedCategory
          }
        });
      });
  }
}
