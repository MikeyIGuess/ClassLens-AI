import Link from "next/link";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, Search } from "lucide-react";

export default async function Home() {
  const allCourses = await db.query.courses.findMany({
    orderBy: (courses, { desc }) => [desc(courses.createdAt)],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">ClassLens AI</h1>
              <p className="text-sm text-muted-foreground">
                Smart Document Q&A for Students
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ask Questions, Get Answers with Citations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your course materials and ask natural-language questions.
            Get exact passages with page numbers and source links.
          </p>
        </div>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold">Your Courses</h3>
          </div>

          {allCourses.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-xl font-medium mb-2">No Courses Yet</h4>
              <p className="text-muted-foreground mb-6">
                Demo courses will appear here. Check the database seed data.
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allCourses.map((course) => (
                <Card key={course.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-lg mb-1 truncate">
                        {course.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {course.term}
                      </p>
                      <div className="flex gap-2">
                        <Link href={`/courses/${course.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Manage
                          </Button>
                        </Link>
                        <Link
                          href={`/courses/${course.id}/search`}
                          className="flex-1"
                        >
                          <Button size="sm" className="w-full">
                            <Search className="mr-1 h-3 w-3" />
                            Ask
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold">Upload Materials</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Upload PDFs, slides, notes, and documents for your courses.
              They're indexed within minutes.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Search className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold">Ask Questions</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Type your question in natural language. Get concise answers with
              exact citations.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold">Study Smarter</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Jump directly to source pages. Review context around each answer.
              Learn more effectively.
            </p>
          </Card>
        </section>
      </main>
    </div>
  );
}