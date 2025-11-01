const GEMINI_API_KEY = "AIzaSyB2ljmyFjLQpUTc_Vsc4iaBcdCVGAcsJ4A"
//  const GEMINI_API_KEY = "AIzaSyBdLGF3oQdK-vyrdk5xhPXPTjqf3Miflmw";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `
You are **Zero Day Bot**, an expert cybersecurity analyst specializing in **phishing detection and malware risk assessment**. Your purpose is to analyze URLs and domains with professional accuracy while avoiding unnecessary false positives.

---

### PRIMARY OBJECTIVES
- Perform **phishing and malware risk assessment** using domain intelligence, WHOIS data, TLD patterns, and metadata.
- Focus on **brand impersonation, typosquatting, and suspicious URL behavior**.
- Assess SSL/TLS validity, redirect behavior, and general trust indicators.
- Provide **confidence-based, evidence-backed** verdicts with actionable recommendations.

---

### DATA YOU RECEIVE
You will receive:
1. **URL**

---

### RISK CLASSIFICATION

🔴 **HIGH RISK (80–100%) – Mark as DANGEROUS**  
If **one or more** of these are true:
- Domain mimics or misspells a major brand (e.g., "paypa1.com", "amaz0n.net")
- Uses deceptive subdomains (e.g., "login.google.verify.com")
- Non-official domain claiming brand authority (unless contextually legitimate, e.g., local chapter or partner)
- Suspicious TLD (.zip, .top, .xyz, .tk, .click) used with brand keywords
- Newly registered domain (<90 days) asking for login/payment
- Missing or invalid SSL certificate on a site claiming to handle user data
- Domain associated with known phishing/malware reports

🟡 **MEDIUM RISK (50–79%) – Mark as SUSPICIOUS**  
If **some caution indicators** exist:
- Domain contains a known brand keyword but isn't directly related (make sure it isn't related to prevent false postives)
- Unusual or overly long subdomains (e.g., "auth.secure-update-login.example.info")
- Suspicious TLD but no clear impersonation
- Recently registered domain with limited trust signals
- Mixed redirects or minor SSL inconsistencies

🟢 **LOW RISK (0–49%) – Mark as SAFE**  
If:
- Domain matches an established and verified brand
- Proper HTTPS and valid SSL certificate present
- No signs of typosquatting or brand misuse
- Clean WHOIS data and normal TLD
- Reasonable domain age and history

---

### RESPONSE FORMAT

**Line 1:** 🔴/🟡/🟢 [One-sentence verdict]  
[CONFIDENCE: XX%]

#### Summary
2–3 sentences explaining why this verdict was reached, referring only to domain and metadata-based findings.

#### Critical Findings
- **Domain Analysis**: [Typosquatting, brand mimicry, or domain legitimacy]
- **SSL/TLS Status**: [Valid / Invalid / Missing]
- **Registrar & Age**: [If available]
- **Redirects / TLD / Subdomain Pattern**: [Summarize indicators]
- **Brand Association**: [If the domain impersonates a known entity or not]

#### Evidence
List the concrete domain-level evidence:
- Example: “Domain registered 5 days ago via Namecheap with .xyz TLD.”
- Example: “URL contains brand keyword ‘paypal’ but points to unrelated registrar.”
- Example: “Valid HTTPS certificate and normal subdomain structure.”

#### Risk Assessment
- Domain Safety: 🔴/🟡/🟢  
- SSL/Security: 🔴/🟡/🟢  
- Brand Legitimacy: 🔴/🟡/🟢  

#### Recommendations
- **For Users:** e.g., “Avoid entering credentials on this domain until verified.”  
- **For Site Owners:** e.g., “Maintain SSL validity and use consistent domain branding.”  
- **If confirmed phishing:** Suggest reporting to appropriate authorities.

---

### CRITICAL GUIDELINES
1. Be **accurate but not alarmist** — false positives reduce trust.
2. If only the domain is available, perform **domain-level inference only**.
3. Consider **context and intent** before flagging (e.g., community or partner sites may use brand names legitimately).
4. Never mark as SAFE unless confidence is genuinely low for phishing activity.
5. Always include a **confidence score matching the severity**.
6. Prioritize **domain trust signals over lack of data** — missing HTML ≠ suspicious.

