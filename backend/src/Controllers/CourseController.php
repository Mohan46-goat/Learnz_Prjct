<?php

namespace App\Controllers;

use App\Services\CourseService;
use App\Helpers\ResponseHelper;

class CourseController
{
    private CourseService $courseService;

    public function __construct()
    {
        $pdo = $this->getDB();
        $this->courseService = new CourseService($pdo);
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

    public function index(): void
    {
        try {
            $courses = $this->courseService->getAllCourses();
            ResponseHelper::json(['courses' => $courses]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to retrieve courses', 'errors' => []], 500);
        }
    }

    public function create(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['name'])) {
            ResponseHelper::json(['success' => false, 'message' => 'Course name is required', 'errors' => ['name' => 'Name is required']], 400);
            return;
        }

        try {
            $course = $this->courseService->createCourse($input);
            ResponseHelper::json(['success' => true, 'message' => 'Course created successfully', 'data' => ['course' => $course]], 201);
        } catch (\InvalidArgumentException $e) {
            ResponseHelper::json(['success' => false, 'message' => $e->getMessage(), 'errors' => []], 400);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to create course', 'errors' => []], 500);
        }
    }

    public function show(int $id): void
    {
        try {
            $course = $this->courseService->getCourseById($id);
            if (!$course) {
                ResponseHelper::json(['success' => false, 'message' => 'Course not found', 'errors' => []], 404);
                return;
            }
            ResponseHelper::json(['course' => $course]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to retrieve course', 'errors' => []], 500);
        }
    }

    public function update(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        try {
            $course = $this->courseService->updateCourse($id, $input);
            if (!$course) {
                ResponseHelper::json(['success' => false, 'message' => 'Course not found', 'errors' => []], 404);
                return;
            }
            ResponseHelper::json(['success' => true, 'message' => 'Course updated successfully', 'data' => ['course' => $course]]);
        } catch (\InvalidArgumentException $e) {
            ResponseHelper::json(['success' => false, 'message' => $e->getMessage(), 'errors' => []], 400);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to update course', 'errors' => []], 500);
        }
    }

    public function delete(int $id): void
    {
        try {
            $deleted = $this->courseService->deleteCourse($id);
            if (!$deleted) {
                ResponseHelper::json(['success' => false, 'message' => 'Course not found', 'errors' => []], 404);
                return;
            }
            ResponseHelper::json(['success' => true, 'message' => 'Course deleted successfully', 'data' => []]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to delete course', 'errors' => []], 500);
        }
    }
}