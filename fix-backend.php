<?php
$file = '/home/vertexun/sis-backend/app/Http/Controllers/Api/Admin/SystemConfigController.php';
$content = file_get_contents($file);

// Fix theme key -> code
$content = str_replace("'key' => \$theme->key", "'code' => \$theme->code", $content);

// Fix theme name -> name_en
$content = str_replace("'name' => \$theme->name", "'name' => \$theme->name_en", $content);

// Fix menu where key -> where code
$content = str_replace("where('key'", "where('code'", $content);

file_put_contents($file, $content);
echo "Fixed!\n";
