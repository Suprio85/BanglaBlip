"use client"

import { cn } from "@/lib/utils"

interface CaptionDisplayProps {
  caption: string
  isStreaming: boolean
  hasStarted: boolean
}

export function CaptionDisplay({ caption, isStreaming, hasStarted }: CaptionDisplayProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">
          Generated Caption
        </h3>
        {isStreaming && (
          <span className="text-xs text-primary animate-pulse flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Generating...
          </span>
        )}
      </div>
      
      <div
        className={cn(
          "relative rounded-xl border bg-card p-6 min-h-[120px] transition-all duration-300",
          "shadow-sm",
          isStreaming && "ring-2 ring-primary/20"
        )}
      >
        {!hasStarted ? (
          <p className="text-muted-foreground text-sm italic">
            Upload an image and click &quot;Generate Caption&quot; to see the result...
          </p>
        ) : (
          <p 
            className="text-xl leading-relaxed text-foreground"
            style={{ fontFamily: "var(--font-bengali), 'Noto Sans Bengali', sans-serif" }}
            lang="bn"
          >
            {caption}
            {/* Animated cursor while streaming */}
            {isStreaming && (
              <span 
                className="inline-block w-0.5 h-6 bg-primary ml-1 align-middle animate-pulse"
                style={{ animation: "pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
                aria-hidden="true"
              />
            )}
          </p>
        )}
      </div>
    </div>
  )
}
