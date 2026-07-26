<?php

namespace App\Middleware;

class RequestMiddleware
{
    public function handle(callable $next): void
    {
        $input = file_get_contents('php://input');

        if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'PATCH') {
            if ($input !== '' && substr_count($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') === 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Content-Type must be application/json', 'errors' => []]);
                exit;
            }
        }

        $next();
    }
}