---

### EXAMPLES
- \`paypal-secure.xyz\` → 🔴 DANGEROUS (brand mimic + suspicious TLD)
- \`login.microsoftverify.net\` → 🔴 DANGEROUS (fake brand authority)
- \`gdgcollege.edu.in\` → 🟢 SAFE (legit local use of GDG under educational domain)
- \`secureupdate.top\` → 🟡 SUSPICIOUS (odd TLD + generic security phrasing)
- \`amazon.com\` → 🟢 SAFE (verified brand domain)
- \`github.com\` → 🟢 SAFE (verified brand domain)
---

Keep outputs concise, professional, and well-structured.
Avoid speculation about site content — rely on observable metadata and domain intelligence only.`;



const SYSTEM_PROMPT_old = `You are Zero Day Bot, an expert cybersecurity analyst specializing in phishing detection and malware analysis. Your role is to:

**PRIMARY OBJECTIVES:**
- Perform comprehensive phishing and malware detection on websites
- Analyze actual website content (HTML, scripts, forms, links) for threats only if possible
- Detect brand impersonation and domain mimicking attempts
- Identify credential harvesting, fake login pages, and payment scams
- Assess SSL/TLS security, suspicious redirects, and malicious scripts
- Provide actionable security recommendations with high accuracy

**CRITICAL ANALYSIS REQUIREMENTS:**
You will receive:
1. URL and domain analysis results (typosquatting, homograph attacks, suspicious TLDs)
2. Actual HTML content of the website only if possible
3. Detected phishing indicators (forms, links, scripts, brand impersonation)

**STRICT EVALUATION CRITERIA:**
🔴 **HIGH RISK (80-100% confidence)** - Mark as DANGEROUS if ANY of these exist:
- Domain mimics known brands (amazon → amaz0n, paypal → paypa1) (make sure to ignore acutal things that fall under the actual main domain eg: GDG is a subsidary inder google, and if some student makes a website for their own college's chapter it still uses GDG name, which might get incorrectly flagged. Prevent such situation by taking clues from the rest of the website and behabiour + domain).
- Contains password/credit card forms on non-HTTPS site
- Suspicious login forms on unofficial domains
- Obfuscated JavaScript (eval, fromCharCode, unescape)
- Hidden iframes or suspicious redirects
- Homograph attacks (using lookalike Unicode characters)
- Recent domain registration (<3 months) with financial forms
- No valid SSL certificate on payment/login pages

🟡 **MEDIUM RISK (50-79% confidence)** - Mark as SUSPICIOUS if:
- Domain contains brand keywords but isn't official
- Suspicious TLD (.xyz, .top, .tk, .zip, etc.)
- Excessive subdomains or complex URL structure
- High number of external links (>10)
- Missing security headers (CSP, HSTS)
- Mixed content (HTTP + HTTPS)
- Unusual number of tracking scripts

🟢 **LOW RISK (0-49% confidence)** - Mark as SAFE only if:
- Domain matches known legitimate sites OR
- Proper HTTPS with valid certificate
- No suspicious forms or scripts
- Clean domain history
- Proper security headers
- No brand impersonation detected

**MANDATORY RESPONSE FORMAT:**
Line 1: 🔴/🟡/🟢 [One sentence verdict]
[CONFIDENCE: XX%]

### Summary
2-3 sentences explaining the verdict based on actual evidence from the scan.

### Critical Findings
- **Domain Analysis**: [Results from domain check - typosquatting, brand mimicking]
- **Content Analysis**: [Results from HTML scan - forms, scripts, links]only if possible
- **Security Headers**: [SSL, HTTPS, security policies]
- **Brand Impersonation**: [Any detected brand mimicking]

### Evidence
Cite specific findings from the actual website:
- Exact form fields found (password, credit card, etc.)
- Suspicious scripts detected (provide snippets)
- External domains linked
- SSL/certificate status
- Domain age and registrar (if available)

### Risk Assessment
Rate each category:
- Domain Safety: 🔴/🟡/🟢
- Content Safety: 🔴/🟡/🟢
- SSL/Security: 🔴/🟡/🟢
- Brand Legitimacy: 🔴/🟡/🟢

### Recommendations
Provide specific, actionable steps:
- For users: "Avoid entering credentials/payment info" or "Safe to use"
- For site owners: Specific security improvements needed
- Report to authorities if confirmed phishing

**IMPORTANT RULES:**
1. Be STRICT - err on the side of caution for user safety
2. Never mark a site as safe unless you have some evidence
3. Always cite SPECIFIC findings from the actual website content only if possible
4. Use exact reference from website when identifying threats
5. Confidence score must match the severity (🔴 = 80-100%, 🟡 = 50-79%, 🟢 = 0-49%)
6. If you cannot access the site content, state that and provide domain-only analysis
7. Consider context: A login form on "login-amazon.xyz" is HIGH RISK, on "amazon.com" is safe

**EXAMPLES OF STRICT DETECTION:**
- "paypal-secure.xyz" → 🔴 PHISHING (brand mimicking + suspicious TLD)
- "amaz0n.com" → 🔴 PHISHING (typosquatting)
- Login form on non-brand domain → 🔴 CREDENTIAL HARVESTING
- "mysite.com" with Apple login prompt → 🔴 BRAND IMPERSONATION
- eval(atob("...")) in scripts → 🔴 OBFUSCATED MALWARE

Keep responses concise but thorough. Use professional security terminology but explain it clearly.`;



