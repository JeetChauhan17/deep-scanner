// Demo data for Zero Day Bot

export interface ScanReport {
  summary: string;
  confidence: number;
  findings: Finding[];
  rawOutputs?: string;
  timestamp: Date;
}

export interface Finding {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  evidence: string;
  fix: string;
}

export interface PhishingResult {
  verdict: 'suspicious' | 'malicious' | 'benign' | 'unknown';
  confidence: number;
  reasons: Array<{ code: string; note: string }>;
  explanation: string;
  screenshot?: string;
}

// Demo phishing results
export const demoPhishingResults: Record<string, PhishingResult> = {
  'suspicious': {
    verdict: 'suspicious',
    confidence: 0.82,
    reasons: [
      { code: 'DOMAIN_AGE', note: 'Domain registered only 8 days ago' },
      { code: 'CERT_MISMATCH', note: 'SSL certificate CN does not match hostname' },
      { code: 'SIMILAR_DOMAIN', note: 'Domain closely resembles well-known brand' },
    ],
    explanation: 'Multiple passive signals indicate potential phishing risk. The domain was recently registered and has certificate inconsistencies. Exercise extreme caution before entering any credentials.',
  },
  'benign': {
    verdict: 'benign',
    confidence: 0.95,
    reasons: [
      { code: 'DOMAIN_AGE', note: 'Domain registered for 8+ years' },
      { code: 'VALID_CERT', note: 'Valid SSL certificate from trusted CA' },
      { code: 'NO_SUSPICIOUS_PATTERNS', note: 'No known phishing indicators detected' },
    ],
    explanation: 'This URL appears legitimate based on all passive security checks. Domain has established history and proper security configurations.',
  },
};

// Demo site scan report
export const demoSiteReport: ScanReport = {
  summary: 'Passive security scan found 3 issues: outdated TLS protocol support (TLS 1.0 accepted), missing security headers (HSTS, CSP), and an open HTTP port without automatic HTTPS redirect. No CVEs were matched in passive checks. Recommend enabling modern TLS protocols only, implementing security headers, and enforcing HTTPS.',
  confidence: 0.78,
  timestamp: new Date(),
  findings: [
    {
      id: 'F1',
      title: 'Outdated TLS 1.0 Protocol Accepted',
      severity: 'medium',
      confidence: 0.92,
      evidence: 'tls_scan output: "Accepted: TLS 1.0, TLS 1.1, TLS 1.2, TLS 1.3"\nServer accepts legacy TLS 1.0 connections which are deprecated.',
      fix: 'Disable TLS 1.0 and TLS 1.1 in your web server configuration. Edit your server config (nginx/apache) to only allow TLS 1.2+:\n\nFor nginx: ssl_protocols TLSv1.2 TLSv1.3;\nFor apache: SSLProtocol -all +TLSv1.2 +TLSv1.3',
    },
    {
      id: 'F2',
      title: 'Missing Security Headers',
      severity: 'medium',
      confidence: 0.85,
      evidence: 'headers_check: Missing:\n- Strict-Transport-Security (HSTS)\n- Content-Security-Policy (CSP)\n- X-Frame-Options\n- X-Content-Type-Options',
      fix: 'Add security headers to your web server response. For nginx, add to your config:\n\nadd_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;\nadd_header Content-Security-Policy "default-src \'self\'" always;\nadd_header X-Frame-Options "SAMEORIGIN" always;\nadd_header X-Content-Type-Options "nosniff" always;',
    },
    {
      id: 'F3',
      title: 'HTTP Port Open Without HTTPS Redirect',
      severity: 'low',
      confidence: 0.68,
      evidence: 'nmap_lite: "80/tcp open http"\nheaders: Server responds on port 80 without immediate redirect to HTTPS',
      fix: 'Configure automatic HTTP to HTTPS redirect:\n\nFor nginx:\nserver {\n  listen 80;\n  return 301 https://$host$request_uri;\n}\n\nFor apache:\nRewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]',
    },
  ],
};

// Sample conversation messages for demo
export const demoMessages = [
  {
    id: '1',
    role: 'assistant' as const,
    content: 'Hello! I\'m Zero Day Bot, your security assistant. I can check URLs for phishing, run passive security scans, and answer your security questions. What would you like to do?',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
];
