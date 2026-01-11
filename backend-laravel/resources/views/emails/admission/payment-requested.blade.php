<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مطلوب دفع رسوم التسجيل</title>
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
        .payment-box {
            background-color: #e7f1ff;
            border-right: 4px solid #0d6efd;
            padding: 25px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .payment-amount {
            font-size: 36px;
            font-weight: bold;
            color: #0d6efd;
            text-align: center;
            margin: 20px 0;
        }
        .payment-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .payment-details h4 {
            margin-top: 0;
            color: #333;
        }
        .payment-details p {
            margin: 10px 0;
            color: #555;
        }
        .warning-box {
            background-color: #fff3cd;
            border-right: 4px solid #ffc107;
            padding: 15px;
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

            <p>تهانينا! تم التحقق من طلبك ومستنداتك بنجاح. لإتمام عملية التسجيل، يرجى دفع رسوم التسجيل.</p>

            <div class="payment-box">
                <h3 style="margin-top: 0; text-align: center; color: #0d6efd;">رسوم التسجيل المطلوبة</h3>
                <div class="payment-amount">{{ number_format($application->registration_fee, 2) }} دولار</div>
            </div>

            <div class="payment-details">
                <h4>طرق الدفع المتاحة:</h4>
                <p>1. التحويل البنكي على الحساب التالي:</p>
                <ul>
                    <li>البنك: البنك الوطني</li>
                    <li>رقم الحساب: XXXX-XXXX-XXXX-XXXX</li>
                    <li>IBAN: SAXXXXXXXXXXXXXXXXXX</li>
                </ul>
                <p>2. الدفع عبر الموقع الإلكتروني</p>
                <p>3. الدفع المباشر في مقر الجامعة</p>
            </div>

            <div class="warning-box">
                <strong>ملاحظة هامة:</strong> يرجى إرفاق إيصال الدفع أو التواصل مع القسم المالي لتأكيد الدفع. رقم الطلب للإشارة: #{{ $application->id }}
            </div>
        </div>

        <div class="footer">
            <p>مع تحيات فريق القبول والتسجيل</p>
            <p>جامعة Universe</p>
        </div>
    </div>
</body>
</html>
