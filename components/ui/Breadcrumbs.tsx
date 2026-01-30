import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  labelAr?: string;
  href?: string;
  icon?: React.FC<{ className?: string }>;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  lang?: 'en' | 'ar';
  showHome?: boolean;
  className?: string;
  separator?: React.ReactNode;
}

// Route to label mapping
const routeLabels: Record<string, { en: string; ar: string }> = {
  '/': { en: 'Home', ar: 'الرئيسية' },
  '/dashboard': { en: 'Dashboard', ar: 'لوحة التحكم' },
  '/academic': { en: 'Academic', ar: 'الأكاديمية' },
  '/finance': { en: 'Finance', ar: 'المالية' },
  '/profile': { en: 'Profile', ar: 'الملف الشخصي' },
  '/settings': { en: 'Settings', ar: 'الإعدادات' },
  '/admissions': { en: 'Admissions', ar: 'القبول' },
  '/lecturer': { en: 'Lecturer Portal', ar: 'بوابة المحاضر' },
  '/reports': { en: 'Reports', ar: 'التقارير' },
  '/students': { en: 'Students', ar: 'الطلاب' },
  '/courses': { en: 'Courses', ar: 'المقررات' },
  '/documents': { en: 'Documents', ar: 'المستندات' },
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  lang = 'en',
  showHome = true,
  className = '',
  separator,
}) => {
  const location = useLocation();
  const isRTL = lang === 'ar';

  // Auto-generate breadcrumbs from current path if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    if (showHome) {
      breadcrumbs.push({
        label: 'Home',
        labelAr: 'الرئيسية',
        href: '/',
        icon: Home,
      });
    }

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const routeLabel = routeLabels[currentPath];

      breadcrumbs.push({
        label: routeLabel?.en || path.charAt(0).toUpperCase() + path.slice(1),
        labelAr: routeLabel?.ar || path,
        href: index < paths.length - 1 ? currentPath : undefined,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();
  const Separator = separator || (
    isRTL ? (
      <ChevronLeft className="w-4 h-4 text-slate-400 mx-2 flex-shrink-0" />
    ) : (
      <ChevronRight className="w-4 h-4 text-slate-400 mx-2 flex-shrink-0" />
    )
  );

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-sm ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <ol className="flex items-center flex-wrap">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const Icon = item.icon;
          const label = lang === 'ar' && item.labelAr ? item.labelAr : item.label;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && Separator}
              {isLast || !item.href ? (
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  {Icon && <Icon className="w-4 h-4" />}
                  {label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Compact breadcrumbs for mobile
export const CompactBreadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  lang = 'en',
  className = '',
}) => {
  const location = useLocation();
  const isRTL = lang === 'ar';

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const routeLabel = routeLabels[currentPath];

      breadcrumbs.push({
        label: routeLabel?.en || path.charAt(0).toUpperCase() + path.slice(1),
        labelAr: routeLabel?.ar || path,
        href: index < paths.length - 1 ? currentPath : undefined,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) return null;

  const lastItem = breadcrumbItems[breadcrumbItems.length - 1];
  const parentItem = breadcrumbItems.length > 1 ? breadcrumbItems[breadcrumbItems.length - 2] : null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-sm ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {parentItem?.href && (
        <Link
          to={parentItem.href}
          className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors"
        >
          {isRTL ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
          <span>{lang === 'ar' && parentItem.labelAr ? parentItem.labelAr : parentItem.label}</span>
        </Link>
      )}
    </nav>
  );
};

// Page header with breadcrumbs
export const PageHeader: React.FC<{
  title: string;
  titleAr?: string;
  subtitle?: string;
  subtitleAr?: string;
  lang?: 'en' | 'ar';
  breadcrumbItems?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}> = ({
  title,
  titleAr,
  subtitle,
  subtitleAr,
  lang = 'en',
  breadcrumbItems,
  actions,
  className = '',
}) => {
  const isRTL = lang === 'ar';

  return (
    <div className={`space-y-2 ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Breadcrumbs items={breadcrumbItems} lang={lang} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {lang === 'ar' && titleAr ? titleAr : title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">
              {lang === 'ar' && subtitleAr ? subtitleAr : subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
};

export default Breadcrumbs;
