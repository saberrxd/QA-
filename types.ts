export type Region = 'US' | 'INDIA';

export interface Company {
  id: string;
  name: string;
  ticker: string;
  region: Region;
  sector: string;
}

export type ReportType = 'ESG' | 'BRSR' | 'Sustainability';

export interface Report {
  year: string;
  type: ReportType;
  title: string;
  url: string;
}

export interface SearchResult {
  companyId: string;
  reports: Report[];
  summary?: string;
}