# Security — LearnHub

## Threat Model

This document outlines the security measures implemented in LearnHub to protect against common web application vulnerabilities.

## SQL Injection Prevention

**Threat:** An attacker injects malicious SQL through user input.

**Mitigation:** All database queries use PDO prepared statements with parameterized queries.

```php
// SECURE — Parameterized query
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email');
$stmt->execute(['email' => $email]);

// INSECURE — String concatenation (NEVER do this)
$stmt = $pdo->query("SELECT * FROM users WHERE email = '$email'");
```

**Why it works:** PDO prepared statements separate SQL logic from data. The database engine treats parameter values as data only, never as executable SQL code.

## Cross-Site Scripting (XSS) Prevention

**Threat:** An attacker injects malicious JavaScript that executes in other users' browsers.

**Mitigation:**

- All user-supplied data is escaped when rendered in HTML
- The frontend uses React, which auto-escapes JSX expressions by default
- API responses are JSON, not HTML, reducing XSS surface area
- `Content-Type: application/json` header is set on all API responses
- `X-Content-Type-Options: nosniff` header is set

## Cross-Site Request Forgery (CSRF) Prevention

**Threat:** An attacker tricks a logged-in user into performing unwanted actions.

**Mitigation:**

- Session cookies use `SameSite=Lax` attribute
- For state-changing operations (POST, PUT, DELETE), the frontend includes the session cookie via `withCredentials`
- In production, consider implementing CSRF tokens for additional protection
- The `SameSite=Lax` attribute prevents cookies from being sent in cross-site POST requests

## Broken Access Control Prevention

**Threat:** A user accesses resources or performs actions they are not authorized for.

**Mitigation:**

- Every API endpoint checks the user's role before allowing the operation
- Authorization is enforced on the backend, not just the frontend
- Users can only access their own data (enforced by user_id checks)
- Instructors can only access their assigned batches
- Students can only access their own attendance and data
- Role checks are implemented in middleware AND in services (defense in depth)

## Insecure Direct Object Reference (IDOR) Prevention

**Threat:** An attacker modifies a URL parameter to access another user's data.

**Mitigation:**

- Every endpoint that accesses a specific resource verifies the current user has permission
- For example, `GET /api/users/{id}` checks that the requesting user is an admin
- `GET /api/reports/student/{student_id}` checks that the requesting user is either an admin or the same student
- Batch-scoped endpoints verify the user is assigned to that batch

## Brute Force Protection

**Threat:** An attacker tries many password combinations to guess a user's password.

**Mitigation:**

- Login endpoint returns generic error messages ("Invalid email or password") — never reveals whether the email exists
- Account lockout after repeated failed attempts can be added
- Rate limiting at the web server level (InfinityFree may provide this)
- `password_hash()` with bcrypt is intentionally slow, making brute-force attacks expensive

## Insecure File Upload Prevention

**Threat:** An attacker uploads a malicious file (e.g., PHP shell) that gets executed on the server.

**Mitigation:**

- File extension whitelist: only `pdf`, `doc`, `docx`, `ppt`, `pptx`, `xls`, `xlsx`, `jpg`, `png` are allowed
- MIME type validation on the server side (not just client-side)
- File size limit (10MB)
- Original filename is never used directly — a random safe name is generated
- Files are stored outside the web root when possible
- Uploaded files are not executed (stored with non-PHP extensions)
- The `StorageService` abstraction allows swapping to external storage (e.g., S3) where file execution is not a concern

## Session Fixation Prevention

**Threat:** An attacker sets a user's session ID before login, then hijacks the session after login.

**Mitigation:**

- `session_regenerate_id(true)` is called after successful login
- This creates a new session ID and invalidates the old one
- `session.use_strict_mode` is enabled in PHP configuration

## Sensitive Data Exposure Prevention

**Threat:** Passwords, API keys, or database credentials are exposed to unauthorized users.

**Mitigation:**

- Passwords are never stored in plain text — always hashed with `password_hash()`
- Password hashes are never returned in API responses
- Database credentials are stored in environment variables (`.env`), never in source code
- `.env` files are in `.gitignore`
- Error messages in production do not reveal database structure or stack traces
- `APP_DEBUG=false` in production
- `display_errors` is disabled in production

## CORS Configuration

**Threat:** A malicious website makes API requests on behalf of a logged-in user.

**Mitigation:**

- CORS is configured with a whitelist of approved origins only
- `Access-Control-Allow-Origin` is never set to `*` for authenticated endpoints
- `Access-Control-Allow-Credentials: true` is only sent for whitelisted origins
- Development origin (`http://localhost:5173`) and production origin are explicitly allowed

## Environment Variables

All sensitive configuration is stored in environment variables:

```env
DB_HOST=localhost
DB_DATABASE=learnhub
DB_USERNAME=root
DB_PASSWORD=
APP_ENV=production
APP_DEBUG=false
CORS_ALLOWED_ORIGINS=https://learnhub.vercel.app
```

Never commit `.env` files to Git. The `.env.example` file contains placeholder values only.

## Security Headers

The PHP backend should set the following HTTP headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## Audit Logging

All sensitive operations are logged in the `audit_logs` table:

- User creation, update, deletion
- Role changes
- Password changes
- Attendance modifications
- File uploads and downloads

Audit logs never contain passwords, API keys, or database credentials.