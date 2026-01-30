import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  CreditCard,
  Users,
  Settings,
  LogOut,
  Presentation,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Calendar,
  FileText,
  BarChart3,
  Bell,
  HelpCircle,
  Award,
  ClipboardList,
  X,
  Table,
  FileEdit,
  PieChart,
  Cog,
  Menu as MenuIcon,
  Home,
  Wallet,
  Receipt,
  School,
  Building2,
  UserCheck,
  FileCheck,
  Clock,
  Shield,
  MessageSquare,
  AlertTriangle,
  Lightbulb,
  BookMarked,
  Palette,
  type LucideIcon,
} from 'lucide-react';
import { UserRole } from '../types';
import { useConfig } from '../context/ConfigContext';
import { useBranding } from '../context/BrandingContext';
import { MenuItem as APIMenuItem } from '../api/config';

interface SidebarProps {
  lang: 'en' | 'ar';
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
  children?: NavItem[];
}

// Icon mapping from string to component
const iconMap: Record<string, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  'home': Home,
  'graduation-cap': GraduationCap,
  'credit-card': CreditCard,
  'users': Users,
  'settings': Settings,
  'presentation': Presentation,
  'user': User,
  'book-open': BookOpen,
  'calendar': Calendar,
  'file-text': FileText,
  'bar-chart-3': BarChart3,
  'bell': Bell,
  'help-circle': HelpCircle,
  'award': Award,
  'clipboard-list': ClipboardList,
  'table': Table,
  'file-edit': FileEdit,
  'pie-chart': PieChart,
  'cog': Cog,
  'menu': MenuIcon,
  'wallet': Wallet,
  'receipt': Receipt,
  'school': School,
  'building-2': Building2,
  'user-check': UserCheck,
  'file-check': FileCheck,
  'clock': Clock,
  'shield': Shield,
  'message-square': MessageSquare,
  'alert-triangle': AlertTriangle,
  'lightbulb': Lightbulb,
  'book-marked': BookMarked,
};

// Get icon component from string
const getIcon = (iconName: string | null): LucideIcon => {
  if (!iconName) return LayoutDashboard;
  const normalized = iconName.toLowerCase().replace(/_/g, '-');
  return iconMap[normalized] || LayoutDashboard;
};

