import { GoogleGenAI } from "@google/genai";
import { Company, Report, ReportType } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to parse the custom structured response
const parseReports = (text: string): Report[] => {
  const lines = text.split('\n');
  const reports: Report[] = [];
  
  for (const line of lines) {
    // Clean up markdown list markers (e.g. "1. ", "- ", "* ")
    const cleanLine = line.trim().replace(/^[\*\-\d\.]+\s+/, '');
    
    // Skip empty lines
    if (!cleanLine) continue;

    // Strategy 1: Pipe Delimiter Split (Preferred)
    // Format: YYYY | TYPE | TITLE | URL
    const parts = cleanLine.split('|').map(p => p.trim());

    if (parts.length >= 4) {
      const year = parts[0];
      const typeRaw = parts[1].toUpperCase();
      const url = parts[parts.length - 1];
      const title = parts.slice(2, parts.length - 1).join(' | ');

      // Validation
      const yearNum = parseInt(year);
      const isYearValid = !isNaN(yearNum) && yearNum >= 2015 && yearNum <= 2030;
      // Clean URL (remove markdown closing parenthesis if present)
      const urlMatch = url.match(/https?:\/\/[^\s\)]+/);
      const cleanUrl = urlMatch ? urlMatch[0] : url;
      const isUrlValid = cleanUrl.startsWith('http');

      if (isYearValid && isUrlValid) {
        let type: ReportType = 'ESG';
        if (typeRaw.includes('BRSR')) type = 'BRSR';
        else if (typeRaw.includes('SUSTAINABILITY')) type = 'Sustainability';
        
        reports.push({ year, type, title, url: cleanUrl });
        continue; 
      }
    }

    // Strategy 2: Regex Fallback for slightly malformed lines
    // Example: "2023 - BRSR - Title - https://..." or missing pipes
    const fallbackRegex = /(\d{4}).*?(BRSR|ESG|Sustainability).*?(https?:\/\/[^\s\)]+)/i;
    const match = cleanLine.match(fallbackRegex);
    
    if (match) {
      const year = match[1];
      const typeStr = match[2].toUpperCase();
      const url = match[3];
      
      let title = cleanLine
        .replace(year, '')
        .replace(url, '')
        .replace(/[-|]/g, ' ') 
        .replace(/\s+/g, ' ')
        .trim();
        
      if (title.length < 5) title = `${typeStr} Report`;

       let type: ReportType = 'ESG';
       if (typeStr.includes('BRSR')) type = 'BRSR';
       else if (typeStr.includes('SUSTAINABILITY')) type = 'Sustainability';

       reports.push({ year, type, title, url });
    }
  }

  return reports;
};

// Helper to extract reports directly from search grounding metadata
// This ensures we get results even if the model doesn't format the text perfectly
const extractGroundingReports = (response: any): Report[] => {
  const reports: Report[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  for (const chunk of chunks) {
    if (chunk.web) {
      const title = chunk.web.title || "Online Report Result";
      const url = chunk.web.uri;
      
      // Attempt to extract year from title or current year fallback
      // Look for 2015-2029
      const yearMatch = title.match(/\b20(1[5-9]|2[0-9])\b/);
      const year = yearMatch ? yearMatch[0] : ""; 
      
      // Determine type
      let type: ReportType = 'ESG';
      const upperTitle = title.toUpperCase();
      if (upperTitle.includes('BRSR') || upperTitle.includes('BUSINESS RESPONSIBILITY')) type = 'BRSR';
      else if (upperTitle.includes('SUSTAINABILITY')) type = 'Sustainability';

      // Only add if it looks like a relevant report file (PDF) or a clear report page
      // And we found a year (or it's a PDF which implies a specific doc)
      if (url && (url.toLowerCase().endsWith('.pdf') || title.toLowerCase().includes('report'))) {
         reports.push({ 
           year: year || new Date().getFullYear().toString(), 
           type, 
           title, 
           url 
         });
      }
    }
  }
  return reports;
};

export const fetchCompanyReports = async (company: Company): Promise<{ reports: Report[], rawText: string }> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const regionContext = company.region === 'INDIA' 
    ? "This is an Indian company. You MUST search for the 'Business Responsibility and Sustainability Report' (BRSR) or 'Integrated Annual Report'." 
    : "This is a US company. Search for ESG or Sustainability Reports.";

  const prompt = `
    Find the official ESG, Sustainability, and Business Responsibility and Sustainability (BRSR) reports for '${company.name}' (${company.ticker}) for the years from 2015 to 2025.
    ${regionContext}
    
    For each report found, output a single line strictly in this format:
    YYYY|TYPE|TITLE|URL
    
    Rules:
    - YYYY must be a year between 2015 and 2025.
    - TYPE must be "BRSR", "ESG", or "Sustainability".
    - TITLE should be the name of the report (e.g., "Integrated Annual Report 2022").
    - URL must be a direct link to the PDF or the report landing page.
    - Do not include bullet points.
    - Do not include introductory text.
    - Only list valid URLs found in your search.
    - Sort by year, newest first.
  `;

  let lastError;
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "";
      let reports = parseReports(text);
      
      // Robustness: Augment with direct search results (Grounding)
      // This helps if the model text generation is incomplete or formatted poorly
      const groundingReports = extractGroundingReports(response);
      
      const existingUrls = new Set(reports.map(r => r.url));
      for (const gr of groundingReports) {
        if (!existingUrls.has(gr.url)) {
          reports.push(gr);
          existingUrls.add(gr.url);
        }
      }

      // Final cleanup: Deduplicate by URL and Sort by Year (Desc)
      const uniqueReports = Array.from(new Map(reports.map(item => [item.url, item])).values())
        .sort((a, b) => parseInt(b.year) - parseInt(a.year));

      return { reports: uniqueReports, rawText: text };

    } catch (error: any) {
      console.warn(`Gemini API Attempt ${attempt + 1} failed:`, error);
      lastError = error;
      
      // Retry on 5xx errors or network interruptions (xhr error)
      if (error.status >= 500 || error.message?.includes('xhr') || error.message?.includes('fetch')) {
        // Exponential backoff
        const delay = 1000 * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Don't retry for client errors (4xx) except maybe 429 (Too Many Requests) if handled by status check above
      break;
    }
  }

  console.error("Gemini API failed after retries:", lastError);
  throw lastError;
};