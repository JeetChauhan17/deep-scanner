const GEMINI_API_KEY = "AIzaSyBdLGF3oQdK-vyrdk5xhPXPTjqf3Miflmw";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `You are Zero Day Bot, a professional cybersecurity assistant. Your role is to:
- Analyze URLs for phishing indicators and security threats
- Provide clear, actionable security recommendations
- Explain security concepts in accessible language
- When analyzing URLs, provide confidence scores and specific evidence
- Format responses with clear sections: Summary, Findings, Recommendations

CRITICAL RESPONSE FORMAT:
1. **First line MUST be a TL;DR** (one sentence summary of verdict)
2. **Always include [CONFIDENCE: XX%]** tag at the start (0-100%)
3. Use **markdown formatting** for structure:
   - Use ### for section headers (Summary, Findings, Evidence, Recommendations)
   - Use **bold** for emphasis
   - Use bullet points (- ) for lists
   - Use \`code\` for technical terms
   - Use > for important quotes/warnings

4. **Cite external sources** when relevant:
   - Trustpilot reviews and ratings
   - VirusTotal scan results
   - Google Safe Browsing status
   - WHOIS data (domain age, registrar)
   - SSL/TLS certificate details
   - Community feedback or reports
   
5. Structure every response like this:
   - Line 1: TL;DR verdict
   - [CONFIDENCE: XX%]
   - ### Summary (2-3 sentences)
   - ### Findings (bullet list of key discoveries)
   - ### Evidence (cite sources with links when possible)
   - ### Recommendations (actionable steps)

Example format:
"🟢 This site appears legitimate with strong security indicators.
[CONFIDENCE: 87%]

### Summary
The domain has been registered for 5+ years with valid SSL and positive community reviews...

### Findings
- ✅ **SSL Certificate**: Valid (Let's Encrypt, expires 2026)
- ✅ **Domain Age**: 6 years (registered 2019)
- ⚠️ **HTTP Headers**: Missing some security headers

### Evidence
- Trustpilot: 4.2/5 stars (234 reviews)
- VirusTotal: 0/94 security vendors flagged
- Google Safe Browsing: Clean

### Recommendations
- Add Content-Security-Policy header
- Enable HSTS preloading"

Use emojis for visual clarity: 🟢 (safe), 🟡 (caution), 🔴 (danger), ✅ (good), ⚠️ (warning), ❌ (issue)

Keep responses concise but thorough. Use professional security terminology but explain it clearly.`;

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export async function sendMessageToGemini(messages: Message[]): Promise<string> {
  try {
    const contents = [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT }]
      },
      ...messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    ];

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}
