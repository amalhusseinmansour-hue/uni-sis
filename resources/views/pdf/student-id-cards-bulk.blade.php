<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>بطاقات الطلاب - طباعة جماعية</title>
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
            padding: 10mm;
        }
        .cards-grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
        }
        .card-wrapper {
            width: 48%;
            margin-bottom: 15mm;
            page-break-inside: avoid;
        }
        .card {
            width: 85.6mm;
            height: 54mm;
            background: linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #1a365d 100%);
            border-radius: 8px;
            position: relative;
            overflow: hidden;
            color: white;
            margin: 0 auto;
        }
        .card-header {
            background: rgba(0,0,0,0.2);
            padding: 4px 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .university-name {
            font-size: 9px;
            font-weight: bold;
        }
        .card-type {
            font-size: 6px;
            background: #ffd700;
            color: #1a365d;
            padding: 2px 4px;
            border-radius: 2px;
        }
        .card-body {
            padding: 6px 8px;
            display: flex;
        }
        .photo-container {
            width: 18mm;
            height: 22mm;
            background: white;
            border-radius: 4px;
            margin-left: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 6px;
            color: #999;
        }
        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 4px;
        }
        .info-section {
            flex: 1;
            text-align: right;
        }
        .student-name {
            font-size: 9px;
            font-weight: bold;
            margin-bottom: 2px;
        }
        .student-id {
            font-size: 12px;
            font-weight: bold;
            color: #ffd700;
            margin-bottom: 4px;
        }
        .info-row {
            font-size: 6px;
            margin: 2px 0;
            color: rgba(255,255,255,0.9);
        }
        .qr-section {
            position: absolute;
            bottom: 15px;
            left: 6px;
            width: 15mm;
            height: 15mm;
            background: white;
            border-radius: 3px;
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
            padding: 3px 8px;
            font-size: 5px;
            display: flex;
            justify-content: space-between;
        }
        .barcode-text {
            font-family: monospace;
            color: #ffd700;
            font-size: 6px;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="cards-grid">
        @foreach($cards as $index => $card)
        <div class="card-wrapper">
            <div class="card">
                <div class="card-header">
                    <div class="university-name">{{ $university_name_ar }}</div>
                    <div class="card-type">بطاقة طالب</div>
                </div>

                <div class="card-body">
                    <div class="photo-container">
                        @if($card['student']->profile_picture)
                            <img src="{{ asset('storage/' . $card['student']->profile_picture) }}" alt="">
                        @else
                            صورة
                        @endif
                    </div>
                    <div class="info-section">
                        <div class="student-name">{{ $card['student']->name_ar ?? $card['student']->name_en }}</div>
                        <div class="student-id">{{ $card['student']->student_id }}</div>
                        <div class="info-row">{{ $card['program']?->name_ar ?? $card['program']?->name_en ?? '-' }}</div>
                        <div class="info-row">السنة {{ $card['student']->level ?? 1 }}</div>
                    </div>
                </div>

                <div class="qr-section">
                    <img src="{{ $card['qr_code'] }}" alt="QR">
                </div>

                <div class="card-footer">
                    <span>صالحة حتى: {{ $card['validity']['expiry_date'] }}</span>
                    <span class="barcode-text">{{ $card['barcode'] }}</span>
                </div>
            </div>
        </div>

        @if(($index + 1) % 6 == 0 && $index + 1 < count($cards))
            </div>
            <div class="page-break"></div>
            <div class="cards-grid">
        @endif
        @endforeach
    </div>
</body>
</html>
