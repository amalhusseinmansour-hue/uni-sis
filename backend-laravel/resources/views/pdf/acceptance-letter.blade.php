<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>خطاب القبول</title>
    <style>
        @font-face {
            font-family: 'DejaVu Sans';
            src: url('{{ storage_path('fonts/DejaVuSans.ttf') }}') format('truetype');
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            direction: rtl;
            text-align: right;
            margin: 0;
            padding: 40px;
            font-size: 14px;
            line-height: 1.8;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #1e3a5f;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #1e3a5f;
        }
        .university-name {
            font-size: 24px;
            color: #1e3a5f;
            margin: 10px 0;
        }
        .letter-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .letter-number {
            text-align: left;
        }
        .letter-date {
            text-align: right;
        }
        .title {
            text-align: center;
            font-size: 22px;
            font-weight: bold;
            color: #1e3a5f;
            margin: 30px 0;
            text-decoration: underline;
        }
        .content {
            text-align: justify;
            margin: 20px 0;
        }
        .student-info {
            background-color: #f5f5f5;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .info-row {
            margin: 10px 0;
        }
        .info-label {
            font-weight: bold;
            color: #333;
            display: inline-block;
            width: 150px;
        }
        .info-value {
            color: #1e3a5f;
        }
        .signature-section {
            margin-top: 50px;
            text-align: left;
        }
        .signature-line {
            border-top: 1px solid #333;
            width: 200px;
            margin-top: 50px;
        }
        .footer {
            position: fixed;
            bottom: 20px;
            left: 40px;
            right: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .stamp-area {
            text-align: left;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🎓</div>
        <div class="university-name">جامعة Universe</div>
        <div>عمادة القبول والتسجيل</div>
    </div>

    <table width="100%" style="margin-bottom: 20px;">
        <tr>
            <td style="text-align: right;">
                <strong>التاريخ:</strong> {{ $date }}
            </td>
            <td style="text-align: left;">
                <strong>رقم الخطاب:</strong> ADM-{{ $application->id }}-{{ date('Y') }}
            </td>
        </tr>
    </table>

    <div class="title">خطاب قبول</div>

    <div class="content">
        <p>إلى من يهمه الأمر،</p>

        <p>تشهد عمادة القبول والتسجيل بجامعة Universe بأن الطالب/الطالبة المذكور/ة أدناه قد تم قبوله/ها للدراسة في الجامعة للعام الأكاديمي {{ $academic_year }}.</p>

        <div class="student-info">
            <div class="info-row">
                <span class="info-label">الاسم الكامل:</span>
                <span class="info-value">{{ $application->full_name }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">الرقم الجامعي:</span>
                <span class="info-value">{{ $student_id }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">رقم الهوية:</span>
                <span class="info-value">{{ $application->national_id }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">الجنسية:</span>
                <span class="info-value">{{ $application->nationality }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">البرنامج:</span>
                <span class="info-value">{{ $program?->name ?? 'غير محدد' }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">الدرجة العلمية:</span>
                <span class="info-value">{{ $program?->degree ?? 'بكالوريوس' }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">تاريخ القبول:</span>
                <span class="info-value">{{ $date }}</span>
            </div>
        </div>

        <p>وقد أُعطي هذا الخطاب بناءً على طلب المعني/ة لتقديمه للجهات ذات الاختصاص، ولا يجوز استخدامه لغير ذلك الغرض.</p>

        <p>والله الموفق،،</p>
    </div>

    <div class="signature-section">
        <p><strong>عميد القبول والتسجيل</strong></p>
        <div class="signature-line"></div>
        <p>التوقيع والختم</p>
    </div>

    <div class="footer">
        جامعة Universe - المملكة العربية السعودية | هاتف: +966 XX XXX XXXX | البريد: admissions@university.edu.sa
    </div>
</body>
</html>
