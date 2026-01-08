import { useState } from "react";
import { Upload, Film, Video, Loader2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import { BRollItem } from "@/components/BRollItem";
import { toast } from "@/hooks/use-toast";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const DEFAULT_AROLL = {
  url: "https://fzuudapb1wvjxbrr.public.blob.vercel-storage.com/food_quality_ugc/a_roll.mp4",
  metadata:
    "Young Indian woman (mid-20s) with a calm, aware tone, speaking in Hinglish, delivering a food-quality awareness message.",
};

const DEFAULT_BROLL = [
  {
    id: "broll_1",
    url: "https://fzuudapb1wvjxbrr.public.blob.vercel-storage.com/food_quality_ugc/broll_1.mp4",
    description:
      "Mumbai street food context shot with closed or empty stalls, utensils and signboards visible, no people present. Establishes everyday food culture in an urban Indian city.",
  },
  {
    id: "broll_2",
    url: "https://fzuudapb1wvjxbrr.public.blob.vercel-storage.com/food_quality_ugc/broll_2.mp4",
    description:
      "Indoor shot of takeaway food containers placed on a table near a window, natural daylight, calm and relatable everyday eating scenario with no humans in frame.",
  },
  {
    id: "broll_3",
    url: "https://fzuudapb1wvjxbrr.public.blob.vercel-storage.com/food_quality_ugc/broll_3.mp4",
    description:
      "Close-up of uncovered food kept at a stall counter, subtle dust particles visible in light, highlighting hygiene concerns in a realistic, non-dramatic way.",
  },
  {
    id: "broll_4",
    url: "https://fzuudapb1wvjxbrr.public.blob.vercel-storage.com/food_quality_ugc/broll_4.mp4",
    description:
      "Clean indoor kitchen counter with freshly prepared food, vegetables and utensils neatly arranged, warm lighting showing a hygienic alternative.",
  },
  {
    id: "broll_5",
    url: "https://fzuudapb1wvjxbrr.public.blob.vercel-storage.com/food_quality_ugc/broll_5.mp4",
    description:
      "Organized indoor cafe or restaurant food display area, clean surfaces and professional setup, no staff or customers visible, reinforcing conscious food choices.",
  },
  {
    id: "broll_6",
    url: "https://fzuudapb1wvjxbrr.public.blob.vercel-storage.com/food_quality_ugc/broll_6.mp4",
    description:
      "Minimal indoor dining table near a window with a glass of water and fresh fruits, soft sunlight creating a calm, reflective closing shot focused on health.",
  },
];


export function UploadCard() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"default" | "custom">("default");
  const [arollUrl, setArollUrl] = useState(DEFAULT_AROLL.url);
  const [arollMetadata, setArollMetadata] = useState(DEFAULT_AROLL.metadata);
  const [brollItems, setBrollItems] = useState(DEFAULT_BROLL);
  const [isLoading, setIsLoading] = useState(false);

  /* ---------- Helpers ---------- */

  const addNewBroll = () => {
    const nextIndex = brollItems.length + 1;
    setBrollItems((items) => [
      ...items,
      {
        id: `broll_${nextIndex}`,
        url: "",
        description: "",
      },
    ]);
  };

  const updateBroll = (
    id: string,
    field: "url" | "description",
    value: string
  ) => {
    setBrollItems((items) =>
      items.map((b) =>
        b.id === id ? { ...b, [field]: value } : b
      )
    );
  };

  const removeBroll = (id: string) => {
    setBrollItems((items) => items.filter((b) => b.id !== id));
  };

  const isValid =
    arollUrl.trim() !== "" &&
    brollItems.length > 0 &&
    brollItems.every(
      (b) => b.url.trim() !== "" && b.description.trim() !== ""
    );

  /* ---------- Generate ---------- */

const handleGenerate = async () => {
  if (!isValid) return;

  setIsLoading(true);

  /* Inform user generation has started */
  toast({
    title: "Generating Plan",
    description: "Analyzing A-Roll and matching B-Rolls",
  });

  try {
    const res = await fetch(`${BACKEND_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        a_roll: {
          url: arollUrl,
          metadata: arollMetadata,
        },
        b_rolls: brollItems.map((b) => ({
          id: b.id,
          url: b.url,
          metadata: b.description,
        })),
      }),
    });

    const data = await res.json();
    const { timeline, transcript } = data;

    /* Success feedback */
    toast({
      title: "Plan Generated",
      description: "B-roll timeline created successfully",
    });

    navigate("/results", {
      state: {
        timeline,
        transcript,
        aRollUrl: arollUrl,
      },
    });

  } catch (err) {
    console.error(err);

    /* Error feedback */
    toast({
      title: "Generation Failed",
      description: "Unable to generate B-roll plan",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

const handleModeChange = (newMode: "default" | "custom") => {
  setMode(newMode);

  if (newMode === "custom") {
    setArollUrl("");
    setArollMetadata("");
    setBrollItems([]);
  }

  if (newMode === "default") {
    setArollUrl(DEFAULT_AROLL.url);
    setArollMetadata(DEFAULT_AROLL.metadata);
    setBrollItems(DEFAULT_BROLL);
  }
};



  /* ---------- UI ---------- */

  return (
    <div className="glass-card-glow p-8 max-w-6xl w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-xl bg-primary/10">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Upload Videos</h2>
          <p className="text-sm text-muted-foreground">
            Configure your A-Roll and B-Roll sources
          </p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="mb-8">
        <ModeToggle mode={mode} onModeChange={handleModeChange} />
      </div>

      {/* Default Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* A-Roll */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" />
            <h3 className="font-medium">A-Roll</h3>
          </div>

          <input
            value={arollUrl}
            onChange={(e) => setArollUrl(e.target.value)}
            placeholder="A-Roll video URL"
            className="w-full px-4 py-3 rounded-xl border bg-muted/40"
          />
          <p>Optional description</p>
          <textarea
            value={arollMetadata}
            onChange={(e) => setArollMetadata(e.target.value)}
            rows={6}
            placeholder="Describe the A-Roll (not mandatory)"
            className="w-full px-4 py-3 rounded-xl border bg-muted/40 resize-none"
          />
        </div>

        {/* B-Rolls */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            <h3 className="font-medium">
              B-Roll Clips (Add detailed metadata to improve accuracy)
            </h3>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
            {brollItems.map((b) => (
              <BRollItem
                key={b.id}
                id={b.id}
                url={b.url}
                description={b.description}
                onUrlChange={(v) => updateBroll(b.id, "url", v)}
                onDescriptionChange={(v) => updateBroll(b.id, "description", v)}
                onRemove={() => removeBroll(b.id)}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={addNewBroll}
            className="w-full border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add B-Roll
          </Button>
        </div>
      </div>

      {/* Generate */}
      <div className="mt-8 pt-6 border-t">
        <Button
          className="w-full"
          size="xl"
          disabled={!isValid || isLoading}
          onClick={handleGenerate}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Generating…
            </>
          ) : (
            "Generate Plan"
          )}
        </Button>
      </div>
    </div>
  );
}
