import { CaptionGenerator } from "@/components/caption-generator";
import { Brain, Zap, Globe } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-8 sm:pt-16 sm:pb-12">
          {/* Header */}
          <header className="text-center space-y-4 mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight text-balance">
              Bangla Image Captioning
            </h1>

            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
              Custom-built machine learning model that generates descriptive
              captions in Bangla with real-time streaming output.
            </p>
          </header>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Real-time Streaming
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-sm">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Bangla Output
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <div className="bg-card rounded-2xl border border-border shadow-xl shadow-black/5 p-6 sm:p-8">
          <CaptionGenerator />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>Custom-built ML model for Bangla image captioning</p>
            <p className="text-xs">Powered by Next.js + Server-Sent Events</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
