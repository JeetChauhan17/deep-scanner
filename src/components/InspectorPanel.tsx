import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Shield, Code, Wrench, Download, Copy } from "lucide-react";

interface Finding {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  evidence: string;
  fix: string;
}

interface ScanReport {
  summary: string;
  confidence: number;
  findings: Finding[];
  rawOutputs?: string;
  timestamp: Date;
}

interface InspectorPanelProps {
  report: ScanReport | null;
}

export const InspectorPanel = ({ report }: InspectorPanelProps) => {
  if (!report) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted/20 flex items-center justify-center">
            <Shield className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-heading text-lg mb-2">No scan selected</h3>
            <p className="text-sm text-muted-foreground">
              Run a scan to view detailed results here
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'medium': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="summary" className="flex-1 flex flex-col">
        <div className="border-b border-border px-6 pt-6">
          <TabsList className="bg-muted/10">
            <TabsTrigger value="summary" className="gap-2">
              <FileText className="w-4 h-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="findings" className="gap-2">
              <Shield className="w-4 h-4" />
              Findings
            </TabsTrigger>
            <TabsTrigger value="evidence" className="gap-2">
              <Code className="w-4 h-4" />
              Evidence
            </TabsTrigger>
            <TabsTrigger value="fixes" className="gap-2">
              <Wrench className="w-4 h-4" />
              Fixes
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Summary Tab */}
            <TabsContent value="summary" className="mt-0 space-y-6">
              <div className="glass-card p-6 rounded-2xl border border-border">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-heading text-lg">Executive Summary</h3>
                  <Badge variant="outline" className="rounded-full">
                    {Math.round(report.confidence * 100)}% confidence
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {report.summary}
                </p>
              </div>

              {/* Confidence Meter */}
              <div className="glass-card p-6 rounded-2xl border border-border">
                <h4 className="text-sm font-semibold mb-3">Overall Confidence</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reliability</span>
                    <span className="font-semibold">{Math.round(report.confidence * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full transition-all duration-500"
                      style={{ width: `${report.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Findings', value: report.findings.length },
                  { label: 'High', value: report.findings.filter(f => f.severity === 'high').length },
                  { label: 'Medium', value: report.findings.filter(f => f.severity === 'medium').length },
                ].map((stat) => (
                  <div key={stat.label} className="glass-card p-4 rounded-xl border border-border text-center">
                    <div className="text-2xl font-heading font-bold text-primary">{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Findings Tab */}
            <TabsContent value="findings" className="mt-0 space-y-3">
              {report.findings.map((finding) => (
                <div
                  key={finding.id}
                  className="glass-card p-4 rounded-xl border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {finding.title}
                    </h4>
                    <Badge className={`rounded-full ${getSeverityColor(finding.severity)}`}>
                      {finding.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{Math.round(finding.confidence * 100)}% confidence</span>
                    <span>•</span>
                    <span>ID: {finding.id}</span>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Evidence Tab */}
            <TabsContent value="evidence" className="mt-0 space-y-3">
              {report.findings.map((finding) => (
                <div key={finding.id} className="glass-card p-4 rounded-xl border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-sm">{finding.title}</h4>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 font-mono text-xs border border-border">
                    <code className="text-muted-foreground">{finding.evidence}</code>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Fixes Tab */}
            <TabsContent value="fixes" className="mt-0 space-y-3">
              {report.findings.map((finding) => (
                <div key={finding.id} className="glass-card p-4 rounded-xl border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{finding.title}</h4>
                      <Badge className={`rounded-full text-xs ${getSeverityColor(finding.severity)}`}>
                        {finding.severity}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">{finding.fix}</p>
                    <Button size="sm" variant="outline" className="rounded-full mt-2">
                      <Copy className="w-3 h-3 mr-2" />
                      Copy Fix Command
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="border-t border-border p-4">
          <Button className="w-full rounded-full glow-purple hover:glow-purple-strong transition-all">
            <Download className="w-4 h-4 mr-2" />
            Download Full Report
          </Button>
        </div>
      </Tabs>
    </div>
  );
};
