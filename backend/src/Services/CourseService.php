<?php

namespace App\Services;

class CourseService
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function getAllCourses(): array
    {
        $courseModel = new \App\Models\Course($this->db);
        return $courseModel->findAll();
    }

    public function getCourseById(int $id): ?array
    {
        $courseModel = new \App\Models\Course($this->db);
        return $courseModel->findById($id);
    }

    public function createCourse(array $data): array
    {
        $courseModel = new \App\Models\Course($this->db);
        $courseId = $courseModel->create($data);
        return $courseModel->findById($courseId);
    }

    public function updateCourse(int $id, array $data): ?array
    {
        $courseModel = new \App\Models\Course($this->db);
        $updated = $courseModel->update($id, $data);
        if (!$updated) {
            return null;
        }
        return $courseModel->findById($id);
    }

    public function deleteCourse(int $id): bool
    {
        $courseModel = new \App\Models\Course($this->db);
        return $courseModel->delete($id);
    }
}