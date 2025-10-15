import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { documents, chunks, events } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const documentId = parseInt(id);

    if (isNaN(documentId)) {
      return NextResponse.json(
        { error: { code: "INVALID_ID", message: "Invalid document ID" } },
        { status: 400 }
      );
    }

    // Check if document exists
    const document = await db.query.documents.findFirst({
      where: eq(documents.id, documentId),
    });

    if (!document) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Document not found" } },
        { status: 404 }
      );
    }

    // Delete associated chunks
    await db.delete(chunks).where(eq(chunks.documentId, documentId));

    // Delete document
    await db.delete(documents).where(eq(documents.id, documentId));

    // Log deletion event
    await db.insert(events).values({
      kind: "document.deleted",
      actorId: 1, // TODO: Replace with actual user ID from session
      targetId: documentId,
      payload: JSON.stringify({
        title: document.title,
        fileKey: document.fileKey,
      }),
      createdAt: new Date().toISOString(),
    });

    // TODO: In production, also delete from S3 and purge vectors from vector DB

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Delete failed",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const documentId = parseInt(id);

    if (isNaN(documentId)) {
      return NextResponse.json(
        { error: { code: "INVALID_ID", message: "Invalid document ID" } },
        { status: 400 }
      );
    }

    const document = await db.query.documents.findFirst({
      where: eq(documents.id, documentId),
    });

    if (!document) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Document not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Get document error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Failed to get document",
        },
      },
      { status: 500 }
    );
  }
}