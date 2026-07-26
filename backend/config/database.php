<?php

$envFile = __DIR__ . '/../.env';
$dotenv = file_exists($envFile) ? parse_ini_file($envFile) : [];

return [
    'host' => $dotenv['DB_HOST'] ?? 'localhost',
    'port' => $dotenv['DB_PORT'] ?? '3306',
    'database' => $dotenv['DB_DATABASE'] ?? 'learnhub',
    'username' => $dotenv['DB_USERNAME'] ?? 'root',
    'password' => $dotenv['DB_PASSWORD'] ?? '',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
];