import { FileText } from "lucide-react";

interface TranscriptSegment {
  start_sec: number;
  end_sec: number;
  translated_text: string;
  text: string;
}

interface TranscriptCardProps {
  transcript: TranscriptSegment[];
}

/* helper: seconds → HH:MM:SS */
function formatTime(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return [
    hrs.toString().padStart(2, "0"),
    mins.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0"),
  ].join(":");
}

export function TranscriptCard({ transcript }: TranscriptCardProps) {
  return (
    <div className="glass-card p-6 h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Transcript Analysis
          </h2>
          <p className="text-sm text-muted-foreground">
            Content breakdown with timestamps
          </p>
        </div>
      </div>

      {/* Transcript */}
      <div className="space-y-4 max-h-[540px] overflow-y-auto pr-2 scrollbar-thin">
        {transcript.map((seg, index) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors"
          >
            {/* Timestamp */}
            <span className="inline-block px-2 py-1 mb-2 text-xs font-mono font-medium text-primary bg-primary/10 rounded-md">
              {formatTime(seg.start_sec)}
            </span>

            {/* Text */}
            <p className="text-sm text-foreground/90 leading-relaxed">
              {seg.text}
            </p>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {seg.translated_text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
