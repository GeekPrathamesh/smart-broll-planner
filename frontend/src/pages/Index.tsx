import { UploadCard } from "@/components/UploadCard";
import { Film } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const Index = () => {
  const [health, sethealth] = useState("backend not working fine");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/health`);
        const data = await response.json();
        console.log("Backend health:", data);

        if (data.status === "ok") {
          sethealth("backend working fine");

          /* Show success toast when backend is healthy */
          toast({
            title: "Backend Connected",
            description: "Server is running and ready to process videos",
          });
        }
      } catch (error) {
        console.error("Backend not reachable", error);
        sethealth("backend has some issue to operate");

        /* Show error toast if backend is down */
        toast({
          title: "Backend Error",
          description: "Unable to connect to backend server",
          variant: "destructive",
        });
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.02] pointer-events-none" />
      
      <div className="relative">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="container flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Film className="w-5 h-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground">
                B-Roll Planner
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {health}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container px-6 py-10 lg:py-15">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 tracking-tight">
                Smart B-Roll Planning
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Upload your main video and B-roll clips. Our AI will analyze the
                content and generate an optimal insertion timeline.
              </p>
            </div>

            <div className="flex justify-center">
              <UploadCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
