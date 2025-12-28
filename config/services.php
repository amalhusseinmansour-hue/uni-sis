<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | WordPress Webhook Integration
    |--------------------------------------------------------------------------
    |
    | API key for WordPress admission form webhook integration.
    | This key must be sent in the X-API-Key header or Authorization header.
    |
    */

    'webhook' => [
        'api_key' => env('WEBHOOK_API_KEY'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Moodle LMS Integration
    |--------------------------------------------------------------------------
    |
    | Configuration for Moodle LMS integration.
    | Enable web services in Moodle and create a token for external service.
    |
    */

    'moodle' => [
        'url' => env('MOODLE_URL'),                           // e.g., https://lms.university.edu
        'token' => env('MOODLE_TOKEN'),                       // Web service token
        'webhook_secret' => env('MOODLE_WEBHOOK_SECRET'),     // Secret for validating incoming webhooks
        'sync_enabled' => env('MOODLE_SYNC_ENABLED', false),  // Enable/disable sync
    ],

];
