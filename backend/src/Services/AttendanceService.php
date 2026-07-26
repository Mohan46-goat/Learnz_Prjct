<?php

namespace App\Services;

class AttendanceService
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function getAllAttendance(): array
    {
        $attendanceModel = new \App\Models\Attendance($this->db);
        return $attendanceModel->findByLesson(0);
    }

    public function getMyAttendance(int $userId): array
    {
        $attendanceModel = new \App\Models\Attendance($this->db);
        return $attendanceModel->findByStudent($userId);
    }

    public function markAttendance(int $lessonId, int $studentId, string $status, ?int $markedBy = null): array
    {
        $lessonModel = new \App\Models\Lesson($this->db);
        $lesson = $lessonModel->findById($lessonId);

        if (!$lesson) {
            throw new \InvalidArgumentException('Lesson not found');
        }

        $batchModel = new \App\Models\Batch($this->db);
        if (!$batchModel->isStudentEnrolled($lesson['batch_id'], $studentId)) {
            throw new \InvalidArgumentException('Student is not enrolled in this batch');
        }

        if (!in_array($status, ['present', 'late', 'absent'], true)) {
            throw new \InvalidArgumentException('Invalid attendance status');
        }

        $attendanceModel = new \App\Models\Attendance($this->db);
        $attendanceModel->mark($lessonId, $studentId, $status);

        $record = $attendanceModel->findByLessonAndStudent($lessonId, $studentId);

        $userModel = new \App\Models\User($this->db);
        $student = $userModel->findById($studentId);

        if ($markedBy && $markedBy !== $studentId) {
            $notificationModel = new \App\Models\Notification($this->db);
            $notificationModel->create(
                $studentId,
                'Attendance Marked',
                "Your attendance for \"{$lesson['title']}\" was marked as " . strtoupper($status),
                'attendance',
                'lesson',
                $lessonId
            );
        }

        return $record;
    }
}