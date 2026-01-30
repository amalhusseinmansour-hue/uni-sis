
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Bell, Search, Globe, UserCircle, X, Languages, ChevronDown } from 'lucide-react';
import { UserRole, User } from '../types';
import { TRANSLATIONS, MOCK_COURSES, MOCK_ANNOUNCEMENTS, MOCK_ENROLLED_STUDENTS } from '../constants';
import { useConfig } from '../context/ConfigContext';

interface LayoutProps {
  lang: 'en' | 'ar';
  setLang: (l: 'en' | 'ar') => void;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ lang, setLang, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const navigate = useNavigate();
  const t = TRANSLATIONS;
  const isRTL = lang === 'ar';
  const { state: configState, getThemeColors } = useConfig();

  // Apply theme colors from backend
  useEffect(() => {
    const themeColors = getThemeColors();
    if (themeColors) {
      const root = document.documentElement;
      // Apply CSS custom properties for theme colors
      Object.entries(themeColors).forEach(([key, value]) => {
        const cssVarName = `--color-${key.replace(/_/g, '-')}`;
        root.style.setProperty(cssVarName, String(value));
      });
    }
  }, [configState.theme]);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const setLanguage = (newLang: 'en' | 'ar') => {
    setLang(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
    setLangMenuOpen(false);
  };

  // Close search and language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getSearchResults = () => {
    if (!searchQuery.trim()) return { courses: [], announcements: [], students: [] };

    const lowerQuery = searchQuery.toLowerCase();

    const courses = MOCK_COURSES.filter(c =>
      c.name_en.toLowerCase().includes(lowerQuery) ||
      c.name_ar.includes(lowerQuery) ||
      c.code.toLowerCase().includes(lowerQuery)
    );

    const announcements = MOCK_ANNOUNCEMENTS.filter(a =>
      a.title.toLowerCase().includes(lowerQuery) ||
      a.content.toLowerCase().includes(lowerQuery)
    );

    const students = MOCK_ENROLLED_STUDENTS.filter(s =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.studentId.includes(lowerQuery)
    );

    return { courses, announcements, students };
  };

  const results = getSearchResults();
  const hasResults = results.courses.length > 0 || results.announcements.length > 0 || results.students.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex" dir={isRTL ? 'rtl' : 'ltr'}>
      <Sidebar
        lang={lang}
        role={user.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col transition-all duration-300">
        {/* Navbar */}
        <header className="bg-white border-b border-slate-200 h-16 sticky top-0 z-20 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 md:hidden hover:bg-slate-100 rounded-lg">
              <Menu className="w-6 h-6 text-slate-600" />
            </button>

            {/* Search Bar - Functional with Dropdown */}
            <div className="hidden md:block relative" ref={searchRef}>
               <div className="flex items-center bg-slate-100 rounded-lg px-3 py-1.5 w-64">
                  <Search className="w-4 h-4 text-slate-400 me-2" />
                  <input
                    type="text"
                    placeholder={t.search[lang]}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="hover:bg-slate-200 rounded-full p-0.5">
                        <X className="w-3 h-3 text-slate-400" />
                    </button>
                  )}
               </div>

               {/* Search Results Dropdown */}
               {isSearchFocused && searchQuery && (
                  <div className="absolute top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 start-0 animate-in fade-in zoom-in-95 duration-100">
                    {!hasResults ? (
                        <div className="p-6 text-sm text-slate-500 text-center">
                            {t.noResults[lang]}
                        </div>
                    ) : (
                        <div className="max-h-96 overflow-y-auto">
                            {/* Courses */}
                            {results.courses.length > 0 && (
                                <div className="p-2">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 mt-2">{t.resultsCourses[lang]}</h4>
                                    {results.courses.map(c => (
                                        <div
                                            key={c.id}
                                            onClick={() => {
                                                navigate('/academic');
                                                setIsSearchFocused(false);
                                                setSearchQuery('');
                                            }}
                                            className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs font-bold shrink-0">
                                                {c.code.substring(0,2)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800 line-clamp-1">{lang === 'en' ? c.name_en : c.name_ar}</p>
                                                <p className="text-xs text-slate-500">{c.code}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Students */}
                            {results.students.length > 0 && (
                                <div className="p-2 border-t border-slate-100">
                                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 mt-2">{t.resultsStudents[lang]}</h4>
                                     {results.students.map(s => (
                                        <div
                                            key={s.id}
                                            onClick={() => {
                                                if (user.role === UserRole.LECTURER || user.role === UserRole.ADMIN) {
                                                    navigate('/lecturer');
                                                }
                                                setIsSearchFocused(false);
                                                setSearchQuery('');
                                            }}
                                            className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                                {s.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{s.name}</p>
                                                <p className="text-xs text-slate-500">{s.studentId}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Announcements */}
                            {results.announcements.length > 0 && (
                                <div className="p-2 border-t border-slate-100">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 mt-2">{t.resultsAnnouncements[lang]}</h4>
                                    {results.announcements.map(a => (
                                        <div
                                            key={a.id}
                                            onClick={() => {
                                                navigate('/');
                                                setIsSearchFocused(false);
                                                setSearchQuery('');
                                            }}
                                            className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${a.type === 'ACADEMIC' ? 'bg-blue-500' : a.type === 'FINANCIAL' ? 'bg-red-500' : 'bg-green-500'}`} />
                                            <div>
                                                <p className="text-sm font-medium text-slate-800 line-clamp-1">{a.title}</p>
                                                <p className="text-xs text-slate-500 line-clamp-1">{a.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                  </div>
               )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher with Dropdown */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${lang === 'ar' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  <Languages className="w-4 h-4" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700">
                  {lang === 'ar' ? 'العربية' : 'English'}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Language Dropdown Menu */}
              {langMenuOpen && (
                <div className="absolute top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 end-0">
                  <div className="p-2">
                    <button
                      onClick={() => setLanguage('en')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${lang === 'en' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${lang === 'en' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                        <span className="text-sm font-bold">EN</span>
                      </div>
                      <div className="text-start">
                        <p className="text-sm font-medium">English</p>
                        <p className="text-xs text-slate-500">Left to Right</p>
                      </div>
                      {lang === 'en' && (
                        <div className="ms-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>

                    <button
                      onClick={() => setLanguage('ar')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mt-1 ${lang === 'ar' ? 'bg-green-50 text-green-700' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${lang === 'ar' ? 'bg-green-100' : 'bg-slate-100'}`}>
                        <span className="text-sm font-bold">ع</span>
                      </div>
                      <div className="text-start">
                        <p className="text-sm font-medium">العربية</p>
                        <p className="text-xs text-slate-500">من اليمين لليسار</p>
                      </div>
                      {lang === 'ar' && (
                        <div className="ms-auto w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="p-2 hover:bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            <div className="flex items-center gap-3 ps-2 border-s border-slate-200">
              <img src={user.avatar || user.profile_picture_url || user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1e40af&color=fff`} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-blue-200" />
              <div className="hidden md:block text-sm">
                <p className="font-medium text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Beta Version Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="font-bold text-xs sm:text-sm tracking-wide">
                {lang === 'ar' ? 'إصدار تجريبي' : 'BETA VERSION'}
              </span>
            </div>
            <span className="text-xs sm:text-sm text-white/90 text-center">
              {lang === 'ar'
                ? 'هذا الإصدار تجريبي وقد تواجه بعض المشكلات. نرحب بملاحظاتكم!'
                : 'This is a beta version. You may encounter some issues. We welcome your feedback!'}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
