<?php

// Cross-origin session cookies: must be set BEFORE session_start()
ini_set('session.cookie_samesite', 'None');
ini_set('session.cookie_secure', '1');
ini_set('session.cookie_httponly', '1');

session_start();

/*
 * Local development keeps the application files beside public/:
 *   backend/{config,routes,src,vendor}
 * The Hostinger upload keeps those files in public_html/src/ instead.
 * Detect the layout so the same code works in both places.
 */
$projectRoot = dirname(__DIR__);
$hostingerRoot = $projectRoot . '/src';
define('BASE_PATH', is_file($hostingerRoot . '/vendor/autoload.php') ? $hostingerRoot : $projectRoot);
define('APP_PATH', is_dir(BASE_PATH . '/Controllers') ? BASE_PATH : BASE_PATH . '/src');

require_once BASE_PATH . '/vendor/autoload.php';

// Composer's local mapping is App\\ => src/. Hostinger has the App files
// directly in src/, so this fallback supports that flattened upload layout too.
spl_autoload_register(function (string $class): void {
    if (!str_starts_with($class, 'App\\')) {
        return;
    }

    $file = APP_PATH . '/' . str_replace('\\', '/', substr($class, 4)) . '.php';
    if (is_file($file)) {
        require_once $file;
    }
});

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

set_exception_handler(function (\Throwable $exception): void {
    error_log($exception->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server configuration error', 'errors' => []]);
});

$envFile = BASE_PATH . '/.env';
$dotenv = file_exists($envFile) ? parse_ini_file($envFile) : [];

$corsOrigins = array_filter(array_map('trim', explode(',', $dotenv['CORS_ALLOWED_ORIGINS'] ?? 'http://localhost:5173')));
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

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$basePath = '/api';

if (strpos($requestUri, $basePath) !== 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Not found', 'errors' => []]);
    exit;
}

require_once BASE_PATH . '/routes/api.php';
