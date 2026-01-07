import { useState } from "react";
import { Clock, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimelineData {
  insertions: Array<{
    timestamp: string;
    duration: string;
    broll: string;
    reason: string;
  }>;
  totalInsertions: number;
  totalDuration: string;
}

interface TimelineCardProps {
  data: TimelineData;
}

export function TimelineCard({ data }: TimelineCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-6 h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">B-Roll Timeline</h2>
            <p className="text-sm text-muted-foreground">{data.totalInsertions} insertions · {data.totalDuration}</p>
          </div>
        </div>
        
        <Button
          variant="glass"
          size="sm"
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy JSON
            </>
          )}
        </Button>
      </div>

      {/* Code Window */}
      <div className="code-window overflow-hidden">
        {/* macOS dots header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
          <div className="w-3 h-3 rounded-full bg-red-400/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
          <div className="w-3 h-3 rounded-full bg-green-400/80" />
          <span className="ml-3 text-xs text-muted-foreground">timeline.json</span>
        </div>
        
        {/* Code content */}
        <div className="p-4 overflow-auto max-h-[500px] scrollbar-thin">
          <pre className="text-sm text-foreground/90 leading-relaxed">
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
