<?php
/**
 * ============================================================
 * WordPress Integration Code for Vertex University SIS
 * ============================================================
 *
 * أضف هذا الكود في ملف functions.php في قالب WordPress
 * أو أنشئ إضافة (plugin) جديدة
 *
 * الإعدادات المطلوبة:
 * 1. SIS_API_URL: رابط API النظام
 * 2. SIS_API_KEY: مفتاح API (أضفه في wp-config.php)
 */

// ============================================================
// الإعدادات - أضفها في wp-config.php
// ============================================================
// define('SIS_API_URL', 'https://your-sis-domain.com/api');
// define('SIS_API_KEY', 'your-secret-api-key-here');

// ============================================================
// Hook لاستقبال بيانات WPForms عند الإرسال
// ============================================================

add_action('wpforms_process_complete', 'send_admission_to_sis', 10, 4);

function send_admission_to_sis($fields, $entry, $form_data, $entry_id) {
    // تحقق من أن هذا هو نموذج الالتحاق (غيّر الرقم حسب ID النموذج)
    $admission_form_id = 123; // ← غيّر هذا الرقم

    if ($form_data['id'] != $admission_form_id) {
        return;
    }

    // جمع البيانات من الحقول
    // ملاحظة: أرقام الحقول (field_id) تختلف حسب نموذجك
    $data = array(
        // المعلومات الشخصية
        'full_name'      => get_wpforms_field($fields, 1),  // الاسم الكامل
        'full_name_ar'   => get_wpforms_field($fields, 2),  // الاسم بالعربي
        'email'          => get_wpforms_field($fields, 3),  // البريد الإلكتروني
        'phone'          => get_wpforms_field($fields, 4),  // رقم الهاتف
        'whatsapp'       => get_wpforms_field($fields, 5),  // رقم الواتساب
        'national_id'    => get_wpforms_field($fields, 6),  // رقم جواز السفر/الهوية
        'date_of_birth'  => get_wpforms_field($fields, 7),  // تاريخ الميلاد
        'gender'         => strtolower(get_wpforms_field($fields, 8)), // الجنس (male/female)
        'nationality'    => get_wpforms_field($fields, 9),  // الجنسية

        // معلومات الإقامة
        'country'        => get_wpforms_field($fields, 10), // الدولة
        'city'           => get_wpforms_field($fields, 11), // المدينة
        'residence'      => get_wpforms_field($fields, 12), // مكان الإقامة
        'address'        => get_wpforms_field($fields, 13), // العنوان الكامل

        // المعلومات الأكاديمية
        'college'             => get_wpforms_field($fields, 14), // الكلية
        'degree'              => get_wpforms_field($fields, 15), // الدرجة (Bachelor, Master, PhD, Diploma)
        'program_code'        => get_wpforms_field($fields, 16), // كود البرنامج
        'high_school_name'    => get_wpforms_field($fields, 17), // اسم الثانوية
        'high_school_score'   => get_wpforms_field($fields, 18), // درجة الثانوية
        'high_school_year'    => get_wpforms_field($fields, 19), // سنة التخرج

        // معلومات المنحة والدفع
        'scholarship_percentage' => get_wpforms_field($fields, 20), // نسبة المنحة
        'payment_method'         => get_wpforms_field($fields, 21), // طريقة الدفع

        // للدراسات العليا
        'previous_university' => get_wpforms_field($fields, 22),
        'previous_degree'     => get_wpforms_field($fields, 23),
        'previous_gpa'        => get_wpforms_field($fields, 24),

        // معلومات التتبع
        'source'       => 'wordpress',
        'utm_source'   => isset($_GET['utm_source']) ? sanitize_text_field($_GET['utm_source']) : '',
        'utm_campaign' => isset($_GET['utm_campaign']) ? sanitize_text_field($_GET['utm_campaign']) : '',
    );

    // إرسال البيانات للـ SIS
    $response = wp_remote_post(SIS_API_URL . '/webhook/admission', array(
        'timeout'     => 30,
        'redirection' => 5,
        'httpversion' => '1.1',
        'blocking'    => true,
        'headers'     => array(
            'Content-Type'  => 'application/json',
            'X-API-Key'     => SIS_API_KEY,
            'Accept'        => 'application/json',
        ),
        'body'        => json_encode($data),
        'cookies'     => array(),
    ));

    // تسجيل النتيجة للتتبع
    if (is_wp_error($response)) {
        error_log('SIS Webhook Error: ' . $response->get_error_message());
    } else {
        $body = json_decode(wp_remote_retrieve_body($response), true);
        if (isset($body['success']) && $body['success']) {
            // حفظ رقم الطلب في entry meta
            wpforms()->entry_meta->add(
                array(
                    'entry_id' => $entry_id,
                    'type'     => 'sis_reference',
                    'data'     => $body['data']['reference_number'] ?? '',
                )
            );
            error_log('SIS Application Submitted: ' . ($body['data']['reference_number'] ?? 'No ref'));
        } else {
            error_log('SIS Webhook Failed: ' . json_encode($body));
        }
    }
}

/**
 * دالة مساعدة لاستخراج قيمة حقل من WPForms
 */
function get_wpforms_field($fields, $field_id) {
    if (isset($fields[$field_id]['value'])) {
        return sanitize_text_field($fields[$field_id]['value']);
    }
    return '';
}

// ============================================================
// Shortcode لعرض حالة الطلب
// ============================================================
// استخدم: [sis_application_status]

add_shortcode('sis_application_status', 'sis_application_status_shortcode');

