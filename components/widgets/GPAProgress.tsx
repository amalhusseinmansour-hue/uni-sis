import React from 'react';
import { TrendingUp, TrendingDown, Minus, Target, Award, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardBody, GradientCard } from '../ui/Card';

interface GPAProgressProps {
  lang: 'en' | 'ar';
  currentGPA: number;
  previousGPA: number;
  targetGPA?: number;
  completedCredits: number;
  totalCredits: number;
}

const GPAProgress: React.FC<GPAProgressProps> = ({
  lang,
  currentGPA,
  previousGPA,
  targetGPA = 3.5,
  completedCredits,
  totalCredits,
}) => {
  const gpaDiff = currentGPA - previousGPA;
  const progressPercent = (completedCredits / totalCredits) * 100;

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.7) return 'text-green-600';
    if (gpa >= 3.0) return 'text-blue-600';
    if (gpa >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGPAGrade = (gpa: number) => {
    if (gpa >= 3.7) return { en: 'Excellent', ar: 'ممتاز' };
    if (gpa >= 3.3) return { en: 'Very Good', ar: 'جيد جداً' };
    if (gpa >= 3.0) return { en: 'Good', ar: 'جيد' };
    if (gpa >= 2.5) return { en: 'Satisfactory', ar: 'مقبول' };
    return { en: 'Needs Improvement', ar: 'يحتاج تحسين' };
  };

  const getTrendIcon = () => {
    if (gpaDiff > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (gpaDiff < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getTrendText = () => {
    if (gpaDiff > 0) {
      return lang === 'ar' ? `+${gpaDiff.toFixed(2)} من الفصل السابق` : `+${gpaDiff.toFixed(2)} from last semester`;
    }
    if (gpaDiff < 0) {
      return lang === 'ar' ? `${gpaDiff.toFixed(2)} من الفصل السابق` : `${gpaDiff.toFixed(2)} from last semester`;
    }
    return lang === 'ar' ? 'لا تغيير' : 'No change';
  };

  return (
    <GradientCard gradient="from-indigo-600 via-purple-600 to-pink-600">
      <div className="relative">
        {/* Background decorations */}
        <div className="absolute top-0 end-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 start-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {lang === 'ar' ? 'المعدل التراكمي' : 'GPA Overview'}
              </h3>
            </div>
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
              {getTrendIcon()}
              <span className="text-xs text-white/80">{getTrendText()}</span>
            </div>
          </div>

          {/* Main GPA Display */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <svg className="w-40 h-40" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(currentGPA / 4) * 283} 283`}
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-1000"
                />
                {/* Target indicator */}
                {targetGPA && (
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    strokeDashoffset={`${283 - (targetGPA / 4) * 283}`}
                    transform="rotate(-90 50 50)"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{currentGPA.toFixed(2)}</span>
                <span className="text-sm text-white/70">{lang === 'ar' ? 'من 4.0' : 'of 4.0'}</span>
              </div>
            </div>
          </div>

          {/* Grade Label */}
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-white font-medium">
              {getGPAGrade(currentGPA)[lang]}
            </span>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/10 rounded-xl">
              <p className="text-2xl font-bold text-white">{completedCredits}</p>
              <p className="text-xs text-white/70">
                {lang === 'ar' ? 'ساعات مكتملة' : 'Credits Done'}
              </p>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-xl">
              <p className="text-2xl font-bold text-white">{totalCredits - completedCredits}</p>
              <p className="text-xs text-white/70">
                {lang === 'ar' ? 'ساعات متبقية' : 'Credits Left'}
              </p>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-xl">
              <p className="text-2xl font-bold text-white">{progressPercent.toFixed(0)}%</p>
              <p className="text-xs text-white/70">
                {lang === 'ar' ? 'نسبة الإنجاز' : 'Progress'}
              </p>
            </div>
          </div>

          {/* Target GPA */}
          {targetGPA && (
            <div className="mt-4 flex items-center justify-center gap-2 text-white/80 text-sm">
              <Target className="w-4 h-4" />
              <span>
                {lang === 'ar' ? `المعدل المستهدف: ${targetGPA.toFixed(1)}` : `Target GPA: ${targetGPA.toFixed(1)}`}
              </span>
              {currentGPA >= targetGPA && (
                <span className="text-green-300">✓</span>
              )}
            </div>
          )}
        </div>
      </div>
    </GradientCard>
  );
};

export default GPAProgress;
