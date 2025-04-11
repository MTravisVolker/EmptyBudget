# EmptyBudget: Personal Budgeting Web App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- Add other badges later if you set up CI/CD, code coverage, etc. -->
<!-- e.g., [![Build Status](...)](...) -->
<!-- e.g., [![Coverage Status](...)](...) -->

A full-stack web application designed to help users manage their personal finances by tracking bank accounts, defining recurring bills, and monitoring due dates and payment statuses. Built with Django REST Framework on the backend and React on the frontend.

<!-- [Screenshot Placeholder: Add a GIF or screenshot of the app's main interface here] -->
<!-- e.g., ![EmptyBudget Screenshot](docs/screenshot.png) -->

## Table of Contents

*   [Features](#features)
*   [Tech Stack](#tech-stack)
*   [Project Structure](#project-structure)
*   [Getting Started](#getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Installation](#installation)
    *   [Database Setup](#database-setup)
    *   [Environment Variables](#environment-variables)
*   [Running the Application](#running-the-application)
    *   [Backend](#backend)
    *   [Frontend](#frontend)
*   [API Endpoints](#api-endpoints)
*   [Running Tests](#running-tests)
    *   [Backend Tests](#backend-tests)
    *   [Frontend Tests](#frontend-tests)
*   [Roadmap](#roadmap)
*   [Contributing](#contributing)
*   [License](#license)

## Features

*   **Bank Account Management:** Define different bank accounts (checking, savings, credit cards).
*   **Bill Definitions:** Set up recurring bills with default amounts and payment URLs.
*   **Due Bill Tracking:** Manage specific instances of bills with due dates, payment dates, amounts, and statuses.
*   **Status Management:** Customizable statuses for bills (e.g., Pending, Paid, Late).
*   **Recurrence Patterns:** Define how often bills or transactions occur (e.g., Monthly, Weekly).
*   **Account Instances:** Track scheduled transactions or balance snapshots for accounts.
*   **RESTful API:** Backend provides a clear API for frontend interaction.

## Tech Stack

*   **Backend:**
    *   Python 3.x
    *   Django 4.x / 5.x
    *   Django REST Framework
    *   PostgreSQL
    *   Psycopg2 (PostgreSQL Adapter)
    *   `django-cors-headers` (for Cross-Origin Resource Sharing)
*   **Frontend:**
    *   React 18.x
    *   JavaScript (ES6+)
    *   Axios (for API calls)
    *   React Bootstrap
    *   Bootstrap 5.x (CSS)
    *   Create React App / CRACO (Build Tooling)
*   **Testing:**
    *   Backend: Django `TestCase`, Pytest (Optional)
    *   Frontend: Cypress (E2E), React Testing Library + Jest (Component/Integration)
*   **Development:**
    *   Git & GitHub
    *   Python Virtual Environments (`venv`)
    *   Node.js & npm / yarn

## Project Structure

This project follows a monorepo structure containing both the backend and frontend codebases:
EmptyBudget/
├── .git/ # Git repository data
├── backend/ # Django project root
│ ├── EmptyBudget/ # Django project settings/core files
│ ├── api/ # Django app for API logic (models, views, serializers)
│ ├── manage.py # Django management script
│ ├── requirements.txt # Backend Python dependencies (Optional, can generate from pip freeze)
│ └── venv/ # Python virtual environment (ignored by Git)
│
├── frontend/ # React project root
│ ├── public/ # Static assets and index.html
│ ├── src/ # React source code (components, hooks, etc.)
│ ├── cypress/ # Cypress E2E test files
│ ├── node_modules/ # Frontend dependencies (ignored by Git)
│ ├── package.json # Frontend dependencies and scripts
│ ├── craco.config.js # CRACO configuration (if used)
│ └── cypress.config.js # Cypress configuration
│
├── .gitignore # Specifies intentionally untracked files for Git
└── README.md # This file

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following installed on your system:

*   **Git:** [Download Git](https://git-scm.com/downloads)
*   **Python:** Version 3.8 or higher. [Download Python](https://www.python.org/downloads/)
*   **PostgreSQL:** A running PostgreSQL server instance. [Download PostgreSQL](https://www.postgresql.org/download/)
*   **Node.js and npm:** LTS version recommended. [Download Node.js](https://nodejs.org/) (npm is included) or **Yarn:** (Optional) [Install Yarn](https://classic.yarnpkg.com/en/docs/install)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/MTravisVolker/EmptyBudget.git
    cd EmptyBudget
    ```

2.  **Set up Backend:**
    ```bash
    # Navigate to backend directory
    cd backend

    # Create and activate a Python virtual environment
    python -m venv venv

    # On macOS/Linux:
    source venv/bin/activate
    # On Windows (CMD):
    .\venv\Scripts\activate.bat
    # On Windows (PowerShell):
    .\venv\Scripts\Activate.ps1

    # Install Python dependencies
    # (Make sure you have psycopg2 build prerequisites if not using -binary version)
    pip install django psycopg2-binary djangorestframework django-cors-headers

    # Optional: Create requirements.txt if needed
    # pip freeze > requirements.txt
    # Then you could use: pip install -r requirements.txt
    ```

3.  **Set up Frontend:**
    ```bash
    # Navigate to frontend directory from the project root
    cd ../frontend
    # Or directly: cd path/to/EmptyBudget/frontend

    # Install JavaScript dependencies
    npm install
    # or if using yarn:
    # yarn install
    ```

### Database Setup

1.  **Create PostgreSQL Database:** Ensure your PostgreSQL server is running. Connect using `psql` or a GUI tool (like pgAdmin, DBeaver). Create the database and user specified in your Django settings:
    ```sql
    -- Example using psql:
    CREATE DATABASE emptybudgetdb;
    CREATE USER MT WITH PASSWORD 'password';
    ALTER ROLE MT SET client_encoding TO 'utf8';
    ALTER ROLE MT SET default_transaction_isolation TO 'read committed';
    ALTER ROLE MT SET timezone TO 'UTC';
    GRANT ALL PRIVILEGES ON DATABASE emptybudgetdb TO MT;
    ALTER DATABASE emptybudgetdb OWNER TO MT; -- Often simplest for local dev
    \q
    ```
    *(Adjust user/password/db name as needed)*

2.  **Configure Django Settings:**
    *   Open `backend/EmptyBudget/settings.py`.
    *   Locate the `DATABASES` setting and ensure the `ENGINE`, `NAME`, `USER`, `PASSWORD`, `HOST`, and `PORT` match your PostgreSQL setup.
    *   Ensure `corsheaders` is in `INSTALLED_APPS` and `corsheaders.middleware.CorsMiddleware` is high up in `MIDDLEWARE`.
    *   Configure `CORS_ALLOWED_ORIGINS` (recommended) or `CORS_ALLOW_ALL_ORIGINS = True` (easier for local dev). See [django-cors-headers docs](https://github.com/adamchainz/django-cors-headers).

3.  **Apply Database Migrations:**
    ```bash
    # Make sure you are in the 'backend' directory with the venv active
    python manage.py makemigrations api
    python manage.py migrate
    ```

### Environment Variables (Recommended Best Practice)

For sensitive information like database passwords or Django's `SECRET_KEY`, it's strongly recommended **not** to hardcode them directly in `settings.py`, especially if the repository is public.

Consider using a library like `python-dotenv` for the backend:

1.  `pip install python-dotenv`
2.  Create a `.env` file in the `backend/` directory (add `.env` to your root `.gitignore`!).
3.  Add secrets to `.env`:
    ```dotenv
    # backend/.env
    DEBUG=True
    SECRET_KEY='your-django-secret-key-here'
    DATABASE_URL='postgres://MT:password@localhost:5432/emptybudgetdb'
    # Or individual DB parts: DB_NAME=..., DB_USER=..., etc.
    ```
4.  Modify `settings.py` to load these variables using `os.environ.get()` or a library like `django-environ`.

## Running the Application

You need to run both the backend and frontend servers simultaneously.

### Backend

1.  Open a terminal.
2.  Navigate to the `backend/` directory.
3.  Activate the virtual environment (e.g., `source venv/bin/activate` or `.\venv\Scripts\Activate.ps1`).
4.  Start the Django development server:
    ```bash
    python manage.py runserver
    ```
    The backend API will typically be available at `http://127.0.0.1:8000/` (or `http://localhost:8000/`).

### Frontend

1.  Open a *separate* terminal.
2.  Navigate to the `frontend/` directory.
3.  Start the React development server:
    ```bash
    npm start
    # or
    # yarn start
    ```
    The React application will typically open automatically in your browser at `http://localhost:3000/`.

## API Endpoints

The Django backend provides RESTful API endpoints under the `/api/` prefix. You can explore these via the Django REST Framework's browsable API by navigating to `http://127.0.0.1:8000/api/` in your browser while the backend server is running.

Main endpoints include:

*   `/api/recurrences/`
*   `/api/bill-statuses/`
*   `/api/bank-accounts/`
*   `/api/bills/`
*   `/api/due-bills/`
*   `/api/bank-account-instances/`

## Running Tests

### Backend Tests

1.  Navigate to the `backend/` directory.
2.  Activate the virtual environment.
3.  Run Django's test runner:
    ```bash
    python manage.py test api
    # Or run tests for the whole project:
    # python manage.py test
    ```

### Frontend Tests

1.  Navigate to the `frontend/` directory.
2.  **Component/Integration Tests (Jest/RTL):**
    ```bash
    npm test
    # or
    # yarn test
    ```
3.  **End-to-End Tests (Cypress):**
    *   **Interactive Runner:**
        ```bash
        npm run cy:open
        # or
        # yarn cy:open
        ```
        (Requires both frontend and backend servers to be running separately)
    *   **Headless Run:**
        ```bash
        npm run cy:run
        # or
        # yarn cy:run
        ```
        (Requires both frontend and backend servers to be running separately)

## Roadmap

Potential future enhancements:

*   [ ] User Authentication & Authorization
*   [ ] Budget Creation & Goal Setting
*   [ ] Reporting & Data Visualization (Charts)
*   [ ] Transaction Importing (CSV/OFX)
*   [ ] Improved UI/UX & Mobile Responsiveness
*   [ ] Notifications/Reminders for Due Bills
*   [ ] Containerization with Docker

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` file for more information (You should create a LICENSE file, typically containing the standard MIT license text).
