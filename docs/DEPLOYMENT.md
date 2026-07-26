# Deployment — LearnHub

## Overview

LearnHub is deployed using free-tier services:

- **Frontend**: Vercel Free
- **Backend**: InfinityFree Free
- **Database**: MySQL on InfinityFree

## Prerequisites

- A Vercel account (free)
- An InfinityFree account (free)
- A domain or subdomain (optional — InfinityFree provides a free subdomain)
- Git repository with the complete project

## Deployment Order

1. Deploy the backend first (PHP + MySQL)
2. Deploy the frontend second (React)
3. Update the frontend's API base URL to point to the production backend
4. Test all functionality

## Backend Deployment (InfinityFree)

### Step 1: Create InfinityFree Account

1. Go to https://infinityfree.com
2. Sign up for a free account
3. Create a new hosting site
4. Note the FTP credentials and database credentials provided by InfinityFree

### Step 2: Prepare Backend Files

1. Ensure `composer.json` is present with autoload configuration
2. Run `composer install --no-dev` locally to generate the `vendor/` directory
3. Create the `.env` file with production database credentials
4. Ensure `APP_DEBUG=false` and `APP_ENV=production`
5. Do NOT commit `.env` to Git

### Step 3: Upload Files

Upload the following files and directories to InfinityFree's `htdocs` directory via FTP (FileZilla or Cyberduck):

```
htdocs/
├── .htaccess
├── index.php
├── .env
├── vendor/
├── config/
├── routes/
├── src/
├── storage/
└── uploads/
```

### Step 4: Create MySQL Database

1. In the InfinityFree control panel, create a MySQL database
2. Note the database name, username, password, and host
3. Update the `.env` file with these credentials
4. Import the database schema:

```bash
mysql -h [InfinityFree DB host] -u [DB user] -p [DB name] < database/migrations/001_create_users_table.sql
mysql -h [InfinityFree DB host] -u [DB user] -p [DB name] < database/migrations/002_create_courses_table.sql
# ... repeat for all migrations
```

Or use phpMyAdmin (provided by InfinityFree) to import the SQL files.

### Step 5: Import Seed Data

```bash
mysql -h [host] -u [user] -p [DB name] < database/seeders/development_seed.sql
```

### Step 6: Test the Backend

```bash
curl https://your-infinityfree-site.infinityfreeapp.com/api/auth/me
curl https://your-infinityfree-site.infinityfreeapp.com/api/courses
```

## Frontend Deployment (Vercel)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Configure Environment Variables

In the Vercel dashboard or via CLI:

```bash
vercel env add VITE_API_BASE_URL
# Enter: https://your-infinityfree-site.infinityfreeapp.com/api
```

### Step 3: Deploy

```bash
cd frontend
vercel
```

Follow the prompts:
- Set up as a new project
- Link to your GitHub repository
- Vercel will automatically detect it's a Vite/React project
- Deploy to production

### Step 4: Update API Base URL

After deployment, ensure the frontend's `.env` file has the correct production API URL:

```env
VITE_API_BASE_URL=https://your-infinityfree-site.infinityfreeapp.com/api
```

### Step 5: Test the Frontend

Visit the Vercel URL and verify:
- Login works
- Dashboard loads correctly
- CRUD operations work
- Attendance marking works
- Notifications appear

## Production Environment Variables

### Backend (.env)

```env
APP_ENV=production
APP_DEBUG=false

DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=learnhub_db
DB_USERNAME=learnhub_user
DB_PASSWORD=your_secure_password_here

CORS_ALLOWED_ORIGINS=https://learnhub.vercel.app
```

### Frontend (.env)

```env
VITE_API_BASE_URL=https://your-infinityfree-site.infinityfreeapp.com/api
```

## Free Hosting Limitations

InfinityFree free tier has the following limitations:

- **Storage**: Limited disk space (typically 500MB–1GB)
- **Bandwidth**: Limited monthly traffic
- **PHP execution time**: Scripts may time out after 30 seconds
- **No scheduled jobs**: Background processes (like the absent-process cron) must be triggered manually or via external cron services
- **Database**: Limited to a single MySQL database
- **File uploads**: Limited storage for uploaded files

### Mitigations

- **Scheduled jobs**: Use an external cron service (e.g., cron-job.org) to trigger the absent process endpoint periodically
- **File storage**: For larger deployments, replace the `LocalStorage` implementation with `S3Storage` or similar
- **Bandwidth**: Optimize images and files; use compression

## CI/CD (Optional)

GitHub Actions can automate deployment:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vercel/action@v30
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Rollback

If a deployment breaks the application:

1. Revert the problematic commit in Git
2. Redeploy from the previous commit
3. Vercel keeps deployment history and allows instant rollback
4. InfinityFree: restore files from backup or re-upload previous version