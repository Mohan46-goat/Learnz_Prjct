<?php

namespace App\Models;

class User
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $user ?: null;
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $user ?: null;
    }

    public function findAll(): array
    {
        $stmt = $this->db->query('SELECT id, name, email, role, status, created_at, updated_at FROM users ORDER BY created_at DESC');
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO users (name, email, password_hash, role, status) VALUES (:name, :email, :password_hash, :role, :status)'
        );
        $stmt->execute([
            'name' => $data['name'],
            'email' => $data['email'],
            'password_hash' => $data['password_hash'],
            'role' => $data['role'],
            'status' => $data['status'],
        ]);
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
        if (isset($data['email'])) {
            $fields[] = 'email = :email';
            $params['email'] = $data['email'];
        }
        if (isset($data['role'])) {
            $fields[] = 'role = :role';
            $params['role'] = $data['role'];
        }
        if (isset($data['status'])) {
            $fields[] = 'status = :status';
            $params['status'] = $data['status'];
        }

        if (empty($fields)) {
            return false;
        }

        $fields[] = 'updated_at = CURRENT_TIMESTAMP';
        $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function updateStatus(int $id, string $status): bool
    {
        $stmt = $this->db->prepare('UPDATE users SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
        return $stmt->execute(['status' => $status, 'id' => $id]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM users WHERE id = :id');
        return $stmt->execute(['id' => $id]);
    }

    public function existsByEmail(string $email, ?int $excludeId = null): bool
    {
        if ($excludeId) {
            $stmt = $this->db->prepare('SELECT id FROM users WHERE email = :email AND id != :id LIMIT 1');
            $stmt->execute(['email' => $email, 'id' => $excludeId]);
        } else {
            $stmt = $this->db->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
            $stmt->execute(['email' => $email]);
        }
        return $stmt->fetch() !== false;
    }

    public function getStudentsByBatch(int $batchId): array
    {
        $stmt = $this->db->prepare(
            'SELECT u.id, u.name, u.email, u.role, u.status
             FROM users u
             JOIN batch_students bs ON u.id = bs.student_id
             WHERE bs.batch_id = :batch_id AND bs.status = "active" AND u.status = "active"'
        );
        $stmt->execute(['batch_id' => $batchId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getInstructorsByBatch(int $batchId): array
    {
        $stmt = $this->db->prepare(
            'SELECT u.id, u.name, u.email, u.role, u.status
             FROM users u
             JOIN batch_instructors bi ON u.id = bi.instructor_id
             WHERE bi.batch_id = :batch_id AND u.status = "active"'
        );
        $stmt->execute(['batch_id' => $batchId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getBatchesByStudent(int $studentId): array
    {
        $stmt = $this->db->prepare(
            'SELECT b.* FROM batches b
             JOIN batch_students bs ON b.id = bs.batch_id
             WHERE bs.student_id = :student_id AND bs.status = "active" AND b.status = "active"'
        );
        $stmt->execute(['student_id' => $studentId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getBatchesByInstructor(int $instructorId): array
    {
        $stmt = $this->db->prepare(
            'SELECT b.* FROM batches b
             JOIN batch_instructors bi ON b.id = bi.batch_id
             WHERE bi.instructor_id = :instructor_id AND b.status = "active"'
        );
        $stmt->execute(['instructor_id' => $instructorId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}