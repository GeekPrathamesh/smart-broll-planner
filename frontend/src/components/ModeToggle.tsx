import { cn } from "@/lib/utils";

interface ModeToggleProps {
  mode: "default" | "custom";
  onModeChange: (mode: "default" | "custom") => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-xl">
      <button
        onClick={() => onModeChange("default")}
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          mode === "default"
            ? "bg-primary text-primary-foreground shadow-soft"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Default
      </button>
      <button
        onClick={() => onModeChange("custom")}
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          mode === "custom"
            ? "bg-primary text-primary-foreground shadow-soft"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Custom
      </button>
    </div>
  );
}
