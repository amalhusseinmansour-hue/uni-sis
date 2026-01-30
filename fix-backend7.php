<?php
$file = '/home/vertexun/sis-backend/app/Models/Student.php';
$content = file_get_contents($file);

// Add full_name_en accessor after getFullNameArAttribute
$oldCode = "public function getFullNameArAttribute(): string
    {
        return \$this->name_ar ?? \$this->name_en;
    }";

$newCode = "public function getFullNameArAttribute(): string
    {
        return \$this->name_ar ?? \$this->name_en;
    }

    public function getFullNameEnAttribute(): string
    {
        return \$this->name_en ?? '';
    }";

$content = str_replace($oldCode, $newCode, $content);

file_put_contents($file, $content);
echo "Added full_name_en accessor to Student model!\n";
