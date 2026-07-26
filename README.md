# LearnHub — Role-Based Learning & Coaching Management Platform

A full-stack web application for managing learning programs, coaching sessions, and student attendance. Built with React (Vite) frontend, PHP 8+ REST API backend, and MySQL database.

## Live Demo

- **Frontend**: https://learnhub.vercel.app (planned)
- **Backend API**: https://learnhub.infinityfreeapp.com (planned)

## Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Frontend   | React, Vite, JavaScript, React Router   |
| Backend    | PHP 8+, PDO, MySQL, REST API            |
| Database   | MySQL 8                                 |
| Hosting    | Vercel (frontend), InfinityFree (backend)|
| Versioning | Git, GitHub                             |

## Quick Start

### Prerequisites

- PHP 8.2+
- MySQL 8.0+
- Node.js 22+
- Composer

### Local Development

```bash
# Clone the repository
git clone https://github.com/<your-username>/learnhub.git
cd learnhub

# Setup backend
cd backend
composer install
cp .env.example .env
# Edit .env with your database credentials

# Setup frontend
cd ../frontend
npm install
npm run dev

# Import database schema
mysql -u root -p learnhub < database/migrations/001_create_users_table.sql
# (repeat for all migration files)
```

## Project Structure

```
learnhub/
├── frontend/          # React + Vite frontend
├── backend/           # PHP REST API backend
├── database/          # SQL migrations and seeders
├── docs/              # Technical documentation
├── tests/             # Test suite
├── .github/           # GitHub Actions workflows
└── README.md
```

## Features

- **Three user roles**: Admin, Instructor, Student
- **User management** with role assignment
- **Course and batch management**
- **Lesson creation with attendance windows**
- **Attendance tracking** (Present, Late, Absent)
- **Material uploads** with storage abstraction
- **Database-backed notifications**
- **Attendance reports and dashboards**
- **Role-based access control** enforced on backend
- **Audit logging** for all sensitive operations

## Documentation

| Document                  | Description                              |
| ------------------------- | ---------------------------------------- |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture and design decisions |
| [DATABASE.md](docs/DATABASE.md)         | Database schema and relationships        |
| [API.md](docs/API.md)                   | API endpoint reference                   |
| [AUTHENTICATION.md](docs/AUTHENTICATION.md) | Auth flow and token handling           |
| [SECURITY.md](docs/SECURITY.md)         | Security measures and hardening          |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md)     | Deployment guide                         |
| [DEVELOPMENT.md](docs/DEVELOPMENT.md)   | Development setup and workflow           |
| [TESTING.md](docs/TESTING.md)           | Testing strategy and instructions        |
| [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md) | Simple project flow, modules, demo accounts, and tester guide |

## License

MIT
