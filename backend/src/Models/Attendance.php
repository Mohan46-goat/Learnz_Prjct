<?php

namespace App\Models;

class Attendance
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function findByLesson(int $lessonId): array
    {
        $stmt = $this->db->prepare('SELECT * FROM attendance WHERE lesson_id = :lesson_id ORDER BY student_id');
        $stmt->execute(['lesson_id' => $lessonId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function findByStudent(int $studentId): array
    {
        $stmt = $this->db->prepare('SELECT * FROM attendance WHERE student_id = :student_id ORDER BY marked_at DESC');
        $stmt->execute(['student_id' => $studentId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function findByLessonAndStudent(int $lessonId, int $studentId): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM attendance WHERE lesson_id = :lesson_id AND student_id = :student_id LIMIT 1');
        $stmt->execute(['lesson_id' => $lessonId, 'student_id' => $studentId]);
        $record = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $record ?: null;
    }

    public function mark(int $lessonId, int $studentId, string $status): bool
    {
        $stmt = $this->db->prepare(
            'INSERT INTO attendance (lesson_id, student_id, status) VALUES (:lesson_id, :student_id, :status)
             ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = CURRENT_TIMESTAMP'
        );
        return $stmt->execute([
            'lesson_id' => $lessonId,
            'student_id' => $studentId,
            'status' => $status,
        ]);
    }

    public function getDailySummary(string $date): array
    {
        $stmt = $this->db->prepare(
            'SELECT a.status, COUNT(*) as count FROM attendance a
             JOIN lessons l ON a.lesson_id = l.id
             WHERE l.lesson_date = :date GROUP BY a.status'
        );
        $stmt->execute(['date' => $date]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getStudentAttendancePercentage(int $studentId): float
    {
        $stmt = $this->db->prepare(
            'SELECT COUNT(*) as total, SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present FROM attendance WHERE student_id = :student_id'
        );
        $stmt->execute(['student_id' => $studentId]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);
        $total = (int) $row['total'];
        $present = (int) $row['present'];
        return $total > 0 ? round(($present / $total) * 100, 2) : 0;
    }

    public function getBatchAttendance(int $batchId, string $date): array
    {
        $stmt = $this->db->prepare(
            'SELECT a.*, u.name as student_name FROM attendance a
             JOIN lessons l ON a.lesson_id = l.id
             JOIN users u ON a.student_id = u.id
             WHERE l.batch_id = :batch_id AND l.lesson_date = :date ORDER BY u.name ASC'
        );
        $stmt->execute(['batch_id' => $batchId, 'date' => $date]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}