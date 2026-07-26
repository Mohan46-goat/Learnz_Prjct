# LearnHub — Project Handoff & Testing Guide

## What this project does

LearnHub is a role-based learning-management app for a coaching centre or training institute. It connects the people who run learning programs with the people who teach and attend them.

The main flow is:

```text
Admin creates people → Admin creates courses → Admin creates batches
→ Admin assigns instructors and students → Instructor schedules lessons
→ Student/instructor records attendance → Student receives notification
→ Admin reviews attendance reports
```

## Roles at a glance

| Role | Purpose | What they use in the current web app |
| --- | --- | --- |
| Admin | Sets up and oversees the learning operation. | Dashboard, Users, Courses, Batches, Attendance records, Reports, Notifications. |
| Instructor | Runs the batches assigned to them. | Dashboard, Lessons, Attendance, Notifications. |
| Student | Follows their learning journey. | Dashboard, Lessons, Attendance, Notifications. |

The backend also supports instructor report endpoints, student attendance-percentage endpoints, and material upload/download endpoints. Those are available through the API but do not yet have their own navigation page in the current frontend.

## Module guide

### Dashboard

Each user sees a role-specific overview after login. It gives a quick view of learners, batches, attendance, today’s lesson, or personal attendance depending on the role.

### Users — admin

Create admin, instructor, or student accounts. Admins can deactivate a user; inactive accounts cannot log in.

### Courses — admin

Create the learning program, for example **Web Development** or **Data Science**. A course is the parent of one or more batches.

### Batches — admin

Create a dated cohort under a course. Open **Manage** to assign instructors and enrol or remove students. This is the bridge between the course, teacher, and learners.

### Lessons — instructor / student

An instructor creates lessons for only their assigned batches, including date and time. Students can view lessons for batches where they are enrolled.

### Attendance — instructor / student / admin

- Student: marks their own attendance for a lesson.
- Instructor: marks attendance for students in their assigned lesson’s batch.
- Admin: views attendance records.

One student can only have one attendance record per lesson. Valid values are `present`, `late`, and `absent`.

### Notifications — all roles

Shows user-specific updates. When an instructor records a student’s attendance, that student receives an attendance notification. Users can mark one update, or all updates, as read. The sidebar badge shows the unread total.

### Reports — admin in the current web UI

Shows daily attendance. The API additionally supports batch reports, a student’s history, and attendance percentage.

### Materials — API module

Instructors can upload lesson files (`pdf`, Office documents, `jpg`, `png`) up to 10 MB. Authorised users can download them. The backend is ready, but the current frontend does not yet include a Materials screen.

### Audit logs — backend module

The database has an audit-log table and helper for recording sensitive actions. It is for system history rather than a current user-facing screen.

## Test accounts

These are **development/demo accounts only**. They are included in `database/seeders/development_seed.sql` and `database/full_schema.sql`.

| Role | Email | Password | Useful for testing |
| --- | --- | --- | --- |
| Admin | `admin@learnhub.com` | `Admin@123` | Create users, courses, batches; assign people; view reports. |
| Instructor | `john@learnhub.com` | `Teacher@123` | Web Development batch. Create a lesson and mark Alice or Bob’s attendance. |
| Instructor | `sarah@learnhub.com` | `Teacher@123` | Data Science batch. |
| Student | `alice@learnhub.com` | `Student@123` | Web Development batch. |
| Student | `bob@learnhub.com` | `Student@123` | Web Development batch. |
| Student | `carol@learnhub.com` | `Student@123` | Data Science batch. |
| Student | `david@learnhub.com` | `Student@123` | Data Science batch. |

Do not use these passwords for real users or leave them enabled in a public production demo. Change or remove them before handing the deployed app to real users.

## Fast testing script

1. Log in as the **admin**. Confirm Users, Courses, Batches, Attendance, Reports, and Notifications are visible.
2. Create a fresh course and batch with current dates. Assign John as instructor and Alice as student.
3. Log out, then log in as **John**. Go to Lessons and create a lesson for that assigned batch.
4. Open Attendance as John, choose the new lesson and Alice, then mark her `present`. This should create a notification for Alice.
5. Log out, then log in as **Alice**. Confirm the unread badge appears beside Notifications, open it, and mark the update read. Confirm the badge count changes.
6. Still as Alice, open Lessons and Attendance. She should only see her batch/records and can mark only her own attendance.
7. Log in as admin again. Verify the attendance record appears in Attendance and Reports.

## Local setup for a tester

1. Create a local MySQL database named `learnhub`.
2. Import `database/full_schema.sql`. It creates the tables and demo data in one import.
3. Create `backend/.env` from `.env.example` and use local database values:

```env
APP_ENV=development
APP_DEBUG=true
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=learnhub
DB_USERNAME=root
DB_PASSWORD=
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

4. In `frontend/.env`, use:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

5. Start the backend from `backend/`:

```bash
php -S localhost:8000 -t public
```

6. Start the frontend from `frontend/`:

```bash
npm install
npm run dev
```

7. Open `http://localhost:5173` and use a demo account above.

## Technical map

```text
React/Vite frontend
  → Axios requests with session cookies
  → PHP REST API and role middleware
  → Services and models
  → MySQL database
```

- `frontend/`: pages, routing, responsive UI, and API client.
- `backend/public/index.php`: API entry point, session and CORS handling.
- `backend/routes/api.php`: endpoint-to-controller routing and role checks.
- `backend/src/Controllers`: receives API requests.
- `backend/src/Services`: business rules.
- `backend/src/Models`: database queries.
- `database/`: schema, migrations, and development seed data.

## Important deployment note

The demo account passwords are for a newly imported database only. `INSERT IGNORE` will not overwrite existing user records. If a live database already contains these accounts, reset their passwords through the database or create separate test users through the Admin → Users screen.
