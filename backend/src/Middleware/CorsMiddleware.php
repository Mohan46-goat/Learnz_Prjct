<?php

namespace App\Middleware;

class CorsMiddleware
{
    public function handle(callable $next): void
    {
        $allowedOrigins = explode(',', getenv('CORS_ALLOWED_ORIGINS') ?: 'http://localhost:5173');
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if (in_array($origin, $allowedOrigins, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization');
        }

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }

        $next();
    }
}