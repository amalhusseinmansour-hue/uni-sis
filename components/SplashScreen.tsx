
import React from 'react';
import { Loader2 } from 'lucide-react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white transition-opacity duration-500">
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
        <img
          src="/logo-white.png"
          alt="Vertex University"
          className="w-24 h-24 object-contain mb-6 animate-pulse"
        />
        <h1 className="text-4xl font-bold tracking-wider mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
          VERTEX UNIVERSITY
        </h1>
        <p className="text-slate-400 tracking-wide text-sm mb-8">تعلم من أي مكان وكن قائداً في كل مكان</p>

        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    </div>
  );
};

export default SplashScreen;
