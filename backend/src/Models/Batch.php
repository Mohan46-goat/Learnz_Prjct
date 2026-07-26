<?php

namespace App\Models;

class Batch
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function findAll(): array
    {
        $stmt = $this->db->query('SELECT b.*, c.name as course_name FROM batches b JOIN courses c ON b.course_id = c.id ORDER BY b.created_at DESC');
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT b.*, c.name as course_name FROM batches b JOIN courses c ON b.course_id = c.id WHERE b.id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $batch = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $batch ?: null;
    }

    public function findByCourseId(int $courseId): array
    {
        $stmt = $this->db->prepare('SELECT * FROM batches WHERE course_id = :course_id ORDER BY start_date ASC');
        $stmt->execute(['course_id' => $courseId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare('INSERT INTO batches (course_id, name, start_date, end_date) VALUES (:course_id, :name, :start_date, :end_date)');
        $stmt->execute([
            'course_id' => $data['course_id'],
            'name' => $data['name'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = ['id' => $id];

        if (isset($data['name'])) {
            $fields[] = 'name = :name';
            $params['name'] = $data['name'];
        }
        if (isset($data['start_date'])) {
            $fields[] = 'start_date = :start_date';
            $params['start_date'] = $data['start_date'];
        }
        if (isset($data['end_date'])) {
            $fields[] = 'end_date = :end_date';
            $params['end_date'] = $data['end_date'];
        }
        if (isset($data['status'])) {
            $fields[] = 'status = :status';
            $params['status'] = $data['status'];
        }

        if (empty($fields)) {
            return false;
        }

        $fields[] = 'updated_at = CURRENT_TIMESTAMP';
        $sql = 'UPDATE batches SET ' . implode(', ', $fields) . ' WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM batches WHERE id = :id');
        return $stmt->execute(['id' => $id]);
    }

    public function getStudents(int $batchId): array
    {
        $stmt = $this->db->prepare(
            'SELECT u.id, u.name, u.email, u.role, bs.joined_at, bs.status as enrollment_status
             FROM users u
             JOIN batch_students bs ON u.id = bs.student_id
             WHERE bs.batch_id = :batch_id AND bs.status = "active"'
        );
        $stmt->execute(['batch_id' => $batchId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getInstructors(int $batchId): array
    {
        $stmt = $this->db->prepare(
            'SELECT u.id, u.name, u.email, u.role, bi.assigned_at
             FROM users u
             JOIN batch_instructors bi ON u.id = bi.instructor_id
             WHERE bi.batch_id = :batch_id'
        );
        $stmt->execute(['batch_id' => $batchId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function assignInstructor(int $batchId, int $instructorId): bool
    {
        $stmt = $this->db->prepare('INSERT IGNORE INTO batch_instructors (batch_id, instructor_id) VALUES (:batch_id, :instructor_id)');
        return $stmt->execute(['batch_id' => $batchId, 'instructor_id' => $instructorId]);
    }

    public function addStudent(int $batchId, int $studentId): bool
    {
        $stmt = $this->db->prepare('INSERT IGNORE INTO batch_students (batch_id, student_id) VALUES (:batch_id, :student_id)');
        return $stmt->execute(['batch_id' => $batchId, 'student_id' => $studentId]);
    }

    public function removeStudent(int $batchId, int $studentId): bool
    {
        $stmt = $this->db->prepare('DELETE FROM batch_students WHERE batch_id = :batch_id AND student_id = :student_id');
        return $stmt->execute(['batch_id' => $batchId, 'student_id' => $studentId]);
    }

    public function isInstructorAssigned(int $batchId, int $instructorId): bool
    {
        $stmt = $this->db->prepare('SELECT id FROM batch_instructors WHERE batch_id = :batch_id AND instructor_id = :instructor_id LIMIT 1');
        $stmt->execute(['batch_id' => $batchId, 'instructor_id' => $instructorId]);
        return $stmt->fetch() !== false;
    }

    public function isStudentEnrolled(int $batchId, int $studentId): bool
    {
        $stmt = $this->db->prepare('SELECT id FROM batch_students WHERE batch_id = :batch_id AND student_id = :student_id AND status = "active" LIMIT 1');
        $stmt->execute(['batch_id' => $batchId, 'student_id' => $studentId]);
        return $stmt->fetch() !== false;
    }
}