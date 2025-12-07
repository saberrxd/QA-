import React from 'react';
import { Company } from '../types';
import { ChevronRight, Factory, Server, ShoppingCart, Landmark, Activity, Zap, Loader2 } from 'lucide-react';

interface CompanyGridProps {
  companies: Company[];
  onSelectCompany: (company: Company) => void;
  isLoading: boolean;
  activeCompanyId: string | null;
}

const getIconForSector = (sector: string) => {
  switch (sector) {
    case 'Technology': return <Server className="w-5 h-5" />;
    case 'Financial Services': return <Landmark className="w-5 h-5" />;
    case 'Consumer Cyclical':
    case 'Consumer Defensive': return <ShoppingCart className="w-5 h-5" />;
    case 'Energy': return <Zap className="w-5 h-5" />;
    case 'Healthcare': return <Activity className="w-5 h-5" />;
    default: return <Factory className="w-5 h-5" />;
  }
};

const CompanyGrid: React.FC<CompanyGridProps> = ({ companies, onSelectCompany, isLoading, activeCompanyId }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {companies.map((company) => {
        const isActive = activeCompanyId === company.id;
        
        // Detailed Loading State Replacement
        if (isActive && isLoading) {
          return (
            <div 
              key={company.id}
              className="relative flex flex-col items-start p-5 rounded-xl border border-corporate-200 bg-corporate-50/50 shadow-inner h-full animate-pulse"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className="p-2 rounded-lg bg-corporate-100/50 text-corporate-400">
                   {getIconForSector(company.sector)}
                </div>
                <div className="h-5 w-12 bg-corporate-100 rounded-full" />
              </div>
              
              <div className="h-6 w-3/4 bg-corporate-100 rounded mb-2" />
              <div className="h-4 w-1/2 bg-slate-100 rounded mb-4" />
              
              <div className="mt-auto flex items-center w-full pt-4 border-t border-corporate-100 text-corporate-600">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="text-sm font-semibold">Analyzing...</span>
              </div>
            </div>
          );
        }

        return (
          <button
            key={company.id}
            onClick={() => onSelectCompany(company)}
            disabled={isLoading}
            className={`
              group relative flex flex-col items-start p-5 rounded-xl border text-left transition-all duration-300
              ${isActive 
                ? 'bg-corporate-50 border-corporate-500 ring-1 ring-corporate-500 shadow-md' 
                : 'bg-white border-slate-200 hover:border-corporate-300 hover:shadow-lg hover:-translate-y-0.5'}
              ${isLoading && !isActive ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className={`
                p-2 rounded-lg transition-colors
                ${isActive ? 'bg-corporate-100 text-corporate-700' : 'bg-slate-50 text-slate-500 group-hover:bg-corporate-50 group-hover:text-corporate-600'}
              `}>
                {getIconForSector(company.sector)}
              </div>
              <span className={`
                text-xs font-bold px-2 py-1 rounded-full border
                ${isActive ? 'bg-white border-corporate-200 text-corporate-700' : 'bg-slate-50 border-slate-100 text-slate-400'}
              `}>
                {company.ticker}
              </span>
            </div>
            
            <h3 className={`font-bold text-lg mb-1 ${isActive ? 'text-corporate-900' : 'text-slate-800'}`}>
              {company.name}
            </h3>
            <p className="text-sm text-slate-500 mb-4">{company.sector}</p>
            
            <div className={`
              mt-auto flex items-center text-sm font-medium w-full pt-4 border-t
              ${isActive ? 'border-corporate-200 text-corporate-600' : 'border-slate-50 text-slate-400 group-hover:text-corporate-600 group-hover:border-slate-100'}
            `}>
              <span>Fetch Reports</span>
              <ChevronRight className="w-4 h-4 ml-auto transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default CompanyGrid;