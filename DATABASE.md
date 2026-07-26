# Database — LearnHub

## Database Engine

MySQL 8.0

## Character Set and Collation

```sql
utf8mb4
utf8mb4_unicode_ci
```

`utf8mb4` supports full Unicode including emojis. `utf8mb4_unicode_ci` provides correct sorting and comparison for multiple languages.

## Connection

The application connects to MySQL via PDO. Connection details are stored in environment variables, never in source code.

## Schema Overview

### Tables

| Table              | Purpose                                      | Rows (expected) |
| ------------------ | -------------------------------------------- | --------------- |
| `users`            | All users (admin, instructor, student)       | 10–100          |
| `courses`          | Learning courses                             | 3–20            |
| `batches`          | Course instances with start/end dates        | 5–50            |
| `batch_instructors`| Maps instructors to batches (many-to-many)   | 5–50            |
| `batch_students`   | Maps students to batches (many-to-many)      | 10–500          |
| `lessons`          | Daily lesson plans within a batch            | 20–200          |
| `materials`        | Files uploaded for lessons                   | 10–100          |
| `attendance`       | Daily attendance records per student/lesson  | 100–5000        |
| `notifications`    | In-app notifications for users               | 50–500          |
| `audit_logs`       | Audit trail for sensitive operations         | 100–1000        |

### Relationships

```
users (1) ──── (M) batch_instructors (M) ──── (1) batches (M) ──── (1) courses
users (1) ──── (M) batch_students     (M) ──── (1) batches
batches (1) ──── (M) lessons
lessons (1) ──── (M) materials
lessons (1) ──── (M) attendance
users (1) ──── (M) notifications
users (1) ──── (M) audit_logs
```

### Key Constraints

- `users.email` is UNIQUE
- `attendance(lesson_id, student_id)` is UNIQUE — prevents duplicate attendance
- Foreign keys enforce referential integrity where applicable
- `batch_students.status` controls active/inactive enrollment

## Normalization

The schema is normalized to Third Normal Form (3NF):

1. **1NF**: All columns contain atomic values, no repeating groups
2. **2NF**: All non-key columns depend on the full primary key
3. **3NF**: No transitive dependencies (non-key columns don't depend on other non-key columns)

The many-to-many relationships (users↔batches) are resolved with junction tables (`batch_instructors`, `batch_students`).

## Indexes

| Table          | Column(s)           | Purpose                          |
| -------------- | ------------------- | -------------------------------- |
| `users`        | `email`             | Fast login lookup                |
| `users`        | `role`              | Filter users by role             |
| `batches`      | `course_id`         | Find batches for a course        |
| `lessons`      | `batch_id`          | Find lessons for a batch         |
| `lessons`      | `lesson_date`       | Find today's lessons             |
| `attendance`   | `lesson_id`         | Find attendance for a lesson     |
| `attendance`   | `student_id`        | Find attendance for a student    |
| `attendance`   | `lesson_id, student_id` | Unique constraint, also an index |
| `notifications`| `user_id, is_read`  | Fast unread count query          |

## SQL Modes

MySQL 8.0 strict mode is enabled by default. This ensures:
- Data type validation at the database level
- No implicit truncation or zero-filling
- Strict error handling for invalid data