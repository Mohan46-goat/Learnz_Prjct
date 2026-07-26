<?php

namespace App\Middleware;

class RoleMiddleware
{
    private array $allowedRoles;

    public function __construct(array $allowedRoles)
    {
        $this->allowedRoles = $allowedRoles;
    }

    public function handle(callable $next): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $userRole = $_SESSION['role'] ?? null;

        if (!in_array($userRole, $this->allowedRoles, true)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'You are not authorized to perform this action', 'errors' => []]);
            exit;
        }

        $next();
    }
}