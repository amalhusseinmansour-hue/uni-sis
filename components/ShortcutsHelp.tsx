import React, { useState, useEffect } from 'react';
import { X, Keyboard, Command } from 'lucide-react';
import Modal from './ui/Modal';

interface ShortcutsHelpProps {
  lang: 'en' | 'ar';
}

const ShortcutsHelp: React.FC<ShortcutsHelpProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleShowShortcuts = () => setIsOpen(true);
    window.addEventListener('show-shortcuts-help', handleShowShortcuts);
    return () => window.removeEventListener('show-shortcuts-help', handleShowShortcuts);
  }, []);

  const shortcuts = [
    {
      category: lang === 'ar' ? 'عام' : 'General',
      items: [
        { keys: ['Ctrl', 'K'], description: lang === 'ar' ? 'فتح البحث' : 'Open Search' },
        { keys: ['Ctrl', 'B'], description: lang === 'ar' ? 'تبديل الشريط الجانبي' : 'Toggle Sidebar' },
        { keys: ['Shift', '?'], description: lang === 'ar' ? 'عرض هذه النافذة' : 'Show this help' },
        { keys: ['Esc'], description: lang === 'ar' ? 'إغلاق النوافذ المنبثقة' : 'Close modals' },
      ],
    },
    {
      category: lang === 'ar' ? 'التنقل' : 'Navigation',
      items: [
        { keys: ['Alt', 'H'], description: lang === 'ar' ? 'الصفحة الرئيسية' : 'Go to Dashboard' },
        { keys: ['Alt', 'S'], description: lang === 'ar' ? 'الجدول' : 'Go to Schedule' },
        { keys: ['Alt', 'E'], description: lang === 'ar' ? 'الامتحانات' : 'Go to Exams' },
        { keys: ['Alt', 'A'], description: lang === 'ar' ? 'الحضور' : 'Go to Attendance' },
        { keys: ['Alt', 'P'], description: lang === 'ar' ? 'الملف الشخصي' : 'Go to Profile' },
      ],
    },
    {
      category: lang === 'ar' ? 'الإجراءات' : 'Actions',
      items: [
        { keys: ['Ctrl', 'S'], description: lang === 'ar' ? 'حفظ' : 'Save' },
        { keys: ['Ctrl', 'P'], description: lang === 'ar' ? 'طباعة' : 'Print' },
        { keys: ['Ctrl', 'Enter'], description: lang === 'ar' ? 'إرسال النموذج' : 'Submit form' },
      ],
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title={
        <div className="flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-blue-600" />
          <span>{lang === 'ar' ? 'اختصارات لوحة المفاتيح' : 'Keyboard Shortcuts'}</span>
        </div>
      }
      size="lg"
    >
      <div className="space-y-6">
        {shortcuts.map((section, index) => (
          <div key={index}>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {section.category}
            </h3>
            <div className="space-y-2">
              {section.items.map((shortcut, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg"
                >
                  <span className="text-slate-700">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, keyIdx) => (
                      <React.Fragment key={keyIdx}>
                        <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-slate-600 shadow-sm">
                          {key === 'Ctrl' && navigator.platform.includes('Mac') ? (
                            <Command className="w-3 h-3 inline" />
                          ) : (
                            key
                          )}
                        </kbd>
                        {keyIdx < shortcut.keys.length - 1 && (
                          <span className="text-slate-400 text-xs">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-500 text-center">
            {lang === 'ar'
              ? 'اضغط Shift + ? في أي وقت لعرض هذه النافذة'
              : 'Press Shift + ? anytime to show this help'
            }
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ShortcutsHelp;
