<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تم استلام رسوم التسجيل</title>
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
            padding: 25px;
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
        .receipt-box {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .receipt-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px dashed #ddd;
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

            <p>نؤكد لك استلام رسوم التسجيل الخاصة بطلب الالتحاق رقم #{{ $application->id }}.</p>

            <div class="success-box">
                <div class="success-icon">💰</div>
                <div class="success-text">تم استلام الدفع بنجاح</div>
            </div>

            <div class="receipt-box">
                <h4 style="margin-top: 0;">تفاصيل الدفع:</h4>
                <div class="receipt-row">
                    <span>رقم المعاملة:</span>
                    <span><strong>{{ $payment->transaction_id }}</strong></span>
                </div>
                <div class="receipt-row">
                    <span>المبلغ المدفوع:</span>
                    <span><strong>{{ number_format($payment->amount, 2) }} {{ $payment->currency }}</strong></span>
                </div>
                <div class="receipt-row">
                    <span>طريقة الدفع:</span>
                    <span>{{ $payment->payment_method }}</span>
                </div>
                <div class="receipt-row">
                    <span>تاريخ الدفع:</span>
                    <span>{{ $payment->paid_at->format('Y-m-d H:i') }}</span>
                </div>
            </div>

            <p>سيتم الآن معالجة طلبك للحصول على الموافقة النهائية. ستتلقى إشعاراً قريباً بنتيجة القبول.</p>
        </div>

        <div class="footer">
            <p>مع تحيات فريق القبول والتسجيل</p>
            <p>جامعة Universe</p>
        </div>
    </div>
</body>
</html>
