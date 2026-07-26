<?php

namespace App\Middleware;

class AuthMiddleware
{
    public function handle(callable $next): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Authentication required', 'errors' => []]);
            exit;
        }

        $next();
    }
}