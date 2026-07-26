<?php
$dirs = [
    __DIR__ . '/backend/public',
    __DIR__ . '/backend/src',
    __DIR__ . '/backend/routes',
    __DIR__ . '/backend/config',
];
$errors = 0;
foreach ($dirs as $dir) {
    $iter = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
    foreach ($iter as $file) {
        if ($file->getExtension() !== 'php') continue;
        $output = shell_exec('php -l "' . $file->getPathname() . '" 2>&1');
        if (strpos($output, 'No syntax errors') === false) {
            echo "SYNTAX ERROR: " . $file->getPathname() . "\n$output\n";
            $errors++;
        }
    }
}
echo $errors === 0 ? "All PHP files OK.\n" : "$errors file(s) have errors.\n";
