import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { documents, events } from "@/db/schema";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const courseId = parseInt(formData.get("courseId") as string);

    if (!file) {
      return NextResponse.json(
        { error: { code: "MISSING_FILE", message: "No file provided" } },
        { status: 400 }
      );
    }

    if (!courseId) {
      return NextResponse.json(
        { error: { code: "MISSING_COURSE_ID", message: "Course ID is required" } },
        { status: 400 }
      );
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: { code: "FILE_TOO_LARGE", message: "File size must be under 50MB" } },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_FILE_TYPE",
            message: "Only PDF, TXT, DOCX, and PPTX files are supported",
          },
        },
        { status: 400 }
      );
    }

    // Calculate checksum
    const buffer = await file.arrayBuffer();
    const checksum = crypto
      .createHash("sha256")
      .update(Buffer.from(buffer))
      .digest("hex");

    // Generate file key
    const fileKey = `courses/${courseId}/${Date.now()}-${file.name}`;

    // Insert document record
    const now = new Date().toISOString();
    const result = await db
      .insert(documents)
      .values({
        courseId,
        title: file.name,
        fileKey,
        checksum,
        status: "queued",
        pages: null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const document = result[0];

    // Log upload event
    await db.insert(events).values({
      kind: "document.uploaded",
      actorId: 1, // TODO: Replace with actual user ID from session
      targetId: document.id,
      payload: JSON.stringify({
        title: file.name,
        size: file.size,
        type: file.type,
      }),
      createdAt: now,
    });

    // TODO: In production, upload to S3 and queue processing job
    // For now, simulate processing by updating status
    setTimeout(async () => {
      try {
        await db
          .update(documents)
          .set({
            status: "indexed",
            pages: Math.floor(Math.random() * 30) + 5,
            updatedAt: new Date().toISOString(),
          })
          .where(documents.id.eq(document.id));
      } catch (err) {
        console.error("Failed to update document status:", err);
      }
    }, 2000);

    return NextResponse.json({
      documentId: document.id,
      status: document.status,
      title: document.title,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Upload failed",
        },
      },
      { status: 500 }
    );
  }
}