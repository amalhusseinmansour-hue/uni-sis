
import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Globe, AlertCircle, Eye, EyeOff, GraduationCap, Users, BookOpen, Award, Shield, Sparkles, Languages, ChevronDown, User } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { authAPI } from '../api';
import { useBranding } from '../context/BrandingContext';

interface LoginProps {
  onLogin: (user: any) => void;
  lang: 'en' | 'ar';
  setLang: (l: 'en' | 'ar') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, lang, setLang }) => {
  const t = TRANSLATIONS;
  const { branding } = useBranding();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const isRTL = lang === 'ar';

  const features = [
    {
      icon: GraduationCap,
      title: lang === 'ar' ? 'التميز الأكاديمي' : 'Academic Excellence',
      description: lang === 'ar' ? 'تتبع تقدمك الأكاديمي ودرجاتك بسهولة' : 'Track your academic progress and grades effortlessly',
    },
    {
      icon: BookOpen,
      title: lang === 'ar' ? 'إدارة المقررات' : 'Course Management',
      description: lang === 'ar' ? 'سجل في المقررات وتابع جدولك الدراسي' : 'Register for courses and manage your schedule',
    },
    {
      icon: Award,
      title: lang === 'ar' ? 'الإنجازات' : 'Achievements',
      description: lang === 'ar' ? 'احتفل بإنجازاتك ومعالمك الأكاديمية' : 'Celebrate your milestones and achievements',
    },
    {
      icon: Shield,
      title: lang === 'ar' ? 'آمن وموثوق' : 'Secure & Reliable',
      description: lang === 'ar' ? 'بياناتك محمية بأعلى معايير الأمان' : 'Your data is protected with highest security standards',
    },
  ];

  // Rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Login] ========== BUTTON CLICKED ==========');
    console.log('[Login] Username:', username);
    console.log('[Login] Password:', password ? '***' : 'EMPTY');

    setIsLoading(true);
    setError('');

    try {
      console.log('[Login] Calling authAPI.login...');
      const response = await authAPI.login({ username, password });
      console.log('[Login] Login response received:', response);
      console.log('[Login] User from response:', response?.user);
      onLogin(response.user);
    } catch (err: any) {
      // Better error handling
      const errorData = err.response?.data;
      if (errorData?.errors) {
        // Validation errors - show first error
        const firstError = Object.values(errorData.errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError as string);
      } else if (errorData?.message) {
        setError(errorData.message);
      } else if (errorData?.error) {
        setError(errorData.error);
      } else {
        setError(lang === 'ar' ? 'فشل تسجيل الدخول. تحقق من بياناتك.' : 'Login failed. Please check your credentials.');
      }
      console.error('Login error:', err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = (newLang: 'en' | 'ar') => {
    setLang(newLang);
    setShowLangMenu(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Visual Panel - Right side for RTL, Left for LTR */}
      <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden flex-col justify-between p-12 text-white text-center ${isRTL ? 'order-2' : 'order-1'}`}>
         {/* Abstract Background */}
         <div className="absolute inset-0">
             <div className="absolute top-0 -start-10 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
             <div className="absolute bottom-0 -end-10 w-96 h-96 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
             <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl"></div>
         </div>

         {/* Grid Pattern */}
         <div className="absolute inset-0 opacity-10" style={{
           backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
           backgroundSize: '30px 30px'
         }}></div>

         <div className="relative z-10 flex flex-col items-center justify-center text-center w-full">
             <img
              src="/logo-white.png"
              alt="Logo"
              className="w-40 h-40 object-contain mb-6 mx-auto"
            />
             <h1 className="text-5xl font-bold mb-4 leading-tight">
               {isRTL ? (branding?.universityNameAr || t.universityName[lang]) : (branding?.universityName || t.universityName[lang])}
             </h1>
             <p className="text-2xl font-semibold text-white mb-4 leading-relaxed">
               {lang === 'ar'
                 ? 'تَعَلَّمْ مِنْ أَيِّ مَكَانٍ .. وَكُنْ قَائِدًا فِي كُلِّ مَكَانٍ'
                 : 'Learn anywhere .. lead everywhere'
               }
             </p>
             <p className="text-blue-200 text-lg max-w-md mb-12">
                {lang === 'ar'
                  ? 'تمكين الجيل القادم من القادة بتجربة أكاديمية رقمية متكاملة'
                  : 'Empowering the next generation of leaders with a seamless digital academic experience.'
                }
             </p>

             {/* Animated Feature Showcase */}
             <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 w-full max-w-md">
               <div className={`flex items-center gap-4 mb-4 ${isRTL ? 'flex-row-reverse text-end' : 'text-start'}`}>
                 <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                   {React.createElement(features[currentFeature].icon, { className: 'w-6 h-6' })}
                 </div>
                 <div>
                   <h3 className="font-bold text-lg">{features[currentFeature].title}</h3>
                   <p className="text-blue-200 text-sm">{features[currentFeature].description}</p>
                 </div>
               </div>
               <div className="flex gap-2">
                 {features.map((_, index) => (
                   <div
                     key={index}
                     className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                       index === currentFeature ? 'bg-blue-400' : 'bg-white/20'
                     }`}
                   />
                 ))}
               </div>
             </div>
         </div>

         {/* Footer */}
         <div className="relative z-10">
           <p className="text-sm text-slate-400">© 2024 {branding?.universityName || 'VERTEX UNIVERSITY'}. {lang === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.</p>
         </div>
      </div>

      {/* Form Panel - Left side for RTL, Right for LTR */}
      <div className={`w-full lg:w-1/2 flex flex-col items-center justify-center px-4 py-8 sm:p-6 md:p-12 relative min-h-screen lg:min-h-0 ${isRTL ? 'order-1 text-end' : 'order-2 text-start'}`}>
         {/* Language Switcher */}
         <div className={`absolute top-4 sm:top-6 ${isRTL ? 'start-4 sm:start-6' : 'end-4 sm:end-6'}`}>
           <button
             onClick={() => setShowLangMenu(!showLangMenu)}
             className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg sm:rounded-xl shadow-sm transition-all ${isRTL ? 'flex-row-reverse' : ''}`}
           >
             <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg ${lang === 'ar' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
               <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
             </div>
             <span className="text-xs sm:text-sm font-medium text-slate-700">
               {lang === 'ar' ? 'العربية' : 'English'}
             </span>
             <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
           </button>

           {/* Language Dropdown */}
           {showLangMenu && (
             <div className={`absolute top-full mt-2 w-48 sm:w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 ${isRTL ? 'start-0' : 'end-0'}`}>
               <div className="p-2">
                 <button
                   onClick={() => setLanguage('en')}
                   className={`w-full flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-colors ${lang === 'en' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}`}
                 >
                   <span className="text-lg sm:text-xl">🇺🇸</span>
                   <div className="flex-1 text-start">
                     <p className="text-xs sm:text-sm font-medium">English</p>
                     <p className="text-[10px] sm:text-xs text-slate-500">USA</p>
                   </div>
                   {lang === 'en' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                 </button>

                 <button
                   onClick={() => setLanguage('ar')}
                   className={`w-full flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-colors mt-1 ${lang === 'ar' ? 'bg-green-50 text-green-700' : 'hover:bg-slate-50 text-slate-700'}`}
                 >
                   <span className="text-lg sm:text-xl">🇸🇦</span>
                   <div className="flex-1 text-start">
                     <p className="text-xs sm:text-sm font-medium">العربية</p>
                     <p className="text-[10px] sm:text-xs text-slate-500">المملكة العربية السعودية</p>
                   </div>
                   {lang === 'ar' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                 </button>
               </div>
             </div>
           )}
         </div>

         <div className="w-full max-w-md space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 mt-14 sm:mt-0">
            <div className={`text-center ${isRTL ? 'lg:text-end' : 'lg:text-start'}`}>
               <img
                 src="/logo-color.png"
                 alt="Logo"
                 className="lg:hidden w-20 h-20 sm:w-28 sm:h-28 object-contain mx-auto mb-4 sm:mb-6"
               />
               <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t.welcomeBack[lang]}</h2>
               <p className="text-slate-500 mt-1.5 sm:mt-2 text-sm sm:text-base">{t.loginSubtitle[lang]}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
               {error && (
                 <div className={`bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3 animate-in fade-in slide-in-from-top-2 ${isRTL ? 'flex-row-reverse text-end' : ''}`}>
                   <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" />
                   <p className="text-xs sm:text-sm font-medium text-red-800">{error}</p>
                 </div>
               )}

               <div className="space-y-3 sm:space-y-4">
                  <div className="w-full">
                     <label className={`block w-full text-xs sm:text-sm font-medium text-slate-700 mb-1 ${isRTL ? 'text-end' : 'text-start'}`} style={isRTL ? {textAlign: 'right'} : {}}>
                       {lang === 'ar' ? 'الرقم الجامعي أو البريد الإلكتروني' : 'Student ID or Email'}
                     </label>
                     <div className="relative">
                        <div className={`absolute top-2.5 sm:top-3 ${lang === 'ar' ? 'end-3' : 'start-3'} text-slate-400`}>
                           <User className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className={`w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50 focus:bg-white ${lang === 'ar' ? 'pe-10 text-end' : 'ps-10 text-start'}`}
                          placeholder={lang === 'ar' ? '202312345 أو name@university.edu' : '202312345 or name@university.edu'}
                          style={isRTL ? {textAlign: 'right'} : {}}
                        />
                     </div>
                  </div>

                  <div>
                     <div className="mb-1">
                        <label className={`block text-xs sm:text-sm font-medium text-slate-700 ${isRTL ? 'text-end' : 'text-start'}`} style={isRTL ? {textAlign: 'right'} : {}}>{t.password[lang]}</label>
                     </div>
                     <div className="relative">
                        <div className={`absolute top-2.5 sm:top-3 ${lang === 'ar' ? 'end-3' : 'start-3'} text-slate-400`}>
                           <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full p-2.5 sm:p-3 text-sm sm:text-base border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50 focus:bg-white ${lang === 'ar' ? 'pe-10 ps-10 text-end' : 'ps-10 pe-10 text-start'}`}
                          placeholder="••••••••"
                          style={isRTL ? {textAlign: 'right'} : {}}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute top-2.5 sm:top-3 ${lang === 'ar' ? 'start-3' : 'end-3'} text-slate-400 hover:text-slate-600 transition-colors`}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                     </div>
                  </div>
               </div>

               <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
                  <input type="checkbox" id="remember" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
                  <label htmlFor="remember" className="text-xs sm:text-sm text-slate-600 cursor-pointer">{t.rememberMe[lang]}</label>
               </div>

               <button
                 type="submit"
                 disabled={isLoading || !username || !password}
                 className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 sm:p-3.5 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
               >
                 {isLoading ? (
                   <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 ) : (
                   <>
                     {t.loginButton[lang]}
                     <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                   </>
                 )}
               </button>

               {/* Contact Info */}
               <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4" dir={isRTL ? 'rtl' : 'ltr'}>
                 <div className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
                     <span className="text-blue-800 font-medium">{lang === 'ar' ? 'عمادة شؤون الطلبة:' : 'Student Affairs:'}</span>
                     <a href="mailto:students@vertexuniversity.edu.eu" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline truncate">
                       students@vertexuniversity.edu.eu
                     </a>
                   </div>
                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
                     <span className="text-blue-800 font-medium">{lang === 'ar' ? 'عمادة القبول والتسجيل:' : 'Admissions & Registration:'}</span>
                     <a href="mailto:admissions@vertexuniversity.edu.eu" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline truncate">
                       admissions@vertexuniversity.edu.eu
                     </a>
                   </div>
                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
                     <span className="text-blue-800 font-medium">{lang === 'ar' ? 'إدارة تقنية المعلومات:' : 'IT Department:'}</span>
                     <a href="mailto:it@vertexuniversity.edu.eu" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline truncate">
                       it@vertexuniversity.edu.eu
                     </a>
                   </div>
                 </div>
               </div>
            </form>
         </div>
      </div>
    </div>
  );
};

export default Login;