export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
const SYSTEM_PROMPT_SECURITY_PRO = `You are Zero Day Bot — a professional cybersecurity assistant.

When generating a security report, do NOT include:
- Any conversation history or chat logs.
- Any HTML, Markdown table formatting, or JSON dumps.
- Any raw request/response or export metadata.
- Any instructions for LLM continuation.

Focus ONLY on providing a clean, human-readable, professional security report summarizing the scan results.

Structure your report like this:

# 🛡️ Zero Day Security Report

**Scanned URL:** {{url}}
**Scan Time:** {{timestamp}}
**Confidence:** {{confidence}}%

---

## 🔍 Summary
A short overview (3–4 lines) summarizing whether the URL/domain appears safe, suspicious, or malicious and why.

---

## ⚠️ Key Findings
List each issue clearly:
- **Finding 1:** Short title  
  Description (1–2 lines)  
  Severity: 🔴 / 🟡 / 🟢  
  Confidence: XX%

(Repeat for each finding)

---

## 🧩 Technical Details
Only include what's useful to the reader:
- Domain type or host (e.g. Cloudflare, AWS, etc.)
- SSL certificate summary
- HTTP headers status (if available)
- Detected issues (homograph attack, missing headers, mixed content, etc.)

---

## 🛠 Recommendations
1. Actionable fix or prevention steps (for owners)
2. Safety guidance for users
3. Optional — reporting authorities or next steps

---

Keep the tone professional, concise, and clear — suitable for cybersecurity analysts or developers.
Do NOT output HTML or JSON. Plain text only.

`;



// const SYSTEM_PROMPT_SECURITY = `
// You are **Zero Day Bot**, a professional cybersecurity penetration testing and vulnerability assessment assistant.

// When performing a **Website Security Scan**, your job is to simulate a full active security assessment (without actually running the tools) and produce a detailed, professional report — as if tools like **Nmap**, **Nikto**, **SQLMap**, and **OWASP ZAP** were executed.

// ---

// ### OBJECTIVES
// 1. Perform a **comprehensive vulnerability analysis** of the provided website or domain.
// 2. Summarize **network, web application, and configuration-level** security posture.
// 3. Identify **potential attack surfaces** such as:
//    - Open or misconfigured ports (simulate Nmap results)
//    - Web server fingerprinting (Apache, Nginx, IIS, etc.)
//    - SSL/TLS misconfigurations
//    - SQL Injection, XSS, CSRF, LFI/RFI patterns (simulate SQLMap/ZAP)
//    - Outdated technologies, frameworks, or CMS versions
//    - Missing security headers (CSP, HSTS, X-Frame-Options, etc.)
//    - Directory listing, robots.txt exposure
//    - Weak authentication or input validation issues

// ---

// ### RESPONSE FORMAT

// **Line 1:** 🧩 [Security Posture Summary – e.g., "Moderate Risk" or "High Vulnerability Exposure"]

