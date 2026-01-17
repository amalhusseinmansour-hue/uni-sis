import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, AlertTriangle, FileText, BookOpen,
  CheckCircle, ChevronRight, Bell
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Badge from '../ui/Badge';

interface UpcomingDeadlinesProps {
  lang: 'en' | 'ar';
}

interface Deadline {
  id: string;
  type: 'exam' | 'assignment' | 'registration' | 'payment' | 'event';
  title: string;
  course?: string;
  date: string;
  time?: string;
  urgent: boolean;
}

const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ lang }) => {
  const navigate = useNavigate();

  // Mock deadlines data
  const deadlines: Deadline[] = [
    {
      id: '1',
      type: 'exam',
      title: lang === 'ar' ? 'اختبار نهائي' : 'Final Exam',
      course: 'CS101',
      date: '2024-12-20',
      time: '09:00',
      urgent: true,
    },
    {
      id: '2',
      type: 'assignment',
      title: lang === 'ar' ? 'واجب برمجة' : 'Programming Assignment',
      course: 'CS201',
      date: '2024-12-15',
      time: '23:59',
      urgent: true,
    },
    {
      id: '3',
      type: 'registration',
      title: lang === 'ar' ? 'آخر موعد للتسجيل' : 'Registration Deadline',
      date: '2024-12-18',
      urgent: false,
    },
    {
      id: '4',
      type: 'payment',
      title: lang === 'ar' ? 'موعد سداد الرسوم' : 'Fee Payment Due',
      date: '2024-12-25',
      urgent: false,
    },
    {
      id: '5',
      type: 'exam',
      title: lang === 'ar' ? 'اختبار نهائي' : 'Final Exam',
      course: 'MATH201',
      date: '2024-12-22',
      time: '14:00',
      urgent: false,
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exam':
        return <FileText className="w-4 h-4" />;
      case 'assignment':
        return <BookOpen className="w-4 h-4" />;
      case 'registration':
        return <CheckCircle className="w-4 h-4" />;
      case 'payment':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exam':
        return 'bg-red-100 text-red-600';
      case 'assignment':
        return 'bg-blue-100 text-blue-600';
      case 'registration':
        return 'bg-green-100 text-green-600';
      case 'payment':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      exam: { en: 'Exam', ar: 'اختبار' },
      assignment: { en: 'Assignment', ar: 'واجب' },
      registration: { en: 'Registration', ar: 'تسجيل' },
      payment: { en: 'Payment', ar: 'دفع' },
      event: { en: 'Event', ar: 'حدث' },
    };
    return labels[type]?.[lang] || type;
  };

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleClick = (deadline: Deadline) => {
    switch (deadline.type) {
      case 'exam':
        navigate('/exams');
        break;
      case 'assignment':
        navigate('/academic?tab=courses');
        break;
      case 'registration':
        navigate('/academic?tab=register');
        break;
      case 'payment':
        navigate('/finance?tab=payments');
        break;
      default:
        break;
    }
  };

  const sortedDeadlines = [...deadlines].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <Card>
      <CardHeader
        title={lang === 'ar' ? 'المواعيد القادمة' : 'Upcoming Deadlines'}
        icon={Clock}
        iconColor="text-orange-600 bg-orange-50"
        action={
          <Badge variant="warning">
            {sortedDeadlines.filter(d => getDaysUntil(d.date) <= 7).length} {lang === 'ar' ? 'هذا الأسبوع' : 'this week'}
          </Badge>
        }
      />
      <CardBody noPadding>
        <div className="divide-y divide-slate-100">
          {sortedDeadlines.slice(0, 5).map((deadline) => {
            const daysUntil = getDaysUntil(deadline.date);
            return (
              <div
                key={deadline.id}
                onClick={() => handleClick(deadline)}
                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                  deadline.urgent || daysUntil <= 3 ? 'bg-red-50/50' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(deadline.type)}`}>
                  {getTypeIcon(deadline.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {deadline.course && (
                      <span className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {deadline.course}
                      </span>
                    )}
                    <span className="text-xs text-slate-500">{getTypeLabel(deadline.type)}</span>
                  </div>
                  <h4 className="font-medium text-slate-800 truncate">{deadline.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(deadline.date)}</span>
                    {deadline.time && (
                      <>
                        <Clock className="w-3 h-3 ms-2" />
                        <span>{deadline.time}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-end">
                  {daysUntil <= 0 ? (
                    <Badge variant="danger">
                      {lang === 'ar' ? 'اليوم!' : 'Today!'}
                    </Badge>
                  ) : daysUntil <= 3 ? (
                    <Badge variant="danger">
                      {daysUntil} {lang === 'ar' ? 'أيام' : 'days'}
                    </Badge>
                  ) : daysUntil <= 7 ? (
                    <Badge variant="warning">
                      {daysUntil} {lang === 'ar' ? 'أيام' : 'days'}
                    </Badge>
                  ) : (
                    <span className="text-sm text-slate-500">
                      {daysUntil} {lang === 'ar' ? 'يوم' : 'days'}
                    </span>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            );
          })}
        </div>

        {sortedDeadlines.length > 5 && (
          <div className="p-3 text-center border-t border-slate-100">
            <button
              onClick={() => navigate('/schedule')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {lang === 'ar' ? 'عرض كل المواعيد' : 'View All Deadlines'} →
            </button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default UpcomingDeadlines;
