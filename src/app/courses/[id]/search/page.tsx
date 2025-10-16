"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  Loader2,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface Citation {
  documentId: number;
  title: string;
  page: number;
  snippet: string;
  score: number;
}

interface SearchResult {
  answer: string;
  citations: Citation[];
  latencyMs: number;
}

const exampleQueries = [
  "What is backpropagation?",
  "Explain the difference between supervised and unsupervised learning",
  "What are the key concepts in neural networks?",
  "How do I approach assignment 1?",
];

export default function SearchPage() {
  const params = useParams();
  const courseId = parseInt(params.id as string);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          query: query.trim(),
          topK: 6,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Search failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/courses/${courseId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Course
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Ask a Question</h1>
          <p className="text-muted-foreground">
            Search through your course materials with natural language
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <Textarea
              placeholder="Type your question here..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="min-h-[100px] resize-none"
              disabled={isSearching}
            />

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Press Enter to search, Shift+Enter for new line
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>

          {!result && !error && !isSearching && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm font-medium mb-3">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {exampleQueries.map((example, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleClick(example)}
                    className="text-xs"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </Card>

        {error && (
          <Card className="p-6 border-destructive/50 bg-destructive/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive mb-1">
                  Search Error
                </h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {result && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <BookOpen className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1">
                  <h2 className="font-semibold text-lg mb-2">Answer</h2>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {result.answer}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-xs text-muted-foreground">
                  Found in {result.latencyMs}ms
                </span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {result.citations.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">
                  Sources ({result.citations.length})
                </h3>
                <div className="space-y-3">
                  {result.citations.map((citation, index) => (
                    <Collapsible key={index}>
                      <Card className="overflow-hidden">
                        <CollapsibleTrigger className="w-full">
                          <div className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                            <div className="flex items-center gap-3 text-left">
                              <Badge variant="outline">{index + 1}</Badge>
                              <div>
                                <p className="font-medium">{citation.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  Page {citation.page} • Relevance:{" "}
                                  {(citation.score * 100).toFixed(0)}%
                                </p>
                              </div>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 pt-2 border-t bg-muted/30">
                            <p className="text-sm leading-relaxed italic">
                              "{citation.snippet}"
                            </p>
                            <Link
                              href={`/courses/${courseId}/documents/${citation.documentId}?page=${citation.page}`}
                              className="inline-block mt-3"
                            >
                              <Button variant="outline" size="sm">
                                Open Document
                              </Button>
                            </Link>
                          </div>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}