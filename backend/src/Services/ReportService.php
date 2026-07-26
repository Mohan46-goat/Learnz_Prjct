<?php

namespace App\Services;

class ReportService
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function getDailyReport(string $date): array
    {
        $attendanceModel = new \App\Models\Attendance($this->db);
        $lessonModel = new \App\Models\Lesson($this->db);

        $lessons = $lessonModel->findByDate($date);
        $attendance = [];

        foreach ($lessons as $lesson) {
            $records = $attendanceModel->findByLesson($lesson['id']);
            foreach ($records as $record) {
                $attendance[] = array_merge($record, [
                    'lesson_title' => $lesson['title'],
                    'batch_name' => $lesson['batch_name'],
                ]);
            }
        }

        return [
            'date' => $date,
            'total_records' => count($attendance),
            'present' => count(array_filter($attendance, fn($a) => $a['status'] === 'present')),
            'late' => count(array_filter($attendance, fn($a) => $a['status'] === 'late')),
            'absent' => count(array_filter($attendance, fn($a) => $a['status'] === 'absent')),
            'attendance' => $attendance,
        ];
    }

    public function getStudentReport(int $studentId): array
    {
        $attendanceModel = new \App\Models\Attendance($this->db);
        $userModel = new \App\Models\User($this->db);

        $records = $attendanceModel->findByStudent($studentId);
        $student = $userModel->findById($studentId);
        $percentage = $attendanceModel->getStudentAttendancePercentage($studentId);

        return [
            'student' => $student,
            'total_records' => count($records),
            'present' => count(array_filter($records, fn($r) => $r['status'] === 'present')),
            'late' => count(array_filter($records, fn($r) => $r['status'] === 'late')),
            'absent' => count(array_filter($records, fn($r) => $r['status'] === 'absent')),
            'percentage' => $percentage,
            'attendance' => $records,
        ];
    }

    public function getBatchReport(int $batchId): array
    {
        $attendanceModel = new \App\Models\Attendance($this->db);
        $batchModel = new \App\Models\Batch($this->db);

        $batch = $batchModel->findById($batchId);
        $students = $batchModel->getStudents($batchId);

        $report = [];
        foreach ($students as $student) {
            $records = $attendanceModel->findByStudent($student['id']);
            $percentage = $attendanceModel->getStudentAttendancePercentage($student['id']);
            $report[] = [
                'student' => $student,
                'total' => count($records),
                'present' => count(array_filter($records, fn($r) => $r['status'] === 'present')),
                'late' => count(array_filter($records, fn($r) => $r['status'] === 'late')),
                'absent' => count(array_filter($records, fn($r) => $r['status'] === 'absent')),
                'percentage' => $percentage,
            ];
        }

        return [
            'batch' => $batch,
            'students' => $report,
        ];
    }

    public function getAttendancePercentage(): array
    {
        $userModel = new \App\Models\User($this->db);
        $attendanceModel = new \App\Models\Attendance($this->db);

        $students = $userModel->findAll();
        $result = [];

        foreach ($students as $student) {
            if ($student['role'] !== 'student') {
                continue;
            }
            $percentage = $attendanceModel->getStudentAttendancePercentage($student['id']);
            $result[] = [
                'student_id' => $student['id'],
                'student_name' => $student['name'],
                'percentage' => $percentage,
            ];
        }

        return $result;
    }
}