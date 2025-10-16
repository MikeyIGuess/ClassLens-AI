import Link from "next/link";
import { db } from "@/db";
import { courses, documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { FileUpload } from "@/components/FileUpload";
import { DocumentList } from "@/components/DocumentList";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const courseId = parseInt(id);

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });

  const docs = await db.query.documents.findMany({
    where: eq(documents.courseId, courseId),
    orderBy: (documents, { desc }) => [desc(documents.createdAt)],
  });

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{course.name}</h1>
            <p className="text-sm text-muted-foreground">{course.term}</p>
          </div>
          <Link href={`/courses/${courseId}/search`}>
            <Button>
              <Search className="mr-2 h-4 w-4" />
              Ask Questions
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Upload Materials</h2>
            <FileUpload courseId={courseId} />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              Course Documents ({docs.length})
            </h2>
            <DocumentList documents={docs} />
          </section>
        </div>
      </main>
    </div>
  );
}