function sis_application_status_shortcode($atts) {
    if (!isset($_GET['ref']) && !isset($_POST['ref'])) {
        return sis_status_form();
    }

    $reference = sanitize_text_field($_GET['ref'] ?? $_POST['ref']);

    $response = wp_remote_get(SIS_API_URL . '/webhook/admission/status/' . urlencode($reference), array(
        'timeout' => 15,
        'headers' => array(
            'X-API-Key' => SIS_API_KEY,
            'Accept'    => 'application/json',
        ),
    ));

    if (is_wp_error($response)) {
        return '<div class="sis-error">حدث خطأ في الاتصال. يرجى المحاولة لاحقاً.</div>';
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);

    if (!isset($body['success']) || !$body['success']) {
        return '<div class="sis-error">لم يتم العثور على الطلب. تأكد من الرقم المرجعي.</div>' . sis_status_form();
    }

    $data = $body['data'];
    $status_class = strtolower(str_replace('_', '-', $data['status']));

    return '
    <div class="sis-status-result">
        <h3>حالة طلب القبول</h3>
        <div class="sis-status-card">
            <p><strong>الرقم المرجعي:</strong> ' . esc_html($data['reference_number']) . '</p>
            <p><strong>اسم المتقدم:</strong> ' . esc_html($data['applicant_name']) . '</p>
            <p><strong>البرنامج:</strong> ' . esc_html($data['program'] ?? '-') . '</p>
            <p><strong>الحالة:</strong> <span class="sis-status sis-status-' . $status_class . '">' . esc_html($data['status_label']['ar']) . '</span></p>
            ' . ($data['student_id'] ? '<p><strong>الرقم الجامعي:</strong> ' . esc_html($data['student_id']) . '</p>' : '') . '
        </div>
    </div>
    <style>
        .sis-status-card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .sis-status { padding: 4px 12px; border-radius: 20px; font-size: 14px; }
        .sis-status-pending { background: #fef3c7; color: #92400e; }
        .sis-status-under-review { background: #dbeafe; color: #1e40af; }
        .sis-status-approved { background: #d1fae5; color: #065f46; }
        .sis-status-rejected { background: #fee2e2; color: #991b1b; }
        .sis-status-pending-payment { background: #fed7aa; color: #c2410c; }
        .sis-error { background: #fee2e2; color: #991b1b; padding: 15px; border-radius: 8px; margin: 10px 0; }
    </style>
    ';
}

function sis_status_form() {
    return '
    <form method="post" class="sis-status-form">
        <label for="ref">أدخل الرقم المرجعي أو البريد الإلكتروني:</label>
        <input type="text" name="ref" id="ref" required placeholder="APP-000001 أو email@example.com">
        <button type="submit">استعلام</button>
    </form>
    <style>
        .sis-status-form { max-width: 400px; margin: 20px 0; }
        .sis-status-form label { display: block; margin-bottom: 8px; font-weight: bold; }
        .sis-status-form input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px; }
        .sis-status-form button { background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        .sis-status-form button:hover { background: #2563eb; }
    </style>
    ';
}

// ============================================================
// Shortcode للحصول على قائمة البرامج
// ============================================================
// استخدم: [sis_programs]

add_shortcode('sis_programs', 'sis_programs_shortcode');

function sis_programs_shortcode($atts) {
    $atts = shortcode_atts(array(
        'degree' => '', // فلترة حسب الدرجة: BACHELOR, MASTER, PHD
    ), $atts);

    $response = wp_remote_get(SIS_API_URL . '/webhook/programs', array(
        'timeout' => 15,
        'headers' => array(
            'X-API-Key' => SIS_API_KEY,
            'Accept'    => 'application/json',
        ),
    ));

    if (is_wp_error($response)) {
        return '<div class="sis-error">حدث خطأ في تحميل البرامج.</div>';
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);

    if (!isset($body['success']) || !$body['success']) {
        return '<div class="sis-error">لا توجد برامج متاحة حالياً.</div>';
    }

    $programs = $body['data'];

    // فلترة حسب الدرجة إذا تم تحديدها
    if (!empty($atts['degree'])) {
        $programs = array_filter($programs, function($p) use ($atts) {
            return strtoupper($p['degree_type']) === strtoupper($atts['degree']);
        });
    }

    $output = '<div class="sis-programs-list"><ul>';
    foreach ($programs as $program) {
        $output .= '<li>';
        $output .= '<strong>' . esc_html($program['name_ar']) . '</strong>';
        $output .= ' <span class="sis-program-code">(' . esc_html($program['code']) . ')</span>';
        $output .= '</li>';
    }
    $output .= '</ul></div>';

    return $output;
}

// ============================================================
// ربط حقول WPForms مع البرامج من SIS
// ============================================================

add_filter('wpforms_field_options_html', 'populate_sis_programs_dropdown', 10, 3);

function populate_sis_programs_dropdown($options, $field, $form_data) {
    // فقط للحقول المحددة (غيّر field_id حسب نموذجك)
    $program_field_id = 16; // ← غيّر هذا الرقم

    if ($field['id'] != $program_field_id) {
        return $options;
    }

    // استرجاع البرامج من cache أو API
    $programs = get_transient('sis_programs_cache');

    if (false === $programs) {
        $response = wp_remote_get(SIS_API_URL . '/webhook/programs', array(
            'timeout' => 15,
            'headers' => array(
                'X-API-Key' => SIS_API_KEY,
            ),
        ));

        if (!is_wp_error($response)) {
            $body = json_decode(wp_remote_retrieve_body($response), true);
            if (isset($body['data'])) {
                $programs = $body['data'];
                set_transient('sis_programs_cache', $programs, HOUR_IN_SECONDS);
            }
        }
    }

    if ($programs) {
        $options = array();
        foreach ($programs as $program) {
            $options[] = array(
                'label' => $program['name_ar'] . ' (' . $program['code'] . ')',
                'value' => $program['code'],
            );
        }
    }

    return $options;
}
