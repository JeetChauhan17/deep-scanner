// import { useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import { Link2, AlertTriangle, Shield } from "lucide-react";

// interface URLInputModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSubmit: (url: string, scanType: 'phishing' | 'passive') => void;
// }

// export const URLInputModal = ({ open, onOpenChange, onSubmit }: URLInputModalProps) => {
//   const [url, setUrl] = useState("");
//   const [scanType, setScanType] = useState<'phishing' | 'passive'>('phishing');
//   const [consent, setConsent] = useState(false);

//   const handleSubmit = () => {
//     if (!url || !consent) return;
//     onSubmit(url, scanType);
//     setUrl("");
//     setConsent(false);
//     onOpenChange(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="glass-card border-primary/20 max-w-2xl">
//         <DialogHeader>
//           <DialogTitle className="font-heading text-2xl flex items-center gap-2">
//             <Shield className="w-6 h-6 text-primary" />
//             Security Scan
//           </DialogTitle>
//           <DialogDescription className="text-muted-foreground">
//             Enter a URL to analyze for security issues. Choose your scan type below.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-6 pt-4">
//           {/* URL Input */}
//           <div className="space-y-2">
//             <Label htmlFor="url" className="text-sm font-medium">
//               Target URL
//             </Label>
//             <div className="relative">
//               <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//               <Input
//                 id="url"
//                 type="url"
//                 placeholder="https://example.com"
//                 value={url}
//                 onChange={(e) => setUrl(e.target.value)}
//                 className="pl-10 h-12 bg-background/50 border-border focus:border-primary transition-colors"
//               />
//             </div>
//           </div>

//           {/* Scan Type Selection */}
//           <div className="space-y-3">
//             <Label className="text-sm font-medium">Scan Type</Label>
//             <div className="grid grid-cols-2 gap-3">
//               <button
//                 onClick={() => setScanType('phishing')}
//                 className={`p-4 rounded-xl border transition-all duration-300 text-left ${
//                   scanType === 'phishing'
//                     ? 'border-primary bg-primary/5 glow-purple'
//                     : 'border-border hover:border-primary/30'
//                 }`}
//               >
//                 <AlertTriangle className="w-5 h-5 mb-2 text-primary" />
//                 <h4 className="font-semibold text-sm mb-1">Phishing Check</h4>
//                 <p className="text-xs text-muted-foreground">Fast passive analysis for suspicious links</p>
//               </button>

//               <button
//                 onClick={() => setScanType('passive')}
//                 className={`p-4 rounded-xl border transition-all duration-300 text-left ${
//                   scanType === 'passive'
//                     ? 'border-primary bg-primary/5 glow-purple'
//                     : 'border-border hover:border-primary/30'
//                 }`}
//               >
//                 <Shield className="w-5 h-5 mb-2 text-primary" />
//                 <h4 className="font-semibold text-sm mb-1">Site Scan</h4>
//                 <p className="text-xs text-muted-foreground">Comprehensive passive security audit</p>
//               </button>
//             </div>
//           </div>

//           {/* Consent */}
//           <div className="glass-card p-4 rounded-xl border border-border space-y-3">
//             <div className="flex items-start space-x-3">
//               <Checkbox
//                 id="consent"
//                 checked={consent}
//                 onCheckedChange={(checked) => setConsent(checked as boolean)}
//                 className="mt-1"
//               />
//               <div className="space-y-1">
//                 <Label
//                   htmlFor="consent"
//                   className="text-sm font-medium cursor-pointer leading-tight"
//                 >
//                   I confirm I have permission to scan this target
//                 </Label>
//                 <p className="text-xs text-muted-foreground">
//                   Active scans require domain ownership verification. Passive checks are allowed for any public URL.
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex gap-3 pt-2">
//             <Button
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//               className="flex-1 rounded-full"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleSubmit}
//               disabled={!url || !consent}
//               className="flex-1 rounded-full glow-purple hover:glow-purple-strong transition-all"
//             >
//               Start Scan
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link2, AlertTriangle, Shield } from "lucide-react";

interface URLInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // 👇 renamed to 'site' for clarity
  onSubmit: (url: string, scanType: "phishing" | "site") => void;
}

export const URLInputModal = ({
  open,
  onOpenChange,
  onSubmit,
}: URLInputModalProps) => {
  const [url, setUrl] = useState("");
  const [scanType, setScanType] = useState<"phishing" | "site">("phishing");
  const [consent, setConsent] = useState(false);

  const handleSubmit = () => {
    if (!url || !consent) return;
    onSubmit(url, scanType);
    setUrl("");
    setConsent(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-primary/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Security Scan
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter a URL to analyze for security issues. Choose your scan type below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium">
              Target URL
            </Label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 h-12 bg-background/50 border-border focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Scan Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Scan Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {/* Phishing Check */}
              <button
                onClick={() => setScanType("phishing")}
                className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                  scanType === "phishing"
                    ? "border-primary bg-primary/5 glow-purple"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <AlertTriangle className="w-5 h-5 mb-2 text-primary" />
                <h4 className="font-semibold text-sm mb-1">Phishing Check</h4>
                <p className="text-xs text-muted-foreground">
                  Fast passive analysis for suspicious links
                </p>
              </button>

              {/* Site Security Scan */}
              <button
                onClick={() => setScanType("site")}
                className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                  scanType === "site"
                    ? "border-primary bg-primary/5 glow-purple"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <Shield className="w-5 h-5 mb-2 text-primary" />
                <h4 className="font-semibold text-sm mb-1">Site Scan</h4>
                <p className="text-xs text-muted-foreground">
                  Comprehensive passive security audit
                </p>
              </button>
            </div>
          </div>

          {/* Consent */}
          <div className="glass-card p-4 rounded-xl border border-border space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consent"
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked as boolean)}
                className="mt-1"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="consent"
                  className="text-sm font-medium cursor-pointer leading-tight"
                >
                  I confirm I have permission to scan this target
                </Label>
                <p className="text-xs text-muted-foreground">
                  Active scans require domain ownership verification. Passive
                  checks are allowed for any public URL.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!url || !consent}
              className="flex-1 rounded-full glow-purple hover:glow-purple-strong transition-all"
            >
              Start Scan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
