<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مبروك! تم قبولك في الجامعة</title>
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
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .header .congrats {
            font-size: 48px;
            margin: 20px 0;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
        }
        .student-info {
            background: linear-gradient(135deg, #e8f4fd 0%, #d4edda 100%);
            border-radius: 10px;
            padding: 25px;
            margin: 20px 0;
        }
        .student-id {
            font-size: 36px;
            font-weight: bold;
            color: #1e3a5f;
            text-align: center;
            margin: 15px 0;
            letter-spacing: 3px;
        }
        .credentials-box {
            background-color: #fff3cd;
            border-right: 4px solid #ffc107;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .credentials-box h4 {
            color: #856404;
            margin-top: 0;
        }
        .credential-item {
            background-color: #fff;
            padding: 10px 15px;
            margin: 10px 0;
            border-radius: 5px;
            border: 1px solid #ddd;
        }
        .credential-label {
            font-size: 12px;
            color: #666;
        }
        .credential-value {
            font-size: 16px;
            font-weight: bold;
            color: #333;
        }
        .attachments-info {
            background-color: #e7f1ff;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .next-steps {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .next-steps h4 {
            color: #1e3a5f;
            margin-top: 0;
        }
        .footer {
            background-color: #1e3a5f;
            padding: 25px;
            text-align: center;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="congrats">🎉</div>
            <h1>مبروك! تم قبولك</h1>
            <p>في جامعة Universe</p>
        </div>

        <div class="content">
            <p class="greeting">عزيزي/عزيزتي {{ $application->full_name }}،</p>

            <p>يسعدنا أن نعلمك بأنه تمت الموافقة على طلب الالتحاق الخاص بك. نرحب بك في أسرة جامعة Universe!</p>

            <div class="student-info">
                <h3 style="margin-top: 0; text-align: center; color: #1e3a5f;">رقمك الجامعي</h3>
                <div class="student-id">{{ $application->student_id }}</div>
                <p style="text-align: center; color: #666; margin-bottom: 0;">احتفظ بهذا الرقم - ستحتاجه في جميع معاملاتك الجامعية</p>
            </div>

            <div class="credentials-box">
                <h4>بيانات الدخول لنظام معلومات الطلاب (SIS)</h4>
                <div class="credential-item">
                    <div class="credential-label">البريد الجامعي:</div>
                    <div class="credential-value">{{ $user->email }}</div>
                </div>
                <div class="credential-item">
                    <div class="credential-label">كلمة المرور المؤقتة:</div>
                    <div class="credential-value">{{ $temporaryPassword }}</div>
                </div>
                <p style="color: #856404; font-size: 14px; margin-bottom: 0;">
                    <strong>هام:</strong> يرجى تغيير كلمة المرور فور تسجيل الدخول الأول.
                </p>
            </div>

            <div class="attachments-info">
                <h4 style="margin-top: 0; color: #0d6efd;">📎 المرفقات</h4>
                <p>تم إرفاق الوثائق التالية مع هذا البريد:</p>
                <ul>
                    <li>خطاب القبول الرسمي</li>
                    <li>بطاقة الجامعة</li>
                </ul>
            </div>

            <div class="next-steps">
                <h4>الخطوات التالية</h4>
                <ol>
                    <li>قم بطباعة خطاب القبول وبطاقة الجامعة</li>
                    <li>سجل الدخول لنظام معلومات الطلاب وغير كلمة المرور</li>
                    <li>أكمل بيانات ملفك الشخصي</li>
                    <li>اطلع على التقويم الأكاديمي ومواعيد التسجيل</li>
                    <li>راجع خطتك الدراسية والمقررات المتاحة</li>
                </ol>
            </div>
        </div>

        <div class="footer">
            <p style="font-size: 18px; margin: 0;">مرحباً بك في جامعة Universe</p>
            <p style="margin: 10px 0 0;">بوابتك نحو المستقبل</p>
        </div>
    </div>
</body>
</html>
