import React from 'react';
import { Report, Company } from '../types';
import { FileText, Download, ExternalLink, Calendar, SearchX } from 'lucide-react';

interface ReportListProps {
  reports: Report[];
  company: Company | null;
  isVisible: boolean;
  onClose: () => void;
}

const ReportList: React.FC<ReportListProps> = ({ reports, company, isVisible, onClose }) => {
  if (!isVisible || !company) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              {company.name}
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold align-middle">
                {company.ticker}
              </span>
            </h2>
            <p className="text-slate-500 mt-1">ESG & Sustainability Report Archive</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 bg-slate-50/30 flex-1">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchX className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No reports found automatically</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-2">
                We couldn't find structured report links for this company. They might use a custom investor portal.
              </p>
              <a 
                href={`https://www.google.com/search?q=${encodeURIComponent(company.name + ' ESG Sustainability Report')}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center text-corporate-600 hover:text-corporate-700 font-medium"
              >
                Search manually on Google <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report, index) => (
                <div 
                  key={`${report.url}-${index}`}
                  className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-corporate-300 transition-all duration-200 flex flex-col sm:flex-row gap-4 sm:items-center"
                >
                  {/* Date Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-lg bg-slate-100 flex flex-col items-center justify-center border border-slate-200 group-hover:border-corporate-200 group-hover:bg-corporate-50 transition-colors">
                      <Calendar className="w-4 h-4 text-slate-400 group-hover:text-corporate-500 mb-1" />
                      <span className="font-bold text-slate-700 group-hover:text-corporate-700">{report.year}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {report.type === 'BRSR' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                          BRSR
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          ESG
                        </span>
                      )}
                      <h4 className="font-semibold text-slate-900 truncate pr-2" title={report.title}>
                        {report.title}
                      </h4>
                    </div>
                    <div className="text-sm text-slate-500 truncate flex items-center gap-1">
                       <FileText className="w-3 h-3" />
                       {new URL(report.url).hostname}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    <a 
                      href={report.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-4 py-2 bg-slate-900 hover:bg-corporate-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm w-full sm:w-auto"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      View Report
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-center text-slate-400">
           Reports sourced via AI search. Always verify with official investor relations pages.
        </div>
      </div>
    </div>
  );
};

export default ReportList;