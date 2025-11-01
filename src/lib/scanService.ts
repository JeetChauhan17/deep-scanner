export interface WebsiteData {
  url: string;
  html?: string;
  markdown?: string;
  screenshot?: string;
  error?: string;
}

export interface PhishingIndicators {
  domainMimicking: { detected: boolean; details: string };
  suspiciousForms: { detected: boolean; details: string };
  suspiciousLinks: { detected: boolean; details: string };
  sslIssues: { detected: boolean; details: string };
  brandImpersonation: { detected: boolean; details: string };
  suspiciousScripts: { detected: boolean; details: string };
}

const KNOWN_BRANDS = [
  { name: 'PayPal', domains: ['paypal.com', 'paypal.me'], keywords: ['paypal', 'pay pal'] },
  { name: 'Amazon', domains: ['amazon.com', 'amzn.to', 'amazon.co.uk', 'amazon.de', 'amazon.in'], keywords: ['amazon', 'amzn'] },
  { name: 'Microsoft', domains: ['microsoft.com', 'live.com', 'outlook.com', 'office.com', 'windows.com'], keywords: ['microsoft', 'msft', 'windows', 'office'] },
  { name: 'Google', domains: ['google.com', 'gmail.com', 'youtube.com', 'goo.gl'], keywords: ['google', 'gmail'] },
  { name: 'Apple', domains: ['apple.com', 'icloud.com', 'me.com'], keywords: ['apple', 'icloud', 'itunes'] },
  { name: 'Facebook', domains: ['facebook.com', 'fb.com', 'messenger.com', 'instagram.com'], keywords: ['facebook', 'fb.com', 'instagram'] },
  { name: 'Netflix', domains: ['netflix.com'], keywords: ['netflix', 'netflex'] },
  { name: 'Bank of America', domains: ['bankofamerica.com', 'bofa.com'], keywords: ['bank of america', 'bofa'] },
  { name: 'Chase', domains: ['chase.com'], keywords: ['chase', 'jpmorgan'] },
  { name: 'Wells Fargo', domains: ['wellsfargo.com'], keywords: ['wells fargo', 'wellsfargo'] },
  { name: 'DHL', domains: ['dhl.com', 'dhl.de'], keywords: ['dhl'] },
  { name: 'FedEx', domains: ['fedex.com'], keywords: ['fedex', 'fed ex'] },
  { name: 'WhatsApp', domains: ['whatsapp.com', 'wa.me'], keywords: ['whatsapp', 'whats app'] },
];

export async function fetchWebsiteContent(url: string): Promise<WebsiteData> {
  try {
    // Normalize URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return {
        url,
        error: `Failed to fetch: ${response.status} ${response.statusText}`,
      };
    }

    const html = await response.text();
    
    return {
      url,
      html,
    };
  } catch (error) {
    return {
      url,
      error: error instanceof Error ? error.message : 'Failed to fetch website',
    };
  }
}

export function analyzeDomain(url: string): { 
  isSuspicious: boolean; 
  reasons: string[];
  brandImpersonation?: { brand: string; confidence: number };
} {
  const reasons: string[] = [];
  let isSuspicious = false;
  
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const domain = urlObj.hostname.toLowerCase();
    
    // Check for suspicious TLDs
    const suspiciousTLDs = ['.xyz', '.top', '.tk', '.ml', '.ga', '.cf', '.gq', '.zip', '.loan', '.work'];
    if (suspiciousTLDs.some(tld => domain.endsWith(tld))) {
      isSuspicious = true;
      reasons.push(`Suspicious TLD: ${domain.split('.').pop()}`);
    }
    
    // Check for excessive subdomains
    const parts = domain.split('.');
    if (parts.length > 4) {
      isSuspicious = true;
      reasons.push(`Excessive subdomains (${parts.length} levels)`);
    }
    
    // Check for IP address instead of domain
    if (/^\d+\.\d+\.\d+\.\d+$/.test(domain)) {
      isSuspicious = true;
      reasons.push('Using IP address instead of domain name');
    }
    
    // Check for suspicious characters
    if (/[^\w\-.]/.test(domain)) {
      isSuspicious = true;
      reasons.push('Contains suspicious characters in domain');
    }
    
    // Check for brand impersonation
    for (const brand of KNOWN_BRANDS) {
      const isLegitDomain = brand.domains.some(d => domain === d || domain.endsWith(`.${d}`));
      
      if (!isLegitDomain) {
        // Check if domain contains brand keywords
        const containsBrandKeyword = brand.keywords.some(keyword => 
          domain.includes(keyword.toLowerCase().replace(/\s+/g, ''))
        );
        
        if (containsBrandKeyword) {
          // Check for typosquatting
          for (const legitDomain of brand.domains) {
            const similarity = calculateSimilarity(domain, legitDomain);
            if (similarity > 0.7) {
              isSuspicious = true;
              reasons.push(`⚠️ Possible ${brand.name} impersonation: "${domain}" mimics "${legitDomain}"`);
              return { 
                isSuspicious, 
                reasons, 
                brandImpersonation: { brand: brand.name, confidence: similarity * 100 }
              };
            }
          }
          
          // Domain contains brand keyword but isn't official
          isSuspicious = true;
          reasons.push(`⚠️ Domain contains "${brand.name}" branding but is not an official ${brand.name} domain`);
          return { 
            isSuspicious, 
            reasons, 
            brandImpersonation: { brand: brand.name, confidence: 85 }
          };
        }
      }
    }
    
    // Check for homograph attacks (lookalike characters)
    const homographs = {
      'a': ['а', 'ɑ', 'α'],
      'e': ['е', 'ҽ', 'е'],
      'o': ['о', '0', 'ο'],
      'i': ['і', 'ι', '1', 'l'],
      'c': ['с', 'ϲ'],
      'p': ['р', 'ρ'],
      'x': ['х', 'χ'],
    };
    
    for (const [normal, lookalikes] of Object.entries(homographs)) {
      if (lookalikes.some(char => domain.includes(char))) {
        isSuspicious = true;
        reasons.push('Contains lookalike characters (homograph attack)');
        break;
      }
    }
    
  } catch (error) {
    reasons.push('Invalid URL format');
    isSuspicious = true;
  }
  
  return { isSuspicious, reasons };
}

