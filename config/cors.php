<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    /*
    |--------------------------------------------------------------------------
    | Allowed Origins
    |--------------------------------------------------------------------------
    |
    | Configure allowed origins based on environment.
    | In production, set specific domains in CORS_ALLOWED_ORIGINS env variable.
    | Example: CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
    |
    */
    'allowed_origins' => env('APP_ENV') === 'production'
        ? explode(',', env('CORS_ALLOWED_ORIGINS', 'https://localhost'))
        : ['http://localhost:3000', 'http://localhost:3003', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:3003', 'http://127.0.0.1:5173'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Accept',
        'Authorization',
        'Content-Type',
        'X-Requested-With',
        'X-CSRF-TOKEN',
        'X-XSRF-TOKEN',
    ],

    'exposed_headers' => [
        'X-Pagination-Total',
        'X-Pagination-Current-Page',
        'X-Pagination-Per-Page',
    ],

    'max_age' => 86400, // 24 hours

    'supports_credentials' => false,

];
