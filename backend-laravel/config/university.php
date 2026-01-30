<?php

return [
    /*
    |--------------------------------------------------------------------------
    | University Information
    |--------------------------------------------------------------------------
    */

    'name_en' => env('UNIVERSITY_NAME_EN', 'Vertex University'),
    'name_ar' => env('UNIVERSITY_NAME_AR', 'جامعة فيرتكس'),

    'email_domain' => env('UNIVERSITY_EMAIL_DOMAIN', 'vertexuniversity.edu.eu'),

    'website' => env('UNIVERSITY_WEBSITE', 'https://vertexuniversity.edu.eu'),

    'logo_path' => env('UNIVERSITY_LOGO', '/images/logo.png'),

    /*
    |--------------------------------------------------------------------------
    | Student ID Configuration
    |--------------------------------------------------------------------------
    */

    'student_id_prefix' => env('STUDENT_ID_PREFIX', 'VU'),
    'student_id_year_format' => env('STUDENT_ID_YEAR_FORMAT', 'y'), // y = 24, Y = 2024

    /*
    |--------------------------------------------------------------------------
    | Admission Settings
    |--------------------------------------------------------------------------
    */

    'admission' => [
        'registration_fee' => env('ADMISSION_REGISTRATION_FEE', 500),
        'currency' => env('ADMISSION_CURRENCY', 'USD'),
        'currency_symbol' => env('ADMISSION_CURRENCY_SYMBOL', '$'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Contact Information
    |--------------------------------------------------------------------------
    */

    'contact' => [
        'email' => env('UNIVERSITY_CONTACT_EMAIL', 'info@vertexuniversity.edu.eu'),
        'admission_email' => env('UNIVERSITY_ADMISSION_EMAIL', 'admission@vertexuniversity.edu.eu'),
        'phone' => env('UNIVERSITY_PHONE', '+39 123 456 789'),
        'address_en' => env('UNIVERSITY_ADDRESS_EN', 'Rome, Italy'),
        'address_ar' => env('UNIVERSITY_ADDRESS_AR', 'روما، إيطاليا'),
    ],

    /*
    |--------------------------------------------------------------------------
    | System URLs
    |--------------------------------------------------------------------------
    */

    'urls' => [
        'sis_login' => env('SIS_LOGIN_URL', 'https://sis.vertexuniversity.edu.eu'),
        'student_portal' => env('STUDENT_PORTAL_URL', 'https://portal.vertexuniversity.edu.eu'),
    ],
];
