<?php

namespace App\Models;

class Course
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function findAll(): array
    {
        $stmt = $this->db->query('SELECT * FROM courses ORDER BY created_at DESC');
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM courses WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $course = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $course ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare('INSERT INTO courses (name, description) VALUES (:name, :description)');
        $stmt->execute(['name' => $data['name'], 'description' => $data['description'] ?? '']);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = ['id' => $id];

        if (isset($data['name'])) {
            $fields[] = 'name = :name';
            $params['name'] = $data['name'];
        }
        if (isset($data['description'])) {
            $fields[] = 'description = :description';
            $params['description'] = $data['description'];
        }

        if (empty($fields)) {
            return false;
        }

        $fields[] = 'updated_at = CURRENT_TIMESTAMP';
        $sql = 'UPDATE courses SET ' . implode(', ', $fields) . ' WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM courses WHERE id = :id');
        return $stmt->execute(['id' => $id]);
    }
}