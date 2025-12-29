<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تم التحقق من المستندات</title>
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
        .success-box {
            background-color: #d4edda;
            border-right: 4px solid #28a745;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            text-align: center;
        }
        .success-icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .success-text {
            font-size: 20px;
            font-weight: bold;
            color: #155724;
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

            <p>يسعدنا إبلاغك بأنه تم التحقق من جميع المستندات الخاصة بطلب الالتحاق رقم #{{ $application->id }} بنجاح.</p>

            <div class="success-box">
                <div class="success-icon">✅</div>
                <div class="success-text">تم التحقق من المستندات بنجاح</div>
            </div>

            <p>الخطوة التالية هي دفع رسوم التسجيل. سيصلك إشعار قريباً بتفاصيل الدفع.</p>

            <p style="color: #666;">شكراً لثقتك بجامعتنا.</p>
        </div>

        <div class="footer">
            <p>مع تحيات فريق القبول والتسجيل</p>
            <p>جامعة Universe</p>
        </div>
    </div>
</body>
</html>
