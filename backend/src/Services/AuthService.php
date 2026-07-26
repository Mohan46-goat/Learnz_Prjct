<?php

namespace App\Services;

class AuthService
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    public function login(string $email, string $password): array
    {
        $userModel = new \App\Models\User($this->db);
        $user = $userModel->findByEmail($email);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            throw new \InvalidArgumentException('Invalid email or password');
        }

        if ($user['status'] !== 'active') {
            throw new \InvalidArgumentException('Account is inactive');
        }

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        session_regenerate_id(true);

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['user_name'] = $user['name'];

        unset($user['password_hash']);

        return $user;
    }

    public function logout(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }

        session_destroy();
    }

    public function getCurrentUser(): ?array
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {
            return null;
        }

        $userModel = new \App\Models\User($this->db);
        return $userModel->findById($userId);
    }
}