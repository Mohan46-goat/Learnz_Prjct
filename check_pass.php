<?php
$hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
$candidates = ['password', 'Admin@1234', 'secret', '1234', 'admin'];
foreach ($candidates as $p) {
    echo "$p => " . (password_verify($p, $hash) ? "MATCH" : "no") . "\n";
}
