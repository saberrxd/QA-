import React from 'react';
import { Region } from '../types';
import { Flag, Building2 } from 'lucide-react';

interface RegionSelectorProps {
  selectedRegion: Region;
  onSelectRegion: (region: Region) => void;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({ selectedRegion, onSelectRegion }) => {
  return (
    <div className="flex justify-center mb-10">
      <div className="bg-slate-100 p-1.5 rounded-xl inline-flex shadow-sm border border-slate-200">
        <button
          onClick={() => onSelectRegion('US')}
          className={`
            flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
            ${selectedRegion === 'US' 
              ? 'bg-white text-corporate-900 shadow-sm ring-1 ring-black/5' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
          `}
        >
          <Building2 className="w-4 h-4" />
          <span>US Market</span>
        </button>
        <button
          onClick={() => onSelectRegion('INDIA')}
          className={`
            flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
            ${selectedRegion === 'INDIA' 
              ? 'bg-white text-corporate-900 shadow-sm ring-1 ring-black/5' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
          `}
        >
          <Flag className="w-4 h-4" />
          <span>SENSEX Top 20</span>
        </button>
      </div>
    </div>
  );
};

export default RegionSelector;