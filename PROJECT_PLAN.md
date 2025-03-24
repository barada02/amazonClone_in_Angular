# Amazon Clone App - Development Plan

## Project Overview
This project aims to build an Amazon-like e-commerce application using Angular for the frontend and Firebase Real-Time Database for the backend. The application will allow users to browse products by category, view product details, add products to cart, and complete the checkout process.

## Features

### User Authentication
- Sign up with name and mobile number
- Login functionality
- Protected routes for authenticated users

### Product Management
- Display products by categories
- Product cards showing name, price, offer price, and image
- Dynamic loading of products based on selected category

### Shopping Cart
- Add products to cart (authenticated users only)
- Local storage of cart items during session
- Checkout functionality that saves order to Firebase

## Technical Architecture

### Frontend Components

1. **Header Component**
   - Logo, search bar, login/signup buttons, cart icon
   - User authentication status display

2. **Category Navigation Bar**
   - Horizontal bar with product categories
   - Initially Electronics and Sweets categories

3. **Product Listing Component**
   - Card-based display of products
   - Dynamic loading based on selected category

4. **Product Detail Component**
   - Detailed view of a selected product
   - Add to cart functionality

5. **Cart Component**
   - List of added products
   - Quantity adjustment
   - Checkout functionality

6. **Authentication Components**
   - Login/Signup forms
   - Mobile number verification

### Services

1. **Product Service**
   - Fetch products from Firebase
   - Filter products by category

2. **Auth Service**
   - Handle user authentication
   - Manage user sessions

3. **Cart Service**
   - Manage cart items locally
   - Sync with Firebase on checkout

### Routing Structure
1. Home route (product listing)
2. Category-specific routes
3. Product detail route
4. Cart route
5. Authentication routes

### Data Models

**User**
```typescript
interface User {
  id: string;
  name: string;
  mobile: string;
}
```

**Product**
```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  offerPrice?: number;
  category: string;
  description?: string;
  imagePath: string;
}
```

**Cart Item**
```typescript
interface CartItem {
  product: Product;
  quantity: number;
}
```

**Order**
```typescript
interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  date: Date;
}
```

## Firebase Database Structure

```
/products
  /electronics
    /product1
      name: "Product 1"
      price: 999
      offerPrice: 899
      imagePath: "path/to/image1.jpg"
    /product2
      ...
  /sweets
    /product1
      ...

/users
  /user1
    name: "User 1"
    mobile: "1234567890"

/orders
  /order1
    userId: "user1"
    items: [...]
    totalPrice: 1798
    date: "2025-03-24T16:12:14"
```

## Development Phases

### Phase 1: Project Setup and Core Structure
- Initialize Angular project
- Set up routing
- Create core components
- Implement basic styling

### Phase 2: Product Display Functionality
- Create product service
- Implement Firebase HTTP requests
- Develop product listing component
- Implement category filtering

### Phase 3: Authentication
- Create auth service
- Implement login/signup forms
- Add authentication guards for protected routes

### Phase 4: Shopping Cart
- Implement cart service
- Create cart component
- Add local storage for cart items
- Implement checkout functionality

### Phase 5: Final Touches
- Responsive design
- Error handling
- Loading states
- Testing and bug fixes

## MVP Scope
- Two product categories: Electronics and Sweets
- Basic authentication
- Product listing and filtering
- Shopping cart functionality
- Checkout process

## Future Enhancements
- Additional product categories
- User profile management
- Order history
- Product reviews and ratings
- Advanced search functionality
- Payment integration
