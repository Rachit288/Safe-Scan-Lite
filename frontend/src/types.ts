// API Response Types based on specification

export interface Risk {
  level: 'safe' | 'caution' | 'danger';
  score: number;
}

export interface Intent {
  code: string;
  label: string;
}

export interface Signals {
  short_url: boolean;
  brand_impersonation: boolean;
  payment_request: boolean;
  apk_download: boolean;
  http_only: boolean;
  domain_age_days: number | null;
  redirect_count: number;
}

export interface SafePreview {
  final_domain: string;
  https: boolean;
  content_type: string;
  country: string;
  file_download: boolean;
}

export interface Reputation {
  virustotal_detected: boolean;
  virustotal_score: number;
  safe_browsing_threat: boolean;
  threat_types: string[];
  checked_by: string[];
}

export interface ScanResponse {
  status: 'success' | 'error';
  risk: Risk;
  intent: Intent;
  signals: Signals;
  reputation: Reputation;
  safe_preview: SafePreview;
  checked_items: string[];
  error_message?: string;
}

export interface DecodeResponse {
  qr_content: string;
}

export interface HealthResponse {
  status: string;
  service: string;
}

// Signal explanations for "Explain Like I'm Not Tech-Savvy" mode
export const signalExplanations: Record<string, { simple: string; normal: string }> = {
  short_url: {
    simple: "This link was shortened to hide where it really goes",
    normal: "URL shorteners like bit.ly can mask malicious destinations"
  },
  brand_impersonation: {
    simple: "This site is pretending to be a trusted brand you know",
    normal: "Domain contains brand names but isn't the official website"
  },
  payment_request: {
    simple: "This site may ask for your money or payment details",
    normal: "Page contains payment forms or cryptocurrency addresses"
  },
  apk_download: {
    simple: "This wants to install an app on your phone that could be harmful",
    normal: "Direct APK download detected - bypasses app store security"
  },
  http_only: {
    simple: "This site isn't secure - others can see what you type",
    normal: "No HTTPS encryption - data sent in plaintext"
  },
  domain_age_new: {
    simple: "This website was just created recently - scam sites often are",
    normal: "Domain registered within the last 30 days"
  },
  redirect_excessive: {
    simple: "This link bounces you through many websites before the final one",
    normal: "Multiple redirects detected - common in phishing chains"
  }
};

// Intent labels
export const intentLabels: Record<string, string> = {
  credential_theft: "Trying to steal your login details",
  financial_fraud: "Attempting to steal your money",
  malware_distribution: "Trying to install harmful software",
  data_harvesting: "Collecting your personal information",
  legitimate: "Appears to be a legitimate website",
  unknown: "Unable to determine intent"
};
