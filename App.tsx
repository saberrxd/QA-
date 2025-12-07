import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import RegionSelector from './components/RegionSelector';
import CompanyGrid from './components/CompanyGrid';
import ReportList from './components/ReportList';
import { US_COMPANIES, INDIA_SENSEX_COMPANIES } from './constants';
import { Region, Company, Report } from './types';
import { fetchCompanyReports } from './services/gemini';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<Region>('US');
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [fetchedReports, setFetchedReports] = useState<Report[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayedCompanies = selectedRegion === 'US' ? US_COMPANIES : INDIA_SENSEX_COMPANIES;
  const activeCompany = displayedCompanies.find(c => c.id === activeCompanyId) || null;

  const handleSelectCompany = async (company: Company) => {
    setActiveCompanyId(company.id);
    setLoading(true);
    setError(null);
    setIsReportModalOpen(false);

    try {
      const { reports } = await fetchCompanyReports(company);
      setFetchedReports(reports);
      setIsReportModalOpen(true);
    } catch (err: any) {
      setError(err.message || "Failed to fetch reports. Please try again.");
    } finally {
      setLoading(false);
      // Keep active ID for a moment so the UI doesn't jump, but reset it if modal closed
      if (!isReportModalOpen) setActiveCompanyId(null); 
    }
  };

  const handleCloseModal = () => {
    setIsReportModalOpen(false);
    setActiveCompanyId(null);
    setFetchedReports([]);
  };

  // Error toast auto-dismiss
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-corporate-100 selection:text-corporate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Find <span className="text-corporate-600">ESG</span> & <span className="text-emerald-600">BRSR</span> Reports Instantly
          </h2>
          <p className="text-lg text-slate-600">
            Access multi-year sustainability data for top global and SENSEX companies. 
            Powered by AI to retrieve comprehensive filings from 2015-2025.
          </p>
        </div>

        <RegionSelector 
          selectedRegion={selectedRegion} 
          onSelectRegion={setSelectedRegion} 
        />

        <div className="relative min-h-[400px]">
           <CompanyGrid 
             companies={displayedCompanies} 
             onSelectCompany={handleSelectCompany}
             isLoading={loading}
             activeCompanyId={activeCompanyId}
           />
        </div>
      </main>

      {/* Report Modal */}
      <ReportList 
        reports={fetchedReports} 
        company={activeCompany} 
        isVisible={isReportModalOpen} 
        onClose={handleCloseModal}
      />

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-6 right-6 max-w-md w-full bg-red-50 border border-red-200 p-4 rounded-xl shadow-lg flex items-start gap-3 animate-in slide-in-from-bottom-5 z-[70]">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-red-900">Search Failed</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <span className="sr-only">Close</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;