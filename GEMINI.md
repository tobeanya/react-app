# Project Overview

This is a React Native application for modeling and analyzing power grid expansion plans. It allows users to create and manage different scenarios, define potential generation and transmission candidates, configure and run a computational solver, and view the results. The application is built for Android, iOS, and Windows.

The core of the application revolves around the concept of an "Expansion Plan," which represents a specific scenario for grid development. Each plan has its own set of settings, candidates, and solver results.

## Main Technologies

*   **React Native:** For cross-platform UI development.
*   **TypeScript:** For static typing.
*   **React Navigation:** For navigation between screens.
*   **Jest:** For testing.
*   **ESLint:** For code linting.

## Architecture

The application is structured as follows:

*   `App.tsx`: The main entry point of the application. It manages the application's state and renders the main navigator.
*   `src/navigation/TopTabNavigator.tsx`: The main navigator, which uses a top tab bar to switch between different pages.
*   `src/pages`: Contains the different pages of the application (Home, Settings, Candidates, Status, Results).
*   `src/components`: Contains reusable UI components.
*   `src/types`: Contains the TypeScript type definitions for the application's data structures.
*   `src/data`: Contains sample data for the application.

# Building and Running

## Prerequisites

*   Node.js (>=18)
*   React Native development environment (see the [official documentation](https://reactnative.dev/docs/set-up-your-environment) for setup instructions).
*   Android Studio and/or Xcode for mobile development.
*   Visual Studio for Windows development.

## Key Commands

*   **Start the Metro bundler:**
    ```sh
    npm start
    ```
*   **Run the Android app:**
    ```sh
    npm run android
    ```
*   **Run the iOS app:**
    ```sh
    npm run ios
    ```
*   **Run the Windows app:**
    ```sh
    npm run windows
    ```
*   **Run tests:**
    ```sh
    npm test
    ```
*   **Run Windows-specific tests:**
    ```sh
    npm run test:windows
    ```
*   **Lint the code:**
    ```sh
    npm run lint
    ```

# Development Conventions

*   **Coding Style:** The project uses Prettier for code formatting and ESLint for linting.
*   **Testing:** Tests are written with Jest and are located in the `__tests__` directory.
*   **State Management:** The application uses React's built-in state management (`useState`) at the top level (`App.tsx`) and passes state and callbacks down to child components via props.
