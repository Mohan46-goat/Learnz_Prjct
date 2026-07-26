<?php

namespace App\Controllers;

use App\Services\UserService;
use App\Helpers\ResponseHelper;

class UserController
{
    private UserService $userService;

    public function __construct()
    {
        $pdo = $this->getDB();
        $this->userService = new UserService($pdo);
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
            $users = $this->userService->getAllUsers();
            ResponseHelper::json(['users' => $users]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to retrieve users', 'errors' => []], 500);
        }
    }

    public function create(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            ResponseHelper::json(['success' => false, 'message' => 'Invalid JSON input', 'errors' => ['body' => 'Request body must be valid JSON']], 400);
            return;
        }

        try {
            $user = $this->userService->createUser($input);
            ResponseHelper::json(['success' => true, 'message' => 'User created successfully', 'data' => ['user' => $user]], 201);
        } catch (\InvalidArgumentException $e) {
            ResponseHelper::json(['success' => false, 'message' => $e->getMessage(), 'errors' => []], 400);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to create user', 'errors' => []], 500);
        }
    }

    public function show(int $id): void
    {
        try {
            $user = $this->userService->getUserById($id);
            if (!$user) {
                ResponseHelper::json(['success' => false, 'message' => 'User not found', 'errors' => []], 404);
                return;
            }
            ResponseHelper::json(['user' => $user]);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to retrieve user', 'errors' => []], 500);
        }
    }

    public function update(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            ResponseHelper::json(['success' => false, 'message' => 'Invalid JSON input', 'errors' => ['body' => 'Request body must be valid JSON']], 400);
            return;
        }

        try {
            $user = $this->userService->updateUser($id, $input);
            if (!$user) {
                ResponseHelper::json(['success' => false, 'message' => 'User not found', 'errors' => []], 404);
                return;
            }
            ResponseHelper::json(['success' => true, 'message' => 'User updated successfully', 'data' => ['user' => $user]]);
        } catch (\InvalidArgumentException $e) {
            ResponseHelper::json(['success' => false, 'message' => $e->getMessage(), 'errors' => []], 400);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to update user', 'errors' => []], 500);
        }
    }

    public function updateStatus(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['status'])) {
            ResponseHelper::json(['success' => false, 'message' => 'Status is required', 'errors' => ['status' => 'Status field is required']], 400);
            return;
        }

        try {
            $user = $this->userService->updateUserStatus($id, $input['status']);
            if (!$user) {
                ResponseHelper::json(['success' => false, 'message' => 'User not found', 'errors' => []], 404);
                return;
            }
            ResponseHelper::json(['success' => true, 'message' => 'User status updated successfully', 'data' => ['user' => $user]]);
        } catch (\InvalidArgumentException $e) {
            ResponseHelper::json(['success' => false, 'message' => $e->getMessage(), 'errors' => []], 400);
        } catch (\Exception $e) {
            ResponseHelper::json(['success' => false, 'message' => 'Failed to update user status', 'errors' => []], 500);
        }
    }
}