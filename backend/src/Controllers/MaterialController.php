<?php

namespace App\Controllers;

use App\Services\MaterialService;
use App\Helpers\ResponseHelper;

class MaterialController
{
    private MaterialService $materialService;

    public function __construct()
    {
        $pdo = $this->getDB();
        $this->materialService = new MaterialService($pdo);
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

    public function upload(): void
    {
        if (!isset($_FILES['file'])) {
            ResponseHelper::json(['success' => false, 'message' => 'No file uploaded', 'errors' => ['file' => 'File is required']], 400);
            return;
        }

        $lessonId = $_POST['lesson_id'] ?? null;
        if (!$lessonId) {
            ResponseHelper::json(['success' => false, 'message' => 'Lesson ID is required', 'errors' => ['lesson_id' => 'Lesson ID is required']], 400);
            return;
        }

        $userId = $_SESSION['user_id'] ?? null;

        try {
            $material = $this->materialService->uploadMaterial($_FILES['file'], $lessonId, $userId);
            ResponseHelper::json(['success' => true, 'message' => 'Material uploaded successfully', 'data' => ['material' => $material]], 201);
        } catch (\InvalidArgumentException $e) {
            ResponseHelper::json(['success' => false, 'message' => $e->getMessage(), 'errors' => []], 400);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to upload material', 'errors' => []], 500);
        }
    }

    public function download(int $id): void
    {
        try {
            $material = $this->materialService->getMaterialById($id);
            if (!$material) {
                ResponseHelper::json(['success' => false, 'message' => 'Material not found', 'errors' => []], 404);
                return;
            }

            $filePath = __DIR__ . '/../../storage/uploads/' . $material['stored_file_name'];

            if (!file_exists($filePath)) {
                ResponseHelper::json(['success' => false, 'message' => 'File not found on disk', 'errors' => []], 404);
                return;
            }

            header('Content-Type: ' . $material['mime_type']);
            header('Content-Disposition: attachment; filename="' . $material['original_file_name'] . '"');
            header('Content-Length: ' . $material['file_size']);
            readfile($filePath);
            exit;
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to download material', 'errors' => []], 500);
        }
    }
}