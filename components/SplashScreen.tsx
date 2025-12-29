
import React from 'react';
import { Loader2 } from 'lucide-react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white transition-opacity duration-500">
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-6 flex items-center justify-center shadow-2xl shadow-blue-900/50 animate-pulse">
           <span className="text-3xl font-bold text-white tracking-tighter">V</span>
        </div>
        <h1 className="text-4xl font-bold tracking-wider mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
          VERTIX UNIVERSITY
        </h1>
        <p className="text-slate-400 tracking-widest text-xs uppercase mb-8">Student Information System</p>
        
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    </div>
  );
};

export default SplashScreen;
