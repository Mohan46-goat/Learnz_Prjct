# API Reference — LearnHub

## Base URL

### Development

```
http://localhost:8000/api
```

### Production

```
https://learnhub.infinityfreeapp.com/api
```

## Response Format

### Success

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

### Pagination

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "items": [],
    "total": 50,
    "page": 1,
    "per_page": 20
  }
}
```

## Authentication Endpoints

### POST /api/auth/login

Authenticate a user and start a session.

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "secret123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@example.com",
      "role": "admin",
      "status": "active"
    }
  }
}
```

**Response (401):**

```json
{
  "success": false,
  "message": "Invalid email or password",
  "errors": []
}
```

### POST /api/auth/logout

Destroy the current session.

**Response (200):**

```json
{
  "success": true,
  "message": "Logout successful",
  "data": {}
}
```

### GET /api/auth/me

Get the currently authenticated user.

**Headers:**

```
Cookie: PHPSESSID=...
```

**Response (200):**

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": { ... }
  }
}
```

**Response (401):**

```json
{
  "success": false,
  "message": "Authentication required",
  "errors": []
}
```

## User Endpoints

### GET /api/users

List all users. **Admin only.**

**Response (200):**

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      { "id": 1, "name": "Admin", "email": "admin@example.com", "role": "admin", "status": "active", "created_at": "..." }
    ]
  }
}
```

### POST /api/users

Create a new user. **Admin only.**

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "student",
  "status": "active"
}
```

**Validation Rules:**

| Field     | Rules                              |
| --------- | ---------------------------------- |
| name      | Required, string, max 255          |
| email     | Required, valid email, unique      |
| password  | Required, min 8 characters         |
| role      | Required, one of: admin, instructor, student |
| status    | Required, one of: active, inactive |

### GET /api/users/{id}

View a single user. **Admin only.**

### PUT /api/users/{id}

Update a user. **Admin only.**

**Request Body:** (all fields optional except at least one must be provided)

```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "role": "instructor",
  "status": "active"
}
```

### PATCH /api/users/{id}/status

Activate or deactivate a user. **Admin only.**

**Request Body:**

```json
{
  "status": "inactive"
}
```

## Course Endpoints

### GET /api/courses

List all courses. **Admin only.**

### POST /api/courses

Create a course. **Admin only.**

**Request Body:**

```json
{
  "name": "Web Development Bootcamp",
  "description": "Full-stack web development course"
}
```

### GET /api/courses/{id}

View a single course. **Admin only.**

### PUT /api/courses/{id}

Update a course. **Admin only.**

### DELETE /api/courses/{id}

Deactivate a course (soft delete). **Admin only.**

## Batch Endpoints

### GET /api/batches

List all batches. **Admin and Instructor** (instructors see only their assigned batches).

### POST /api/batches

Create a batch. **Admin only.**

**Request Body:**

```json
{
  "course_id": 1,
  "name": "Web Dev - Batch 1",
  "start_date": "2026-08-01",
  "end_date": "2026-12-31"
}
```

### GET /api/batches/{id}

View a single batch with members. **Admin and assigned Instructor.**

### PUT /api/batches/{id}

Update a batch. **Admin only.**

### POST /api/batches/{id}/assign-instructor

Assign an instructor to a batch. **Admin only.**

**Request Body:**

```json
{
  "instructor_id": 3
}
```

### POST /api/batches/{id}/add-student

Add a student to a batch. **Admin only.**

**Request Body:**

```json
{
  "student_id": 5
}
```

### DELETE /api/batches/{id}/remove-student/{student_id}

Remove a student from a batch. **Admin only.**

## Lesson Endpoints

### GET /api/lessons

List lessons. **Admin** (all lessons), **Instructor** (assigned batches only), **Student** (assigned batches only).

**Query Parameters:**

- `batch_id` (optional) — filter by batch
- `date` (optional) — filter by lesson date

### POST /api/lessons

Create a lesson. **Instructor** (for assigned batches only).

**Request Body:**

```json
{
  "batch_id": 1,
  "title": "Introduction to React",
  "description": "Overview of React components and props",
  "lesson_date": "2026-08-05",
  "start_time": "09:00",
  "end_time": "10:30",
  "attendance_start_time": "09:00",
  "attendance_end_time": "09:15"
}
```

### GET /api/lessons/{id}

View a single lesson with attendance records.

### PUT /api/lessons/{id}

Update a lesson. **Instructor** (for lessons in assigned batches).

### DELETE /api/lessons/{id}

Delete a lesson. **Instructor** (for lessons in assigned batches).

## Attendance Endpoints

### POST /api/attendance

Mark attendance for a student in a lesson. **Student** (own attendance only), **Instructor** (for assigned batches).

**Request Body:**

```json
{
  "lesson_id": 1,
  "student_id": 5,
  "status": "present"
}
```

**Status values:** `present`, `late`, `absent`

**Validation:**
- Student must be enrolled in the lesson's batch
- Attendance window must be open (or instructor overriding)
- Duplicate attendance is prevented (UNIQUE constraint)

### GET /api/attendance

Get attendance records. **Admin** (all), **Instructor** (assigned batches only).

**Query Parameters:**

- `lesson_id` (optional)
- `student_id` (optional)
- `date` (optional)
- `status` (optional) — filter by present/late/absent

### GET /api/attendance/my

Get the current student's attendance records. **Student only.**

## Notification Endpoints

### GET /api/notifications

List notifications for the current user.

**Query Parameters:**

- `is_read` (optional) — filter by read/unread
- `limit` (optional) — number of results (default 50)

### PATCH /api/notifications/{id}/read

Mark a single notification as read.

### PATCH /api/notifications/read-all

Mark all notifications as read.

## Report Endpoints

### GET /api/reports/daily

Daily attendance summary. **Admin and Instructor.**

**Query Parameters:**

- `date` (optional, defaults to today)
- `batch_id` (optional)

### GET /api/reports/student/{student_id}

Attendance history for a student. **Admin and the student themselves.**

### GET /api/reports/batch/{batch_id}

Attendance report for a batch. **Admin and assigned Instructor.**

### GET /api/reports/percentage

Attendance percentage per student. **Admin and Student (own data).**

## Material Endpoints

### POST /api/materials

Upload a material file for a lesson. **Instructor** (for assigned batches).

**Content-Type:** `multipart/form-data`

**Form Fields:**

- `lesson_id` — the lesson this material belongs to
- `file` — the file to upload

**Allowed extensions:** `pdf`, `doc`, `docx`, `ppt`, `pptx`, `xls`, `xlsx`, `jpg`, `png`

**Max file size:** 10MB

### GET /api/materials/{id}/download

Download a material file. **Student** (for lessons in assigned batches), **Instructor** (for own materials).

## CORS

The API sends the following CORS headers:

```
Access-Control-Allow-Origin: https://your-vercel-app.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

Development origin (`http://localhost:5173`) is also allowed.