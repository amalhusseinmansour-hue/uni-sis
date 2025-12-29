# 🎓 Universe SIS - Student Information System

نظام إدارة معلومات الطلاب الشامل | Comprehensive Student Information System

---

## 📋 نظرة عامة | Overview

**Universe SIS** هو نظام متكامل لإدارة الشؤون الأكاديمية والإدارية للطلبة من مرحلة القبول وحتى التخرج، مع تكامل كامل مع Moodle LMS وأنظمة الدفع الإلكتروني.

A comprehensive student information system for managing academic and administrative affairs from admission to graduation, with full integration with Moodle LMS and payment gateways.

---

## ✨ الميزات الرئيسية | Key Features

### 🔐 **المصادقة والصلاحيات**
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ 5 أنواع مستخدمين: Student, Lecturer, Admin, Finance, Registrar
- ✅ تشفير كلمات المرور (bcrypt)

### 👨‍🎓 **إدارة الطلاب**
- ✅ ملفات طلابية كاملة (أكاديمية + شخصية + مالية)
- ✅ تتبع المعدل التراكمي (GPA)
- ✅ الساعات المكتسبة والمتطلبات
- ✅ الحالة الأكاديمية والإنذارات

### 📚 **إدارة المساقات**
- ✅ كتالوج المساقات الدراسية
- ✅ المتطلبات السابقة (Prerequisites)
- ✅ الشعب الدراسية (Course Sections)
- ✅ الجداول والمواعيد
- ✅ كشف التسجيل والانسحاب

### 📝 **التسجيل والقبول**
- ✅ طلبات القبول الإلكترونية
- ✅ التحقق من الأهلية للتسجيل
- ✅ كشف التعارض الزمني
- ✅ التحقق من المتطلبات السابقة
- ✅ السحب والإضافة (Add/Drop)

### 💰 **المالية**
- ✅ إنشاء الفواتير تلقائياً
- ✅ تتبع المدفوعات والديون
- ✅ تكامل Stripe للدفع الإلكتروني
- ✅ المنح والخصومات
- ✅ التقارير المالية

### 👨‍🏫 **بوابة المحاضرين**
- ✅ إدارة المساقات المكلف بها
- ✅ إدخال الدرجات
- ✅ مشاهدة الحضور
- ✅ قوائم الطلاب

### 🔗 **التكامل مع Moodle**
- ✅ مزامنة المستخدمين تلقائياً
- ✅ مزامنة التسجيلات
- ✅ استيراد الدرجات من Moodle
- ✅ استيراد الحضور من BBB/Moodle

### 🔔 **نظام الإشعارات**
- ✅ إشعارات بالبريد الإلكتروني (Nodemailer)
- ✅ إشعارات SMS (Twilio)
- ✅ إشعارات داخل النظام
- ✅ إشعارات أكاديمية ومالية

### 📊 **التقارير**
- ✅ كشوف الدرجات (PDF)
- ✅ التقارير المالية (Excel)
- ✅ السجل الأكاديمي الرسمي
- ✅ تقارير الحضور

### 🌐 **دعم اللغات**
- ✅ العربية والإنجليزية بالكامل
- ✅ واجهة متعددة اللغات
- ✅ تبديل سلس بين اللغات

---

## 🏗️ البنية التقنية | Tech Stack

### Frontend
- **Framework**: React 19.2.0
- **Language**: TypeScript
- **Routing**: React Router v7
- **Build Tool**: Vite
- **UI Icons**: Lucide React
- **Charts**: Recharts
- **AI**: Google Gemini

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Payment**: Stripe
- **Email**: Nodemailer
- **SMS**: Twilio
- **PDF**: PDFKit
- **Excel**: ExcelJS
- **Logging**: Winston

---

## 📦 التثبيت | Installation

### المتطلبات | Prerequisites

```bash
- Node.js 18+ and npm
- PostgreSQL 14+
- Redis (optional)
```

### 1. استنساخ المشروع | Clone Repository

```bash
git clone <repository-url>
cd universe-sis
```

### 2. تثبيت Frontend

```bash
# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local and add your Gemini API key
```

### 3. تثبيت Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and configure all required variables:
# - DATABASE_URL
# - JWT_SECRET
# - MOODLE_URL, MOODLE_TOKEN
# - STRIPE_SECRET_KEY
# - SMTP credentials
# - TWILIO credentials

# Generate Prisma Client
npm run db:generate

# Create/Update database schema
npm run db:push

# Seed database with sample data
npm run db:seed
```

---

## 🚀 التشغيل | Running the Application

### الطريقة السريعة | Quick Start

#### 1. تشغيل قاعدة البيانات

```bash
# Using Docker (recommended)
docker-compose up -d postgres redis
```

#### 2. تشغيل Backend

```bash
cd backend
npm run dev
```

Backend يعمل على: `http://localhost:5000`

#### 3. تشغيل Frontend

```bash
# في نافذة terminal أخرى | In another terminal
npm run dev
```

Frontend يعمل على: `http://localhost:3000`

---

## 🔑 بيانات الدخول التجريبية | Test Credentials

بعد تشغيل `npm run db:seed`:

