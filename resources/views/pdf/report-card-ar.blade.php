<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>كشف الدرجات - {{ $data['student']['name_ar'] ?? $data['student']['name_en'] }}</title>
    <style>
        @font-face {
            font-family: 'DejaVu Sans';
            src: url('{{ storage_path('fonts/DejaVuSans.ttf') }}') format('truetype');
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 10px;
            line-height: 1.4;
            color: #333;
            padding: 15mm;
            direction: rtl;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #1a365d;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .logo-section {
            text-align: center;
        }
        .logo {
            width: 60px;
            height: 60px;
            background: #1a365d;
            border-radius: 50%;
            margin: 0 auto 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
        }
        .university-name {
            font-size: 16px;
            font-weight: bold;
            color: #1a365d;
        }
        .document-title {
            font-size: 14px;
            color: #666;
            margin-top: 3px;
        }
        .semester-info {
            text-align: left;
        }
        .semester-name {
            font-size: 12px;
            font-weight: bold;
            color: #1a365d;
        }
        .semester-year {
            color: #666;
        }
        .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            background: #f8fafc;
            padding: 15px;
            border-radius: 5px;
        }
        .info-column {
            width: 48%;
        }
        .info-row {
            margin-bottom: 5px;
        }
        .info-label {
            font-weight: bold;
            color: #1a365d;
            display: inline-block;
            width: 80px;
        }
        .info-value {
            color: #333;
        }
        .grades-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .grades-table th {
            background: #1a365d;
            color: white;
            padding: 8px;
            text-align: center;
            font-size: 9px;
            font-weight: bold;
        }
        .grades-table td {
            border: 1px solid #e2e8f0;
            padding: 6px 8px;
            text-align: center;
            font-size: 9px;
        }
        .grades-table tr:nth-child(even) {
            background: #f8fafc;
        }
        .grades-table .course-name {
            text-align: right;
            max-width: 150px;
        }
        .grade-cell {
            font-weight: bold;
        }
        .grade-A { color: #22c55e; }
        .grade-B { color: #3b82f6; }
        .grade-C { color: #f59e0b; }
        .grade-D { color: #ef4444; }
        .grade-F { color: #dc2626; font-weight: bold; }
        .passed { color: #22c55e; }
        .failed { color: #dc2626; }
        .summary-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        .summary-box {
            width: 30%;
            background: #f8fafc;
            border-radius: 5px;
            padding: 12px;
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        .summary-title {
            font-size: 8px;
            color: #666;
            margin-bottom: 5px;
        }
        .summary-value {
            font-size: 18px;
            font-weight: bold;
            color: #1a365d;
        }
        .summary-subtitle {
            font-size: 8px;
            color: #666;
        }
        .attendance-section {
            background: #f8fafc;
            padding: 12px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .attendance-title {
            font-weight: bold;
            color: #1a365d;
            margin-bottom: 8px;
        }
        .attendance-bar {
            height: 20px;
            background: #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
        }
        .attendance-fill {
            height: 100%;
            background: linear-gradient(90deg, #22c55e, #16a34a);
            border-radius: 10px;
        }
        .attendance-stats {
            display: flex;
            justify-content: space-between;
            margin-top: 5px;
            font-size: 8px;
            color: #666;
        }
        .ranking-section {
            background: #fef3c7;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            margin-bottom: 20px;
        }
        .ranking-title {
            font-size: 8px;
            color: #92400e;
        }
        .ranking-value {
            font-size: 14px;
            font-weight: bold;
            color: #92400e;
        }
        .standing-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: bold;
            margin-top: 10px;
        }
        .standing-deans { background: #22c55e; color: white; }
        .standing-good { background: #3b82f6; color: white; }
        .standing-satisfactory { background: #f59e0b; color: white; }
        .standing-probation { background: #ef4444; color: white; }
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
        }
        .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
        }
        .signature-box {
            text-align: center;
            width: 30%;
        }
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 30px;
            padding-top: 5px;
            font-size: 8px;
        }
        .generated-info {
            text-align: center;
            margin-top: 20px;
            font-size: 8px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="semester-info">
            <div class="semester-name">{{ $data['semester']['name_ar'] ?? $data['semester']['name'] }}</div>
            <div class="semester-year">العام الأكاديمي {{ $data['semester']['academic_year'] }}</div>
        </div>
        <div class="logo-section">
            <div class="logo">UNI</div>
            <div class="university-name">{{ $university_name_ar }}</div>
            <div class="document-title">كشف الدرجات الفصلي</div>
        </div>
    </div>

    <div class="info-section">
        <div class="info-column">
            <div class="info-row">
                <span class="info-label">الرقم الجامعي:</span>
                <span class="info-value">{{ $data['student']['student_id'] }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">الاسم:</span>
                <span class="info-value">{{ $data['student']['name_ar'] ?? $data['student']['name_en'] }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">المستوى:</span>
                <span class="info-value">السنة {{ $data['student']['level'] }}</span>
            </div>
        </div>
        <div class="info-column">
            <div class="info-row">
                <span class="info-label">البرنامج:</span>
                <span class="info-value">{{ $data['program']['name_ar'] ?? $data['program']['name_en'] ?? 'غير محدد' }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">القسم:</span>
                <span class="info-value">{{ $data['program']['department_ar'] ?? $data['program']['department'] ?? 'غير محدد' }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">الكلية:</span>
                <span class="info-value">{{ $data['program']['college_ar'] ?? $data['program']['college'] ?? 'غير محدد' }}</span>
            </div>
        </div>
    </div>

    <table class="grades-table">
        <thead>
            <tr>
                <th style="width: 15%">الرمز</th>
                <th style="width: 30%" class="course-name">اسم المقرر</th>
                <th style="width: 10%">الساعات</th>
                <th style="width: 10%">النوع</th>
                <th style="width: 10%">النصفي</th>
                <th style="width: 10%">النهائي</th>
                <th style="width: 8%">التقدير</th>
                <th style="width: 7%">الحالة</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['courses'] as $course)
            <tr>
                <td>{{ $course['course_code'] }}</td>
                <td class="course-name">{{ $course['course_name_ar'] ?? $course['course_name_en'] }}</td>
                <td>{{ $course['credits'] }}</td>
                <td>{{ $course['type'] }}</td>
                <td>{{ $course['midterm_score'] ?? '-' }}</td>
                <td>{{ $course['final_score'] ?? '-' }}</td>
                <td class="grade-cell grade-{{ substr($course['grade'], 0, 1) }}">
                    {{ $course['grade'] }}
                </td>
                <td class="{{ $course['passed'] ? 'passed' : 'failed' }}">
                    {{ $course['passed'] ? 'ناجح' : 'راسب' }}
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="summary-section">
        <div class="summary-box">
            <div class="summary-title">المعدل الفصلي</div>
            <div class="summary-value">{{ number_format($data['summary']['semester_gpa'], 2) }}</div>
            <div class="summary-subtitle">من 4.00</div>
        </div>
        <div class="summary-box">
            <div class="summary-title">المعدل التراكمي</div>
            <div class="summary-value">{{ number_format($data['summary']['cumulative_gpa'], 2) }}</div>
            <div class="summary-subtitle">من 4.00</div>
        </div>
        <div class="summary-box">
            <div class="summary-title">الساعات المكتسبة</div>
            <div class="summary-value">{{ $data['summary']['earned_credits'] }}/{{ $data['summary']['total_credits'] }}</div>
            <div class="summary-subtitle">هذا الفصل</div>
        </div>
    </div>

    @if($data['attendance'])
    <div class="attendance-section">
        <div class="attendance-title">ملخص الحضور</div>
        <div class="attendance-bar">
            <div class="attendance-fill" style="width: {{ $data['attendance']['attendance_percentage'] }}%"></div>
        </div>
        <div class="attendance-stats">
            <span>الحضور: {{ $data['attendance']['attended_classes'] }} محاضرة</span>
            <span>الغياب: {{ $data['attendance']['missed_classes'] }} محاضرة</span>
            <span>النسبة: {{ $data['attendance']['attendance_percentage'] }}%</span>
        </div>
    </div>
    @endif

    @if($data['ranking'])
    <div class="ranking-section">
        <div class="ranking-title">الترتيب في الدفعة</div>
        <div class="ranking-value">
            #{{ $data['ranking']['rank'] }} من {{ $data['ranking']['total_students'] }} طالب
            (أفضل {{ 100 - $data['ranking']['percentile'] }}%)
        </div>
    </div>
    @endif

    <div style="text-align: center;">
        @php
            $standing = $data['summary']['academic_standing_ar'] ?? $data['summary']['academic_standing'];
            $standingClass = match($data['summary']['academic_standing']) {
                "Dean's List" => 'standing-deans',
                'Good Standing' => 'standing-good',
                'Satisfactory' => 'standing-satisfactory',
                default => 'standing-probation'
            };
        @endphp
        <span class="standing-badge {{ $standingClass }}">
            {{ $standing }}
        </span>
    </div>

    <div class="footer">
        <div class="signatures">
            <div class="signature-box">
                <div class="signature-line">المرشد الأكاديمي</div>
            </div>
            <div class="signature-box">
                <div class="signature-line">رئيس القسم</div>
            </div>
            <div class="signature-box">
                <div class="signature-line">عمادة القبول والتسجيل</div>
            </div>
        </div>
        <div class="generated-info">
            تم الإصدار في {{ $data['generated_at'] }} | هذا مستند رسمي
        </div>
    </div>
</body>
</html>
