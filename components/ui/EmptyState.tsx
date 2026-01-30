import React from 'react';
import {
  FileText,
  Users,
  BookOpen,
  Calendar,
  CreditCard,
  Bell,
  Search,
  Inbox,
  FolderOpen,
  ClipboardList,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  FileX,
  UserX,
  ShoppingCart,
  Archive,
} from 'lucide-react';

type EmptyStateType =
  | 'no-data'
  | 'no-results'
  | 'no-courses'
  | 'no-students'
  | 'no-notifications'
  | 'no-messages'
  | 'no-payments'
  | 'no-documents'
  | 'no-schedule'
  | 'no-assignments'
  | 'empty-cart'
  | 'error'
  | 'success'
  | 'pending';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  lang?: 'en' | 'ar';
  className?: string;
}

const translations = {
  'no-data': {
    title: { en: 'No Data Available', ar: 'لا توجد بيانات' },
    description: { en: 'There is no data to display at the moment.', ar: 'لا توجد بيانات للعرض حالياً.' },
  },
  'no-results': {
    title: { en: 'No Results Found', ar: 'لم يتم العثور على نتائج' },
    description: { en: 'Try adjusting your search or filter criteria.', ar: 'جرب تعديل معايير البحث أو التصفية.' },
  },
  'no-courses': {
    title: { en: 'No Courses', ar: 'لا توجد مقررات' },
    description: { en: 'You are not enrolled in any courses yet.', ar: 'لم تسجل في أي مقررات بعد.' },
  },
  'no-students': {
    title: { en: 'No Students', ar: 'لا يوجد طلاب' },
    description: { en: 'There are no students in this list.', ar: 'لا يوجد طلاب في هذه القائمة.' },
  },
  'no-notifications': {
    title: { en: 'No Notifications', ar: 'لا توجد إشعارات' },
    description: { en: "You're all caught up! No new notifications.", ar: 'أنت على اطلاع! لا توجد إشعارات جديدة.' },
  },
  'no-messages': {
    title: { en: 'No Messages', ar: 'لا توجد رسائل' },
    description: { en: 'Your inbox is empty.', ar: 'صندوق الوارد فارغ.' },
  },
  'no-payments': {
    title: { en: 'No Payment History', ar: 'لا يوجد سجل دفعات' },
    description: { en: 'You have no payment records yet.', ar: 'لا توجد لديك سجلات دفع بعد.' },
  },
  'no-documents': {
    title: { en: 'No Documents', ar: 'لا توجد مستندات' },
    description: { en: 'No documents have been uploaded yet.', ar: 'لم يتم رفع أي مستندات بعد.' },
  },
  'no-schedule': {
    title: { en: 'No Schedule', ar: 'لا يوجد جدول' },
    description: { en: 'No classes scheduled for this period.', ar: 'لا توجد حصص مجدولة لهذه الفترة.' },
  },
  'no-assignments': {
    title: { en: 'No Assignments', ar: 'لا توجد واجبات' },
    description: { en: 'No assignments due at the moment.', ar: 'لا توجد واجبات مستحقة حالياً.' },
  },
  'empty-cart': {
    title: { en: 'Cart is Empty', ar: 'السلة فارغة' },
    description: { en: 'Add courses to your registration cart.', ar: 'أضف مقررات إلى سلة التسجيل.' },
  },
  error: {
    title: { en: 'Something Went Wrong', ar: 'حدث خطأ ما' },
    description: { en: 'An error occurred. Please try again later.', ar: 'حدث خطأ. يرجى المحاولة مرة أخرى لاحقاً.' },
  },
  success: {
    title: { en: 'Success!', ar: 'تم بنجاح!' },
    description: { en: 'Your action was completed successfully.', ar: 'تم إكمال العملية بنجاح.' },
  },
  pending: {
    title: { en: 'Pending', ar: 'قيد الانتظار' },
    description: { en: 'Your request is being processed.', ar: 'جاري معالجة طلبك.' },
  },
};

const iconMap: Record<EmptyStateType, React.FC<{ className?: string }>> = {
  'no-data': Inbox,
  'no-results': Search,
  'no-courses': BookOpen,
  'no-students': Users,
  'no-notifications': Bell,
  'no-messages': MessageSquare,
  'no-payments': CreditCard,
  'no-documents': FileText,
  'no-schedule': Calendar,
  'no-assignments': ClipboardList,
  'empty-cart': ShoppingCart,
  error: AlertCircle,
  success: CheckCircle,
  pending: Clock,
};

