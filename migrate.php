<?php
$pdo = new PDO("mysql:host=127.0.0.1;port=3306", 'root', 'Mohan4664@', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
]);

$pdo->exec("DROP DATABASE IF EXISTS learnhub");
$pdo->exec("CREATE DATABASE learnhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$pdo->exec("USE learnhub");
echo "Database recreated.\n";

$files = glob(__DIR__ . '/database/migrations/*.sql');
sort($files);
foreach ($files as $file) {
    $pdo->exec(file_get_contents($file));
    echo "OK: " . basename($file) . "\n";
}

// Strip comment lines, then split on semicolons
$raw = file_get_contents(__DIR__ . '/database/seeders/development_seed.sql');
$lines = explode("\n", $raw);
$cleaned = [];
foreach ($lines as $line) {
    $trimmed = ltrim($line);
    if (strpos($trimmed, '--') === 0) continue;
    $cleaned[] = $line;
}
$sql = implode("\n", $cleaned);

$count = 0;
foreach (array_filter(array_map('trim', explode(';', $sql))) as $stmt) {
    if (empty($stmt)) continue;
    try {
        $pdo->exec($stmt);
        $count++;
    } catch (PDOException $e) {
        echo "SEED WARN: " . $e->getMessage() . "\n";
    }
}
echo "Seed done ($count statements).\n";

echo "\n--- Users ---\n";
foreach ($pdo->query("SELECT id, name, email, role FROM users ORDER BY id")->fetchAll(PDO::FETCH_ASSOC) as $u) {
    echo "  [" . $u['id'] . "] " . str_pad($u['role'], 10) . " " . $u['name'] . " <" . $u['email'] . ">\n";
}

echo "\n--- Batches ---\n";
foreach ($pdo->query("SELECT b.id, b.name, c.name as course FROM batches b JOIN courses c ON b.course_id=c.id")->fetchAll(PDO::FETCH_ASSOC) as $b) {
    echo "  [" . $b['id'] . "] " . $b['name'] . " (Course: " . $b['course'] . ")\n";
}

echo "\n--- Batch Instructors ---\n";
foreach ($pdo->query("SELECT bi.batch_id, u.name FROM batch_instructors bi JOIN users u ON bi.instructor_id=u.id")->fetchAll(PDO::FETCH_ASSOC) as $r) {
    echo "  Batch " . $r['batch_id'] . " -> " . $r['name'] . "\n";
}

echo "\n--- Batch Students ---\n";
foreach ($pdo->query("SELECT bs.batch_id, u.name FROM batch_students bs JOIN users u ON bs.student_id=u.id")->fetchAll(PDO::FETCH_ASSOC) as $r) {
    echo "  Batch " . $r['batch_id'] . " -> " . $r['name'] . "\n";
}

echo "\nDone!\n";
