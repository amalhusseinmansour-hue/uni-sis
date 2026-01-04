<?php

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Setting;

$settings = [
    // University Settings
    ['group' => 'university', 'key' => 'university_name_en', 'value' => 'Vertex University', 'type' => 'text', 'label_en' => 'University Name (English)', 'label_ar' => 'اسم الجامعة (إنجليزي)', 'is_public' => true],
    ['group' => 'university', 'key' => 'university_name_ar', 'value' => 'جامعة فيرتكس', 'type' => 'text', 'label_en' => 'University Name (Arabic)', 'label_ar' => 'اسم الجامعة (عربي)', 'is_public' => true],
    ['group' => 'university', 'key' => 'university_logo', 'value' => null, 'type' => 'file', 'label_en' => 'University Logo', 'label_ar' => 'شعار الجامعة', 'is_public' => true],
    ['group' => 'university', 'key' => 'university_email', 'value' => 'info@vertexuniversity.edu.eu', 'type' => 'text', 'label_en' => 'University Email', 'label_ar' => 'البريد الإلكتروني', 'is_public' => true],
    ['group' => 'university', 'key' => 'university_phone', 'value' => '+1234567890', 'type' => 'text', 'label_en' => 'University Phone', 'label_ar' => 'رقم الهاتف', 'is_public' => true],
    ['group' => 'university', 'key' => 'university_website', 'value' => 'https://vertexuniversity.edu.eu', 'type' => 'text', 'label_en' => 'Website', 'label_ar' => 'الموقع الإلكتروني', 'is_public' => true],
    ['group' => 'university', 'key' => 'university_address_en', 'value' => 'University Address', 'type' => 'text', 'label_en' => 'Address (English)', 'label_ar' => 'العنوان (إنجليزي)', 'is_public' => true],
    ['group' => 'university', 'key' => 'university_address_ar', 'value' => 'عنوان الجامعة', 'type' => 'text', 'label_en' => 'Address (Arabic)', 'label_ar' => 'العنوان (عربي)', 'is_public' => true],

    // ID Card Settings
    ['group' => 'id_card', 'key' => 'id_card_validity_months', 'value' => '6', 'type' => 'number', 'label_en' => 'ID Card Validity (Months)', 'label_ar' => 'صلاحية البطاقة (أشهر)', 'is_public' => false],
    ['group' => 'id_card', 'key' => 'id_card_background_color', 'value' => '#1e293b', 'type' => 'text', 'label_en' => 'Card Background Color', 'label_ar' => 'لون خلفية البطاقة', 'is_public' => false],
    ['group' => 'id_card', 'key' => 'id_card_accent_color', 'value' => '#eab308', 'type' => 'text', 'label_en' => 'Card Accent Color', 'label_ar' => 'اللون الثانوي للبطاقة', 'is_public' => false],

    // Document Settings
    ['group' => 'documents', 'key' => 'document_header_logo', 'value' => null, 'type' => 'file', 'label_en' => 'Document Header Logo', 'label_ar' => 'شعار ترويسة المستندات', 'is_public' => false],
    ['group' => 'documents', 'key' => 'document_footer_text_en', 'value' => 'This is an official document issued by Vertex University', 'type' => 'text', 'label_en' => 'Footer Text (English)', 'label_ar' => 'نص التذييل (إنجليزي)', 'is_public' => false],
    ['group' => 'documents', 'key' => 'document_footer_text_ar', 'value' => 'هذه وثيقة رسمية صادرة عن جامعة فيرتكس', 'type' => 'text', 'label_en' => 'Footer Text (Arabic)', 'label_ar' => 'نص التذييل (عربي)', 'is_public' => false],
    ['group' => 'documents', 'key' => 'registrar_signature', 'value' => null, 'type' => 'file', 'label_en' => 'Registrar Signature', 'label_ar' => 'توقيع المسجل', 'is_public' => false],
    ['group' => 'documents', 'key' => 'dean_signature', 'value' => null, 'type' => 'file', 'label_en' => 'Dean Signature', 'label_ar' => 'توقيع العميد', 'is_public' => false],
];

$count = 0;
foreach ($settings as $s) {
    $exists = Setting::where('key', $s['key'])->exists();
    if (!$exists) {
        Setting::create($s);
        $count++;
        echo "Created: {$s['key']}\n";
    } else {
        echo "Exists: {$s['key']}\n";
    }
}

echo "\nDone! Created {$count} new settings.\n";
