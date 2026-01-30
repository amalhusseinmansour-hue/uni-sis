import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Calendar, CreditCard, FileText, Download,
  MessageCircle, Bell, User, Settings, HelpCircle,
  ClipboardList, Award, Printer, Upload
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';

interface QuickActionsProps {
  lang: 'en' | 'ar';
  userRole: 'STUDENT' | 'LECTURER' | 'ADMIN' | 'FINANCE';
}

interface QuickAction {
  id: string;
  icon: React.FC<{ className?: string }>;
  label: { en: string; ar: string };
  path: string;
  color: string;
  roles: string[];
}

const allActions: QuickAction[] = [
  // Course registration removed - students cannot self-register, must go through Student Affairs
  {
    id: 'schedule',
    icon: Calendar,
    label: { en: 'View Schedule', ar: 'عرض الجدول' },
    path: '/schedule',
    color: 'bg-purple-500 hover:bg-purple-600',
    roles: ['STUDENT', 'LECTURER'],
  },
  {
    id: 'grades',
    icon: Award,
    label: { en: 'View Grades', ar: 'عرض الدرجات' },
    path: '/academic?tab=grades',
    color: 'bg-green-500 hover:bg-green-600',
    roles: ['STUDENT'],
  },
  {
    id: 'pay',
    icon: CreditCard,
    label: { en: 'Pay Fees', ar: 'دفع الرسوم' },
    path: '/finance?tab=payments',
    color: 'bg-emerald-500 hover:bg-emerald-600',
    roles: ['STUDENT'],
  },
  {
    id: 'exams',
    icon: ClipboardList,
    label: { en: 'Exam Schedule', ar: 'جدول الاختبارات' },
    path: '/exams',
    color: 'bg-orange-500 hover:bg-orange-600',
    roles: ['STUDENT', 'LECTURER'],
  },
  {
    id: 'attendance',
    icon: FileText,
    label: { en: 'Attendance', ar: 'الحضور' },
    path: '/attendance',
    color: 'bg-cyan-500 hover:bg-cyan-600',
    roles: ['STUDENT', 'LECTURER'],
  },
  {
    id: 'support',
    icon: MessageCircle,
    label: { en: 'Get Support', ar: 'طلب المساعدة' },
    path: '/support',
    color: 'bg-pink-500 hover:bg-pink-600',
    roles: ['STUDENT', 'LECTURER', 'ADMIN', 'FINANCE'],
  },
  {
    id: 'profile',
    icon: User,
    label: { en: 'My Profile', ar: 'ملفي الشخصي' },
    path: '/profile',
    color: 'bg-indigo-500 hover:bg-indigo-600',
    roles: ['STUDENT', 'LECTURER'],
  },
  {
    id: 'transcript',
    icon: Download,
    label: { en: 'Download Transcript', ar: 'تحميل السجل' },
    path: '/academic?tab=documents',
    color: 'bg-slate-500 hover:bg-slate-600',
    roles: ['STUDENT'],
  },
  {
    id: 'reports',
    icon: FileText,
    label: { en: 'View Reports', ar: 'عرض التقارير' },
    path: '/reports',
    color: 'bg-violet-500 hover:bg-violet-600',
    roles: ['ADMIN', 'FINANCE'],
  },
  {
    id: 'applications',
    icon: ClipboardList,
    label: { en: 'Applications', ar: 'الطلبات' },
    path: '/admissions?tab=applications',
    color: 'bg-amber-500 hover:bg-amber-600',
    roles: ['ADMIN'],
  },
  {
    id: 'students',
    icon: User,
    label: { en: 'Manage Students', ar: 'إدارة الطلاب' },
    path: '/admissions?tab=students',
    color: 'bg-teal-500 hover:bg-teal-600',
    roles: ['ADMIN'],
  },
  {
    id: 'my-courses',
    icon: BookOpen,
    label: { en: 'My Courses', ar: 'مقرراتي' },
    path: '/lecturer?tab=courses',
    color: 'bg-blue-500 hover:bg-blue-600',
    roles: ['LECTURER'],
  },
  {
    id: 'grade-students',
    icon: Award,
    label: { en: 'Grade Students', ar: 'رصد الدرجات' },
    path: '/lecturer?tab=grades',
    color: 'bg-green-500 hover:bg-green-600',
    roles: ['LECTURER'],
  },
];

const QuickActions: React.FC<QuickActionsProps> = ({ lang, userRole }) => {
  const navigate = useNavigate();

  const filteredActions = allActions.filter(action => action.roles.includes(userRole));

  return (
    <Card>
      <CardHeader
        title={lang === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
        icon={Settings}
        iconColor="text-blue-600 bg-blue-50"
      />
      <CardBody>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredActions.map((action) => (
            <button
              key={action.id}
              onClick={() => navigate(action.path)}
              className={`${action.color} text-white rounded-xl p-4 flex flex-col items-center gap-2 transition-all transform hover:scale-105 hover:shadow-lg`}
            >
              <action.icon className="w-6 h-6" />
              <span className="text-xs font-medium text-center">
                {action.label[lang]}
              </span>
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default QuickActions;
