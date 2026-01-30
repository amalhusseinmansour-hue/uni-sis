<?php
$file = '/home/vertexun/sis-backend/app/Http/Middleware/CheckStudentAccess.php';
$content = file_get_contents($file);

// Fix the comparison - handle both object and integer
$oldCode = 'if ($studentId) {
                $student = $user->student;

                if (!$student || $student->id != $studentId) {';

$newCode = 'if ($studentId) {
                $student = $user->student;

                // Handle both object (Route Model Binding) and integer
                $targetId = is_object($studentId) ? $studentId->id : (int)$studentId;

                if (!$student || $student->id != $targetId) {';

$content = str_replace($oldCode, $newCode, $content);

file_put_contents($file, $content);
echo "Fixed CheckStudentAccess middleware!\n";
