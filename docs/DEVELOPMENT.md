# Development Guide — LearnHub

## Prerequisites

- PHP 8.2+
- MySQL 8.0+
- Node.js 22+
- Composer
- Git

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/learnhub.git
cd learnhub
```

### 2. Start MySQL

MySQL should already be running locally. Verify:

```bash
mysql -u root -e "SELECT 1"
```

If MySQL is not running, start it:

```bash
# Windows
net start MySQL80
```

### 3. Create the Database

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS learnhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
```

### 4. Setup Backend

```bash
cd backend
composer install
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=learnhub
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Run Database Migrations

```bash
mysql -u root learnhub < ../database/migrations/001_create_users_table.sql
mysql -u root learnhub < ../database/migrations/002_create_courses_table.sql
mysql -u root learnhub < ../database/migrations/003_create_batches_table.sql
mysql -u root learnhub < ../database/migrations/004_create_batch_instructors_table.sql
mysql -u root learnhub < ../database/migrations/005_create_batch_students_table.sql
mysql -u root learnhub < ../database/migrations/006_create_lessons_table.sql
mysql -u root learnhub < ../database/migrations/007_create_materials_table.sql
mysql -u root learnhub < ../database/migrations/008_create_attendance_table.sql
mysql -u root learnhub < ../database/migrations/009_create_notifications_table.sql
mysql -u root learnhub < ../database/migrations/010_create_audit_logs_table.sql
```

### 6. Seed the Database (Optional)

```bash
mysql -u root learnhub < ../database/seeders/development_seed.sql
```

### 7. Setup Frontend

```bash
cd ../frontend
npm install
```

### 8. Start Development Servers

Start the PHP backend:

```bash
cd ../backend
php -S localhost:8000 -t public
```

Start the Vite frontend dev server:

```bash
cd ../frontend
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to `http://localhost:8000`.

## PHP Concepts — JavaScript Comparison

### Variables

PHP:
```php
$name = "John";
$age = 25;
$isActive = true;
```

JavaScript:
```javascript
let name = "John";
let age = 25;
let isActive = true;
```

### Arrays

PHP:
```php
$fruits = ["apple", "banana", "cherry"];
$fruits[] = "date";
$count = count($fruits);
```

JavaScript:
```javascript
const fruits = ["apple", "banana", "cherry"];
fruits.push("date");
const count = fruits.length;
```

### Associative Arrays (Objects in JS)

PHP:
```php
$user = [
    "id" => 1,
    "name" => "John",
    "email" => "john@example.com"
];
echo $user["name"];
```

JavaScript:
```javascript
const user = {
    id: 1,
    name: "John",
    email: "john@example.com"
};
console.log(user.name);
```

### Functions

PHP:
```php
function greet(string $name): string {
    return "Hello, $name!";
}
```

JavaScript:
```javascript
function greet(name) {
    return `Hello, ${name}!`;
}
```

### Classes

PHP:
```php
class User {
    private string $name;

    public function __construct(string $name) {
        $this->name = $name;
    }

    public function getName(): string {
        return $this->name;
    }
}
```

JavaScript:
```javascript
class User {
    constructor(name) {
        this.name = name;
    }

    getName() {
        return this.name;
    }
}
```

### Namespaces (Modules in JS)

PHP:
```php
namespace App\Controllers;

use App\Models\User;

class UserController {
    public function index() {
        $user = new User();
    }
}
```

JavaScript:
```javascript
import { User } from '../models/User.js';

export class UserController {
    index() {
        const user = new User();
    }
}
```

### HTTP Requests

PHP (cURL):
```php
$ch = curl_init('https://api.example.com/users');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
```

JavaScript (fetch):
```javascript
const response = await fetch('https://api.example.com/users');
const data = await response.json();
```

### JSON

PHP:
```php
$json = json_encode($data);
$data = json_decode($json, true);
```

JavaScript:
```javascript
const json = JSON.stringify(data);
const data = JSON.parse(json);
```

### Environment Variables

PHP:
```php
$dbHost = getenv('DB_HOST');
```

JavaScript (Vite):
```javascript
const apiBase = import.meta.env.VITE_API_BASE_URL;
```

### Autoloading

PHP (Composer):
```json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    }
}
```

JavaScript (ES Modules):
```javascript
import User from './models/User.js';
```

## Git Workflow

### Branching Strategy

```
main
  └── develop
        └── feature/your-feature-name
```

### Creating a Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/user-crud
```

### Commit Messages

Use conventional commit format:

```
feat: add user CRUD endpoints
fix: prevent duplicate attendance records
security: validate file MIME type on upload
test: add authentication integration tests
docs: update API documentation
chore: update dependencies
```

### Pull Request Workflow

1. Create a feature branch from `develop`
2. Make changes and commit with meaningful messages
3. Push the branch to GitHub
4. Open a Pull Request against `develop`
5. Get code review
6. Merge after approval
7. Merge `develop` into `main` for releases

## Testing

Run tests from the `tests/` directory:

```bash
cd backend
php vendor/bin/phpunit
```

See [TESTING.md](TESTING.md) for detailed testing instructions.

## Common Issues

### CORS Errors

If the frontend cannot reach the backend:
- Check that CORS middleware allows the frontend origin
- Verify `VITE_API_BASE_URL` is correct
- Ensure the backend server is running

### Database Connection Errors

- Verify MySQL is running
- Check `.env` database credentials
- Ensure the database exists
- Check that `pdo_mysql` PHP extension is enabled

### Session Issues

- Ensure `session_start()` is called before any output
- Check that session directory is writable
- Verify session cookie settings in production