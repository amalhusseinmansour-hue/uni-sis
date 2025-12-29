<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>بطاقات الطلاب - طباعة جماعية</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 10mm;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background: #f8fafc;
        }
        .page-header {
            text-align: center;
            padding: 5mm 0;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 5mm;
        }
        .page-header h1 {
            font-size: 14px;
            color: #1e293b;
            margin: 0;
        }
        .page-header p {
            font-size: 10px;
            color: #64748b;
            margin-top: 2px;
        }
        .cards-grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
            gap: 8mm;
        }
        .card-wrapper {
            width: 90mm;
            margin-bottom: 8mm;
            page-break-inside: avoid;
        }
        .card {
            width: 85.6mm;
            height: 54mm;
            background: linear-gradient(145deg, #0d1b2a 0%, #1b263b 40%, #415a77 100%);
            border-radius: 3mm;
            position: relative;
            overflow: hidden;
            color: white;
            margin: 0 auto;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        /* Decorative Elements */
        .card-decoration {
            position: absolute;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }
        .card-decoration::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 1mm;
            background: linear-gradient(90deg, #ffd700, #ff8c00, #ffd700);
        }
        /* Header Section */
        .card-header {
            background: linear-gradient(90deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2));
            padding: 3mm 4mm;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            z-index: 2;
        }
        .logo-section {
            display: flex;
            align-items: center;
            gap: 2mm;
        }
        .university-logo {
            width: 8mm;
            height: 8mm;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4mm;
            font-weight: bold;
            color: #1b263b;
        }
        .university-logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 50%;
        }
        .university-info {
            text-align: right;
        }
        .university-name-ar {
            font-size: 3mm;
            font-weight: bold;
            color: #ffd700;
        }
        .university-name-en {
            font-size: 2mm;
            color: rgba(255,255,255,0.8);
        }
        .card-type-badge {
            background: linear-gradient(135deg, #ffd700, #ff8c00);
            color: #1b263b;
            padding: 1mm 2mm;
            border-radius: 1.5mm;
            font-size: 1.8mm;
            font-weight: bold;
        }
        /* Body Section */
        .card-body {
            padding: 2mm 4mm;
            display: flex;
            position: relative;
            z-index: 2;
        }
        /* Photo Section */
        .photo-frame {
            width: 18mm;
            height: 22mm;
            background: white;
            border-radius: 2mm;
            border: 0.3mm solid #ffd700;
            margin-left: 3mm;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .photo-frame img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .photo-placeholder {
            font-size: 1.8mm;
            color: #94a3b8;
            text-align: center;
            background: linear-gradient(135deg, #e2e8f0, #cbd5e0);
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        /* Info Section */
        .info-section {
            flex: 1;
            direction: rtl;
            text-align: right;
        }
        .student-name-ar {
            font-size: 3.2mm;
            font-weight: bold;
            color: white;
            margin-bottom: 0.5mm;
        }
        .student-name-en {
            font-size: 2.2mm;
            color: rgba(255,255,255,0.8);
            margin-bottom: 1.5mm;
            font-style: italic;
        }
        .student-id-label {
            font-size: 1.5mm;
            color: #ffd700;
            text-transform: uppercase;
            letter-spacing: 0.3mm;
        }
        .student-id-number {
            font-size: 3.5mm;
            font-weight: bold;
            color: #ffd700;
            font-family: 'Courier New', monospace;
            letter-spacing: 0.5mm;
            margin-bottom: 1.5mm;
        }
        .info-row {
            font-size: 2mm;
            margin: 0.5mm 0;
            color: rgba(255,255,255,0.85);
        }
        .info-label {
            color: rgba(255,255,255,0.6);
        }
        /* QR Code Section */
        .qr-section {
            position: absolute;
            bottom: 7mm;
            left: 4mm;
            z-index: 3;
        }
        .qr-frame {
            width: 13mm;
            height: 13mm;
            background: white;
            border-radius: 1mm;
            padding: 0.8mm;
        }
        .qr-frame img {
            width: 100%;
            height: 100%;
        }
        /* Status Badge */
        .status-badge {
            position: absolute;
            top: 13mm;
            left: 4mm;
            padding: 0.8mm 1.5mm;
            border-radius: 1mm;
            font-size: 1.5mm;
            font-weight: bold;
            z-index: 3;
        }
        .status-active {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
        }
        .status-inactive {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
        }
        .status-graduated {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
        }
        .status-suspended {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
        }
        /* Footer */
        .card-footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(90deg, rgba(0,0,0,0.5), rgba(0,0,0,0.3));
            padding: 1.2mm 4mm;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 2;
        }
        .validity-section {
            display: flex;
            gap: 3mm;
            font-size: 1.5mm;
            color: rgba(255,255,255,0.7);
        }
        .validity-value {
            color: white;
        }
        .barcode-text {
            font-size: 1.8mm;
            font-family: 'Courier New', monospace;
            color: #ffd700;
            letter-spacing: 0.2mm;
        }
        /* Page Break */
        .page-break {
            page-break-after: always;
        }
        /* Print Info */
        .print-info {
            text-align: center;
            padding: 3mm 0;
            font-size: 8px;
            color: #94a3b8;
            margin-top: 5mm;
            border-top: 1px dashed #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="page-header">
        <h1>{{ $university_name_ar ?? 'جامعة يونيفرس' }} - طباعة بطاقات الطلاب</h1>
        <p>{{ $university_name ?? 'Universe University' }} - Student ID Cards Bulk Print</p>
    </div>

    <div class="cards-grid">
        @foreach($cards as $index => $card)
        <div class="card-wrapper">
            <div class="card">
                <div class="card-decoration"></div>

                <!-- Header -->
                <div class="card-header">
                    <div class="logo-section">
                        <div class="university-logo">
                            @if($university_logo ?? false)
                                <img src="{{ $university_logo }}" alt="Logo">
                            @else
                                U
                            @endif
                        </div>
                        <div class="university-info">
                            <div class="university-name-ar">{{ $university_name_ar ?? 'جامعة يونيفرس' }}</div>
                            <div class="university-name-en">{{ $university_name ?? 'Universe University' }}</div>
                        </div>
                    </div>
                    <div class="card-type-badge">بطاقة طالب</div>
                </div>

                <!-- Status Badge -->
                <div class="status-badge {{ $card['student']->status == 'ACTIVE' ? 'status-active' : ($card['student']->status == 'GRADUATED' ? 'status-graduated' : ($card['student']->status == 'SUSPENDED' ? 'status-suspended' : 'status-inactive')) }}">
                    @if($card['student']->status == 'ACTIVE')
                        نشط
                    @elseif($card['student']->status == 'GRADUATED')
                        متخرج
                    @elseif($card['student']->status == 'SUSPENDED')
                        موقوف
                    @else
                        {{ $card['student']->status }}
                    @endif
                </div>

                <!-- Body -->
                <div class="card-body">
                    <!-- Photo -->
                    <div class="photo-frame">
                        @if($card['student']->profile_picture)
                            <img src="{{ Storage::disk('public')->exists($card['student']->profile_picture) ? Storage::disk('public')->url($card['student']->profile_picture) : asset('storage/' . $card['student']->profile_picture) }}" alt="صورة الطالب">
                        @else
                            <div class="photo-placeholder">صورة</div>
                        @endif
                    </div>

                    <!-- Info -->
                    <div class="info-section">
                        <div class="student-name-ar">{{ $card['student']->name_ar ?? $card['student']->name_en }}</div>
                        <div class="student-name-en">{{ $card['student']->name_en }}</div>

                        <div class="student-id-label">الرقم الجامعي</div>
                        <div class="student-id-number">{{ $card['student']->student_id }}</div>

                        <div class="info-row">
                            <span class="info-label">البرنامج:</span>
                            {{ $card['program']?->name_ar ?? $card['program']?->name_en ?? 'غير محدد' }}
                        </div>
                        <div class="info-row">
                            <span class="info-label">المستوى:</span>
                            السنة {{ $card['student']->level ?? 1 }}
                        </div>
                    </div>
                </div>

                <!-- QR Code -->
                <div class="qr-section">
                    <div class="qr-frame">
                        @if(str_starts_with($card['qr_code'] ?? '', 'data:'))
                            <img src="{{ $card['qr_code'] }}" alt="QR">
                        @elseif(!empty($card['qr_code']))
                            <img src="{{ $card['qr_code'] }}" alt="QR">
                        @else
                            <div style="width:100%;height:100%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:5px;">QR</div>
                        @endif
                    </div>
                </div>

                <!-- Footer -->
                <div class="card-footer">
                    <div class="validity-section">
                        <span>صدور: <span class="validity-value">{{ $card['validity']['issue_date'] ?? now()->format('Y-m-d') }}</span></span>
                        <span>صالحة حتى: <span class="validity-value">{{ $card['validity']['expiry_date'] ?? now()->addMonths(6)->format('Y-m-d') }}</span></span>
                    </div>
                    <div class="barcode-text">{{ $card['barcode'] }}</div>
                </div>
            </div>
        </div>

        @if(($index + 1) % 6 == 0 && $index + 1 < count($cards))
            </div>
            <div class="print-info">
                صفحة {{ ceil(($index + 1) / 6) }} من {{ ceil(count($cards) / 6) }}
            </div>
            <div class="page-break"></div>
            <div class="page-header">
                <h1>{{ $university_name_ar ?? 'جامعة يونيفرس' }} - طباعة بطاقات الطلاب</h1>
                <p>{{ $university_name ?? 'Universe University' }} - Student ID Cards Bulk Print</p>
            </div>
            <div class="cards-grid">
        @endif
        @endforeach
    </div>

    <div class="print-info">
        @if(count($cards) > 0)
            صفحة {{ ceil(count($cards) / 6) }} من {{ ceil(count($cards) / 6) }} | إجمالي البطاقات: {{ count($cards) }}
        @endif
        <br>
        تم الإنشاء في: {{ now()->format('Y-m-d H:i') }}
    </div>
</body>
</html>
