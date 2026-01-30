import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  initialLang?: 'en' | 'ar';
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  initialLang = 'ar'
}) => {
  const [lang, setLangState] = useState<'en' | 'ar'>(() => {
    const savedLang = localStorage.getItem('app_language');
    return savedLang === 'en' ? 'en' : initialLang;
  });

  const setLang = (newLang: 'en' | 'ar') => {
    setLangState(newLang);
    localStorage.setItem('app_language', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const value: LanguageContextType = {
    lang,
    setLang,
    isRTL: lang === 'ar',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Return a default value if used outside provider (for backwards compatibility)
    const defaultLang = (localStorage.getItem('app_language') as 'en' | 'ar') || 'ar';
    return {
      lang: defaultLang,
      setLang: (newLang: 'en' | 'ar') => {
        localStorage.setItem('app_language', newLang);
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLang;
      },
      isRTL: defaultLang === 'ar',
    };
  }
  return context;
};

export default LanguageContext;
