import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Shield, Globe, Lock, Camera, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface ScanProgressModalProps {
  open: boolean;
  scanType: 'phishing' | 'site';
}

interface ScanStage {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const stages: ScanStage[] = [
  { id: 'dns', label: 'DNS Lookup', icon: <Globe className="w-5 h-5" /> },
  { id: 'tls', label: 'TLS Verification', icon: <Lock className="w-5 h-5" /> },
  { id: 'screenshot', label: 'Page Capture', icon: <Camera className="w-5 h-5" /> },
  { id: 'headers', label: 'Header Analysis', icon: <Search className="w-5 h-5" /> },
  { id: 'analysis', label: 'AI Analysis', icon: <Shield className="w-5 h-5" /> },
];

export const ScanProgressModal = ({ open, scanType }: ScanProgressModalProps) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) {
      setCurrentStage(0);
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [open]);

  useEffect(() => {
    const stageIndex = Math.min(
      Math.floor((progress / 100) * stages.length),
      stages.length - 1
    );
    setCurrentStage(stageIndex);
  }, [progress]);

  return (
    <Dialog open={open}>
      <DialogContent className="glass-card border-primary/20 max-w-md [&>button]:hidden">
        <div className="space-y-6 py-4">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center glow-purple animate-pulse-glow">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-heading text-xl">
              {scanType === 'phishing' ? 'Checking for Phishing' : 'Running Security Scan'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we analyze the target...
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="relative">
              <Progress value={progress} className="h-2" />
              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                <div
                  className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-scan-progress"
                  style={{
                    width: '30%',
                    animation: 'scan-progress 2s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Stages */}
          <div className="space-y-2">
            {stages.map((stage, index) => (
              <div
                key={stage.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                  index === currentStage
                    ? 'bg-primary/10 border border-primary/20 glow-subtle'
                    : index < currentStage
                    ? 'bg-primary/5 border border-primary/10'
                    : 'border border-transparent'
                }`}
              >
                <div
                  className={`transition-colors ${
                    index <= currentStage ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {stage.icon}
                </div>
                <span
                  className={`text-sm font-medium transition-colors ${
                    index <= currentStage ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {stage.label}
                </span>
                {index === currentStage && (
                  <div className="ml-auto flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
                {index < currentStage && (
                  <div className="ml-auto">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
