import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { searchLogs, events } from "@/db/schema";

interface SearchRequest {
  courseId: number;
  query: string;
  topK?: number;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: SearchRequest = await request.json();
    const { courseId, query, topK = 6 } = body;

    if (!courseId || !query) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_PARAMETERS",
            message: "courseId and query are required",
          },
        },
        { status: 400 }
      );
    }

    if (!query.trim()) {
      return NextResponse.json(
        {
          error: {
            code: "EMPTY_QUERY",
            message: "Query cannot be empty",
          },
        },
        { status: 400 }
      );
    }

    // TODO: In production, implement actual vector search with OpenAI embeddings
    // For now, return mock results based on the query
    const mockCitations = generateMockCitations(query, topK);
    
    // If no relevant citations found, return no answer
    if (mockCitations.length === 0 || mockCitations[0].score < 0.4) {
      const latencyMs = Date.now() - startTime;
      
      // Log search
      await logSearch(courseId, query, latencyMs, 0);

      return NextResponse.json({
        answer: "I did not find this in your materials. Please try rephrasing your question or check if the relevant documents have been uploaded.",
        citations: [],
        latencyMs,
      });
    }

    // Generate answer from citations
    const answer = generateMockAnswer(query, mockCitations);
    const latencyMs = Date.now() - startTime;

    // Log search
    await logSearch(courseId, query, latencyMs, mockCitations.length);

    // Log search event
    await db.insert(events).values({
      kind: "search.performed",
      actorId: 1, // TODO: Replace with actual user ID from session
      targetId: courseId,
      payload: JSON.stringify({
        query,
        resultsCount: mockCitations.length,
        latencyMs,
      }),
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      answer,
      citations: mockCitations,
      latencyMs,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Search failed",
        },
      },
      { status: 500 }
    );
  }
}

async function logSearch(
  courseId: number,
  query: string,
  latencyMs: number,
  resultsCount: number
) {
  try {
    await db.insert(searchLogs).values({
      userId: 1, // TODO: Replace with actual user ID from session
      courseId,
      query,
      latencyMs,
      resultsCount,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to log search:", err);
  }
}

function generateMockCitations(query: string, topK: number) {
  const lowerQuery = query.toLowerCase();
  
  // Define mock citation templates based on common AI topics
  const citations = [
    {
      documentId: 1,
      title: "Lecture 1 - Introduction.pdf",
      page: 7,
      snippet: "Backpropagation is a fundamental algorithm in neural networks that calculates gradients of the loss function with respect to the network's weights. It works by applying the chain rule of calculus backwards through the network layers.",
      score: 0.92,
      keywords: ["backpropagation", "gradient", "chain rule", "neural network"],
    },
    {
      documentId: 2,
      title: "Neural Networks Basics.pdf",
      page: 15,
      snippet: "Supervised learning uses labeled training data where each example has an input and corresponding output. The algorithm learns to map inputs to outputs. Unsupervised learning, in contrast, works with unlabeled data and finds patterns or structure within the data.",
      score: 0.88,
      keywords: ["supervised", "unsupervised", "learning", "labeled", "unlabeled"],
    },
    {
      documentId: 2,
      title: "Neural Networks Basics.pdf",
      page: 3,
      snippet: "Key concepts in neural networks include: neurons (computational units), layers (input, hidden, output), weights (learnable parameters), activation functions (introduce non-linearity), and loss functions (measure prediction error).",
      score: 0.85,
      keywords: ["neural network", "neuron", "layer", "weight", "activation", "concepts"],
    },
    {
      documentId: 3,
      title: "Assignment 1 - Python Basics.pdf",
      page: 2,
      snippet: "For this assignment, start by reviewing Python data structures (lists, dictionaries, numpy arrays). Implement the forward pass first, then add backpropagation. Test with small examples before running on the full dataset.",
      score: 0.78,
      keywords: ["assignment", "python", "implement", "approach", "start"],
    },
    {
      documentId: 1,
      title: "Lecture 1 - Introduction.pdf",
      page: 12,
      snippet: "Gradient descent is an optimization algorithm that iteratively adjusts parameters to minimize the loss function. The learning rate controls the step size of each update.",
      score: 0.75,
      keywords: ["gradient descent", "optimization", "learning rate", "minimize"],
    },
    {
      documentId: 2,
      title: "Neural Networks Basics.pdf",
      page: 20,
      snippet: "Overfitting occurs when a model performs well on training data but poorly on unseen test data. Regularization techniques like dropout and L2 regularization help prevent overfitting.",
      score: 0.70,
      keywords: ["overfitting", "regularization", "dropout", "training"],
    },
  ];

  // Filter and score citations based on query relevance
  const relevantCitations = citations
    .map((citation) => {
      const matchCount = citation.keywords.filter((keyword) =>
        lowerQuery.includes(keyword)
      ).length;
      const adjustedScore = citation.score * (matchCount > 0 ? 1 : 0.3);
      return { ...citation, score: adjustedScore };
    })
    .filter((c) => c.score > 0.4)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ keywords, ...rest }) => rest);

  return relevantCitations;
}

function generateMockAnswer(query: string, citations: any[]) {
  const lowerQuery = query.toLowerCase();

  // Generate contextual answers based on query
  if (lowerQuery.includes("backpropagation")) {
    return "Backpropagation is a fundamental algorithm in neural networks that calculates gradients of the loss function with respect to the network's weights. It works by applying the chain rule of calculus backwards through the network layers, allowing the network to learn by adjusting weights to minimize prediction errors.";
  }

  if (lowerQuery.includes("supervised") && lowerQuery.includes("unsupervised")) {
    return "Supervised learning uses labeled training data where each example has an input and corresponding output, allowing the algorithm to learn mappings between them. Unsupervised learning, in contrast, works with unlabeled data and discovers patterns, clusters, or structure within the data without explicit output labels.";
  }

  if (lowerQuery.includes("neural network") && (lowerQuery.includes("concept") || lowerQuery.includes("key"))) {
    return "Key concepts in neural networks include: neurons (computational units that process inputs), layers (organized structures of neurons including input, hidden, and output layers), weights (learnable parameters connecting neurons), activation functions (introduce non-linearity to enable complex patterns), and loss functions (measure how well the network's predictions match the actual outputs).";
  }

  if (lowerQuery.includes("assignment")) {
    return "For Assignment 1, start by reviewing Python data structures like lists, dictionaries, and numpy arrays. Implement the forward pass through the network first to ensure data flows correctly, then add backpropagation for learning. Test your implementation with small, simple examples before running on the full dataset to catch bugs early.";
  }

  // Generic answer based on first citation
  if (citations.length > 0) {
    return citations[0].snippet;
  }

  return "I found some relevant information in your course materials. Please review the citations below for details.";
}