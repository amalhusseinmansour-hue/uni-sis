import React from 'react';
import {
  Activity, CheckCircle, XCircle, AlertCircle, FileText,
  CreditCard, BookOpen, Bell, User, Award, MessageCircle
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Badge from '../ui/Badge';

interface RecentActivityProps {
  lang: 'en' | 'ar';
}

interface ActivityItem {
  id: string;
  type: 'grade' | 'payment' | 'attendance' | 'announcement' | 'registration' | 'document' | 'support';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

const RecentActivity: React.FC<RecentActivityProps> = ({ lang }) => {
  // Mock activity data
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'grade',
      title: lang === 'ar' ? 'تم رصد درجة جديدة' : 'New Grade Posted',
      description: lang === 'ar' ? 'CS101 - اختبار نصفي: 85/100' : 'CS101 - Midterm: 85/100',
      timestamp: '2024-11-29T10:30:00',
      status: 'success',
    },
    {
      id: '2',
      type: 'payment',
      title: lang === 'ar' ? 'تم استلام الدفعة' : 'Payment Received',
      description: lang === 'ar' ? 'رسوم الفصل الدراسي - 5,000 ر.س' : 'Semester Fees - USD 5,000',
      timestamp: '2024-11-28T14:20:00',
      status: 'success',
    },
    {
      id: '3',
      type: 'attendance',
      title: lang === 'ar' ? 'تسجيل غياب' : 'Absence Recorded',
      description: lang === 'ar' ? 'MATH201 - 27 نوفمبر' : 'MATH201 - Nov 27',
      timestamp: '2024-11-27T09:00:00',
      status: 'warning',
    },
    {
      id: '4',
      type: 'announcement',
      title: lang === 'ar' ? 'إعلان جديد' : 'New Announcement',
      description: lang === 'ar' ? 'جدول الاختبارات النهائية متاح الآن' : 'Final exam schedule is now available',
      timestamp: '2024-11-26T16:45:00',
      status: 'info',
    },
    {
      id: '5',
      type: 'registration',
      title: lang === 'ar' ? 'تسجيل مقرر' : 'Course Registered',
      description: lang === 'ar' ? 'تم تسجيلك في CS301 بنجاح' : 'Successfully registered for CS301',
      timestamp: '2024-11-25T11:15:00',
      status: 'success',
    },
    {
      id: '6',
      type: 'support',
      title: lang === 'ar' ? 'رد على تذكرة الدعم' : 'Support Ticket Reply',
      description: lang === 'ar' ? 'تم الرد على استفسارك' : 'Your inquiry has been answered',
      timestamp: '2024-11-24T13:30:00',
      status: 'info',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'grade':
        return Award;
      case 'payment':
        return CreditCard;
      case 'attendance':
        return CheckCircle;
      case 'announcement':
        return Bell;
      case 'registration':
        return BookOpen;
      case 'document':
        return FileText;
      case 'support':
        return MessageCircle;
      default:
        return Activity;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-600';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      case 'error':
        return 'bg-red-100 text-red-600';
      case 'info':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return lang === 'ar' ? `منذ ${diffMins} دقيقة` : `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return lang === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return lang === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <Card>
      <CardHeader
        title={lang === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
        icon={Activity}
        iconColor="text-purple-600 bg-purple-50"
      />
      <CardBody noPadding>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-0 bottom-0 left-7 w-px bg-slate-200"></div>

          <div className="space-y-0">
            {activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div
                  key={activity.id}
                  className="relative flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors"
                >
                  {/* Icon */}
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(activity.status)}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-800">{activity.title}</h4>
                    <p className="text-sm text-slate-500 mt-0.5">{activity.description}</p>
                    <span className="text-xs text-slate-400 mt-1 block">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-3 text-center border-t border-slate-100">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            {lang === 'ar' ? 'عرض كل النشاط' : 'View All Activity'} →
          </button>
        </div>
      </CardBody>
    </Card>
  );
};

export default RecentActivity;
