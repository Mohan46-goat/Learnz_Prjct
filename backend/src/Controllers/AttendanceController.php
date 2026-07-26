<?php

namespace App\Controllers;

use App\Services\AttendanceService;
use App\Helpers\ResponseHelper;

class AttendanceController
{
    private AttendanceService $attendanceService;

    public function __construct()
    {
        $pdo = $this->getDB();
        $this->attendanceService = new AttendanceService($pdo);
    }

    private function getDB(): \PDO
    {
        $config = require __DIR__ . '/../../config/database.php';
        return new \PDO(
            "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset={$config['charset']}",
            $config['username'],
            $config['password'],
            [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]
        );
    }

    public function mark(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = $_SESSION['user_id'] ?? null;
        $userRole = $_SESSION['role'] ?? null;

        if (!isset($input['lesson_id']) || !isset($input['student_id']) || !isset($input['status'])) {
            ResponseHelper::json(['success' => false, 'message' => 'Missing required fields', 'errors' => []], 400);
            return;
        }

        if ($userRole === 'student' && $input['student_id'] != $userId) {
            ResponseHelper::json(['success' => false, 'message' => 'Students can only mark their own attendance', 'errors' => []], 403);
            return;
        }

        try {
            $attendance = $this->attendanceService->markAttendance($input['lesson_id'], $input['student_id'], $input['status'], $userId);
            ResponseHelper::json(['success' => true, 'message' => 'Attendance marked successfully', 'data' => ['attendance' => $attendance]]);
        } catch (\InvalidArgumentException $e) {
            ResponseHelper::json(['success' => false, 'message' => $e->getMessage(), 'errors' => []], 400);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to mark attendance', 'errors' => []], 500);
        }
    }

    public function index(): void
    {
        try {
            $attendance = $this->attendanceService->getAllAttendance();
            ResponseHelper::json(['attendance' => $attendance]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to retrieve attendance', 'errors' => []], 500);
        }
    }

    public function myAttendance(): void
    {
        $userId = $_SESSION['user_id'] ?? null;

        try {
            $attendance = $this->attendanceService->getMyAttendance($userId);
            ResponseHelper::json(['attendance' => $attendance]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to retrieve attendance', 'errors' => []], 500);
        }
    }
}