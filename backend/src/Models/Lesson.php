<?php

namespace App\Models;

class Lesson
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function findAll(): array
    {
        $stmt = $this->db->query('SELECT l.*, b.name as batch_name, u.name as instructor_name FROM lessons l JOIN batches b ON l.batch_id = b.id JOIN users u ON l.instructor_id = u.id ORDER BY l.lesson_date DESC, l.start_time ASC');
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function findByBatch(int $batchId): array
    {
        $stmt = $this->db->prepare('SELECT l.*, u.name as instructor_name FROM lessons l JOIN users u ON l.instructor_id = u.id WHERE l.batch_id = :batch_id ORDER BY l.lesson_date ASC');
        $stmt->execute(['batch_id' => $batchId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT l.*, b.name as batch_name, b.course_id FROM lessons l JOIN batches b ON l.batch_id = b.id WHERE l.id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $lesson = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $lesson ?: null;
    }

    public function findByDate(string $date): array
    {
        $stmt = $this->db->prepare('SELECT l.*, b.name as batch_name, u.name as instructor_name FROM lessons l JOIN batches b ON l.batch_id = b.id JOIN users u ON l.instructor_id = u.id WHERE l.lesson_date = :date ORDER BY l.start_time ASC');
        $stmt->execute(['date' => $date]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO lessons (batch_id, instructor_id, title, description, lesson_date, start_time, end_time, attendance_start_time, attendance_end_time)
             VALUES (:batch_id, :instructor_id, :title, :description, :lesson_date, :start_time, :end_time, :attendance_start_time, :attendance_end_time)'
        );
        $stmt->execute([
            'batch_id' => $data['batch_id'],
            'instructor_id' => $data['instructor_id'],
            'title' => $data['title'],
            'description' => $data['description'] ?? '',
            'lesson_date' => $data['lesson_date'],
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
            'attendance_start_time' => $data['attendance_start_time'],
            'attendance_end_time' => $data['attendance_end_time'],
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = ['id' => $id];

        $allowedFields = ['title', 'description', 'lesson_date', 'start_time', 'end_time', 'attendance_start_time', 'attendance_end_time', 'status'];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = :$field";
                $params[$field] = $data[$field];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $fields[] = 'updated_at = CURRENT_TIMESTAMP';
        $sql = 'UPDATE lessons SET ' . implode(', ', $fields) . ' WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM lessons WHERE id = :id');
        return $stmt->execute(['id' => $id]);
    }

    public function getAttendance(int $lessonId): array
    {
        $stmt = $this->db->prepare(
            'SELECT a.*, u.name as student_name FROM attendance a
             JOIN users u ON a.student_id = u.id
             WHERE a.lesson_id = :lesson_id ORDER BY u.name ASC'
        );
        $stmt->execute(['lesson_id' => $lessonId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}