<?php

namespace App\Models;

class Material
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM materials WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $material = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $material ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO materials (lesson_id, uploaded_by, original_file_name, stored_file_name, file_path, mime_type, file_size)
             VALUES (:lesson_id, :uploaded_by, :original_file_name, :stored_file_name, :file_path, :mime_type, :file_size)'
        );
        $stmt->execute([
            'lesson_id' => $data['lesson_id'],
            'uploaded_by' => $data['uploaded_by'],
            'original_file_name' => $data['original_file_name'],
            'stored_file_name' => $data['stored_file_name'],
            'file_path' => $data['file_path'],
            'mime_type' => $data['mime_type'],
            'file_size' => $data['file_size'],
        ]);
        return (int) $this->db->lastInsertId();
    }
}