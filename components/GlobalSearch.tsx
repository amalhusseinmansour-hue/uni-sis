import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { preferencesAPI } from '../api/preferences';
import {
  Search,
  X,
  Command,
  ArrowRight,
  Clock,
  Star,
  User,
  BookOpen,
  FileText,
  CreditCard,
  Calendar,
  Settings,
  Users,
  GraduationCap,
  Presentation,
  BarChart3,
  Bell,
  HelpCircle,
  ChevronRight,
  Hash,
  Loader2,
} from 'lucide-react';

type SearchCategory = 'all' | 'pages' | 'students' | 'courses' | 'documents' | 'settings';

interface SearchResult {
  id: string;
  type: 'page' | 'student' | 'course' | 'document' | 'action' | 'setting';
  title: string;
  titleAr?: string;
  subtitle?: string;
  subtitleAr?: string;
  icon: React.FC<{ className?: string }>;
  url?: string;
  action?: () => void;
  keywords?: string[];
}

interface GlobalSearchProps {
  lang: 'en' | 'ar';
  isOpen: boolean;
  onClose: () => void;
}

const t = {
  searchPlaceholder: { en: 'Search anything...', ar: 'ابحث عن أي شيء...' },
  recentSearches: { en: 'Recent Searches', ar: 'عمليات البحث الأخيرة' },
  quickLinks: { en: 'Quick Links', ar: 'روابط سريعة' },
  suggestions: { en: 'Suggestions', ar: 'اقتراحات' },
  noResults: { en: 'No results found', ar: 'لم يتم العثور على نتائج' },
  tryDifferent: { en: 'Try different keywords or browse categories', ar: 'جرب كلمات مختلفة أو تصفح الفئات' },
  pages: { en: 'Pages', ar: 'الصفحات' },
  students: { en: 'Students', ar: 'الطلاب' },
  courses: { en: 'Courses', ar: 'المقررات' },
  documents: { en: 'Documents', ar: 'المستندات' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  all: { en: 'All', ar: 'الكل' },
  pressEnter: { en: 'Press Enter to select', ar: 'اضغط Enter للاختيار' },
  typeToSearch: { en: 'Type to search', ar: 'اكتب للبحث' },
  clearRecent: { en: 'Clear', ar: 'مسح' },
};

// Mock data - In real app, this would come from API
const allResults: SearchResult[] = [
  // Pages
  { id: 'p1', type: 'page', title: 'Dashboard', titleAr: 'لوحة التحكم', icon: GraduationCap, url: '/', keywords: ['home', 'main', 'الرئيسية'] },
  { id: 'p2', type: 'page', title: 'Academic', titleAr: 'الأكاديمية', subtitle: 'Courses, Grades, Schedule', subtitleAr: 'المقررات، الدرجات، الجدول', icon: BookOpen, url: '/academic', keywords: ['courses', 'grades', 'مقررات'] },
  { id: 'p3', type: 'page', title: 'Finance', titleAr: 'المالية', subtitle: 'Payments & Invoices', subtitleAr: 'المدفوعات والفواتير', icon: CreditCard, url: '/finance', keywords: ['payment', 'invoice', 'fees', 'دفع'] },
  { id: 'p4', type: 'page', title: 'Profile', titleAr: 'الملف الشخصي', icon: User, url: '/profile', keywords: ['account', 'info', 'حساب'] },
  { id: 'p5', type: 'page', title: 'Settings', titleAr: 'الإعدادات', icon: Settings, url: '/settings', keywords: ['preferences', 'config', 'تفضيلات'] },
  { id: 'p6', type: 'page', title: 'Reports', titleAr: 'التقارير', icon: BarChart3, url: '/reports', keywords: ['analytics', 'statistics', 'تحليلات'] },
  { id: 'p7', type: 'page', title: 'Admissions', titleAr: 'القبول', icon: Users, url: '/admissions', keywords: ['applications', 'register', 'طلبات'] },
  { id: 'p8', type: 'page', title: 'Lecturer Portal', titleAr: 'بوابة المحاضر', icon: Presentation, url: '/lecturer', keywords: ['teacher', 'instructor', 'أستاذ'] },

  // Students (mock)
  { id: 's1', type: 'student', title: 'Ahmed Mohammed', titleAr: 'أحمد محمد', subtitle: 'ID: STU-2024-001', icon: User, url: '/students/1', keywords: ['ahmed', 'أحمد'] },
  { id: 's2', type: 'student', title: 'Fatima Ali', titleAr: 'فاطمة علي', subtitle: 'ID: STU-2024-002', icon: User, url: '/students/2', keywords: ['fatima', 'فاطمة'] },
  { id: 's3', type: 'student', title: 'Omar Hassan', titleAr: 'عمر حسن', subtitle: 'ID: STU-2024-003', icon: User, url: '/students/3', keywords: ['omar', 'عمر'] },
  { id: 's4', type: 'student', title: 'Sara Abdullah', titleAr: 'سارة عبدالله', subtitle: 'ID: STU-2024-004', icon: User, url: '/students/4', keywords: ['sara', 'سارة'] },

  // Courses (mock)
  { id: 'c1', type: 'course', title: 'Data Structures', titleAr: 'هياكل البيانات', subtitle: 'CS201 • Dr. Ahmed', icon: BookOpen, url: '/academic?course=cs201', keywords: ['cs201', 'programming', 'برمجة'] },
  { id: 'c2', type: 'course', title: 'Database Systems', titleAr: 'نظم قواعد البيانات', subtitle: 'CS301 • Dr. Sarah', icon: BookOpen, url: '/academic?course=cs301', keywords: ['cs301', 'sql', 'قواعد'] },
  { id: 'c3', type: 'course', title: 'Web Development', titleAr: 'تطوير الويب', subtitle: 'CS401 • Dr. Mohammed', icon: BookOpen, url: '/academic?course=cs401', keywords: ['cs401', 'html', 'css', 'ويب'] },
  { id: 'c4', type: 'course', title: 'Artificial Intelligence', titleAr: 'الذكاء الاصطناعي', subtitle: 'CS501 • Dr. Layla', icon: BookOpen, url: '/academic?course=cs501', keywords: ['cs501', 'ai', 'ml', 'ذكاء'] },

  // Documents
  { id: 'd1', type: 'document', title: 'Transcript Request', titleAr: 'طلب كشف درجات', subtitle: 'Academic document', icon: FileText, url: '/documents/transcript', keywords: ['transcript', 'كشف'] },
  { id: 'd2', type: 'document', title: 'Enrollment Certificate', titleAr: 'شهادة القيد', subtitle: 'Official document', icon: FileText, url: '/documents/enrollment', keywords: ['certificate', 'شهادة'] },
  { id: 'd3', type: 'document', title: 'Fee Structure', titleAr: 'هيكل الرسوم', subtitle: 'Financial document', icon: FileText, url: '/documents/fees', keywords: ['fees', 'رسوم'] },

  // Settings/Actions
  { id: 'a1', type: 'setting', title: 'Change Password', titleAr: 'تغيير كلمة المرور', icon: Settings, url: '/settings?tab=security', keywords: ['password', 'security', 'أمان'] },
  { id: 'a2', type: 'setting', title: 'Notification Preferences', titleAr: 'تفضيلات الإشعارات', icon: Bell, url: '/settings?tab=notifications', keywords: ['notifications', 'alerts', 'إشعارات'] },
  { id: 'a3', type: 'setting', title: 'Language Settings', titleAr: 'إعدادات اللغة', icon: Settings, url: '/settings?tab=appearance', keywords: ['language', 'arabic', 'english', 'لغة'] },
  { id: 'a4', type: 'setting', title: 'Help & Support', titleAr: 'المساعدة والدعم', icon: HelpCircle, url: '/settings?tab=help', keywords: ['help', 'support', 'faq', 'مساعدة'] },
];

const quickLinks: SearchResult[] = [
  { id: 'q1', type: 'page', title: 'Dashboard', titleAr: 'لوحة التحكم', icon: GraduationCap, url: '/' },
  { id: 'q2', type: 'page', title: 'My Courses', titleAr: 'مقرراتي', icon: BookOpen, url: '/academic?tab=courses' },
  { id: 'q3', type: 'page', title: 'Schedule', titleAr: 'الجدول', icon: Calendar, url: '/academic?tab=schedule' },
  { id: 'q4', type: 'page', title: 'Payments', titleAr: 'المدفوعات', icon: CreditCard, url: '/finance?tab=payments' },
];

const GlobalSearch: React.FC<GlobalSearchProps> = ({ lang, isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isRTL = lang === 'ar';

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Search function
  const performSearch = useCallback((searchQuery: string, searchCategory: SearchCategory) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const normalizedQuery = searchQuery.toLowerCase();

      let filtered = allResults.filter((item) => {
        const matchesQuery =
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.titleAr?.includes(searchQuery) ||
          item.subtitle?.toLowerCase().includes(normalizedQuery) ||
          item.keywords?.some((k) => k.toLowerCase().includes(normalizedQuery));

        if (searchCategory === 'all') return matchesQuery;
        if (searchCategory === 'pages') return matchesQuery && item.type === 'page';
        if (searchCategory === 'students') return matchesQuery && item.type === 'student';
        if (searchCategory === 'courses') return matchesQuery && item.type === 'course';
        if (searchCategory === 'documents') return matchesQuery && item.type === 'document';
        if (searchCategory === 'settings') return matchesQuery && (item.type === 'setting' || item.type === 'action');

        return matchesQuery;
      });

      setResults(filtered);
      setSelectedIndex(0);
      setIsLoading(false);
    }, 150);
  }, []);

  // Handle search input change
  useEffect(() => {
    performSearch(query, category);
  }, [query, category, performSearch]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleSelect = async (result: SearchResult) => {
    // Save to recent searches (localStorage + database)
    if (query.trim()) {
      const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));

      // Save to database
      try {
        await preferencesAPI.addRecentSearch(query);
      } catch (error) {
        console.error('Failed to save recent search:', error);
      }
    }

    if (result.action) {
      result.action();
    } else if (result.url) {
      navigate(result.url);
    }

    onClose();
    setQuery('');
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const categories: { key: SearchCategory; label: string }[] = [
    { key: 'all', label: t.all[lang] },
    { key: 'pages', label: t.pages[lang] },
    { key: 'students', label: t.students[lang] },
    { key: 'courses', label: t.courses[lang] },
    { key: 'documents', label: t.documents[lang] },
    { key: 'settings', label: t.settings[lang] },
  ];

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'page':
        return 'bg-blue-100 text-blue-600';
      case 'student':
        return 'bg-green-100 text-green-600';
      case 'course':
        return 'bg-purple-100 text-purple-600';
      case 'document':
        return 'bg-orange-100 text-orange-600';
      case 'setting':
      case 'action':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Search Modal */}
      <div className="absolute top-[15%] start-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Search Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder[lang]}
                className="flex-1 text-lg outline-none placeholder:text-slate-400"
                autoComplete="off"
              />
              {isLoading && <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />}
              {query && !isLoading && (
                <button onClick={() => setQuery('')} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs text-slate-500">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                    category === cat.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {query ? (
              results.length > 0 ? (
                <div ref={resultsRef} className="py-2">
                  {results.map((result, index) => {
                    const Icon = result.icon;
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleSelect(result)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-start transition-colors ${
                          index === selectedIndex ? 'bg-blue-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">
                            {lang === 'ar' && result.titleAr ? result.titleAr : result.title}
                          </p>
                          {result.subtitle && (
                            <p className="text-sm text-slate-500 truncate">
                              {lang === 'ar' && result.subtitleAr ? result.subtitleAr : result.subtitle}
                            </p>
                          )}
                        </div>
                        <ChevronRight className={`w-4 h-4 text-slate-400 ${isRTL ? 'rotate-180' : ''}`} />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">{t.noResults[lang]}</p>
                  <p className="text-sm text-slate-400 mt-1">{t.tryDifferent[lang]}</p>
                </div>
              )
            ) : (
              <div className="py-4">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between px-4 mb-2">
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        {t.recentSearches[lang]}
                      </span>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {t.clearRecent[lang]}
                      </button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setQuery(search)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-start hover:bg-slate-50"
                        >
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">{search}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Links */}
                <div>
                  <p className="px-4 text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                    {t.quickLinks[lang]}
                  </p>
                  <div className="grid grid-cols-2 gap-1 px-2">
                    {quickLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <button
                          key={link.id}
                          onClick={() => handleSelect(link)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-start"
                        >
                          <Icon className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {lang === 'ar' && link.titleAr ? link.titleAr : link.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px]">↓</kbd>
                <span className="ms-1">{lang === 'en' ? 'Navigate' : 'التنقل'}</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px]">Enter</kbd>
                <span className="ms-1">{lang === 'en' ? 'Select' : 'اختيار'}</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px]">Esc</kbd>
                <span className="ms-1">{lang === 'en' ? 'Close' : 'إغلاق'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Search Trigger Button
export const SearchTrigger: React.FC<{
  onClick: () => void;
  lang: 'en' | 'ar';
  className?: string;
}> = ({ onClick, lang, className = '' }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors ${className}`}
  >
    <Search className="w-4 h-4 text-slate-500" />
    <span className="text-sm text-slate-500 hidden sm:inline">
      {lang === 'en' ? 'Search...' : 'بحث...'}
    </span>
    <div className="hidden sm:flex items-center gap-0.5 ms-2">
      <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] text-slate-500">⌘</kbd>
      <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] text-slate-500">K</kbd>
    </div>
  </button>
);

export default GlobalSearch;
