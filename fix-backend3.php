<?php
$file = '/home/vertexun/sis-backend/app/Http/Controllers/Api/Admin/SystemConfigController.php';
$content = file_get_contents($file);

// Fix getDashboardByRole - replace columns and gap with grid_settings
$content = str_replace(
    "'columns' => \$layout->columns,\n                'gap' => \$layout->gap,",
    "'grid_settings' => \$layout->grid_settings,",
    $content
);

// Also check Menu model - check if 'description' exists
// Looking at the Menu columns: id, code, name_en, name_ar, location, roles, is_active
// No 'description' or 'role' columns

$content = str_replace(
    "'description' => \$menu->description,\n                'role' => \$menu->role,",
    "'location' => \$menu->location,\n                'roles' => \$menu->roles,",
    $content
);

file_put_contents($file, $content);
echo "Fixed dashboard and menu attributes!\n";
