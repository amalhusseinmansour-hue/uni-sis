<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تم استلام طلب الالتحاق</title>
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
        .info-box {
            background-color: #e8f4fd;
            border-right: 4px solid #2c5282;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 5px 0;
            border-bottom: 1px dashed #ddd;
        }
        .info-label {
            color: #666;
            font-weight: bold;
        }
        .info-value {
            color: #333;
        }
        .status-badge {
            display: inline-block;
            background-color: #ffc107;
            color: #333;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
        }
        .next-steps {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .next-steps h3 {
            color: #2c5282;
            margin-top: 0;
        }
        .next-steps ul {
            padding-right: 20px;
            margin: 0;
        }
        .next-steps li {
            margin: 10px 0;
            color: #555;
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

            <p>نشكرك على تقديم طلب الالتحاق بجامعتنا. تم استلام طلبك بنجاح وسيتم مراجعته من قبل فريق القبول والتسجيل.</p>

            <div class="info-box">
                <h3 style="margin-top: 0; color: #2c5282;">تفاصيل الطلب</h3>
                <div class="info-row">
                    <span class="info-label">رقم الطلب:</span>
                    <span class="info-value">#{{ $application->id }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">تاريخ التقديم:</span>
                    <span class="info-value">{{ $application->created_at->format('Y-m-d H:i') }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">البرنامج المطلوب:</span>
                    <span class="info-value">{{ $application->program?->name ?? $application->program_name ?? 'غير محدد' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">حالة الطلب:</span>
                    <span class="status-badge">قيد الانتظار</span>
                </div>
            </div>

            <div class="next-steps">
                <h3>الخطوات التالية</h3>
                <ul>
                    <li>سيقوم فريق القبول والتسجيل بمراجعة طلبك والمستندات المرفقة</li>
                    <li>ستتلقى إشعاراً عبر البريد الإلكتروني بأي تحديثات على حالة طلبك</li>
                    <li>في حال الحاجة لمستندات إضافية، سيتم التواصل معك</li>
                    <li>بعد الموافقة على الطلب، سيُطلب منك دفع رسوم التسجيل</li>
                </ul>
            </div>

            <p style="color: #666;">إذا كان لديك أي استفسارات، يرجى التواصل معنا عبر البريد الإلكتروني أو الهاتف.</p>
        </div>

        <div class="footer">
            <p>مع تحيات فريق القبول والتسجيل</p>
            <p>جامعة Universe - بوابتك نحو المستقبل</p>
        </div>
    </div>
</body>
</html>
