<?php
$file = '/home/vertexun/sis-backend/app/Http/Controllers/Api/Admin/SystemConfigController.php';
$content = file_get_contents($file);

// Fix $item->order_column to $item->order
$content = str_replace('$item->order_column', '$item->order', $content);

file_put_contents($file, $content);
echo "Fixed item->order_column to item->order!\n";
