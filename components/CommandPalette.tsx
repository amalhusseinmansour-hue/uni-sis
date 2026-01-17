import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, ArrowRight, Clock, Star, FileText, BookOpen,
  Calendar, CreditCard, User, Settings, HelpCircle, Home,
  ClipboardList, MessageCircle, BarChart3, Award
} from 'lucide-react';
import { useRecentSearches, useFavorites } from '../hooks/useLocalStorage';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
}

interface SearchResult {
  id: string;
  type: 'page' | 'action' | 'course' | 'document';
  title: string;
  description?: string;
  path: string;
  icon: React.FC<{ className?: string }>;
  keywords?: string[];
}

const allResults: SearchResult[] = [
  // Pages
  { id: 'dashboard', type: 'page', title: 'Dashboard', path: '/', icon: Home, keywords: ['home', 'main', 'الرئيسية'] },
  { id: 'academic', type: 'page', title: 'Academic', path: '/academic', icon: BookOpen, keywords: ['courses', 'grades', 'المقررات', 'الدرجات'] },
  { id: 'schedule', type: 'page', title: 'Schedule', path: '/schedule', icon: Calendar, keywords: ['timetable', 'classes', 'الجدول', 'المحاضرات'] },
  { id: 'exams', type: 'page', title: 'Exams', path: '/exams', icon: ClipboardList, keywords: ['tests', 'finals', 'الاختبارات', 'النهائي'] },
  { id: 'attendance', type: 'page', title: 'Attendance', path: '/attendance', icon: FileText, keywords: ['presence', 'absence', 'الحضور', 'الغياب'] },
  { id: 'finance', type: 'page', title: 'Finance', path: '/finance', icon: CreditCard, keywords: ['fees', 'payment', 'الرسوم', 'الدفع'] },
  { id: 'support', type: 'page', title: 'Support', path: '/support', icon: MessageCircle, keywords: ['help', 'ticket', 'الدعم', 'المساعدة'] },
  { id: 'profile', type: 'page', title: 'Profile', path: '/profile', icon: User, keywords: ['account', 'info', 'الملف', 'الحساب'] },
  { id: 'settings', type: 'page', title: 'Settings', path: '/settings', icon: Settings, keywords: ['preferences', 'الإعدادات'] },
  { id: 'reports', type: 'page', title: 'Reports', path: '/reports', icon: BarChart3, keywords: ['analytics', 'التقارير'] },

  // Actions
  { id: 'register-courses', type: 'action', title: 'Register for Courses', path: '/academic?tab=register', icon: BookOpen, keywords: ['تسجيل المقررات'] },
  { id: 'view-grades', type: 'action', title: 'View Grades', path: '/academic?tab=grades', icon: Award, keywords: ['عرض الدرجات'] },
  { id: 'pay-fees', type: 'action', title: 'Pay Fees', path: '/finance?tab=payments', icon: CreditCard, keywords: ['دفع الرسوم'] },
  { id: 'new-ticket', type: 'action', title: 'Create Support Ticket', path: '/support', icon: MessageCircle, keywords: ['تذكرة جديدة'] },

  // Sample courses
  { id: 'cs101', type: 'course', title: 'CS101 - Intro to Computer Science', path: '/academic?course=CS101', icon: BookOpen, keywords: ['programming', 'برمجة'] },
  { id: 'math201', type: 'course', title: 'MATH201 - Calculus II', path: '/academic?course=MATH201', icon: BookOpen, keywords: ['calculus', 'تفاضل'] },
  { id: 'cs201', type: 'course', title: 'CS201 - Data Structures', path: '/academic?course=CS201', icon: BookOpen, keywords: ['algorithms', 'خوارزميات'] },
];

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, lang }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { searches, addSearch, clearSearches } = useRecentSearches();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  // Filter results based on query
  const filteredResults = query.trim()
    ? allResults.filter(result => {
        const searchQuery = query.toLowerCase();
        return (
          result.title.toLowerCase().includes(searchQuery) ||
          result.description?.toLowerCase().includes(searchQuery) ||
          result.keywords?.some(k => k.toLowerCase().includes(searchQuery))
        );
      })
    : [];

  // Get results to display
  const displayResults = query.trim()
    ? filteredResults
    : [
        ...favorites.slice(0, 3).map(f => allResults.find(r => r.id === f.id)).filter(Boolean) as SearchResult[],
        ...searches.slice(0, 3).map(s => allResults.find(r => r.title.toLowerCase().includes(s.toLowerCase()))).filter(Boolean) as SearchResult[],
      ];

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, displayResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (displayResults[selectedIndex]) {
          handleSelect(displayResults[selectedIndex]);
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  }, [isOpen, displayResults, selectedIndex, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    if (query.trim()) {
      addSearch(query);
    }
    navigate(result.path);
    onClose();
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      page: { en: 'Page', ar: 'صفحة' },
      action: { en: 'Action', ar: 'إجراء' },
      course: { en: 'Course', ar: 'مقرر' },
      document: { en: 'Document', ar: 'مستند' },
    };
    return labels[type]?.[lang] || type;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative min-h-screen flex items-start justify-center pt-[15vh] px-4">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-200">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث عن صفحات، إجراءات، مقررات...' : 'Search pages, actions, courses...'}
              className="flex-1 text-lg outline-none placeholder:text-slate-400"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            )}
            <kbd className="hidden sm:block px-2 py-1 bg-slate-100 rounded text-xs text-slate-500">
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {!query.trim() && (
              <>
                {/* Recent Searches */}
                {searches.length > 0 && (
                  <div className="p-2">
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase">
                        {lang === 'ar' ? 'عمليات البحث الأخيرة' : 'Recent Searches'}
                      </span>
                      <button
                        onClick={clearSearches}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        {lang === 'ar' ? 'مسح' : 'Clear'}
                      </button>
                    </div>
                    {searches.slice(0, 3).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(search)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg text-start"
                      >
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">{search}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Favorites */}
                {favorites.length > 0 && (
                  <div className="p-2 border-t border-slate-100">
                    <div className="px-3 py-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase">
                        {lang === 'ar' ? 'المفضلة' : 'Favorites'}
                      </span>
                    </div>
                    {favorites.slice(0, 3).map((fav) => {
                      const result = allResults.find(r => r.id === fav.id);
                      if (!result) return null;
                      return (
                        <button
                          key={fav.id}
                          onClick={() => handleSelect(result)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg text-start"
                        >
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-slate-700">{result.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Quick Links */}
                <div className="p-2 border-t border-slate-100">
                  <div className="px-3 py-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      {lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 px-2">
                    {allResults.filter(r => r.type === 'page').slice(0, 6).map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelect(result)}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-start"
                      >
                        <result.icon className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700">{result.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Search Results */}
            {query.trim() && (
              <div className="p-2">
                {filteredResults.length > 0 ? (
                  filteredResults.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-start transition-colors ${
                        index === selectedIndex ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        index === selectedIndex ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <result.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${index === selectedIndex ? 'text-blue-600' : 'text-slate-800'}`}>
                            {result.title}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-500">
                            {getTypeLabel(result.type)}
                          </span>
                        </div>
                        {result.description && (
                          <p className="text-sm text-slate-500 truncate">{result.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite({
                              id: result.id,
                              type: result.type as any,
                              title: result.title,
                              path: result.path,
                            });
                          }}
                          className={`p-1 rounded ${isFavorite(result.id) ? 'text-yellow-500' : 'text-slate-300 hover:text-slate-400'}`}
                        >
                          <Star className="w-4 h-4" fill={isFavorite(result.id) ? 'currentColor' : 'none'} />
                        </button>
                        {index === selectedIndex && (
                          <ArrowRight className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">
                      {lang === 'ar' ? 'لا توجد نتائج لـ' : 'No results for'} "{query}"
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      {lang === 'ar' ? 'جرب كلمات مختلفة' : 'Try different keywords'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border rounded">↓</kbd>
                {lang === 'ar' ? 'للتنقل' : 'to navigate'}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border rounded">Enter</kbd>
                {lang === 'ar' ? 'للفتح' : 'to open'}
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border rounded">Ctrl</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border rounded">K</kbd>
              {lang === 'ar' ? 'للبحث' : 'to search'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
