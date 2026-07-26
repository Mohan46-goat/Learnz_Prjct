<?php

require_once __DIR__ . '/../vendor/autoload.php';

$config = require __DIR__ . '/../config/database.php';

try {
    $pdo = new \PDO(
        "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset={$config['charset']}",
        $config['username'],
        $config['password'],
        [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]
    );
    return $pdo;
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed', 'errors' => []]);
    exit;
}