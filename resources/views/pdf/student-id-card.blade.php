<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>بطاقة الطالب الجامعية</title>
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
            font-family: 'DejaVu Sans', sans-serif;
            margin: 0;
            padding: 0;
        }
        .card {
            width: 85.6mm;
            height: 54mm;
            background: linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #1a365d 100%);
            border-radius: 10px;
            position: relative;
            overflow: hidden;
            color: white;
        }
        .card-pattern {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            opacity: 0.1;
            background-image: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.1) 10px,
                rgba(255,255,255,0.1) 20px
            );
        }
        .card-header {
            background: rgba(0,0,0,0.2);
            padding: 6px 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
            z-index: 1;
        }
        .university-logo {
            width: 30px;
            height: 30px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #1a365d;
            font-weight: bold;
        }
        .university-info {
            flex: 1;
            margin-right: 8px;
            text-align: right;
        }
        .university-name {
            font-size: 11px;
            font-weight: bold;
        }
        .university-name-en {
            font-size: 8px;
            opacity: 0.9;
        }
        .card-type {
            font-size: 7px;
            background: #ffd700;
            color: #1a365d;
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: bold;
        }
        .card-body {
            padding: 8px 10px;
            display: flex;
            position: relative;
            z-index: 1;
        }
        .photo-container {
            width: 22mm;
            height: 28mm;
            background: white;
            border-radius: 5px;
            border: 2px solid rgba(255,255,255,0.5);
            margin-left: 10px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .photo-placeholder {
            color: #999;
            font-size: 8px;
            text-align: center;
        }
        .info-section {
            flex: 1;
            direction: rtl;
            text-align: right;
        }
        .student-name-ar {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 2px;
            color: #fff;
        }
        .student-name-en {
            font-size: 9px;
            color: rgba(255,255,255,0.8);
            margin-bottom: 6px;
        }
        .student-id-label {
            font-size: 7px;
            color: rgba(255,255,255,0.7);
        }
        .student-id {
            font-size: 14px;
            font-weight: bold;
            color: #ffd700;
            letter-spacing: 2px;
            margin-bottom: 6px;
        }
        .info-row {
            font-size: 7px;
            margin: 2px 0;
            color: rgba(255,255,255,0.9);
        }
        .info-label {
            color: rgba(255,255,255,0.7);
        }
        .qr-section {
            position: absolute;
            bottom: 20px;
            left: 8px;
            width: 20mm;
            height: 20mm;
            background: white;
            border-radius: 4px;
            padding: 2px;
        }
        .qr-section img {
            width: 100%;
            height: 100%;
        }
        .card-footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0,0,0,0.3);
            padding: 4px 10px;
            font-size: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 1;
        }
        .validity {
            color: rgba(255,255,255,0.8);
        }
        .barcode-text {
            font-family: monospace;
            color: #ffd700;
            letter-spacing: 1px;
            font-size: 7px;
        }
        .status-badge {
            font-size: 6px;
            padding: 2px 4px;
            border-radius: 2px;
            text-transform: uppercase;
        }
        .status-active {
            background: #48bb78;
            color: white;
        }
        .status-inactive {
            background: #fc8181;
            color: white;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="card-pattern"></div>

        <div class="card-header">
            <div class="university-logo">
                @if($university_logo)
                    <img src="{{ $university_logo }}" style="width: 100%; height: 100%; border-radius: 50%;">
                @else
                    UNI
                @endif
            </div>
            <div class="university-info">
                <div class="university-name">{{ $university_name_ar }}</div>
                <div class="university-name-en">{{ $university_name }}</div>
            </div>
            <div class="card-type">بطاقة طالب</div>
        </div>

        <div class="card-body">
            <div class="photo-container">
                @if($student->profile_picture)
                    <img src="{{ asset('storage/' . $student->profile_picture) }}" alt="Student Photo">
                @else
                    <div class="photo-placeholder">صورة<br>الطالب</div>
                @endif
            </div>
            <div class="info-section">
                <div class="student-name-ar">{{ $student->name_ar ?? $student->name_en }}</div>
                <div class="student-name-en">{{ $student->name_en }}</div>
                <div class="student-id-label">الرقم الجامعي</div>
                <div class="student-id">{{ $student->student_id }}</div>
                <div class="info-row">
                    <span class="info-label">البرنامج:</span>
                    {{ $program?->name_ar ?? $program?->name_en ?? 'غير محدد' }}
                </div>
                <div class="info-row">
                    <span class="info-label">المستوى:</span>
                    السنة {{ $student->level ?? 1 }}
                </div>
                <div class="info-row">
                    <span class="status-badge {{ $student->status == 'ACTIVE' ? 'status-active' : 'status-inactive' }}">
                        {{ $student->status == 'ACTIVE' ? 'نشط' : $student->status }}
                    </span>
                </div>
            </div>
        </div>

        <div class="qr-section">
            @if(str_starts_with($qr_code, 'data:'))
                <img src="{{ $qr_code }}" alt="QR Code">
            @else
                <img src="{{ $qr_code }}" alt="QR Code">
            @endif
        </div>

        <div class="card-footer">
            <div class="validity">
                <span>صدور: {{ $validity['issue_date'] }}</span> |
                <span>صالحة حتى: {{ $validity['expiry_date'] }}</span>
            </div>
            <div class="barcode-text">{{ $barcode }}</div>
        </div>
    </div>
</body>
</html>
