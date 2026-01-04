import React from 'react';
import { GraduationCap, BookOpen, Calendar, CreditCard } from 'lucide-react';

interface SimpleStudentDashboardProps {
  lang: 'en' | 'ar';
  student: any;
}

// This is a SIMPLE dashboard with NO API CALLS for testing
const SimpleStudentDashboard: React.FC<SimpleStudentDashboardProps> = ({ lang, student }) => {
  const isRTL = lang === 'ar';

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-bold mb-6">
        {isRTL ? 'مرحباً' : 'Welcome'}, {student?.name || student?.email || 'Student'}!
      </h1>

      <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded mb-6">
        <p className="font-bold">
          {isRTL ? '✅ تم تسجيل الدخول بنجاح كطالب!' : '✅ Successfully logged in as Student!'}
        </p>
        <p className="text-sm mt-2">
          Role: {student?.role} | Email: {student?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{isRTL ? 'المعدل التراكمي' : 'GPA'}</p>
              <p className="text-2xl font-bold">3.50</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{isRTL ? 'المواد المسجلة' : 'Enrolled Courses'}</p>
              <p className="text-2xl font-bold">5</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{isRTL ? 'الساعات المكتملة' : 'Credits Completed'}</p>
              <p className="text-2xl font-bold">45</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-full">
              <CreditCard className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{isRTL ? 'الرصيد' : 'Balance'}</p>
              <p className="text-2xl font-bold">$0.00</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">
          {isRTL ? 'معلومات التشخيص' : 'Debug Info'}
        </h2>
        <pre className="bg-slate-100 p-4 rounded overflow-auto text-xs">
          {JSON.stringify(student, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default SimpleStudentDashboard;
