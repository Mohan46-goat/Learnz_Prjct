<?php

namespace App\Services;

class BatchService
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function getAllBatches(): array
    {
        $batchModel = new \App\Models\Batch($this->db);
        return $batchModel->findAll();
    }

    public function getBatchById(int $id): ?array
    {
        $batchModel = new \App\Models\Batch($this->db);
        return $batchModel->findById($id);
    }

    public function createBatch(array $data): array
    {
        $batchModel = new \App\Models\Batch($this->db);
        $batchId = $batchModel->create($data);
        return $batchModel->findById($batchId);
    }

    public function updateBatch(int $id, array $data): ?array
    {
        $batchModel = new \App\Models\Batch($this->db);
        $updated = $batchModel->update($id, $data);
        if (!$updated) {
            return null;
        }
        return $batchModel->findById($id);
    }

    public function assignInstructor(int $batchId, int $instructorId): void
    {
        $batchModel = new \App\Models\Batch($this->db);
        $userModel = new \App\Models\User($this->db);

        $instructor = $userModel->findById($instructorId);
        if (!$instructor) {
            throw new \InvalidArgumentException('User not found');
        }

        if ($instructor['role'] !== 'instructor') {
            throw new \InvalidArgumentException('User is not an instructor');
        }

        $batchModel->assignInstructor($batchId, $instructorId);
    }

    public function addStudent(int $batchId, int $studentId): void
    {
        $batchModel = new \App\Models\Batch($this->db);
        $userModel = new \App\Models\User($this->db);

        $student = $userModel->findById($studentId);
        if (!$student) {
            throw new \InvalidArgumentException('User not found');
        }

        if ($student['role'] !== 'student') {
            throw new \InvalidArgumentException('User is not a student');
        }

        $batchModel->addStudent($batchId, $studentId);
    }

    public function removeStudent(int $batchId, int $studentId): void
    {
        $batchModel = new \App\Models\Batch($this->db);
        $batchModel->removeStudent($batchId, $studentId);
    }
}