export function analyzeHTML(html: string, url: string): PhishingIndicators {
  const indicators: PhishingIndicators = {
    domainMimicking: { detected: false, details: '' },
    suspiciousForms: { detected: false, details: '' },
    suspiciousLinks: { detected: false, details: '' },
    sslIssues: { detected: false, details: '' },
    brandImpersonation: { detected: false, details: '' },
    suspiciousScripts: { detected: false, details: '' },
  };
  
  const lowerHTML = html.toLowerCase();
  
  // Check for password/credit card forms
  if (lowerHTML.includes('type="password"') || lowerHTML.includes("type='password'")) {
    const hasLogin = lowerHTML.includes('login') || lowerHTML.includes('signin') || lowerHTML.includes('sign in');
    const hasCreditCard = lowerHTML.includes('credit') || lowerHTML.includes('card') || lowerHTML.includes('cvv');
    
    if (hasLogin || hasCreditCard) {
      indicators.suspiciousForms.detected = true;
      indicators.suspiciousForms.details = hasCreditCard 
        ? 'Contains credit card/payment form'
        : 'Contains password/login form';
    }
  }
  
  // Check for suspicious external links
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const currentDomain = urlObj.hostname;
    
    const linkRegex = /href=["']([^"']+)["']/gi;
    const links = Array.from(html.matchAll(linkRegex)).map(match => match[1]);
    
    const externalLinks = links.filter(link => {
      try {
        if (link.startsWith('http')) {
          const linkUrl = new URL(link);
          return linkUrl.hostname !== currentDomain;
        }
      } catch {}
      return false;
    });
    
    if (externalLinks.length > 10) {
      indicators.suspiciousLinks.detected = true;
      indicators.suspiciousLinks.details = `High number of external links (${externalLinks.length})`;
    }
  } catch {}
  
  // Check for obfuscated/suspicious scripts
  if (lowerHTML.includes('eval(') || lowerHTML.includes('fromcharcode') || lowerHTML.includes('unescape(')) {
    indicators.suspiciousScripts.detected = true;
    indicators.suspiciousScripts.details = 'Contains potentially obfuscated JavaScript';
  }
  
  // Check for iframe redirects
  if (lowerHTML.includes('<iframe') && lowerHTML.includes('src=')) {
    indicators.suspiciousLinks.detected = true;
    indicators.suspiciousLinks.details = 'Contains hidden iframes (possible redirect)';
  }
  
  // Check SSL/HTTPS
  if (!url.startsWith('https://')) {
    indicators.sslIssues.detected = true;
    indicators.sslIssues.details = 'Site does not use HTTPS encryption';
  }
  
  // Check for brand impersonation in content
  for (const brand of KNOWN_BRANDS) {
    const brandMentioned = brand.keywords.some(keyword => lowerHTML.includes(keyword.toLowerCase()));
    const isLegitDomain = brand.domains.some(d => url.includes(d));
    
    if (brandMentioned && !isLegitDomain) {
      indicators.brandImpersonation.detected = true;
      indicators.brandImpersonation.details = `Page mentions ${brand.name} but domain doesn't match official domains`;
      break;
    }
  }
  
  return indicators;
}

function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}


export async function runSecurityScan(url: string) {
  // later: integrate nmap/sqlmap here
  return {
    url,
    scannedAt: new Date().toISOString(),
    vulnerabilities: [
      {
        name: "Open Port 22 (SSH)",
        severity: "medium",
        description: "SSH port exposed to internet.",
        fix: "Restrict access to trusted IPs or close the port if not needed."
      },
      {
        name: "Missing X-Frame-Options Header",
        severity: "low",
        description: "No X-Frame-Options header found; site may be clickjacked.",
        fix: "Add X-Frame-Options: DENY header in HTTP response."
      }
    ]
  };
}
