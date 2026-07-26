<?php
// Generate hashes for seed passwords
$passwords = [
    'Admin@123'      => 'admin',
    'Teacher@123'    => 'instructor',
    'Student@123'    => 'student',
];
foreach ($passwords as $pass => $role) {
    echo $role . ': ' . password_hash($pass, PASSWORD_DEFAULT) . "\n";
}
