<?php

namespace App\Controllers;

use App\Services\BatchService;
use App\Helpers\ResponseHelper;

class BatchController
{
    private BatchService $batchService;

    public function __construct()
    {
        $pdo = $this->getDB();
        $this->batchService = new BatchService($pdo);
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

    public function myBatches(): void
    {
        $userId = $_SESSION['user_id'] ?? null;
        $role = $_SESSION['role'] ?? null;
        try {
            $batches = $this->batchService->getMyBatches($userId, $role);
            ResponseHelper::json(['batches' => $batches]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to retrieve batches', 'errors' => []], 500);
        }
    }

    public function index(): void
    {
        try {
            $batches = $this->batchService->getAllBatches();
            ResponseHelper::json(['batches' => $batches]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to retrieve batches', 'errors' => []], 500);
        }
    }

    public function create(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['course_id']) || !isset($input['name']) || !isset($input['start_date']) || !isset($input['end_date'])) {
            ResponseHelper::json(['success' => false, 'message' => 'Missing required fields', 'errors' => []], 400);
            return;
        }

        try {
            $batch = $this->batchService->createBatch($input);
            ResponseHelper::json(['success' => true, 'message' => 'Batch created successfully', 'data' => ['batch' => $batch]], 201);
        } catch (\InvalidArgumentException $e) {
            ResponseHelper::json(['success' => false, 'message' => $e->getMessage(), 'errors' => []], 400);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to create batch', 'errors' => []], 500);
        }
    }

    public function show(int $id): void
    {
        try {
            $batch = $this->batchService->getBatchById($id);
            if (!$batch) {
                ResponseHelper::json(['success' => false, 'message' => 'Batch not found', 'errors' => []], 404);
                return;
            }
            $batch['instructors'] = $this->batchService->getBatchInstructors($id);
            $batch['students'] = $this->batchService->getBatchStudents($id);
            ResponseHelper::json(['batch' => $batch]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to retrieve batch', 'errors' => []], 500);
        }
    }

    public function update(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        try {
            $batch = $this->batchService->updateBatch($id, $input);
            if (!$batch) {
                ResponseHelper::json(['success' => false, 'message' => 'Batch not found', 'errors' => []], 404);
                return;
            }
            ResponseHelper::json(['success' => true, 'message' => 'Batch updated successfully', 'data' => ['batch' => $batch]]);
        } catch (\InvalidArgumentException $e) {
            ResponseHelper::json(['success' => false, 'message' => $e->getMessage(), 'errors' => []], 400);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to update batch', 'errors' => []], 500);
        }
    }

    public function getStudents(int $id): void
    {
        try {
            $students = $this->batchService->getBatchStudents($id);
            ResponseHelper::json(['students' => $students]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to retrieve students', 'errors' => []], 500);
        }
    }

    public function assignInstructor(int $batchId): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['instructor_id'])) {
            ResponseHelper::json(['success' => false, 'message' => 'Instructor ID is required', 'errors' => []], 400);
            return;
        }

        try {
            $this->batchService->assignInstructor($batchId, $input['instructor_id']);
            ResponseHelper::json(['success' => true, 'message' => 'Instructor assigned successfully', 'data' => []]);
        } catch (\InvalidArgumentException $e) {
            ResponseHelper::json(['success' => false, 'message' => $e->getMessage(), 'errors' => []], 400);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to assign instructor', 'errors' => []], 500);
        }
    }

    public function addStudent(int $batchId): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['student_id'])) {
            ResponseHelper::json(['success' => false, 'message' => 'Student ID is required', 'errors' => []], 400);
            return;
        }

        try {
            $this->batchService->addStudent($batchId, $input['student_id']);
            ResponseHelper::json(['success' => true, 'message' => 'Student added successfully', 'data' => []]);
        } catch (\InvalidArgumentException $e) {
            ResponseHelper::json(['success' => false, 'message' => $e->getMessage(), 'errors' => []], 400);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to add student', 'errors' => []], 500);
        }
    }

    public function removeStudent(int $batchId, int $studentId): void
    {
        try {
            $this->batchService->removeStudent($batchId, $studentId);
            ResponseHelper::json(['success' => true, 'message' => 'Student removed successfully', 'data' => []]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to remove student', 'errors' => []], 500);
        }
    }
}