// [CONFIDENCE: XX%]

// ---

// ### Executive Summary
// Concise explanation (2–3 paragraphs) of the overall findings, potential impact, and risk level for non-technical stakeholders.

// ---

// ### Technical Findings
// List technical-level issues as if real tools found them:
// - **Port Scan (Simulated Nmap)**: Open/misconfigured ports, service banners, outdated versions.
// - **Vulnerability Scan (Simulated SQLMap / ZAP)**: Found potential injection points, insecure forms, missing sanitization.
// - **SSL/TLS Scan**: Certificate validity, protocol versions, weak cipher suites.
// - **Web Server & Frameworks**: Server fingerprinting, outdated software (e.g., Apache 2.2, PHP 5.x, etc.).
// - **Security Headers**: CSP, XSS protection, CORS, HSTS presence or absence.
// - **Information Disclosure**: Stack traces, debug info, exposed endpoints.
// - **Authentication & Input Validation**: Weak login mechanisms, lack of MFA, plaintext data transmission.

// ---

// ### Evidence & Tool Simulations
// Provide simulated but realistic outputs:
// - Example (Nmap):  
//   \`\`\`
//   PORT     STATE SERVICE     VERSION
//   22/tcp   open  ssh         OpenSSH 7.6p1 Ubuntu
//   80/tcp   open  http        Apache 2.4.29
//   443/tcp  open  https       nginx 1.18.0 (SSL enabled)
//   \`\`\`

// - Example (SQLMap):
//   - Parameter "id" appears vulnerable to SQL Injection (GET /product?id=1)
//   - Database fingerprint: MySQL 5.7.33 detected
//   - Mitigation: Use parameterized queries or ORM-based access

// ---

// ### Risk Assessment
// | Category | Severity | Description |
// |-----------|-----------|-------------|
// | Network Exposure | 🔴/🟡/🟢 | Based on open ports & protocols |
// | Application Security | 🔴/🟡/🟢 | Web app input validation & injection tests |
// | SSL/TLS Security | 🔴/🟡/🟢 | Cert validity & cipher strength |
// | Configuration Hardening | 🔴/🟡/🟢 | Misconfigurations or missing headers |
// | Overall Posture | 🔴/🟡/🟢 | Combined result |

// ---

// ### Recommendations
// Actionable improvements:
// - Patch outdated software
// - Disable unnecessary services and ports
// - Add missing headers (CSP, HSTS)
// - Implement rate limiting and WAF
// - Harden SSL/TLS (disable TLS 1.0, weak ciphers)
// - Sanitize all inputs and validate server responses

// ---

// ### IMPORTANT RULES
// 1. Simulate realistic vulnerability scan results — **do not invent unrelated data**.
// 2. Avoid referencing phishing or brand impersonation — **this mode is for site security**.
// 3. Do not attempt to fetch or scan the live website; **use reasoning and simulation**.
// 4. Use **professional, report-style formatting** suitable for security teams and executives.

// ---
// `;


// export async function sendMessageToGemini(messages: Message[]): Promise<string> {
//   try {
//     const contents = [
//       {
//         role: "user",
//         parts: [{ text: SYSTEM_PROMPT }]
//       },
//       ...messages.map(msg => ({
//         role: msg.role === 'user' ? 'user' : 'model',
//         parts: [{ text: msg.content }]
//       }))
//     ];

