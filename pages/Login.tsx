
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
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.login({ username, password });
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
    <div className={`min-h-screen flex bg-slate-50 ${isRTL ? 'flex-row-reverse' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Left Panel (Visual) - Hidden on Mobile */}
      <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden flex-col justify-between p-12 text-white ${isRTL ? 'text-right' : 'text-left'}`}>
         {/* Abstract Background */}
         <div className="absolute inset-0">
             <div className="absolute top-0 -left-10 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
             <div className="absolute bottom-0 -right-10 w-96 h-96 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl"></div>
         </div>

         {/* Grid Pattern */}
         <div className="absolute inset-0 opacity-10" style={{
           backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
           backgroundSize: '30px 30px'
         }}></div>

         <div className="relative z-10">
             <img
              src="/logo-white.png"
              alt="Logo"
              className="w-14 h-14 object-contain mb-8"
            />
             <h1 className="text-5xl font-bold mb-4 leading-tight">
               {isRTL ? (branding?.universityNameAr || t.universityName[lang]) : (branding?.universityName || t.universityName[lang])}
             </h1>
             <p className="text-2xl font-semibold text-white mb-4 leading-relaxed">
               {lang === 'ar'
                 ? 'تَعَلَّمْ مِنْ أَيِّ مَكَانٍ وَكُنْ قَائِدًا فِي كُلِّ مَكَانٍ'
                 : 'Learn from anywhere and be a leader everywhere'
               }
             </p>
             <p className="text-blue-200 text-lg max-w-md mb-12">
                {lang === 'ar'
                  ? 'تمكين الجيل القادم من القادة بتجربة أكاديمية رقمية متكاملة'
                  : 'Empowering the next generation of leaders with a seamless digital academic experience.'
                }
             </p>

             {/* Animated Feature Showcase */}
             <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
               <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
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
           <p className="text-sm text-slate-400">© 2024 {branding?.universityName || 'VERTIX UNIVERSITY'}. {lang === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.</p>
         </div>
      </div>

      {/* Right Panel (Form) */}
      <div className={`w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 relative ${isRTL ? 'text-right' : 'text-left'}`}>
         {/* Language Switcher */}
         <div className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'}`}>
           <button
             onClick={() => setShowLangMenu(!showLangMenu)}
             className={`flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-sm transition-all ${isRTL ? 'flex-row-reverse' : ''}`}
           >
             <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${lang === 'ar' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
               <Languages className="w-4 h-4" />
             </div>
             <span className="text-sm font-medium text-slate-700">
               {lang === 'ar' ? 'العربية' : 'English'}
             </span>
             <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
           </button>

           {/* Language Dropdown */}
           {showLangMenu && (
             <div className={`absolute top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 ${isRTL ? 'left-0' : 'right-0'}`}>
               <div className="p-2">
                 <button
                   onClick={() => setLanguage('en')}
                   className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${lang === 'en' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}`}
                 >
                   <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${lang === 'en' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                     <span className="text-sm font-bold">EN</span>
                   </div>
                   <div className="text-left flex-1">
                     <p className="text-sm font-medium">English</p>
                     <p className="text-xs text-slate-500">Left to Right</p>
                   </div>
                   {lang === 'en' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                 </button>

                 <button
                   onClick={() => setLanguage('ar')}
                   className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mt-1 ${lang === 'ar' ? 'bg-green-50 text-green-700' : 'hover:bg-slate-50 text-slate-700'}`}
                 >
                   <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${lang === 'ar' ? 'bg-green-100' : 'bg-slate-100'}`}>
                     <span className="text-sm font-bold">ع</span>
                   </div>
                   <div className="text-left flex-1">
                     <p className="text-sm font-medium">العربية</p>
                     <p className="text-xs text-slate-500">من اليمين لليسار</p>
                   </div>
                   {lang === 'ar' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                 </button>
               </div>
             </div>
           )}
         </div>

         <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className={`text-center ${isRTL ? 'lg:text-right' : 'lg:text-left'}`}>
               <img
                 src="/logo-color.png"
                 alt="Logo"
                 className="lg:hidden w-12 h-12 object-contain mx-auto mb-6"
               />
               <h2 className="text-3xl font-bold text-slate-900">{t.welcomeBack[lang]}</h2>
               <p className="text-slate-500 mt-2">{t.loginSubtitle[lang]}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               {error && (
                 <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                   <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                   <div>
                     <p className="text-sm font-medium text-red-800">{error}</p>
                     <p className="text-xs text-red-600 mt-1">
                       Test credentials: admin@university.edu / admin123
                     </p>
                   </div>
                 </div>
               )}

               {/* Support Contact Info */}
               <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                 <p className="text-sm text-blue-800">
                   {lang === 'ar' ? 'للتواصل مع قسم الدعم الفني' : 'For technical support contact'}
                 </p>
                 <a
                   href="mailto:technical.support@vertexuniversity.edu.eu"
                   className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                 >
                   technical.support@vertexuniversity.edu.eu
                 </a>
               </div>

               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">
                       {lang === 'ar' ? 'الرقم الجامعي أو البريد الإلكتروني' : 'Student ID or Email'}
                     </label>
                     <div className="relative">
                        <div className={`absolute top-3 ${lang === 'ar' ? 'right-3' : 'left-3'} text-slate-400`}>
                           <User className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className={`w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50 focus:bg-white ${lang === 'ar' ? 'pr-10' : 'pl-10'}`}
                          placeholder={lang === 'ar' ? '202312345 أو name@university.edu' : '202312345 or name@university.edu'}
                        />
                     </div>
                  </div>
                  
                  <div>
                     <div className="flex justify-between mb-1">
                        <label className="block text-sm font-medium text-slate-700">{t.password[lang]}</label>
                        <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">{t.forgotPassword[lang]}</a>
                     </div>
                     <div className="relative">
                        <div className={`absolute top-3 ${lang === 'ar' ? 'right-3' : 'left-3'} text-slate-400`}>
                           <Lock className="w-5 h-5" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50 focus:bg-white ${lang === 'ar' ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute top-3 ${lang === 'ar' ? 'left-3' : 'right-3'} text-slate-400 hover:text-slate-600 transition-colors`}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                     </div>
                  </div>
               </div>

               <div className="flex items-center">
                  <input type="checkbox" id="remember" className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
                  <label htmlFor="remember" className={`text-sm text-slate-600 cursor-pointer ${lang === 'ar' ? 'mr-2' : 'ml-2'}`}>{t.rememberMe[lang]}</label>
               </div>

               <button
                 type="submit"
                 disabled={isLoading || !username || !password}
                 className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
               >
                 {isLoading ? (
                   <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 ) : (
                   <>
                     {t.loginButton[lang]}
                     <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                   </>
                 )}
               </button>
            </form>
            
            <div className="pt-6 border-t border-slate-100 text-center">
               <p className="text-xs text-slate-400 mb-2">
                  Test Accounts:
               </p>
               <div className="text-xs text-slate-500 space-y-1">
                 <p><strong>Admin:</strong> admin@university.edu / admin123</p>
                 <p><strong>Student:</strong> ahmed.mansour@student.university.edu / student123</p>
                 <p><strong>Lecturer:</strong> sarah.smith@university.edu / lecturer123</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Login;
