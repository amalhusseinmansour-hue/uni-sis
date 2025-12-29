<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>البطاقة الجامعية - {{ $student->student_id }}</title>
    <style>
        @page {
            size: 85.6mm 54mm landscape;
            margin: 0;
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
            width: 85.6mm;
            height: 54mm;
        }
        .card {
            width: 85.6mm;
            height: 54mm;
            position: relative;
            overflow: hidden;
            background: linear-gradient(145deg, #0d1b2a 0%, #1b263b 40%, #415a77 100%);
        }
        /* Decorative Elements */
        .card-decoration {
            position: absolute;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }
        .card-decoration::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 100%;
            height: 200%;
            background: radial-gradient(ellipse, rgba(255,215,0,0.08) 0%, transparent 70%);
        }
        .card-decoration::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, #ffd700, #ff8c00, #ffd700);
        }
        /* Header Section */
        .card-header {
            background: linear-gradient(90deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2));
            padding: 4mm 4mm;
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
            width: 10mm;
            height: 10mm;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .university-logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        .university-logo-text {
            font-size: 5mm;
            font-weight: bold;
            color: #1b263b;
        }
        .university-info {
            text-align: right;
        }
        .university-name-ar {
            font-size: 3.5mm;
            font-weight: bold;
            color: #ffd700;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }
        .university-name-en {
            font-size: 2.2mm;
            color: rgba(255,255,255,0.8);
            margin-top: 0.5mm;
        }
        .card-type-badge {
            background: linear-gradient(135deg, #ffd700, #ff8c00);
            color: #1b263b;
            padding: 1.5mm 3mm;
            border-radius: 2mm;
            font-size: 2mm;
            font-weight: bold;
            text-transform: uppercase;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        /* Body Section */
        .card-body {
            padding: 3mm 4mm;
            display: flex;
            position: relative;
            z-index: 2;
            height: calc(100% - 22mm);
        }
        /* Photo Section */
        .photo-section {
            margin-left: 4mm;
        }
        .photo-frame {
            width: 20mm;
            height: 25mm;
            background: white;
            border-radius: 2mm;
            border: 0.5mm solid #ffd700;
            overflow: hidden;
            box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        }
        .photo-frame img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .photo-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #e2e8f0, #cbd5e0);
            color: #64748b;
            font-size: 2mm;
            text-align: center;
        }
        /* Info Section */
        .info-section {
            flex: 1;
            direction: rtl;
            text-align: right;
            padding-right: 2mm;
        }
        .student-name-ar {
            font-size: 3.8mm;
            font-weight: bold;
            color: white;
            margin-bottom: 1mm;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        .student-name-en {
            font-size: 2.5mm;
            color: rgba(255,255,255,0.85);
            margin-bottom: 2mm;
            font-style: italic;
        }
        .student-id-container {
            margin-bottom: 2mm;
        }
        .student-id-label {
            font-size: 1.8mm;
            color: #ffd700;
            text-transform: uppercase;
            letter-spacing: 0.5mm;
        }
        .student-id-number {
            font-size: 4mm;
            font-weight: bold;
            color: #ffd700;
            font-family: 'Courier New', monospace;
            letter-spacing: 0.8mm;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }
        .info-grid {
            display: table;
            width: 100%;
            margin-top: 1mm;
        }
        .info-row {
            display: table-row;
        }
        .info-label {
            display: table-cell;
            font-size: 2mm;
            color: rgba(255,255,255,0.6);
            padding: 0.5mm 0;
            width: 12mm;
        }
        .info-value {
            display: table-cell;
            font-size: 2.2mm;
            color: white;
            font-weight: 500;
            padding: 0.5mm 0;
        }
        /* QR Code Section */
        .qr-section {
            position: absolute;
            bottom: 8mm;
            left: 4mm;
            z-index: 3;
        }
        .qr-frame {
            width: 15mm;
            height: 15mm;
            background: white;
            border-radius: 1.5mm;
            padding: 1mm;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .qr-frame img {
            width: 100%;
            height: 100%;
        }
        /* Footer */
        .card-footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(90deg, rgba(0,0,0,0.5), rgba(0,0,0,0.3));
            padding: 1.5mm 4mm;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 2;
        }
        .validity-section {
            display: flex;
            gap: 4mm;
            font-size: 1.8mm;
            color: rgba(255,255,255,0.7);
        }
        .validity-item {
            display: flex;
            align-items: center;
            gap: 1mm;
        }
        .validity-label {
            color: rgba(255,255,255,0.5);
        }
        .validity-value {
            color: white;
            font-weight: 500;
        }
        .barcode-section {
            text-align: left;
        }
        .barcode-text {
            font-size: 2mm;
            font-family: 'Courier New', monospace;
            color: #ffd700;
            letter-spacing: 0.3mm;
        }
        /* Status Badge */
        .status-badge {
            position: absolute;
            top: 15mm;
            left: 4mm;
            padding: 1mm 2mm;
            border-radius: 1mm;
            font-size: 1.8mm;
            font-weight: bold;
            text-transform: uppercase;
            z-index: 3;
        }
        .status-active {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
            box-shadow: 0 2px 4px rgba(34,197,94,0.4);
        }
        .status-inactive {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            box-shadow: 0 2px 4px rgba(239,68,68,0.4);
        }
        .status-graduated {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
        }
        .status-suspended {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="card-decoration"></div>

        <!-- Header -->
        <div class="card-header">
            <div class="logo-section">
                <div class="university-logo">
                    @if($university_logo)
                        <img src="{{ $university_logo }}" alt="Logo">
                    @else
                        <span class="university-logo-text">U</span>
                    @endif
                </div>
                <div class="university-info">
                    <div class="university-name-ar">{{ $university_name_ar ?? 'جامعة يونيفرس' }}</div>
                    <div class="university-name-en">{{ $university_name ?? 'Universe University' }}</div>
                </div>
            </div>
            <div class="card-type-badge">بطاقة طالب | Student ID</div>
        </div>

        <!-- Status Badge -->
        <div class="status-badge {{ $student->status == 'ACTIVE' ? 'status-active' : ($student->status == 'GRADUATED' ? 'status-graduated' : ($student->status == 'SUSPENDED' ? 'status-suspended' : 'status-inactive')) }}">
            @if($student->status == 'ACTIVE')
                نشط | Active
            @elseif($student->status == 'GRADUATED')
                متخرج | Graduated
            @elseif($student->status == 'SUSPENDED')
                موقوف | Suspended
            @else
                {{ $student->status }}
            @endif
        </div>

        <!-- Body -->
        <div class="card-body">
            <!-- Photo -->
            <div class="photo-section">
                <div class="photo-frame">
                    @if($student->profile_picture)
                        <img src="{{ Storage::disk('public')->exists($student->profile_picture) ? Storage::disk('public')->url($student->profile_picture) : asset('storage/' . $student->profile_picture) }}" alt="صورة الطالب">
                    @else
                        <div class="photo-placeholder">
                            صورة<br>شخصية<br>Photo
                        </div>
                    @endif
                </div>
            </div>

            <!-- Info -->
            <div class="info-section">
                <div class="student-name-ar">{{ $student->name_ar ?? $student->name_en }}</div>
                <div class="student-name-en">{{ $student->name_en }}</div>

                <div class="student-id-container">
                    <div class="student-id-label">الرقم الجامعي | Student ID</div>
                    <div class="student-id-number">{{ $student->student_id }}</div>
                </div>

                <div class="info-grid">
                    <div class="info-row">
                        <span class="info-label">البرنامج:</span>
                        <span class="info-value">{{ $program?->name_ar ?? $program?->name_en ?? 'غير محدد' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">الكلية:</span>
                        <span class="info-value">{{ $program?->department?->college?->name_ar ?? $program?->department?->name_ar ?? '-' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">المستوى:</span>
                        <span class="info-value">السنة {{ $student->level ?? 1 }} - الفصل {{ $student->current_semester ?? 1 }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- QR Code -->
        <div class="qr-section">
            <div class="qr-frame">
                @if(str_starts_with($qr_code ?? '', 'data:'))
                    <img src="{{ $qr_code }}" alt="QR Code">
                @elseif(!empty($qr_code))
                    <img src="{{ $qr_code }}" alt="QR Code">
                @else
                    <div style="width:100%;height:100%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:6px;">QR</div>
                @endif
            </div>
        </div>

        <!-- Footer -->
        <div class="card-footer">
            <div class="validity-section">
                <div class="validity-item">
                    <span class="validity-label">صدور:</span>
                    <span class="validity-value">{{ $validity['issue_date'] ?? now()->format('Y-m-d') }}</span>
                </div>
                <div class="validity-item">
                    <span class="validity-label">صالحة حتى:</span>
                    <span class="validity-value">{{ $validity['expiry_date'] ?? now()->addMonths(6)->format('Y-m-d') }}</span>
                </div>
            </div>
            <div class="barcode-section">
                <div class="barcode-text">{{ $barcode ?? 'UNI' . date('Y') . str_pad($student->student_id, 8, '0', STR_PAD_LEFT) }}</div>
            </div>
        </div>
    </div>
</body>
</html>
