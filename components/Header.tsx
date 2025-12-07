import React from 'react';
import { ShieldCheck, BarChart3, Globe2 } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-corporate-600 p-2 rounded-lg">
            <Globe2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">ESG Insight</h1>
            <p className="text-xs text-slate-500 font-medium">Global Corporate Responsibility Tracker</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-sm font-medium text-slate-600">
           <div className="hidden md:flex items-center space-x-2">
             <ShieldCheck className="w-4 h-4 text-emerald-600" />
             <span>Verified Reports</span>
           </div>
           <div className="hidden md:flex items-center space-x-2">
             <BarChart3 className="w-4 h-4 text-corporate-600" />
             <span>Historical Analysis</span>
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;