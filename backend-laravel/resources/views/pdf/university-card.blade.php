<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>بطاقة الجامعة</title>
    <style>
        @font-face {
            font-family: 'DejaVu Sans';
            src: url('{{ storage_path('fonts/DejaVuSans.ttf') }}') format('truetype');
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            margin: 0;
            padding: 0;
        }
        .card {
            width: 85.6mm;
            height: 54mm;
            background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 50%, #1e3a5f 100%);
            border-radius: 8px;
            position: relative;
            overflow: hidden;
            color: white;
        }
        .card-header {
            background: rgba(255,255,255,0.1);
            padding: 5px 10px;
            text-align: center;
        }
        .university-name {
            font-size: 14px;
            font-weight: bold;
        }
        .card-body {
            display: flex;
            padding: 10px;
        }
        .photo-area {
            width: 25mm;
            height: 30mm;
            background: white;
            border-radius: 5px;
            margin-left: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 10px;
        }
        .info-area {
            flex: 1;
            direction: rtl;
            text-align: right;
        }
        .student-name {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .student-id {
            font-size: 16px;
            font-weight: bold;
            color: #ffd700;
            letter-spacing: 2px;
            margin: 5px 0;
        }
        .info-item {
            font-size: 8px;
            margin: 3px 0;
            color: rgba(255,255,255,0.9);
        }
        .card-footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0,0,0,0.3);
            padding: 5px 10px;
            font-size: 7px;
            display: flex;
            justify-content: space-between;
        }
        .barcode {
            text-align: center;
            font-family: monospace;
            font-size: 12px;
            letter-spacing: 3px;
            color: #ffd700;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="card-header">
            <div class="university-name">جامعة Universe</div>
            <div style="font-size: 8px;">University Student ID Card</div>
        </div>

        <div class="card-body">
            <div class="photo-area">
                <span>صورة<br>الطالب</span>
            </div>
            <div class="info-area">
                <div class="student-name">{{ $application->full_name }}</div>
                <div class="student-id">{{ $student_id }}</div>
                <div class="info-item">
                    <strong>البرنامج:</strong> {{ $program?->name ?? 'غير محدد' }}
                </div>
                <div class="info-item">
                    <strong>الهوية:</strong> {{ substr($application->national_id, 0, 4) }}****
                </div>
                <div class="barcode">{{ $barcode }}</div>
            </div>
        </div>

        <div class="card-footer">
            <span>صدور: {{ $issue_date }}</span>
            <span>انتهاء: {{ $expiry_date }}</span>
        </div>
    </div>
</body>
</html>
