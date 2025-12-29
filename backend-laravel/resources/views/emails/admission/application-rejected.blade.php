<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نتيجة طلب الالتحاق</title>
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
        .result-box {
            background-color: #f8d7da;
            border-right: 4px solid #dc3545;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .reason-box {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
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

            <p>نشكرك على اهتمامك بالالتحاق بجامعة Universe والتقدم بطلب الالتحاق رقم #{{ $application->id }}.</p>

            <div class="result-box">
                <p style="margin: 0;"><strong>نأسف لإبلاغك بأن طلبك لم يُقبل في هذه المرحلة.</strong></p>
            </div>

            <div class="reason-box">
                <h4 style="margin-top: 0;">سبب عدم القبول:</h4>
                <p>{{ $reason }}</p>
            </div>

            <p>نشجعك على:</p>
            <ul>
                <li>مراجعة شروط القبول للبرنامج المطلوب</li>
                <li>التقدم مرة أخرى في الفترات القادمة إذا استوفيت الشروط</li>
                <li>التواصل مع قسم القبول والتسجيل للاستفسار عن البرامج الأخرى المتاحة</li>
            </ul>

            <p style="color: #666;">نتمنى لك كل التوفيق في مسيرتك الأكاديمية.</p>
        </div>

        <div class="footer">
            <p>مع تحيات فريق القبول والتسجيل</p>
            <p>جامعة Universe</p>
        </div>
    </div>
</body>
</html>
