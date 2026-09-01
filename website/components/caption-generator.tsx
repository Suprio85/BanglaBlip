"use client";

import { useState, useCallback, useEffect } from "react";
import { Sparkles, Loader2, AlertCircle, Upload, Link2, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/image-uploader";
import { CaptionDisplay } from "@/components/caption-display";
import { cn } from "@/lib/utils";

interface StreamEvent {
  type: "start" | "chunk" | "end";
  content?: string;
}

const STORAGE_KEY = "bangla_blip_backend_url";

export function CaptionGenerator() {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [backendUrl, setBackendUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved backend URL from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setBackendUrl(saved);
  }, []);

  const handleBackendUrlChange = useCallback((val: string) => {
    setBackendUrl(val);
    localStorage.setItem(STORAGE_KEY, val);
  }, []);

  const generateCaption = useCallback(async () => {
    if (mode === "upload" && !selectedImage) return;
    if (mode === "url" && !imageUrl.trim()) return;

    setError(null);
    setCaption("");
    setIsStreaming(true);
    setHasStarted(true);

    try {
      const formData = new FormData();
      formData.append("backendUrl", backendUrl.trim());
      if (mode === "upload" && selectedImage) {
        formData.append("image", selectedImage);
      } else {
        formData.append("imageUrl", imageUrl.trim());
      }

      const response = await fetch("/api/caption", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate caption");
      }

      // Handle Server-Sent Events stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to read response stream");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || ""; // Keep incomplete message in buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data: StreamEvent = JSON.parse(line.slice(6));

              if (data.type === "chunk" && data.content) {
                setCaption((prev) => prev + data.content);
              } else if (data.type === "end") {
                setIsStreaming(false);
              }
            } catch {
              // Skip malformed JSON
              console.warn("Malformed SSE data:", line);
            }
          }
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      setIsStreaming(false);
    }
  }, [mode, selectedImage, imageUrl, backendUrl]);

  const handleImageSelect = useCallback((file: File | null) => {
    setSelectedImage(file);
    setError(null);
    setCaption("");
    setHasStarted(false);
  }, []);

  const handleModeSwitch = useCallback((next: "upload" | "url") => {
    setMode(next);
    setError(null);
    setCaption("");
    setHasStarted(false);
    setSelectedImage(null);
    setImageUrl("");
  }, []);

  return (
    <div className="space-y-8">
      {/* Backend URL Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            1
          </span>
          Backend URL
        </h2>
        <div className="relative">
          <Server className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="url"
            placeholder="https://xxxx.ngrok-free.app"
            value={backendUrl}
            onChange={(e) => handleBackendUrlChange(e.target.value)}
            disabled={isStreaming}
            className="pl-9 h-11 font-mono text-sm"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Paste your Colab ngrok URL here. It is saved automatically in your browser.
        </p>
      </div>

      {/* Image Input Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            2
          </span>
          Choose Image
        </h2>

        {/* Mode switcher */}
        <div className="flex rounded-lg border bg-muted/40 p-1 gap-1">
          <button
            type="button"
            onClick={() => handleModeSwitch("upload")}
            disabled={isStreaming}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              mode === "upload"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Upload className="h-4 w-4" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch("url")}
            disabled={isStreaming}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              mode === "url"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Link2 className="h-4 w-4" />
            Image URL
          </button>
        </div>

        {mode === "upload" ? (
          <ImageUploader
            onImageSelect={handleImageSelect}
            selectedImage={selectedImage}
            disabled={isStreaming}
          />
        ) : (
          <div className="space-y-1.5">
            <Input
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setError(null);
              }}
              disabled={isStreaming}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Paste a direct link to any publicly accessible image.
            </p>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="flex flex-col items-center gap-4">
        <Button
          onClick={generateCaption}
          disabled={
            !backendUrl.trim() ||
            (mode === "upload" ? !selectedImage : !imageUrl.trim()) ||
            isStreaming
          }
          size="lg"
          className="gap-2 min-w-[200px] h-12 text-base font-medium shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
        >
          {isStreaming ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate Caption
            </>
          )}
        </Button>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-4 py-2 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Caption Display Section */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            2
          </span>
          View Result
        </h2>
        {!hasStarted && !backendUrl.trim() && (
          <p className="text-xs text-muted-foreground text-center">
            Enter the backend URL above to get started.
          </p>
        )}
        <CaptionDisplay
          caption={caption}
          isStreaming={isStreaming}
          hasStarted={hasStarted}
        />
      </div>
    </div>
  );
}
