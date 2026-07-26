<?php

namespace App\Controllers;

use App\Services\LessonService;
use App\Helpers\ResponseHelper;

class LessonController
{
    private LessonService $lessonService;

    public function __construct()
    {
        $pdo = $this->getDB();
        $this->lessonService = new LessonService($pdo);
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

    public function index(): void
    {
        try {
            $lessons = $this->lessonService->getAllLessons();
            ResponseHelper::json(['lessons' => $lessons]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to retrieve lessons', 'errors' => []], 500);
        }
    }

    public function create(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = $_SESSION['user_id'] ?? null;

        if (!isset($input['batch_id']) || !isset($input['title']) || !isset($input['lesson_date'])) {
            ResponseHelper::json(['success' => false, 'message' => 'Missing required fields', 'errors' => []], 400);
            return;
        }

        try {
            $input['instructor_id'] = $userId;
            $lesson = $this->lessonService->createLesson($input);
            ResponseHelper::json(['success' => true, 'message' => 'Lesson created successfully', 'data' => ['lesson' => $lesson]], 201);
        } catch (\InvalidArgumentException $e) {
            ResponseHelper::json(['success' => false, 'message' => $e->getMessage(), 'errors' => []], 400);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to create lesson', 'errors' => []], 500);
        }
    }

    public function show(int $id): void
    {
        try {
            $lesson = $this->lessonService->getLessonById($id);
            if (!$lesson) {
                ResponseHelper::json(['success' => false, 'message' => 'Lesson not found', 'errors' => []], 404);
                return;
            }
            ResponseHelper::json(['lesson' => $lesson]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to retrieve lesson', 'errors' => []], 500);
        }
    }

    public function update(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        try {
            $lesson = $this->lessonService->updateLesson($id, $input);
            if (!$lesson) {
                ResponseHelper::json(['success' => false, 'message' => 'Lesson not found', 'errors' => []], 404);
                return;
            }
            ResponseHelper::json(['success' => true, 'message' => 'Lesson updated successfully', 'data' => ['lesson' => $lesson]]);
        } catch (\InvalidArgumentException $e) {
            ResponseHelper::json(['success' => false, 'message' => $e->getMessage(), 'errors' => []], 400);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to update lesson', 'errors' => []], 500);
        }
    }

    public function delete(int $id): void
    {
        try {
            $deleted = $this->lessonService->deleteLesson($id);
            if (!$deleted) {
                ResponseHelper::json(['success' => false, 'message' => 'Lesson not found', 'errors' => []], 404);
                return;
            }
            ResponseHelper::json(['success' => true, 'message' => 'Lesson deleted successfully', 'data' => []]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to delete lesson', 'errors' => []], 500);
        }
    }
}