// Default translations
const t = {
  dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
  academic: { en: 'Academic', ar: 'الشؤون الأكاديمية' },
  finance: { en: 'Finance', ar: 'الشؤون المالية' },
  profile: { en: 'Profile', ar: 'الملف الشخصي' },
  lecturer: { en: 'Lecturer Portal', ar: 'بوابة المحاضر' },
  admissions: { en: 'Admissions', ar: 'القبول والتسجيل' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  logout: { en: 'Logout', ar: 'تسجيل الخروج' },
  attendance: { en: 'Attendance', ar: 'الحضور والغياب' },
  myCourses: { en: 'My Courses', ar: 'مقرراتي' },
  grades: { en: 'Grades', ar: 'الدرجات' },
  schedule: { en: 'Schedule', ar: 'الجدول الدراسي' },
  registration: { en: 'Registration', ar: 'تسجيل المقررات' },
  payments: { en: 'Payments', ar: 'المدفوعات' },
  invoices: { en: 'Invoices', ar: 'الفواتير' },
  scholarships: { en: 'Scholarships', ar: 'المنح الدراسية' },
  students: { en: 'Students', ar: 'إدارة الطلاب' },
  applications: { en: 'Applications', ar: 'طلبات القبول' },
  reports: { en: 'Reports', ar: 'التقارير' },
  announcements: { en: 'Announcements', ar: 'الإعلانات' },
  support: { en: 'Help & Support', ar: 'المساعدة والدعم' },
  collapseMenu: { en: 'Collapse', ar: 'طي القائمة' },
  expandMenu: { en: 'Expand', ar: 'توسيع القائمة' },
  quickLinks: { en: 'Quick Links', ar: 'روابط سريعة' },
  exams: { en: 'Exams', ar: 'الامتحانات' },
  mainMenu: { en: 'Main Menu', ar: 'القائمة الرئيسية' },
  management: { en: 'Management', ar: 'الإدارة' },
  financialReports: { en: 'Financial Reports', ar: 'التقارير المالية' },
  academicRequests: { en: 'Academic Requests', ar: 'الطلبات الأكاديمية' },
  idCard: { en: 'ID Card', ar: 'البطاقة الجامعية' },
  transcript: { en: 'Transcript', ar: 'السجل الأكاديمي' },
  adminPanel: { en: 'Admin Panel', ar: 'لوحة الإدارة' },
  tableBuilder: { en: 'Table Builder', ar: 'مُنشئ الجداول' },
  formBuilder: { en: 'Form Builder', ar: 'مُنشئ النماذج' },
  reportBuilder: { en: 'Report Builder', ar: 'مُنشئ التقارير' },
  systemSettings: { en: 'System Settings', ar: 'إعدادات النظام' },
  menusDashboards: { en: 'Menus & Dashboards', ar: 'القوائم ولوحات المعلومات' },
  advising: { en: 'Academic Advising', ar: 'الإرشاد الأكاديمي' },
  certificates: { en: 'Certificates', ar: 'الشهادات والوثائق' },
  academicStatus: { en: 'Academic Status', ar: 'الحالة الأكاديمية' },
  userManagement: { en: 'User Management', ar: 'إدارة المستخدمين' },
  branding: { en: 'Branding & Templates', ar: 'العلامة التجارية والقوالب' },
  rolesPermissions: { en: 'Roles & Permissions', ar: 'الأدوار والصلاحيات' },
  programs: { en: 'Programs', ar: 'البرامج الأكاديمية' },
  semesters: { en: 'Semesters', ar: 'الفصول الدراسية' },
  courses: { en: 'Courses', ar: 'المواد الدراسية' },
  lectures: { en: 'Lectures', ar: 'المحاضرات' },
};

// Convert API menu items to NavItems
const convertAPIMenuToNavItems = (items: APIMenuItem[], lang: 'en' | 'ar'): NavItem[] => {
  return items.map((item) => ({
    to: item.route || '/',
    icon: getIcon(item.icon),
    label: lang === 'ar' ? item.title_ar : item.title_en,
    badge: item.badge_value ? parseInt(item.badge_value) : undefined,
    children: item.children && item.children.length > 0
      ? convertAPIMenuToNavItems(item.children, lang)
      : undefined,
  }));
};

const Sidebar: React.FC<SidebarProps> = ({ lang, role, isOpen, onClose, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();
  const { state: configState, loadConfig } = useConfig();
  const { branding } = useBranding();

  const isRTL = lang === 'ar';

  // Load config when role changes
  useEffect(() => {
    loadConfig(role);
  }, [role]);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  // Build navigation from API or fallback to hardcoded
  const getNavigation = (): NavItem[] => {
    // If we have API menu items, use them
    if (configState.menu?.items && configState.menu.items.length > 0) {
      return convertAPIMenuToNavItems(configState.menu.items as APIMenuItem[], lang);
    }

    // Fallback to hardcoded navigation
    const baseNav: NavItem[] = [{ to: '/', icon: LayoutDashboard, label: t.dashboard[lang] }];

    if (role === UserRole.STUDENT) {
      return [
        ...baseNav,
        {
          to: '/academic',
          icon: GraduationCap,
          label: t.academic[lang],
          children: [
            { to: '/academic?tab=courses', icon: BookOpen, label: t.myCourses[lang] },
            { to: '/academic?tab=grades', icon: Award, label: t.grades[lang] },
          ],
        },
        { to: '/requests', icon: FileText, label: t.academicRequests[lang] },
        { to: '/schedule', icon: Calendar, label: t.schedule[lang] },
        { to: '/lectures', icon: Presentation, label: t.lectures[lang] },
        { to: '/exams', icon: FileText, label: t.exams[lang] },
        { to: '/attendance', icon: ClipboardList, label: t.attendance[lang] },
        { to: '/transcript', icon: FileText, label: t.transcript[lang] },
        {
          to: '/finance',
          icon: CreditCard,
          label: t.finance[lang],
          children: [
            { to: '/finance?tab=payments', icon: CreditCard, label: t.payments[lang] },
            { to: '/finance?tab=invoices', icon: FileText, label: t.invoices[lang] },
            { to: '/finance?tab=scholarships', icon: Award, label: t.scholarships[lang] },
          ],
        },
        { to: '/id-card', icon: CreditCard, label: t.idCard[lang] },
        { to: '/certificates', icon: FileCheck, label: t.certificates[lang] },
        { to: '/academic-status', icon: AlertTriangle, label: t.academicStatus[lang] },
        { to: '/profile', icon: User, label: t.profile[lang] },
        { to: '/support', icon: HelpCircle, label: t.support[lang] },
      ];
    }

    if (role === UserRole.LECTURER) {
      return [
        ...baseNav,
        {
          to: '/lecturer',
          icon: Presentation,
          label: t.lecturer[lang],
          children: [
            { to: '/lecturer?tab=courses', icon: BookOpen, label: t.myCourses[lang] },
            { to: '/lecturer?tab=grades', icon: Award, label: t.grades[lang] },
          ],
        },
        { to: '/schedule', icon: Calendar, label: t.schedule[lang] },
        { to: '/exams', icon: FileText, label: t.exams[lang] },
        { to: '/attendance', icon: ClipboardList, label: t.attendance[lang] },
        { to: '/profile', icon: User, label: t.profile[lang] },
        { to: '/support', icon: HelpCircle, label: t.support[lang] },
      ];
    }

    if (role === UserRole.ADMIN) {
      return [
        ...baseNav,
        { to: '/students', icon: Users, label: t.students[lang] },
        {
          to: '/admissions',
          icon: UserCheck,
          label: t.admissions[lang],
          badge: 5,
          children: [
            { to: '/admissions?tab=applications', icon: FileText, label: t.applications[lang], badge: 5 },
          ],
        },
        {
          to: '/finance',
          icon: CreditCard,
          label: t.finance[lang],
          children: [
            { to: '/finance?tab=payments', icon: CreditCard, label: t.payments[lang] },
            { to: '/finance?tab=reports', icon: BarChart3, label: t.reports[lang] },
          ],
        },
        { to: '/reports', icon: BarChart3, label: t.reports[lang] },
        { to: '/schedule', icon: Calendar, label: t.schedule[lang] },
        // Standalone management items
        { to: '/admin/users', icon: Users, label: t.userManagement[lang] },
        // Academic Affairs Management - إدارة الشؤون الأكاديمية
        {
          to: '/admin/academic-affairs',
          icon: School,
          label: lang === 'ar' ? 'إدارة الشؤون الأكاديمية' : 'Academic Affairs',
          children: [
            { to: '/admin/academic-affairs', icon: School, label: lang === 'ar' ? 'لوحة التحكم' : 'Dashboard' },
            { to: '/admin/programs', icon: GraduationCap, label: t.programs[lang] },
            { to: '/admin/courses', icon: BookOpen, label: t.courses[lang] },
            { to: '/admin/semesters', icon: Calendar, label: t.semesters[lang] },
            { to: '/admin/grading-scales', icon: Award, label: lang === 'ar' ? 'إدارة التقديرات' : 'Grading Scales' },
            { to: '/admin/lecturers', icon: Presentation, label: lang === 'ar' ? 'المحاضرين من LMS' : 'LMS Lecturers' },
          ],
        },
        {
          to: '/admin/tables',
          icon: Cog,
          label: t.adminPanel[lang],
          children: [
            { to: '/admin/roles', icon: Shield, label: t.rolesPermissions[lang] },
            { to: '/admin/branding', icon: Palette, label: t.branding[lang] },
            { to: '/admin/tables', icon: Table, label: t.tableBuilder[lang] },
            { to: '/admin/forms', icon: FileEdit, label: t.formBuilder[lang] },
            { to: '/admin/reports', icon: PieChart, label: t.reportBuilder[lang] },
            { to: '/admin/settings', icon: Settings, label: t.systemSettings[lang] },
            { to: '/admin/menus', icon: MenuIcon, label: t.menusDashboards[lang] },
          ],
        },
        { to: '/support', icon: HelpCircle, label: t.support[lang] },
      ];
    }

    if (role === UserRole.FINANCE) {
      return [
        ...baseNav,
        {
          to: '/finance',
          icon: CreditCard,
          label: t.finance[lang],
          children: [
            { to: '/finance?tab=payments', icon: CreditCard, label: t.payments[lang] },
            { to: '/finance?tab=invoices', icon: FileText, label: t.invoices[lang] },
            { to: '/finance?tab=reports', icon: BarChart3, label: t.reports[lang] },
          ],
        },
        { to: '/reports', icon: BarChart3, label: t.reports[lang] },
        { to: '/support', icon: HelpCircle, label: t.support[lang] },
      ];
    }

    // Student Affairs Role - شؤون الطلاب
    if (role === UserRole.STUDENT_AFFAIRS) {
      return [
        ...baseNav,
        { to: '/students', icon: Users, label: t.students[lang] },
        { to: '/admissions', icon: FileText, label: t.admissions[lang] },
        { to: '/registration', icon: BookOpen, label: t.registration[lang] },
        { to: '/schedule', icon: Calendar, label: t.schedule[lang] },
        { to: '/requests', icon: FileText, label: lang === 'ar' ? 'طلبات الطلاب' : 'Requests' },
        { to: '/reports', icon: BarChart3, label: t.reports[lang] },
        { to: '/profile', icon: User, label: t.profile[lang] },
        { to: '/support', icon: HelpCircle, label: t.support[lang] },
      ];
    }

    // Registrar / Academic Affairs Role - الشؤون الأكاديمية
    if (role === UserRole.REGISTRAR) {
      return [
        ...baseNav,
        { to: '/students', icon: Users, label: t.students[lang] },
        { to: '/admissions', icon: UserCheck, label: t.admissions[lang] },
        { to: '/registration', icon: BookOpen, label: t.registration[lang] },
        { to: '/admin/programs', icon: GraduationCap, label: t.programs[lang] },
        { to: '/admin/courses', icon: BookOpen, label: t.courses[lang] },
        { to: '/admin/semesters', icon: Calendar, label: t.semesters[lang] },
        { to: '/schedule', icon: Calendar, label: t.schedule[lang] },
        { to: '/requests', icon: FileText, label: lang === 'ar' ? 'طلبات الطلاب' : 'Student Requests' },
        { to: '/reports', icon: BarChart3, label: t.reports[lang] },
        { to: '/profile', icon: User, label: t.profile[lang] },
        { to: '/support', icon: HelpCircle, label: t.support[lang] },
      ];
    }

    return baseNav;
  };

  const navigation = getNavigation();

  const isActiveRoute = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to.split('?')[0]);
  };

  const NavItemComponent: React.FC<{ item: NavItem; depth?: number }> = ({ item, depth = 0 }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const isActive = isActiveRoute(item.to);
    const Icon = item.icon;

    if (hasChildren && !isCollapsed) {
      return (
        <div>
          <button
            onClick={() => toggleExpanded(item.label)}
            className={`
              flex items-center justify-between w-full px-4 py-2.5 rounded-lg transition-colors duration-200
              ${isActive ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
            `}
          >
            <div className="flex items-center">
              <Icon className="w-5 h-5 me-3" />
              <span className="font-medium">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge && (
                <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </div>
          </button>
          {isExpanded && (
            <div className="mt-1 space-y-1 ps-4">
              {item.children?.map((child) => (
                <NavLink
                  key={child.to}
                  to={child.to}
                  onClick={() => {
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={({ isActive: childActive }) => `
                    flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-colors duration-200
                    ${childActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <div className="flex items-center">
                    <child.icon className="w-4 h-4 me-2" />
                    <span>{child.label}</span>
                  </div>
                  {child.badge && (
                    <span className="px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                      {child.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        to={item.to}
        onClick={() => {
          if (window.innerWidth < 768) onClose();
        }}
        className={({ isActive: navActive }) => `
          flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors duration-200
          ${navActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
        `}
        title={isCollapsed ? item.label : undefined}
      >
        <div className="flex items-center">
          <Icon className={`w-5 h-5 ${!isCollapsed ? 'me-3' : ''}`} />
          {!isCollapsed && <span className="font-medium">{item.label}</span>}
        </div>
        {!isCollapsed && item.badge && (
          <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
            {item.badge}
          </span>
        )}
      </NavLink>
    );
  };

  const sidebarClasses = `
    fixed top-0 bottom-0 z-40 bg-slate-900 text-white transition-transform duration-300 ease-in-out flex flex-col
    ${isCollapsed ? 'w-20' : 'w-64'}
    ${isRTL ? 'right-0' : 'left-0'}
    ${isOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'}
    md:translate-x-0 md:relative md:top-auto md:bottom-auto md:left-auto md:right-auto
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="relative h-32 px-4 border-b border-slate-700">
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} p-2 hover:bg-slate-800 rounded-lg md:hidden z-10`}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>

          <div className="flex items-center justify-center h-full">
            {!isCollapsed ? (
              <div className="flex flex-col items-center justify-center gap-2 w-full">
                <img
                  src="/logo-white.png"
                  alt="Logo"
                  className="w-16 h-16 object-contain"
                />
                <h1 className="text-sm font-bold text-white tracking-wide text-center">
                  {isRTL ? (branding?.universityNameAr || 'جامعة فيرتكس') : (branding?.universityName || 'VERTEX UNIVERSITY')}
                </h1>
                <p className="text-[8px] text-slate-400 leading-tight text-center">
                  تَعَلَّمْ مِنْ أَيِّ مَكَانٍ وَكُنْ قَائِدًا فِي كُلِّ مَكَانٍ
                </p>
              </div>
            ) : (
              <img
                src="/logo-white.png"
                alt="Logo"
                className="w-12 h-12 object-contain mx-auto"
              />
            )}
          </div>
        </div>

        {/* Loading indicator */}
        {configState.isLoading && (
          <div className="px-4 py-2">
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 animate-pulse w-1/2"></div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavItemComponent key={item.to} item={item} />
            ))}
          </div>
        </nav>

        {/* Quick Links */}
        {!isCollapsed && (
          <div className="px-3 py-4 border-t border-slate-700">
            <p className="px-4 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              {t.quickLinks[lang]}
            </p>
            <div className="space-y-1">
              <NavLink
                to="/"
                onClick={() => {
                  if (window.innerWidth < 768) onClose();
                }}
                className="flex items-center w-full px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors text-sm"
              >
                <Bell className="w-4 h-4 me-2" />
                <span>{t.announcements[lang]}</span>
              </NavLink>
              <NavLink
                to="/support"
                onClick={() => {
                  if (window.innerWidth < 768) onClose();
                }}
                className="flex items-center w-full px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors text-sm"
              >
                <HelpCircle className="w-4 h-4 me-2" />
                <span>{t.support[lang]}</span>
              </NavLink>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-slate-700 space-y-1">
          <NavLink
            to="/settings"
            onClick={() => {
              if (window.innerWidth < 768) onClose();
            }}
            className={({ isActive }) => `
              flex items-center px-4 py-2.5 rounded-lg transition-colors
              ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
            `}
            title={isCollapsed ? t.settings[lang] : undefined}
          >
            <Settings className={`w-5 h-5 ${!isCollapsed ? 'me-3' : ''}`} />
            {!isCollapsed && <span>{t.settings[lang]}</span>}
          </NavLink>

          {/* Logout Button */}
          <div className="border-t border-slate-700 pt-2 mt-2">
            <button
              onClick={() => {
                onLogout();
                if (window.innerWidth < 768) onClose();
              }}
              className="flex items-center w-full px-4 py-2.5 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors"
              title={isCollapsed ? t.logout[lang] : undefined}
            >
              <LogOut className={`w-5 h-5 ${!isCollapsed ? 'me-3' : ''}`} />
              {!isCollapsed && <span className="font-medium">{t.logout[lang]}</span>}
            </button>
          </div>

          {/* Collapse Toggle - Desktop Only */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center w-full px-4 py-2 text-slate-500 hover:bg-slate-800 hover:text-white rounded-lg transition-colors text-sm"
            title={isCollapsed ? t.expandMenu[lang] : t.collapseMenu[lang]}
          >
            {isCollapsed ? (
              isRTL ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )
            ) : (
              <>
                {isRTL ? (
                  <ChevronRight className="w-4 h-4 me-2" />
                ) : (
                  <ChevronLeft className="w-4 h-4 me-2" />
                )}
                <span>{t.collapseMenu[lang]}</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
