# Feature-Rich, Responsive Front-End Dashboard Application

This project is a complete front-end dashboard application built with React. It features a modern UI with theme switching, user authentication, a photo gallery with lazy loading, and an image annotation feature.

## Features

*   **Responsive Dashboard UI:** A mobile-first design that looks great on all screen sizes.
*   **Theme Switching:** Easily switch between light and dark themes. Your preference is saved in `localStorage`.
*   **Authentication:** A secure login system using JWT. Dashboard pages are protected and require authentication.
*   **Photo Gallery:** A beautiful photo gallery with lazy loading for optimal performance.
*   **Image Annotation:** Select a portion of an image and tag it with a label.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need to have Node.js and npm installed on your machine.

*   [Node.js](https://nodejs.org/) (which comes with npm)

### Installing

1.  Clone the repository:
    ```sh
    git clone https://github.com/your-username/your-repo-name.git
    ```
2.  Navigate into the project directory:
    ```sh
    cd dashboard-app
    ```
3.  Install the dependencies:
    ```sh
    npm install
    ```

### Running the Application

To run the application in development mode, use the following command:

```sh
npm start
```

This will open the application in your default browser at `http://localhost:3000`.

The page will automatically reload if you make changes to the code.

### Login Credentials

To log in to the application, use the following mock credentials:

*   **Username:** `admin`
*   **Password:** `password`

## Project Structure

The project is organized as follows:

```
dashboard-app/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── components/
│   │   ├── Annotation.css
│   │   ├── Annotation.js
│   │   ├── Image.js
│   │   ├── Modal.css
│   │   ├── Modal.js
│   │   ├── ProtectedRoute.js
│   │   └── ThemeSwitcher.js
│   ├── context/
│   │   └── ThemeContext.js
│   ├── hooks/
│   │   └── useLazyLoad.js
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── LoginPage.js
│   │   ├── PhotoGalleryPage.css
│   │   └── PhotoGalleryPage.js
│   ├── services/
│   │   ├── annotationService.js
│   │   └── authService.js
│   ├── App.css
│   ├── App.js
│   ├── index.css
│   └── index.js
├── .gitignore
├── package.json
└── README.md
```

*   **`public/`**: Contains the public assets and the main `index.html` file.
*   **`src/`**: Contains all the source code for the application.
    *   **`components/`**: Reusable components used throughout the application.
    *   **`context/`**: React context providers for managing global state (e.g., themes).
    *   **`hooks/`**: Custom React hooks.
    *   **`pages/`**: Components that represent the different pages of the application.
    *   **`services/`**: Mock API services for authentication and annotations.
*   **`package.json`**: Lists the project dependencies and scripts.
