<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>طلبك قيد المراجعة</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            direction: rtl;
            text-align: right;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
        }
        .status-box {
            background-color: #fff3cd;
            border-right: 4px solid #ffc107;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            text-align: center;
        }
        .status-icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .status-text {
            font-size: 20px;
            font-weight: bold;
            color: #856404;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>جامعة Universe</h1>
            <p>نظام القبول والتسجيل</p>
        </div>

        <div class="content">
            <p class="greeting">عزيزي/عزيزتي {{ $application->full_name }}،</p>

            <p>نود إعلامك بأن طلب الالتحاق الخاص بك (رقم #{{ $application->id }}) أصبح الآن قيد المراجعة من قبل فريق القبول والتسجيل.</p>

            <div class="status-box">
                <div class="status-icon">📋</div>
                <div class="status-text">طلبك قيد المراجعة</div>
            </div>

            <p>يقوم فريقنا حالياً بمراجعة:</p>
            <ul>
                <li>المعلومات الشخصية المقدمة</li>
                <li>المؤهلات الأكاديمية</li>
                <li>المستندات المرفقة</li>
            </ul>

            <p style="color: #666;">سنقوم بإشعارك فور الانتهاء من المراجعة. نشكرك على صبرك.</p>
        </div>

        <div class="footer">
            <p>مع تحيات فريق القبول والتسجيل</p>
            <p>جامعة Universe</p>
        </div>
    </div>
</body>
</html>
