"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, FileText, AlertCircle } from "lucide-react";

interface Document {
  id: number;
  title: string;
  status: string;
  pages: number | null;
  courseId: number;
}

export default function DocumentViewerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const documentId = parseInt(params.documentId as string);
  const courseId = parseInt(params.id as string);
  const targetPage = searchParams.get("page");

  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`);
        
        if (!response.ok) {
          throw new Error("Failed to load document");
        }

        const data = await response.json();
        setDocument(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load document");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load Document</h2>
          <p className="text-muted-foreground mb-4">
            {error || "Document not found"}
          </p>
          <Link href={`/courses/${courseId}`}>
            <Button>Back to Course</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/courses/${courseId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <h1 className="font-semibold">{document.title}</h1>
                {document.pages && (
                  <p className="text-xs text-muted-foreground">
                    {document.pages} pages
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="p-8">
          {/* PDF Viewer Placeholder */}
          <div className="aspect-[8.5/11] bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">PDF Viewer</h3>
              <p className="text-sm text-muted-foreground mb-1">
                {targetPage
                  ? `Viewing page ${targetPage} of ${document.title}`
                  : `Viewing ${document.title}`}
              </p>
              <p className="text-xs text-muted-foreground">
                In production, this would display the actual PDF using react-pdf
              </p>
              {document.pages && (
                <div className="mt-4 flex gap-2 justify-center flex-wrap">
                  {Array.from({ length: Math.min(document.pages, 10) }, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={targetPage === String(i + 1) ? "default" : "outline"}
                      size="sm"
                      asChild
                    >
                      <Link
                        href={`/courses/${courseId}/documents/${documentId}?page=${i + 1}`}
                      >
                        Page {i + 1}
                      </Link>
                    </Button>
                  ))}
                  {document.pages > 10 && (
                    <span className="text-sm text-muted-foreground self-center">
                      ... and {document.pages - 10} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
            <h4 className="font-medium text-sm mb-2 text-blue-900 dark:text-blue-100">
              📝 Implementation Note
            </h4>
            <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
              In a production environment, this component would integrate with react-pdf
              to render actual PDF documents. It would support features like page navigation,
              zoom controls, text search, and highlighted citation spans. Documents would be
              served from S3 using signed URLs for security.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}