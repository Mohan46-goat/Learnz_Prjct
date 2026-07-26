# Authentication — LearnHub

## Overview

LearnHub uses session-based authentication. When a user logs in, PHP creates a session and stores the user ID in the session. Subsequent requests include the session cookie, which the backend uses to identify the user.

## Why Session-Based Authentication

- Simple and well-understood
- No token management complexity
- Works well with PHP's native session handling
- Sufficient for a learning/portfolio project
- For production applications, consider JWT or OAuth2

## Comparison with Node.js/Express

| Concept          | PHP                          | Node.js/Express                    |
| ---------------- | ---------------------------- | ---------------------------------- |
| Session storage  | `$_SESSION` superglobal      | `express-session` middleware       |
| Session ID       | `PHPSESSID` cookie           | `connect.sid` cookie               |
| Session middleware | Built into PHP              | `express-session` package          |
| Password hashing | `password_hash()` / `password_verify()` | `bcrypt` / `bcryptjs`       |
| Auth middleware  | Custom PHP middleware class  | Custom middleware function         |

## Authentication Flow

### Login

1. User submits email and password via the frontend login form
2. Frontend sends `POST /api/auth/login` with JSON body
3. Backend finds the user by email in the `users` table
4. Backend verifies the password using `password_verify()`
5. If valid, backend stores `user_id` and `role` in `$_SESSION`
6. Backend returns the user object (without password hash)
7. Frontend stores session cookie automatically (browser handles it)

### Logout

1. User clicks logout button
2. Frontend sends `POST /api/auth/logout`
3. Backend destroys the session with `session_destroy()`
4. Backend returns success response
5. Frontend clears any local state

### Session Check (Authenticated Routes)

1. Every authenticated API request includes the session cookie
2. Backend middleware reads `$_SESSION['user_id']`
3. If no user is in the session, the request is rejected with 401
4. If a user is found, the request proceeds to the controller

### Get Current User

1. Frontend sends `GET /api/auth/me`
2. Backend reads `$_SESSION['user_id']`
3. Backend fetches the user from the database (excluding password hash)
4. Backend returns the user object

## Password Handling

### Hashing

```php
$hash = password_hash($plainPassword, PASSWORD_DEFAULT);
```

- Uses bcrypt by default in PHP 8.2
- Automatically generates a salt
- Includes the algorithm, cost factor, and salt in the hash string
- `PASSWORD_DEFAULT` will use the strongest available algorithm in future PHP versions

### Verification

```php
$isValid = password_verify($plainPassword, $storedHash);
```

- Extracts the salt and cost from the stored hash
- Hashes the provided password with the same parameters
- Compares the result with the stored hash

### Why Not MD5 or SHA1

- MD5 is cryptographically broken and fast to brute-force
- SHA1 is also broken and should not be used for passwords
- Plain-text passwords are a critical security violation
- `password_hash()` handles salting and cost automatically

## Session Security

- Session cookie is set with `HttpOnly` flag (not accessible via JavaScript)
- Session cookie uses `Secure` flag in production (HTTPS only)
- Session cookie uses `SameSite=Lax` for CSRF protection
- Session ID is regenerated on login to prevent session fixation
- Sessions expire after a configurable timeout

## Session Configuration

```php
// In config/database.php or a session config file
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1); // In production with HTTPS
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.use_strict_mode', 1);
ini_set('session.gc_maxlifetime', 3600); // 1 hour
```

## Password Requirements

- Minimum 8 characters
- Should contain a mix of uppercase, lowercase, numbers, and special characters
- Frontend should validate before sending to backend
- Backend should validate and reject weak passwords