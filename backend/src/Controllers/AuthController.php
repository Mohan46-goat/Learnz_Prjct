<?php

namespace App\Controllers;

use App\Services\AuthService;
use App\Helpers\ResponseHelper;

class AuthController
{
    private AuthService $authService;

    public function __construct()
    {
        $pdo = $this->getDB();
        $this->authService = new AuthService($pdo);
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

    public function login(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['email']) || !isset($input['password'])) {
            ResponseHelper::json(['success' => false, 'message' => 'Email and password are required', 'errors' => ['email' => 'Email is required', 'password' => 'Password is required']], 400);
            return;
        }

        try {
            $user = $this->authService->login($input['email'], $input['password']);
            ResponseHelper::json(['success' => true, 'message' => 'Login successful', 'data' => ['user' => $user]]);
        } catch (\InvalidArgumentException $e) {
            ResponseHelper::json(['success' => false, 'message' => $e->getMessage(), 'errors' => []], 401);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Login failed', 'errors' => []], 500);
        }
    }

    public function logout(): void
    {
        $this->authService->logout();
        ResponseHelper::json(['success' => true, 'message' => 'Logout successful', 'data' => []]);
    }

    public function me(): void
    {
        try {
            $user = $this->authService->getCurrentUser();
            if (!$user) {
                ResponseHelper::json(['success' => false, 'message' => 'Authentication required', 'errors' => []], 401);
                return;
            }
            ResponseHelper::json(['user' => $user]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to retrieve user', 'errors' => []], 500);
        }
    }
}