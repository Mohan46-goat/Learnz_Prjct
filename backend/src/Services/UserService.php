<?php

namespace App\Services;

class UserService
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function getAllUsers(): array
    {
        $userModel = new \App\Models\User($this->db);
        return $userModel->findAll();
    }

    public function getUserById(int $id): ?array
    {
        $userModel = new \App\Models\User($this->db);
        return $userModel->findById($id);
    }

    public function createUser(array $data): array
    {
        $validator = new \App\Validators\UserValidator();
        $errors = $validator->validateCreate($data);

        if (!empty($errors)) {
            throw new \InvalidArgumentException('Validation failed: ' . json_encode($errors));
        }

        if ($this->userExists($data['email'])) {
            throw new \InvalidArgumentException('Email already exists');
        }

        $userModel = new \App\Models\User($this->db);
        $userId = $userModel->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password_hash' => password_hash($data['password'], PASSWORD_DEFAULT),
            'role' => $data['role'],
            'status' => $data['status'],
        ]);

        $user = $userModel->findById($userId);
        return $user;
    }

    public function updateUser(int $id, array $data): ?array
    {
        $existingUser = $this->getUserById($id);
        if (!$existingUser) {
            return null;
        }

        if (isset($data['email']) && $data['email'] !== $existingUser['email']) {
            if ($this->userExists($data['email'], $id)) {
                throw new \InvalidArgumentException('Email already exists');
            }
        }

        if (isset($data['password'])) {
            $data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
            unset($data['password']);
        }

        $userModel = new \App\Models\User($this->db);
        $userModel->update($id, $data);

        return $userModel->findById($id);
    }

    public function updateUserStatus(int $id, string $status): ?array
    {
        $existingUser = $this->getUserById($id);
        if (!$existingUser) {
            return null;
        }

        $userModel = new \App\Models\User($this->db);
        $userModel->updateStatus($id, $status);

        return $userModel->findById($id);
    }

    private function userExists(string $email, ?int $excludeId = null): bool
    {
        $userModel = new \App\Models\User($this->db);
        return $userModel->existsByEmail($email, $excludeId);
    }
}