<?php
try {
    $pdo = new PDO("mysql:host=127.0.0.1;port=3306", 'root', 'Mohan4664@');
    echo "SUCCESS\n";
    $stmt = $pdo->query("SELECT VERSION()");
    echo "MySQL version: " . $stmt->fetchColumn() . "\n";
} catch (PDOException $e) {
    echo "FAIL: " . $e->getMessage() . "\n";
}
