<?php
$file = '/home/vertexun/sis-backend/app/Http/Controllers/Api/Admin/SystemConfigController.php';
$content = file_get_contents($file);

// Fix order_column to order
$content = str_replace("orderBy('order_column')", "orderBy('order')", $content);
$content = str_replace("'order_column' =>", "'order' =>", $content);

file_put_contents($file, $content);
echo "Fixed order_column to order!\n";
