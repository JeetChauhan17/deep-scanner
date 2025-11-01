import { useState } from "react";
import { Hero } from "@/components/Hero";
import { ChatInterface } from "@/components/ChatInterface";
import { InspectorPanel } from "@/components/InspectorPanel";
import { URLInputModal } from "@/components/URLInputModal";
import { ScanProgressModal } from "@/components/ScanProgressModal";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X } from "lucide-react";
import { demoMessages, demoSiteReport, demoPhishingResults } from "@/lib/demoData";
import { toast } from "sonner";
import { sendMessageToGemini, type Message } from "@/lib/geminiService";

const Index = () => {
  const [showApp, setShowApp] = useState(false);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [scanningUrl, setScanningUrl] = useState<string | null>(null);
  const [lastScannedUrl, setLastScannedUrl] = useState<string>("");
  const [scanType, setScanType] = useState<'phishing' | 'site'>('phishing');
  const [messages, setMessages] = useState<Message[]>(demoMessages);
  const [currentReport, setCurrentReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const handleStartScan = () => {
    setShowApp(true);
    setUrlModalOpen(true);
  };

  const handleScanSubmit = async (url: string, type: 'phishing' | 'site') => {
  setScanningUrl(url);
  setLastScannedUrl(url);
  setScanType(type);

  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: `Run a ${type === 'phishing' ? 'phishing' : 'security'} scan on ${url}`,
    timestamp: new Date(),
  };
  setMessages(prev => [...prev, userMessage]);

  try {
    const { fetchWebsiteContent, analyzeDomain, analyzeHTML, runSecurityScan } = await import('@/lib/scanService');

    let scanResults = '';
    let report: any = null;

    // 🧩 Branch logic based on scan type
    if (type === 'phishing') {
      // --- EXISTING PHISHING LOGIC ---
      const domainAnalysis = analyzeDomain(url);
      const websiteData = await fetchWebsiteContent(url);
      let phishingReport = '';

      if (websiteData.error) {
        phishingReport = `**URL:** ${url}\n\n❌ Could not fetch site content (${websiteData.error})\n`;
      } else {
        const htmlAnalysis = analyzeHTML(websiteData.html || '', url);
        phishingReport = `**URL:** ${url}\n\n**Phishing Risk Analysis:**\n`;

        if (domainAnalysis.isSuspicious)
          phishingReport += `🔴 Suspicious domain: ${domainAnalysis.reasons.join(', ')}\n`;
        if (htmlAnalysis.suspiciousForms.detected)
          phishingReport += `🔴 Malicious forms: ${htmlAnalysis.suspiciousForms.details}\n`;
        if (htmlAnalysis.suspiciousScripts.detected)
          phishingReport += `⚠️ Suspicious scripts: ${htmlAnalysis.suspiciousScripts.details}\n`;
        if (!htmlAnalysis.suspiciousForms.detected && !htmlAnalysis.suspiciousScripts.detected)
          phishingReport += `✅ No phishing signatures detected.\n`;
      }

      const aiPrompt = `Perform a phishing risk analysis for the following website:\n\n${phishingReport}\n\nSummarize risks and likelihood.`;
      const response = await sendMessageToGemini([...messages, userMessage, { ...userMessage, content: aiPrompt }]);

      scanResults = phishingReport;
      report = {
        summary: phishingReport,
        confidence: 0.85,
        findings: [
          {
            id: 'phishing-analysis',
            title: 'Phishing Analysis',
            severity: domainAnalysis.isSuspicious ? 'high' : 'low',
            confidence: domainAnalysis.brandImpersonation ? 95 : (domainAnalysis.isSuspicious ? 80 : 20),
            evidence: domainAnalysis.reasons.join(', '),
            fix: 'Avoid domains with suspicious naming or structure.',
          },
        ],
        timestamp: new Date(),
        rawOutput: response,
      };

    } else {
      // --- SECURITY / CONFIGURATION SCAN LOGIC ---
      const secResults = await runSecurityScan(url);
      const aiPrompt = `Analyze this web security scan report and summarize vulnerabilities and fixes:\n\n${JSON.stringify(secResults, null, 2)}`;
      const response = await sendMessageToGemini([...messages, userMessage, { ...userMessage, content: aiPrompt }]);

      scanResults = JSON.stringify(secResults, null, 2);
      report = {
        summary: 'Security misconfiguration and open port analysis.',
        confidence: 0.9,
        findings: secResults.vulnerabilities.map((v: any, i: number) => ({
          id: `vuln-${i}`,
          title: v.name,
          severity: v.severity,
          evidence: v.description,
          fix: v.fix,
        })),
        timestamp: new Date(),
        rawOutput: response,
      };
    }

    const assistantMessage: Message = {
      id: (Date.now() + 2).toString(),
      role: 'assistant',
      content: report.rawOutput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setCurrentReport(report);
    setInspectorOpen(true);
    toast.success(`${type === 'phishing' ? 'Phishing' : 'Security'} scan completed`);

  } catch (error) {
    console.error('Scan error:', error);
    setScanningUrl(null);
    toast.error('Scan failed. Please try again.');

    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `Sorry, I encountered an error while scanning ${url}. Please check the URL and try again.`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, errorMessage]);
  }
};

  

  // const handleScanSubmit = async (url: string, type: 'phishing' | 'site') => {
  //   setScanningUrl(url);
  //   setLastScannedUrl(url);
  //   setScanType(type);

  //   // Add user message
  //   const userMessage: Message = {
  //     id: Date.now().toString(),
  //     role: 'user',
  //     content: `Scan ${url} for ${type === 'phishing' ? 'phishing' : 'security issues'}`,
  //     timestamp: new Date(),
  //   };
  //   setMessages(prev => [...prev, userMessage]);

  //   try {
  //     // Perform actual scan
  //     const { fetchWebsiteContent, analyzeDomain, analyzeHTML } = await import('@/lib/scanService');

  //     // Step 1: Domain analysis
  //     const domainAnalysis = analyzeDomain(url);

  //     // Step 2: Fetch website content
  //     const websiteData = await fetchWebsiteContent(url);

  //     let scanResults = '';

  //     if (websiteData.error) {
  //       scanResults = `**URL:** ${url}\n\n**Error:** Could not fetch website content - ${websiteData.error}\n\n**Domain Analysis:**\n`;
  //       if (domainAnalysis.isSuspicious) {
  //         scanResults += `⚠️ Domain flagged as suspicious:\n${domainAnalysis.reasons.map(r => `- ${r}`).join('\n')}`;
  //       } else {
  //         scanResults += `Domain appears structurally safe, but unable to verify content.`;
  //       }

  //       if (domainAnalysis.brandImpersonation) {
  //         scanResults += `\n\n🔴 **CRITICAL: Possible ${domainAnalysis.brandImpersonation.brand} impersonation detected (${Math.round(domainAnalysis.brandImpersonation.confidence)}% confidence)**`;
  //       }
  //     } else {
  //       // Step 3: Analyze HTML content
  //       const htmlAnalysis = analyzeHTML(websiteData.html || '', url);

  //       // Build comprehensive scan report
  //       scanResults = `**URL:** ${url}\n\n`;

  //       // Domain Analysis
  //       scanResults += `**DOMAIN ANALYSIS:**\n`;
  //       if (domainAnalysis.isSuspicious) {
  //         scanResults += `🔴 Suspicious domain detected:\n${domainAnalysis.reasons.map(r => `- ${r}`).join('\n')}\n\n`;
  //       } else {
  //         scanResults += `✅ Domain structure appears legitimate\n\n`;
  //       }

  //       if (domainAnalysis.brandImpersonation) {
  //         scanResults += `🔴 **BRAND IMPERSONATION ALERT:** Possible ${domainAnalysis.brandImpersonation.brand} impersonation (${Math.round(domainAnalysis.brandImpersonation.confidence)}% confidence)\n\n`;
  //       }

  //       // Content Analysis
  //       scanResults += `**CONTENT ANALYSIS:**\n`;

  //       if (htmlAnalysis.suspiciousForms.detected) {
  //         scanResults += `🔴 ${htmlAnalysis.suspiciousForms.details}\n`;
  //       }

  //       if (htmlAnalysis.suspiciousLinks.detected) {
  //         scanResults += `⚠️ ${htmlAnalysis.suspiciousLinks.details}\n`;
  //       }

  //       if (htmlAnalysis.suspiciousScripts.detected) {
  //         scanResults += `🔴 ${htmlAnalysis.suspiciousScripts.details}\n`;
  //       }

  //       if (htmlAnalysis.sslIssues.detected) {
  //         scanResults += `🔴 ${htmlAnalysis.sslIssues.details}\n`;
  //       }

  //       if (htmlAnalysis.brandImpersonation.detected) {
  //         scanResults += `🔴 ${htmlAnalysis.brandImpersonation.details}\n`;
  //       }

  //       if (!htmlAnalysis.suspiciousForms.detected &&
  //         !htmlAnalysis.suspiciousLinks.detected &&
  //         !htmlAnalysis.suspiciousScripts.detected &&
  //         !htmlAnalysis.sslIssues.detected &&
  //         !htmlAnalysis.brandImpersonation.detected) {
  //         scanResults += `✅ No immediate threats detected in website content\n`;
  //       }

  //       // Add HTML snippet for AI analysis (first 3000 chars)
  //       const htmlSnippet = (websiteData.html || '').substring(0, 3000);
  //       scanResults += `\n**HTML CONTENT SAMPLE:**\n\`\`\`html\n${htmlSnippet}\n\`\`\`\n`;
  //     }

  //     // Send to AI for comprehensive analysis
  //     const analysisPrompt = `Perform a comprehensive phishing and security analysis:\n\n${scanResults}\n\nProvide a detailed security assessment following the required format.`;

  //     const aiMessage: Message = {
  //       id: (Date.now() + 1).toString(),
  //       role: 'user',
  //       content: analysisPrompt,
  //       timestamp: new Date(),
  //     };

  //     const response = await sendMessageToGemini([...messages, userMessage, aiMessage]);
  //     console.log(response);
  //     setScanningUrl(null);

  //     const assistantMessage: Message = {
  //       id: (Date.now() + 2).toString(),
  //       role: 'assistant',
  //       content: response,
  //       timestamp: new Date(),
  //     };
  //     setMessages(prev => [...prev, assistantMessage]);

  //     // Create report for inspector panel
  //     const report = {
  //       summary: scanResults,
  //       confidence: 0.85,
  //       findings: [
  //         {
  //           id: 'domain-analysis',
  //           title: 'Domain Analysis',
  //           severity: domainAnalysis.isSuspicious ? 'high' : 'low',
  //           confidence: domainAnalysis.brandImpersonation ? 95 : (domainAnalysis.isSuspicious ? 80 : 20),
  //           evidence: domainAnalysis.reasons.join(', '),
  //           fix: domainAnalysis.isSuspicious ? 'Avoid this website - domain shows signs of malicious intent' : 'Domain appears safe',
  //         },
  //       ],
  //       timestamp: new Date(),
  //       rawOutput: response,
  //     };

  //     setCurrentReport(report);
  //     setInspectorOpen(true);

  //     toast.success('Security scan completed');

  //   } catch (error) {
  //     console.error('Scan error:', error);
  //     setScanningUrl(null);
  //     toast.error('Scan failed. Please try again.');

  //     const errorMessage: Message = {
  //       id: (Date.now() + 1).toString(),
  //       role: 'assistant',
  //       content: `Sorry, I encountered an error while scanning ${url}. Please check the URL and try again.`,
  //       timestamp: new Date(),
  //     };
  //     setMessages(prev => [...prev, errorMessage]);
  //   }
  // };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);

    try {
      const response = await sendMessageToGemini([...messages, userMessage]);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get response from AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showApp) {
    return <Hero onStartScan={handleStartScan} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center glow-subtle">
              {/* <Shield className="w-5 h-5 text-primary" /> */}
              <img className="w-10 h-10 text-primary" src="/Artboard 3.png" alt="" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold">Zero Day Bot</h1>
              <p className="text-xs text-muted-foreground">Security Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUrlModalOpen(true)}
              className="rounded-full glow-subtle hover:glow-purple transition-all"
            >
              New Scan
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setInspectorOpen(!inspectorOpen)}
              className="md:hidden"
            >
              {inspectorOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className={`flex-1 ${inspectorOpen ? 'hidden md:flex' : 'flex'} flex-col`}>
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>

        {/* Inspector Panel */}
        <div className={`w-full md:w-[400px] lg:w-[500px] border-l border-border bg-card/30 backdrop-blur-sm ${inspectorOpen ? 'flex' : 'hidden md:flex'} flex-col`}>
          <InspectorPanel
            report={currentReport}
            messages={messages}
            scannedUrl={lastScannedUrl}
          />
        </div>
      </div>

      {/* Modals */}
      <URLInputModal
        open={urlModalOpen}
        onOpenChange={setUrlModalOpen}
        onSubmit={handleScanSubmit}
      />

      <ScanProgressModal
        open={!!scanningUrl}
        scanType={scanType}
      />
    </div>
  );
};

export default Index;
