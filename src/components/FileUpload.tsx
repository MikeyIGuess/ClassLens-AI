"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  courseId: number;
}

export function FileUpload({ courseId }: FileUploadProps) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        setError(null);
      }
    },
    []
  );

  const handleUpload = async () => {
    if (!selectedFile) return;

    // Validate file size (50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("File size must be under 50MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only PDF, TXT, DOCX, and PPTX files are supported");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("courseId", courseId.toString());

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Upload failed");
      }

      setSelectedFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25"
        )}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.txt,.docx,.pptx"
        />

        {!selectedFile ? (
          <>
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              Drag and drop your files here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse
            </p>
            <Button asChild variant="outline">
              <label htmlFor="file-upload" className="cursor-pointer">
                Select File
              </label>
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Supported: PDF, TXT, DOCX, PPTX (up to 50MB)
            </p>
          </>
        ) : (
          <>
            <FileText className="mx-auto h-12 w-12 text-primary mb-4" />
            <p className="text-lg font-medium mb-2">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground mb-4">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="min-w-[120px]"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setError(null);
                }}
                disabled={isUploading}
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </Card>
  );
}