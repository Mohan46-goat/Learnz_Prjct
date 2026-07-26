<?php

$dotenv = parse_ini_file(__DIR__ . '/../.env');

return [
    'host' => $dotenv['DB_HOST'] ?? 'localhost',
    'port' => $dotenv['DB_PORT'] ?? '3306',
    'database' => $dotenv['DB_DATABASE'] ?? 'learnhub',
    'username' => $dotenv['DB_USERNAME'] ?? 'root',
    'password' => $dotenv['DB_PASSWORD'] ?? '',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
];