const colorMap: Record<EmptyStateType, string> = {
  'no-data': 'text-slate-400 bg-slate-100',
  'no-results': 'text-blue-400 bg-blue-100',
  'no-courses': 'text-purple-400 bg-purple-100',
  'no-students': 'text-green-400 bg-green-100',
  'no-notifications': 'text-yellow-400 bg-yellow-100',
  'no-messages': 'text-indigo-400 bg-indigo-100',
  'no-payments': 'text-emerald-400 bg-emerald-100',
  'no-documents': 'text-orange-400 bg-orange-100',
  'no-schedule': 'text-cyan-400 bg-cyan-100',
  'no-assignments': 'text-pink-400 bg-pink-100',
  'empty-cart': 'text-violet-400 bg-violet-100',
  error: 'text-red-400 bg-red-100',
  success: 'text-green-400 bg-green-100',
  pending: 'text-amber-400 bg-amber-100',
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'no-data',
  title,
  description,
  icon,
  action,
  secondaryAction,
  lang = 'en',
  className = '',
}) => {
  const Icon = iconMap[type];
  const colors = colorMap[type];
  const defaultTitle = translations[type]?.title[lang] || translations['no-data'].title[lang];
  const defaultDescription = translations[type]?.description[lang] || translations['no-data'].description[lang];

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className={`p-4 rounded-full mb-4 ${colors}`}>
        {icon || <Icon className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title || defaultTitle}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description || defaultDescription}</p>
      {(action || secondaryAction) && (
        <div className="flex flex-wrap gap-3 justify-center">
          {action && (
            <button
              onClick={action.onClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Specialized Empty States
export const NoSearchResults: React.FC<{ query?: string; lang?: 'en' | 'ar'; onClear?: () => void }> = ({
  query,
  lang = 'en',
  onClear,
}) => (
  <EmptyState
    type="no-results"
    title={lang === 'en' ? `No results for "${query}"` : `لا توجد نتائج لـ "${query}"`}
    description={
      lang === 'en'
        ? 'Try different keywords or check your spelling.'
        : 'جرب كلمات مختلفة أو تحقق من الإملاء.'
    }
    action={onClear ? { label: lang === 'en' ? 'Clear Search' : 'مسح البحث', onClick: onClear } : undefined}
    lang={lang}
  />
);

export const NoCoursesEnrolled: React.FC<{ lang?: 'en' | 'ar'; onBrowse?: () => void }> = ({
  lang = 'en',
  onBrowse,
}) => (
  <EmptyState
    type="no-courses"
    action={onBrowse ? { label: lang === 'en' ? 'Browse Courses' : 'تصفح المقررات', onClick: onBrowse } : undefined}
    lang={lang}
  />
);

export const EmptyNotifications: React.FC<{ lang?: 'en' | 'ar' }> = ({ lang = 'en' }) => (
  <EmptyState type="no-notifications" lang={lang} />
);

export const EmptyCart: React.FC<{ lang?: 'en' | 'ar'; onBrowse?: () => void }> = ({ lang = 'en', onBrowse }) => (
  <EmptyState
    type="empty-cart"
    action={onBrowse ? { label: lang === 'en' ? 'Browse Courses' : 'تصفح المقررات', onClick: onBrowse } : undefined}
    lang={lang}
  />
);

export const ErrorState: React.FC<{ message?: string; lang?: 'en' | 'ar'; onRetry?: () => void }> = ({
  message,
  lang = 'en',
  onRetry,
}) => (
  <EmptyState
    type="error"
    description={message}
    action={onRetry ? { label: lang === 'en' ? 'Try Again' : 'حاول مرة أخرى', onClick: onRetry } : undefined}
    lang={lang}
  />
);

export const SuccessState: React.FC<{ message?: string; lang?: 'en' | 'ar'; onContinue?: () => void }> = ({
  message,
  lang = 'en',
  onContinue,
}) => (
  <EmptyState
    type="success"
    description={message}
    action={onContinue ? { label: lang === 'en' ? 'Continue' : 'متابعة', onClick: onContinue } : undefined}
    lang={lang}
  />
);

export const PendingState: React.FC<{ message?: string; lang?: 'en' | 'ar' }> = ({ message, lang = 'en' }) => (
  <EmptyState type="pending" description={message} lang={lang} />
);

export default EmptyState;
