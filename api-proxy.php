<?php
// API Proxy to bypass CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$backend_url = 'https://sistest.vertexuniversity.edu.eu/api';

// Get the requested path
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/api-proxy.php', '', $path);
$path = str_replace('/api/', '/', $path);

// If path is empty, get it from query string
if (empty($path) || $path === '/') {
    $path = isset($_GET['path']) ? '/' . $_GET['path'] : '';
}

$url = $backend_url . $path;

// Get query string
$query = $_SERVER['QUERY_STRING'];
if (!empty($query)) {
    // Remove 'path' parameter from query string
    parse_str($query, $params);
    unset($params['path']);
    $query = http_build_query($params);
    if (!empty($query)) {
        $url .= '?' . $query;
    }
}

// Initialize cURL
$ch = curl_init();

// Set URL
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

// Forward method
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);

// Forward headers
$headers = [];
foreach (getallheaders() as $name => $value) {
    if (strtolower($name) !== 'host' && strtolower($name) !== 'content-length') {
        $headers[] = "$name: $value";
    }
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Forward body for POST/PUT/PATCH
if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'PATCH'])) {
    $body = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

// Execute request
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

curl_close($ch);

// Set response headers
http_response_code($http_code);
if ($content_type) {
    header('Content-Type: ' . $content_type);
}

// Output response
echo $response;
