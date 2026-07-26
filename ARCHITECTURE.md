# Architecture — LearnHub

## Overview

LearnHub is a three-tier full-stack application with a React frontend, PHP REST API backend, and MySQL database. The architecture follows a clean separation of concerns with layered backend design.

## System Architecture

### Local Development

```
React + Vite (Port 5173)
      |
      | HTTP/REST API (JSON)
      v
PHP Backend (Built-in PHP server or Apache)
      |
      | PDO
      v
MySQL (Local or Docker)
```

### Production Deployment

```
User Browser
    |
    v
React + Vite Frontend (Vercel CDN)
    |
    | HTTPS API Calls
    v
PHP REST API (InfinityFree)
    |
    | PDO
    v
MySQL (InfinityFree)
```

## Backend Architecture

The PHP backend uses a layered architecture:

```
HTTP Request
    |
    v
routes/api.php          (Route definitions)
    |
    v
Middleware              (Auth, AuthZ, CORS, Validation)
    |
    v
Controllers             (Handle HTTP request/response)
    |
    v
Services                (Business logic)
    |
    v
Repositories            (Database queries via PDO)
    |
    v
MySQL Database
```

### Layer Responsibilities

| Layer        | Responsibility                                      | Example                          |
| ------------ | --------------------------------------------------- | -------------------------------- |
| Controller   | Parse HTTP request, call service, return JSON       | UserController::create()         |
| Service      | Business logic, validation orchestration            | UserService::createUser()        |
| Repository   | Database queries, PDO prepared statements           | UserRepository::findById()       |
| Middleware   | Cross-cutting concerns (auth, CORS, logging)        | AuthMiddleware::handle()         |
| Validator    | Input validation and sanitization                   | UserValidator::validateCreate()  |

### Why This Architecture

- **Separation of concerns**: Each layer has a single responsibility
- **Testability**: Services can be tested independently of HTTP
- **Maintainability**: Changes to database queries don't affect controllers
- **Security**: Authorization logic is centralized in middleware and services
- **Scalability**: Repository pattern makes it easy to swap storage backends

## Frontend Architecture

```
src/
├── api/           # Axios instances and API endpoints
├── components/    # Reusable UI components
├── layouts/       # Page layouts (admin, instructor, student)
├── pages/         # Route-level page components
├── routes/        # Protected route definitions
├── hooks/         # Custom React hooks
├── context/       # React context (auth, notifications)
├── services/      # Frontend API service layer
└── utils/         # Helpers and formatters
```

## Data Flow

1. User interacts with React UI
2. Frontend makes HTTP request to PHP API
3. Middleware authenticates and authorizes the request
4. Controller validates input via Validator
5. Service executes business logic
6. Repository executes database query
7. Response flows back through the same layers
8. Frontend updates UI with response data

## Design Decisions

### Why React + Vite
- Fast development with HMR
- Component-based UI matches the role-based dashboard structure
- Large ecosystem and familiar to the developer

### Why PHP (not Node.js)
- Primary learning objective is PHP
- PDO provides a clean, standard database interface
- PHP's built-in web server simplifies local development
- The patterns (MVC, middleware, repositories) transfer to other backends

### Why MySQL (not MongoDB)
- Relational data model fits the domain (users, batches, lessons, attendance)
- Foreign keys enforce referential integrity
- Structured queries for reporting and attendance calculations
- Same database technology in dev and production

### Why Plain PHP (not a Framework)
- Learning objective is to understand PHP deeply
- Frameworks abstract away the mechanics we want to learn
- A plain PHP REST API demonstrates the core concepts clearly
- Composer is used for autoloading and dependency management

### Why Vercel + InfinityFree
- Both offer free tiers suitable for a learning project
- Vercel provides excellent frontend hosting with CDN
- InfinityFree provides PHP + MySQL on a single host
- This combination keeps the project cost-free while being functional

## Security Architecture

- **Authentication**: Session-based with PHP sessions
- **Authorization**: Role-based access control enforced in middleware and services
- **Database**: PDO prepared statements prevent SQL injection
- **Passwords**: `password_hash()` / `password_verify()` with bcrypt
- **CORS**: Whitelist of approved origins only
- **File uploads**: Extension + MIME validation, safe filename generation
- **Audit logs**: All sensitive operations are logged
- **Environment variables**: Secrets never committed to Git