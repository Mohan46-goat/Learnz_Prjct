<?php

// BASE_PATH is defined in public/index.php as public_html/src/
// Fallback for local dev where .env is one level above config/
if (defined('BASE_PATH')) {
    $envFile = BASE_PATH . '/.env';
} else {
    $envFile = __DIR__ . '/../.env';
}

$dotenv = file_exists($envFile) ? parse_ini_file($envFile) : [];

return [
    'host'      => $dotenv['DB_HOST']     ?? 'localhost',
    'port'      => $dotenv['DB_PORT']     ?? '3306',
    'database'  => $dotenv['DB_DATABASE'] ?? 'learnhub',
    'username'  => $dotenv['DB_USERNAME'] ?? 'root',
    'password'  => $dotenv['DB_PASSWORD'] ?? '',
    'charset'   => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
];
