# AmazonCloneInAngular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.5.

## Project Overview

This is an Amazon clone application built with Angular and Firebase. The application allows users to:
- Browse products by categories (Electronics and Sweets)
- View product details
- Sign up and log in using name and mobile number
- Add products to cart (authenticated users only)
- Checkout and place orders

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- Angular CLI (v19.1.5 or higher)
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd amazonClone_in_Angular
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - The application uses Firebase Realtime Database for storing products and orders
   - The database is already configured with sample products
   - If you want to use your own Firebase database:
     - Create a new project in [Firebase Console](https://console.firebase.google.com/)
     - Set up a Realtime Database
     - Update the database URL in the environment files
     - Use the provided `upload-to-firebase.js` script to upload product data:
       ```bash
       node upload-to-firebase.js
       ```

4. **Start the development server**
   ```bash
   ng serve
   ```

5. **Access the application**
   - Open your browser and navigate to `http://localhost:4200/`

## Project Structure

- `src/app/components`: Contains all Angular components
- `src/app/services`: Contains services for authentication, products, and cart
- `src/app/models`: Contains TypeScript interfaces for data models
- `src/assets`: Contains images and other static assets

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
