import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Share, CheckCircle } from 'lucide-react';

interface PWAInstallPromptProps {
  lang: 'en' | 'ar';
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const t = {
  installApp: { en: 'Install App', ar: 'تثبيت التطبيق' },
  installTitle: { en: 'Install Vertex SIS', ar: 'تثبيت نظام فيرتكس' },
  installDesc: { en: 'Install our app for a better experience', ar: 'ثبت التطبيق لتجربة أفضل' },
  installBenefits: { en: 'Quick access from home screen', ar: 'وصول سريع من الشاشة الرئيسية' },
  offlineAccess: { en: 'Works offline', ar: 'يعمل بدون انترنت' },
  notifications: { en: 'Push notifications', ar: 'إشعارات فورية' },
  fasterLoading: { en: 'Faster loading', ar: 'تحميل أسرع' },
  install: { en: 'Install Now', ar: 'تثبيت الآن' },
  notNow: { en: 'Not Now', ar: 'ليس الآن' },
  installed: { en: 'App Installed!', ar: 'تم تثبيت التطبيق!' },
  iosInstructions: { en: 'Tap', ar: 'اضغط' },
  iosThen: { en: 'then "Add to Home Screen"', ar: 'ثم "إضافة إلى الشاشة الرئيسية"' },
};

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ lang }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Check for iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if dismissed recently
    const dismissedTime = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissedTime) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        return; // Don't show if dismissed in last 24 hours
      }
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowBanner(false);
      setShowPrompt(false);
      localStorage.removeItem('pwa_prompt_dismissed');
    });

    // Show iOS prompt after delay if on iOS and not standalone
    if (isIOSDevice && !isStandaloneMode) {
      setTimeout(() => setShowBanner(true), 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
      setShowBanner(false);
    } catch (error) {
      console.error('Installation error:', error);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  // Don't show if already installed
  if (isStandalone || installed) {
    return null;
  }

  // Installation success message
  if (installed) {
    return (
      <div className="fixed bottom-4 end-4 start-4 sm:left-auto sm:w-80 bg-green-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-slide-up">
        <CheckCircle className="w-6 h-6 flex-shrink-0" />
        <span className="font-medium">{t.installed[lang]}</span>
      </div>
    );
  }

  return (
    <>
      {/* Floating Install Banner */}
      {showBanner && !showPrompt && (
        <div className="fixed bottom-4 end-4 start-4 sm:left-auto sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 z-50 animate-slide-up">
          <button
            onClick={handleDismiss}
            className="absolute top-2 end-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                {t.installTitle[lang]}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.installDesc[lang]}
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            {isIOS ? (
              <button
                onClick={() => setShowPrompt(true)}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {lang === 'ar' ? 'كيفية التثبيت' : 'How to Install'}
              </button>
            ) : deferredPrompt ? (
              <button
                onClick={handleInstall}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {t.install[lang]}
              </button>
            ) : null}
            <button
              onClick={handleDismiss}
              className="py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors"
            >
              {t.notNow[lang]}
            </button>
          </div>
        </div>
      )}

      {/* Full Install Modal */}
      {showPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white text-center relative">
              <button
                onClick={handleDismiss}
                className="absolute top-3 end-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl font-bold text-blue-600">VU</span>
              </div>
              <h2 className="text-xl font-bold">{t.installTitle[lang]}</h2>
              <p className="text-blue-100 text-sm mt-1">{t.installDesc[lang]}</p>
            </div>

            {/* Benefits */}
            <div className="p-6 space-y-3">
              {[
                { icon: Smartphone, text: t.installBenefits[lang] },
                { icon: Download, text: t.offlineAccess[lang] },
                { icon: Monitor, text: t.fasterLoading[lang] },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-200 text-sm">{item.text}</span>
                </div>
              ))}

              {/* iOS Instructions */}
              {isIOS && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
                    {t.iosInstructions[lang]}{' '}
                    <Share className="w-4 h-4 inline-block mx-1 text-blue-600" />{' '}
                    {t.iosThen[lang]}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              <button
                onClick={handleDismiss}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-colors"
              >
                {t.notNow[lang]}
              </button>
              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  {t.install[lang]}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-scale-up {
          animation: scale-up 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default PWAInstallPrompt;
