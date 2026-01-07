import { X, Video } from "lucide-react";

interface Props {
  id: string;
  url: string;
  description: string;
  onUrlChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onRemove: () => void;
}

export function BRollItem({
  id,
  url,
  description,
  onUrlChange,
  onDescriptionChange,
  onRemove,
}: Props) {
  return (
    <div className="p-3 rounded-xl border bg-muted/30 space-y-2">
      <div className="flex items-center gap-2">
        <Video className="w-4 h-4 text-primary" />
        <span className="text-xs font-mono text-muted-foreground">
          {id}
        </span>
        <button
          onClick={onRemove}
          className="ml-auto text-muted-foreground hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <input
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="B-Roll video URL"
        className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
      />

      <textarea
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Describe what this B-Roll shows"
        rows={2}
        className="w-full px-3 py-2 rounded-lg border bg-background text-sm resize-none"
      />
    </div>
  );
}