| النوع | البريد الإلكتروني | كلمة المرور |
|-------|-------------------|--------------|
| **مدير** (Admin) | admin@university.edu | Admin123! |
| **محاضر** (Lecturer) | sarah.smith@university.edu | Lecturer123! |
| **طالب** (Student) | ahmed.mansour@student.university.edu | Student123! |

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register        - تسجيل مستخدم جديد
POST   /api/auth/login           - تسجيل الدخول
GET    /api/auth/profile         - الملف الشخصي
PUT    /api/auth/profile         - تحديث الملف الشخصي
POST   /api/auth/change-password - تغيير كلمة المرور
```

### Students
```
GET    /api/students             - جميع الطلاب (Admin)
GET    /api/students/me          - ملفي الشخصي (Student)
GET    /api/students/:id         - طالب محدد
PUT    /api/students/:id         - تحديث طالب
GET    /api/students/:id/enrollments - تسجيلات الطالب
GET    /api/students/:id/grades  - درجات الطالب
```

### Courses
```
GET    /api/courses              - جميع المساقات
GET    /api/courses/:id          - مساق محدد
POST   /api/courses              - إنشاء مساق (Admin)
GET    /api/courses/sections/available - الشعب المتاحة
POST   /api/courses/sections     - إنشاء شعبة (Admin)
```

### Enrollments
```
GET    /api/enrollments/check-eligibility - التحقق من الأهلية
POST   /api/enrollments          - تسجيل طالب
DELETE /api/enrollments/:id      - حذف تسجيل
GET    /api/enrollments/:id      - تفاصيل التسجيل
```

### Finance
```
GET    /api/finance/student/:id  - المالية الطالب
POST   /api/finance/payment/intent - إنشاء نية دفع
POST   /api/finance/payment/confirm - تأكيد الدفع
POST   /api/finance/invoice      - إنشاء فاتورة (Admin)
POST   /api/finance/scholarship  - تطبيق منحة (Admin)
GET    /api/finance/overdue      - الفواتير المتأخرة
```

### Reports
```
GET    /api/reports/transcript/:id   - كشف الدرجات PDF
GET    /api/reports/financial/:id    - التقرير المالي Excel
```

### Notifications
```
GET    /api/notifications        - إشعاراتي
PUT    /api/notifications/:id/read - تعليم كمقروء
POST   /api/notifications        - إنشاء إشعار (Admin)
```

---

## 🗂️ هيكل المشروع | Project Structure

```
universe-sis/
├── backend/                    # Backend API
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Sample data
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Express middleware
│   │   ├── services/          # Business logic
│   │   ├── routes/            # API routes
│   │   ├── utils/             # Utilities
│   │   └── index.ts           # Entry point
│   ├── package.json
│   └── README.md
├── api/                       # Frontend API client
│   ├── auth.ts
│   ├── students.ts
│   ├── courses.ts
│   ├── enrollments.ts
│   ├── finance.ts
│   └── index.ts
├── components/                # React components
├── pages/                     # Page components
├── services/                  # Frontend services
├── App.tsx
├── docker-compose.yml
└── README.md
```

---

## 🔧 إعداد الإنتاج | Production Setup

### 1. المتغيرات البيئية

```bash
# Backend .env
NODE_ENV=production
DATABASE_URL=<production-database-url>
JWT_SECRET=<strong-random-secret>
MOODLE_URL=<your-moodle-url>
MOODLE_TOKEN=<your-moodle-token>
STRIPE_SECRET_KEY=<your-stripe-key>
# ... other variables
```

### 2. بناء التطبيق

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd ..
npm run build
npm run preview
```

### 3. Docker Deployment

```bash
docker-compose up -d
```

---

## 🔒 الأمان | Security

- ✅ Helmet.js لحماية Headers
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Password hashing (bcrypt)
- ✅ JWT token authentication
- ✅ Input validation
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection

---

## 📈 خارطة الطريق | Roadmap

### ✅ تم الإنجاز | Completed
- ✅ Full Backend API
- ✅ Database schema
- ✅ Authentication & Authorization
- ✅ Moodle integration
- ✅ Payment gateway (Stripe)
- ✅ Email/SMS notifications
- ✅ PDF/Excel reports
- ✅ API client for Frontend
- ✅ Bilingual support (AR/EN)

### 🔄 قيد العمل | In Progress
- 🔄 Connect Frontend with Backend APIs
- 🔄 Attendance tracking system
- 🔄 Academic calendar module
- 🔄 Advanced analytics dashboard

### 📅 المخطط | Planned
- 📅 Mobile app (React Native)
- 📅 Push notifications (FCM)
- 📅 Advanced reporting
- 📅 Student portal enhancements
- 📅 Parent portal
- 📅 Alumni management
- 📅 Library integration
- 📅 Hostel management

---

## 🤝 المساهمة | Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 الترخيص | License

MIT License

---

## 📞 الدعم | Support

For issues and questions:
- Create an issue on GitHub
- Email: support@universe-sis.edu

---

## 🙏 شكر خاص | Acknowledgments

- React Team
- Express.js
- Prisma
- Moodle Community
- Stripe
- Google Gemini AI

---

**Made with ❤️ for educational institutions**

