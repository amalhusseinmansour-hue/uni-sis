<?php
$file = '/home/vertexun/sis-backend/app/Http/Controllers/Api/Admin/SystemConfigController.php';
$content = file_get_contents($file);

// Fix all occurrences of 'key' => $variable->key to 'code' => $variable->code
$content = preg_replace("/'key' => \\$(\\w+)->key/", "'code' => \$\\1->code", $content);

// Fix all occurrences of 'name' => $variable->name to 'name' => $variable->name_en
$content = preg_replace("/'name' => \\$(\\w+)->name([^_])/", "'name' => \$\\1->name_en\\2", $content);

// Also fix the query where('key' to where('code'
$content = str_replace("where('key'", "where('code'", $content);

file_put_contents($file, $content);
echo "Fixed all occurrences!\n";
