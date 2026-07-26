<?php

namespace App\Controllers;

use App\Services\ReportService;
use App\Helpers\ResponseHelper;

class ReportController
{
    private ReportService $reportService;

    public function __construct()
    {
        $pdo = $this->getDB();
        $this->reportService = new ReportService($pdo);
    }

    private function getDB(): \PDO
    {
        $config = require BASE_PATH . '/config/database.php';
        return new \PDO(
            "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset={$config['charset']}",
            $config['username'],
            $config['password'],
            [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]
        );
    }

    public function daily(): void
    {
        $date = $_GET['date'] ?? date('Y-m-d');

        try {
            $report = $this->reportService->getDailyReport($date);
            ResponseHelper::json(['report' => $report]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to generate daily report', 'errors' => []], 500);
        }
    }

    public function student(int $studentId): void
    {
        try {
            $report = $this->reportService->getStudentReport($studentId);
            ResponseHelper::json(['report' => $report]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to generate student report', 'errors' => []], 500);
        }
    }

    public function batch(int $batchId): void
    {
        try {
            $report = $this->reportService->getBatchReport($batchId);
            ResponseHelper::json(['report' => $report]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to generate batch report', 'errors' => []], 500);
        }
    }

    public function percentage(): void
    {
        try {
            $data = $this->reportService->getAttendancePercentage();
            ResponseHelper::json(['data' => $data]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to generate attendance percentage report', 'errors' => []], 500);
        }
    }
}