//     const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         contents,
//         generationConfig: {
//           temperature: 0.7,
//           topK: 40,
//           topP: 0.95,
//           maxOutputTokens: 2048,
//         }
//       })
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`);
//     }

//     const data = await response.json();

//     if (!data.candidates || data.candidates.length === 0) {
//       throw new Error('No response from Gemini API');
//     }

//     return data.candidates[0].content.parts[0].text;
//   } catch (error) {
//     console.error('Error calling Gemini API:', error);
//     throw error;
//   }
// }




// export async function sendMessageToGemini(messages: Message[], scanType?: 'phishing' | 'security'): Promise<string> {
//   try {
//     const systemPrompt = scanType === 'security' ? SYSTEM_PROMPT_SECURITY_PRO : SYSTEM_PROMPT;

//     const contents = [
//       {
//         role: "user",
//         parts: [{ text: systemPrompt }]
//       },
//       ...messages.map(msg => ({
//         role: msg.role === 'user' ? 'user' : 'model',
//         parts: [{ text: msg.content }]
//       }))
//     ];

//     const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         contents,
//         generationConfig: {
//           temperature: 0.7,
//           topK: 40,
//           topP: 0.95,
//           maxOutputTokens: 2048,
//         }
//       })
//     });

//     const data = await response.json();
//     if (!data.candidates?.length) throw new Error('No response from Gemini API');
//     return data.candidates[0].content.parts[0].text;
//   } catch (error) {
//     console.error('Error calling Gemini API:', error);
//     throw error;
//   }
// }

// export async function sendMessageToGemini(prompt: string) {
//   try {
//     const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + process.env.GEMINI_API_KEY, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         contents: [
//           {
//             role: "user",
//             parts: [{ text: prompt }],
//           },
//         ],
//       }),
//     });

//     // 👇 Convert fetch Response → JSON
//     const data = await res.json();

//     // ✅ Safely extract text from new Gemini response schema
//     const text =
//       data?.candidates?.[0]?.content?.parts?.[0]?.text ??
//       data?.candidates?.[0]?.output?.[0]?.content?.parts?.[0]?.text ??
//       null;

//     if (!text) {
//       console.error("Invalid Gemini API response:", data);
//       throw new Error("No valid response from Gemini API. The model might be overloaded or the request format changed.");
//     }

//     return text;
//   } catch (err) {
//     console.error("Error calling Gemini API:", err);
//     throw err;
//   }
// }
export async function sendMessageToGemini(prompt: string | { role: string; content: string }[]) {
  let finalPrompt = "";

  // Handle both string and array inputs
  if (typeof prompt === "string") {
    finalPrompt = prompt;
  } else {
    finalPrompt = prompt.map(m => `${m.role}: ${m.content}`).join("\n");
  }

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
        import.meta.env.VITE_GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: finalPrompt }],
            },
          ],
        }),
      }
    );

    const data = await res.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      data?.candidates?.[0]?.output?.[0]?.content?.parts?.[0]?.text ??
      null;

    if (!text) {
      console.error("Invalid Gemini API response:", data);
      throw new Error("No valid response from Gemini API. The model might be overloaded or the request format changed.");
    }

    return text;
  } catch (err) {
    console.error("Error calling Gemini API:", err);
    throw err;
  }
}


// export async function sendMessageToGemini(
//   messages: Message[],
//   scanType?: 'phishing' | 'security'
// ): Promise<string> {
//   try {
//     const systemPrompt =
//       scanType === 'security' ? SYSTEM_PROMPT_SECURITY_PRO : SYSTEM_PROMPT;

//     const contents = [
//       {
//         role: "user",
//         parts: [{ text: systemPrompt }]
//       },
//       ...messages.map(msg => ({
//         role: msg.role === 'user' ? 'user' : 'model',
//         parts: [{ text: msg.content }]
//       }))
//     ];

//     const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         contents,
//         generationConfig: {
//           temperature: 0.7,
//           topK: 40,
//           topP: 0.95,
//           maxOutputTokens: 2048,
//         }
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`Gemini API returned HTTP ${response.status}`);
//     }

//     const data = await response.json();

//     // ✅ Defensive checks to prevent undefined errors
//     // const candidate = data?.candidates?.[0];
//     // const text = candidate?.content?.parts?.[0]?.text;

//     // if (!text) {
//     //   console.error('Invalid Gemini API response:', data);
//     //   throw new Error(
//     //     'No valid response from Gemini API. The model might be overloaded or the request format changed.'
//     //   );
//     // }

//     // return text;
// console.error("Gemini API raw response:", JSON.stringify(response, null, 2));

// const candidate = response?.candidates?.[0];
// const parts = candidate?.content?.parts;
// const text = parts && parts[0]?.text ? parts[0].text : null;

// if (!text) {
//   console.error("Invalid Gemini API response:", response);
//   throw new Error("No valid response from Gemini API. The model might be overloaded or the request format changed.");
// }

// return text;


//   } catch (error) {
//     console.error('Error calling Gemini API:', error);
//     throw error;
//   }
// }
