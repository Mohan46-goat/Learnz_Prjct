<?php

session_start();

require_once __DIR__ . '/../vendor/autoload.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

$corsOrigins = explode(',', getenv('CORS_ALLOWED_ORIGINS') ?: 'http://localhost:5173');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $corsOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$basePath = '/api';

if (strpos($requestUri, $basePath) !== 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Not found', 'errors' => []]);
    exit;
}

$route = substr($requestUri, strlen($basePath));
if ($route === '') {
    $route = '/';
}

require_once __DIR__ . '/../routes/api.php';