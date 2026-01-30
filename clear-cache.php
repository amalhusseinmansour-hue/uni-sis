<?php
require '/home/sisvertexunivers/laravel-backend/vendor/autoload.php';
$app = require_once '/home/sisvertexunivers/laravel-backend/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Artisan;

echo "Clearing cache...\n";
Artisan::call('cache:clear');
echo Artisan::output();

echo "Clearing config cache...\n";
Artisan::call('config:clear');
echo Artisan::output();

echo "Clearing route cache...\n";
Artisan::call('route:clear');
echo Artisan::output();

echo "Clearing view cache...\n";
Artisan::call('view:clear');
echo Artisan::output();

echo "Clearing OPcache...\n";
if (function_exists('opcache_reset')) {
    opcache_reset();
    echo "OPcache cleared!\n";
} else {
    echo "OPcache not available.\n";
}

echo "Done!\n";
