import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { Film, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimelineCard } from "@/components/TimelineCard";
import { TranscriptCard } from "@/components/TranscriptCard";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  
  const { timeline, transcript ,aRollUrl } = location.state || {};
  console.log(timeline,transcript);

  // Redirect if no data
  if (!timeline || !transcript) {
    return <Navigate to="/" replace />;
  }


const [videoUrl, setVideoUrl] = useState(null);

const handleGenerateVideo = async () => {
  try {
    setIsGeneratingVideo(true);

    const payload = {
      a_roll_url: aRollUrl,
      insertions: timeline.insertions.map(i => ({
        start_sec: i.start_sec,
        duration_sec: i.duration_sec,
        broll_URL: i.broll_URL
      }))
    };

    const res = await fetch("http://localhost:3001/api/video/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Video generation failed");
    }

    // Backend returns local path → expose it via static route
    setVideoUrl(`http://localhost:3001/${data.output}`);

  } catch (err) {
  console.error(err);
  alert(err.message);
}
 finally {
    setIsGeneratingVideo(false);
  }
};


  return (
    <div className="min-h-screen bg-background">
      {/* Subtle gradient background with neon hint */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.02] pointer-events-none" />
      
      <div className="relative">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="container flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Film className="w-5 h-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground">B-Roll Planner</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Upload
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="container px-6 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Title Section */}
            <div className="text-center mb-10 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Analysis Complete
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
                Your B-Roll Timeline
              </h1>
              <p className="text-muted-foreground">
                Review the generated insertion points and transcript analysis
              </p>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <TimelineCard data={timeline} />
              <TranscriptCard transcript={transcript} />
            </div>

            {/* Generate Video Button */}
            <div className="flex justify-center animate-fade-in" style={{ animationDelay: "200ms" }}>
              <Button
                variant="generate"
                size="xl"
                onClick={handleGenerateVideo}
                disabled={isGeneratingVideo}
                className="gap-3 min-w-[280px]"
              >
                {isGeneratingVideo ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Video...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Full Video
                  </>
                )}
              </Button>
            </div>

            {/* Progress indicator when generating */}
            {isGeneratingVideo && (
              <div className="mt-6 max-w-md mx-auto animate-fade-in">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full animate-shimmer"
                    style={{ 
                      width: "100%",
                      backgroundImage: "linear-gradient(90deg, transparent 0%, hsl(var(--primary)) 50%, transparent 100%)",
                      backgroundSize: "200% 100%"
                    }}
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground mt-3">
                  Processing your video with B-roll insertions...
                </p>
              </div>
            )}
          {/* video will be displayed here.. */}
                    {videoUrl && (
          <div className="mt-10 animate-fade-in">
            <div className="relative rounded-2xl border border-border/50 bg-background/80 backdrop-blur-xl shadow-xl overflow-hidden">
              
              {/* Gradient glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />

              <div className="relative p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Film className="w-5 h-5 text-primary" />
                  Generated Video Preview
                </h2>

               <div className="mx-auto max-w-3xl">
  <video
    src={videoUrl}
    controls
    className="w-full max-h-[420px] rounded-xl border border-border/40 shadow-lg object-contain bg-black"
  />
</div>


                <p className="mt-3 text-sm text-muted-foreground">
                  A-roll audio is preserved while B-roll visuals are inserted automatically.
                </p>
              </div>
            </div>
          </div>
        )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default Results;
