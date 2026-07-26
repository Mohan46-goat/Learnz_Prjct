# Testing — LearnHub

## Testing Strategy

Testing is organized into four levels:

1. **Unit Tests** — Test individual functions and classes in isolation
2. **Integration Tests** — Test interactions between components (e.g., controller + service + repository)
3. **API Tests** — Test HTTP endpoints end-to-end
4. **Security Tests** — Test that security controls are enforced

## Test Framework

PHPUnit is the standard testing framework for PHP. It is installed via Composer.

## Setup

### 1. Install PHPUnit

```bash
cd backend
composer require --dev phpunit/phpunit
```

### 2. Create phpunit.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit bootstrap="vendor/autoload.php" colors="true">
    <testsuites>
        <testsuite name="Unit">
            <directory>tests/Unit</directory>
        </testsuite>
        <testsuite name="Integration">
            <directory>tests/Integration</directory>
        </testsuite>
        <testsuite name="API">
            <directory>tests/API</directory>
        </testsuite>
        <testsuite name="Security">
            <directory>tests/Security</directory>
        </testsuite>
    </testsuites>
</phpunit>
```

### 3. Create Test Database

Create a separate test database to avoid affecting development data:

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS learnhub_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
```

### 4. Run Tests

```bash
cd backend
vendor/bin/phpunit
```

## Test Categories

### Authentication Tests

Verify that:
- Login with valid credentials succeeds
- Login with invalid credentials fails
- Login with missing fields fails validation
- Logout destroys the session
- Unauthenticated requests are rejected with 401

### Authorization Tests

Verify that:
- Students cannot access admin endpoints
- Instructors cannot access student-only endpoints
- Users cannot access other users' data (IDOR)
- Instructors can only access their assigned batches
- Students can only access their own attendance

### User CRUD Tests

Verify that:
- Admin can create a user
- Admin can list all users
- Admin can view a single user
- Admin can update a user
- Admin can deactivate a user
- Non-admin users cannot create/update/delete users

### Course CRUD Tests

Verify that:
- Admin can create a course
- Admin can list all courses
- Admin can update a course
- Admin can deactivate a course
- Non-admin users cannot modify courses

### Attendance Tests

Verify that:
- Students can mark their own attendance
- Students cannot mark attendance for other students
- Duplicate attendance is prevented
- Late status is applied correctly after the threshold
- Absent records are created when no attendance is marked

### Duplicate Attendance Tests

Verify that:
- A student cannot mark attendance twice for the same lesson
- The UNIQUE constraint prevents duplicates
- The application handles the duplicate gracefully

### Notification Tests

Verify that:
- Notifications are created for attendance events
- Unread count is accurate
- Mark as read updates the record
- Mark all as read updates all records

### File Upload Tests

Verify that:
- Only allowed file extensions are accepted
- Files exceeding the size limit are rejected
- Invalid MIME types are rejected
- Uploaded files are stored with safe names
- Original filenames are not used directly

### Security Tests

Verify that:
- SQL injection attempts are blocked
- XSS payloads are not executed
- Unauthorized API access is rejected
- Role escalation is prevented
- IDOR attempts are blocked
- Invalid file uploads are rejected
- Invalid input is rejected with proper error messages

## Writing a Test Example

```php
<?php

use PHPUnit\Framework\TestCase;
use App\Models\User;
use App\Services\UserService;

class UserServiceTest extends TestCase
{
    private $pdo;
    private $userService;

    protected function setUp(): void
    {
        $this->pdo = new PDO('mysql:host=localhost;dbname=learnhub_test', 'root', '');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->userService = new UserService($this->pdo);
    }

    public function testCanCreateUser(): void
    {
        $user = $this->userService->createUser([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'securePassword123',
            'role' => 'student',
            'status' => 'active'
        ]);

        $this->assertNotNull($user['id']);
        $this->assertEquals('Test User', $user['name']);
        $this->assertEquals('student', $user['role']);
    }

    public function testCannotCreateUserWithDuplicateEmail(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Email already exists');

        $this->userService->createUser([
            'name' => 'User One',
            'email' => 'duplicate@example.com',
            'password' => 'securePassword123',
            'role' => 'student',
            'status' => 'active'
        ]);

        $this->userService->createUser([
            'name' => 'User Two',
            'email' => 'duplicate@example.com',
            'password' => 'anotherPassword',
            'role' => 'student',
            'status' => 'active'
        ]);
    }

    protected function tearDown(): void
    {
        $this->pdo->exec("TRUNCATE TABLE users");
    }
}
```

## Test Database Setup

Before running tests, ensure the test database has the correct schema:

```bash
mysql -u root learnhub_test < ../database/migrations/001_create_users_table.sql
mysql -u root learnhub_test < ../database/migrations/002_create_courses_table.sql
# ... all migrations
```

Each test should clean up after itself (truncate tables or use transactions that roll back).

## Running All Tests

```bash
cd backend
vendor/bin/phpunit --verbose
```

## CI Integration

Add a GitHub Actions workflow to run tests on every push and pull request:

```yaml
# .github/workflows/tests.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: learnhub_test
        ports:
          - 3306:3306
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: pdo, pdo_mysql
      - run: composer install
      - run: mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS learnhub_test"
      - run: mysql -u root -proot learnhub_test < database/migrations/001_create_users_table.sql
      # ... run all migrations
      - run: vendor/bin/phpunit
```