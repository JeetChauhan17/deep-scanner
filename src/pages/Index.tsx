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
  const [scanType, setScanType] = useState<'phishing' | 'passive'>('phishing');
  const [messages, setMessages] = useState<Message[]>(demoMessages);
  const [currentReport, setCurrentReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const handleStartScan = () => {
    setShowApp(true);
    setUrlModalOpen(true);
  };

  const handleScanSubmit = (url: string, type: 'phishing' | 'passive') => {
    setScanningUrl(url);
    setLastScannedUrl(url);
    setScanType(type);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `Scan ${url} for ${type === 'phishing' ? 'phishing' : 'security issues'}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Simulate scan with progress
    setTimeout(() => {
      setScanningUrl(null);
      
      if (type === 'phishing') {
        // Demo phishing result
        const result = url.includes('phish') || url.includes('suspicious') 
          ? demoPhishingResults.suspicious 
          : demoPhishingResults.benign;
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Phishing Check Results for ${url}:\n\nVerdict: ${result.verdict.toUpperCase()}\nConfidence: ${Math.round(result.confidence * 100)}%\n\n${result.explanation}\n\nKey Indicators:\n${result.reasons.map(r => `• ${r.note}`).join('\n')}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        toast.success('Phishing check completed');
      } else {
        // Demo site scan
        setCurrentReport(demoSiteReport);
        setInspectorOpen(true);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Security scan completed for ${url}.\n\n${demoSiteReport.summary}\n\nView detailed findings in the Inspector panel →`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        toast.success('Security scan completed');
      }
    }, 5000);
  };

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
              <Shield className="w-5 h-5 text-primary" />
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
