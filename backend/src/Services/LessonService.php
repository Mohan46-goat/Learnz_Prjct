<?php

namespace App\Services;

class LessonService
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function getAllLessons(): array
    {
        $lessonModel = new \App\Models\Lesson($this->db);
        return $lessonModel->findAll();
    }

    public function getLessonById(int $id): ?array
    {
        $lessonModel = new \App\Models\Lesson($this->db);
        return $lessonModel->findById($id);
    }

    public function createLesson(array $data): array
    {
        $lessonModel = new \App\Models\Lesson($this->db);
        $lessonId = $lessonModel->create($data);
        return $lessonModel->findById($lessonId);
    }

    public function updateLesson(int $id, array $data): ?array
    {
        $lessonModel = new \App\Models\Lesson($this->db);
        $updated = $lessonModel->update($id, $data);
        if (!$updated) {
            return null;
        }
        return $lessonModel->findById($id);
    }

    public function deleteLesson(int $id): bool
    {
        $lessonModel = new \App\Models\Lesson($this->db);
        return $lessonModel->delete($id);
    }
}