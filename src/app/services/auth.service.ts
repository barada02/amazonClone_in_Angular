import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, switchMap, take } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.databaseURL;
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
    
    // First check if username already exists by getting all users
    return this.http.get(`${this.baseUrl}/users.json`).pipe(
      map((allUsers: any) => {
        console.log('All existing users:', allUsers);
        
        // Convert Firebase object to array
        const usersArray = allUsers ? Object.keys(allUsers).map(key => ({
          ...allUsers[key],
          id: key
        })) : [];
        
        // Check if username exists
        const existingUser = usersArray.find(u => 
          u.userName && u.userName.toLowerCase() === user.userName.toLowerCase()
        );
        
        if (existingUser) {
          console.log('Username already exists:', existingUser);
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
            
            // Save user to localStorage and log in automatically
            localStorage.setItem('currentUser', JSON.stringify(createdUser));
            this.currentUserSubject.next(createdUser);
            this.isAuthenticatedSubject.next(true);
            
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
    return this.http.get(`${this.baseUrl}/users.json`).pipe(
      map((allUsers: any) => {
        console.log('All users from Firebase:', allUsers);
        
        if (!allUsers) {
          console.log('No users found in database');
          throw new Error('Invalid username or mobile number');
        }
        
        // Convert Firebase object to array of users with IDs
        const usersArray = Object.keys(allUsers).map(key => ({
          ...allUsers[key],
          id: key
        }));
        
        console.log('Converted users array:', usersArray);
        
        // Find user with matching username
        const userWithMatchingUsername = usersArray.find(u => 
          u.userName && u.userName.toLowerCase() === userName.toLowerCase()
        );
        
        console.log('User with matching username:', userWithMatchingUsername);
        
        if (!userWithMatchingUsername) {
          console.log('No user found with this username');
          throw new Error('Invalid username or mobile number');
        }
        
        // Check if mobile number matches
        if (String(userWithMatchingUsername.mobileNumber) !== String(mobileNumber)) {
          console.log('Mobile number does not match');
          console.log('Expected:', String(userWithMatchingUsername.mobileNumber));
          console.log('Received:', String(mobileNumber));
          throw new Error('Invalid username or mobile number');
        }
        
        console.log('Successfully authenticated user:', userWithMatchingUsername);
        
        // Save user to localStorage
        localStorage.setItem('currentUser', JSON.stringify(userWithMatchingUsername));
        
        // Update subjects
        this.currentUserSubject.next(userWithMatchingUsername);
        this.isAuthenticatedSubject.next(true);
        
        return userWithMatchingUsername;
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

  // Helper method to update the user state without making an HTTP request
  updateUserState(user: User): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }
}
