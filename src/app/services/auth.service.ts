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
    console.log('Attempting to sign up user:', user);
    // First check if username already exists
    return this.checkUserNameExists(user.userName).pipe(
      map(exists => {
        console.log('Username exists check:', exists);
        if (exists) {
          throw new Error('Username already exists. Please choose a different username.');
        }
        return user;
      }),
      switchMap(newUser => {
        // Ensure cart and purchases are initialized as arrays
        const userToCreate = {
          ...newUser,
          cart: newUser.cart || [],
          purchases: newUser.purchases || []
        };
        
        console.log('Creating new user in Firebase:', userToCreate);
        
        return this.http.post<{name: string}>(`${this.baseUrl}/users.json`, userToCreate).pipe(
          map(response => {
            console.log('User created with ID:', response.name);
            const createdUser = { ...userToCreate, id: response.name };
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
    console.log(`Attempting to login with username: ${userName} and mobile: ${mobileNumber}`);
    return this.http.get<{[key: string]: User}>(`${this.baseUrl}/users.json?orderBy="userName"&equalTo="${userName}"`).pipe(
      map(response => {
        // Check if we got any results
        if (!response || Object.keys(response).length === 0) {
          console.log('No users found with this username');
          throw new Error('Invalid username or mobile number');
        }

        const users = Object.keys(response).map(key => ({
          ...response[key],
          id: key
        }));

        console.log('Found users with matching username:', users);
        
        // Find the user with matching mobile number
        // Convert both to strings to ensure proper comparison
        const user = users.find(u => String(u.mobileNumber) === String(mobileNumber));
        
        if (!user) {
          console.log('No user found with matching mobile number');
          throw new Error('Invalid username or mobile number');
        }

        console.log('Successfully authenticated user:', user);

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
