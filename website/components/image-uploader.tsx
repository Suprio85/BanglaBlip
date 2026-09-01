"use client";

import React from "react";

import { useCallback, useState, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onImageSelect: (file: File | null) => void;
  selectedImage: File | null;
  disabled?: boolean;
}

export function ImageUploader({
  onImageSelect,
  selectedImage,
  disabled,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type.startsWith("image/")) {
        onImageSelect(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    },
    [onImageSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, handleFile],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const clearImage = useCallback(() => {
    onImageSelect(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onImageSelect, previewUrl]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative rounded-xl border-2 border-dashed transition-all duration-300 ease-out",
          "min-h-[280px] flex items-center justify-center",
          isDragging && !disabled
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          disabled && "opacity-60 cursor-not-allowed",
          previewUrl && "border-solid border-border",
        )}
      >
        {previewUrl ? (
          <div className="relative w-full h-full min-h-[280px] p-4">
            <img
              src={previewUrl}
              alt="Preview of uploaded image"
              className="w-full h-full max-h-[400px] object-contain rounded-lg"
            />
            {!disabled && (
              <Button
                variant="secondary"
                size="icon"
                onClick={clearImage}
                className="absolute top-6 right-6 h-8 w-8 rounded-full shadow-lg"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div
            onClick={handleClick}
            className={cn(
              "flex flex-col items-center justify-center gap-4 p-8 cursor-pointer w-full h-full",
              disabled && "cursor-not-allowed",
            )}
          >
            <div className="rounded-full bg-muted p-4">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-foreground">
                Drop an image here or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                Supports PNG, JPG, JPEG, WebP
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent pointer-events-none"
              disabled={disabled}
              type="button"
            >
              <Upload className="h-4 w-4" />
              Choose File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileInput}
              disabled={disabled}
              className="hidden"
              aria-label="Upload image file"
            />
          </div>
        )}
      </div>
    </div>
  );
}
