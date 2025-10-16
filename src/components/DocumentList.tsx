"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Document {
  id: number;
  title: string;
  status: string;
  pages: number | null;
  createdAt: string;
  updatedAt: string;
}

interface DocumentListProps {
  documents: Document[];
}

const statusConfig = {
  indexed: {
    label: "Indexed",
    icon: CheckCircle,
    variant: "default" as const,
    color: "text-green-600",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    variant: "secondary" as const,
    color: "text-blue-600",
  },
  queued: {
    label: "Queued",
    icon: Clock,
    variant: "secondary" as const,
    color: "text-yellow-600",
  },
  failed: {
    label: "Failed",
    icon: AlertCircle,
    variant: "destructive" as const,
    color: "text-red-600",
  },
};

export function DocumentList({ documents }: DocumentListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (documentId: number) => {
    setDeletingId(documentId);
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-muted-foreground">
          No documents uploaded yet
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Upload your first document to get started
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {documents.map((doc) => {
        const status = statusConfig[doc.status as keyof typeof statusConfig] ||
          statusConfig.queued;
        const StatusIcon = status.icon;

        return (
          <Card key={doc.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="mt-1">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-lg mb-1 truncate">
                    {doc.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                    {doc.pages && <span>{doc.pages} pages</span>}
                    <Badge variant={status.variant} className="gap-1.5">
                      <StatusIcon
                        className={`h-3 w-3 ${
                          doc.status === "processing" ? "animate-spin" : ""
                        }`}
                      />
                      {status.label}
                    </Badge>
                  </div>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deletingId === doc.id}
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{doc.title}" and all
                      associated data. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(doc.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        );
      })}
    </div>
  );
}