import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, switchMap, take } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://angulartest-93e44-default-rtdb.asia-southeast1.firebasedatabase.app/';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check for saved user in localStorage on service initialization
    this.loadUserFromLocalStorage();
  }

  private loadUserFromLocalStorage() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  signup(user: User): Observable<User> {
    // First check if username already exists
    return this.checkUserNameExists(user.userName).pipe(
      map(exists => {
        if (exists) {
          throw new Error('Username already exists. Please choose a different username.');
        }
        return user;
      }),
      switchMap(newUser => {
        return this.http.post<{name: string}>(`${this.baseUrl}/users.json`, newUser).pipe(
          map(response => {
            const createdUser = { ...newUser, id: response.name };
            return createdUser;
          }),
          catchError(error => {
            console.error('Error during signup:', error);
            return throwError(() => new Error('Failed to create account. Please try again.'));
          })
        );
      })
    );
  }

  login(userName: string, mobileNumber: string): Observable<User> {
    return this.http.get<{[key: string]: User}>(`${this.baseUrl}/users.json?orderBy="userName"&equalTo="${userName}"`).pipe(
      map(response => {
        const users = Object.keys(response || {}).map(key => ({
          ...response[key],
          id: key
        }));

        const user = users.find(u => u.mobileNumber === mobileNumber);
        
        if (!user) {
          throw new Error('Invalid username or mobile number');
        }

        // Save user to localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Update subjects
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        
        return user;
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error('Login failed. Please check your credentials and try again.'));
      })
    );
  }

  logout(): void {
    // Clear user from localStorage
    localStorage.removeItem('currentUser');
    
    // Update subjects
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private checkUserNameExists(userName: string): Observable<boolean> {
    return this.http.get<{[key: string]: User}>(`${this.baseUrl}/users.json?orderBy="userName"&equalTo="${userName}"`).pipe(
      map(response => {
        return Object.keys(response || {}).length > 0;
      }),
      catchError(error => {
        console.error('Error checking username:', error);
        return of(false);
      })
    );
  }

  updateUser(user: User): Observable<User> {
    if (!user.id) {
      return throwError(() => new Error('User ID is required for update'));
    }

    return this.http.put<User>(`${this.baseUrl}/users/${user.id}.json`, user).pipe(
      tap(() => {
        // Update localStorage and subjects
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Error updating user:', error);
        return throwError(() => new Error('Failed to update user information'));
      })
    );
  }

  // Add a product to the user's cart
  addToCart(product: any) {
    return this.currentUser$.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Create a new cart array with the added product
        const updatedCart = [...user.cart || [], product];
        const updatedUser = { ...user, cart: updatedCart };

        // Update the user in the database
        return this.http.put<User>(
          `${this.baseUrl}/users/${user.id}.json`,
          updatedUser
        ).pipe(
          map(() => {
            // Update local storage with the new user data
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            // Update the current user subject
            this.currentUserSubject.next(updatedUser);
            return updatedUser;
          })
        );
      })
    );
  }
}
