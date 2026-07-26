<?php

if (!defined('BASE_PATH')) {
    throw new \RuntimeException('BASE_PATH must be defined before loading DatabaseHelper');
}

$config = require BASE_PATH . '/config/database.php';

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
