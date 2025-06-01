<?php
// Database Configuration
define('DB_TYPE', 'sqlite'); // sqlite atau mysql
define('DB_PATH', __DIR__ . '/database/prompt_generator.db'); // untuk SQLite dengan path absolut
define('DB_HOST', 'localhost'); // untuk MySQL
define('DB_NAME', 'prompt_generator'); // untuk MySQL
define('DB_USER', 'root'); // untuk MySQL
define('DB_PASS', ''); // untuk MySQL

// Application Configuration
define('APP_NAME', 'Generator Prompt Video AI');
define('APP_VERSION', '2.0.0');
define('APP_DEBUG', true);

// Pastikan direktori database ada
$dbDir = dirname(DB_PATH);
if (!is_dir($dbDir)) {
    mkdir($dbDir, 0755, true);
}

// Error Reporting
if (APP_DEBUG) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// CORS Headers untuk development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
?> 