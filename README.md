# ClassLens AI

**Smart Document Q&A for Students**

Ask natural-language questions over class materials and get exact passages with citations and links to source files.

---

## 🎯 Overview

ClassLens AI is a RAG (Retrieval-Augmented Generation) application that allows students to:
- Upload course materials (PDFs, slides, notes)
- Ask questions in natural language
- Receive concise answers with exact citations
- Navigate directly to source pages

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Database credentials (provided in `.env`)

### Installation

1. **Install dependencies:**
```bash
npm install
# or
bun install
```

2. **Environment variables are already configured in `.env`:**
```
TURSO_CONNECTION_URL=...
TURSO_AUTH_TOKEN=...
```

3. **Run the development server:**
```bash
npm run dev
# or
bun dev
```

4. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

The application uses the following tables:

- **users**: Student and instructor accounts
- **courses**: Course information (name, term, org)
- **enrollments**: Links users to courses with roles
- **documents**: Uploaded files with indexing status
- **chunks**: Text segments with embeddings metadata
- **search_logs**: Query analytics and performance metrics
- **events**: Audit trail for all operations

**Sample data is already seeded** with:
- 2 users (student, instructor)
- 1 course: "Introduction to AI"
- 3 documents with indexed status

## 🎨 Features

### ✅ Implemented

1. **Course Management**
   - View all courses
   - Access course materials
   - Navigate between course and search views

2. **Document Upload**
   - Drag-and-drop interface
   - File validation (type, size)
   - Status tracking (queued, processing, indexed, failed)
   - Delete documents with confirmation

3. **Smart Search**
   - Natural language queries
   - Contextual answers with citations
   - Relevance scoring
   - Source snippets with page numbers
   - Collapsible citation details
   - Direct links to document viewer

4. **Document Viewer**
   - View document metadata
   - Navigate to specific pages
   - Citation context (linked from search results)

5. **Audit Trail**
   - Upload events logged
   - Search queries tracked
   - Delete operations recorded

### 🔮 Production Enhancements (Not Yet Implemented)

The following features are noted in the codebase but require production setup:

1. **Vector Search**
   - Integration with Weaviate or Qdrant
   - OpenAI embeddings (text-embedding-3-large)
   - HNSW indexing for fast retrieval
   - Hybrid search (dense + keyword)

2. **LLM Integration**
   - OpenAI API for answer synthesis
   - Prompt engineering for citation accuracy
   - Confidence scoring
   - Safety filters

3. **Document Processing**
   - PDF text extraction
   - DOCX/PPTX support
   - Audio transcription (optional)
   - Chunking strategy with overlap
   - LaTeX equation preservation

4. **Object Storage**
   - S3-compatible storage
   - Signed URLs for secure access
   - File encryption at rest

5. **Worker Queue**
   - BullMQ or Celery for async processing
   - Retry logic for failed jobs
   - Progress tracking

6. **Authentication**
   - User sessions
   - Role-based access control
   - Course enrollment verification

## 📡 API Endpoints

### POST `/api/upload`
Upload a document to a course.

**Request:**
```typescript
FormData {
  file: File
  courseId: string
}
```

**Response:**
```json
{
  "documentId": 1,
  "status": "queued",
  "title": "Lecture 1.pdf"
}
```

### DELETE `/api/documents/:id`
Delete a document and its associated chunks.

**Response:**
```json
{
  "success": true
}
```

### GET `/api/documents/:id`
Get document metadata.

**Response:**
```json
{
  "id": 1,
  "title": "Lecture 1.pdf",
  "status": "indexed",
  "pages": 15,
  "courseId": 1,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### POST `/api/search`
Search course materials with natural language.

**Request:**
```json
{
  "courseId": 1,
  "query": "What is backpropagation?",
  "topK": 6
}
```

**Response:**
```json
{
  "answer": "Backpropagation is a fundamental algorithm...",
  "citations": [
    {
      "documentId": 1,
      "title": "Lecture 1 - Introduction.pdf",
      "page": 7,
      "snippet": "Backpropagation is a fundamental algorithm...",
      "score": 0.92
    }
  ],
  "latencyMs": 145
}
```

## 🏗️ Architecture

```
┌─────────────┐
│   Next.js   │  ← Frontend (React, Tailwind, shadcn/ui)
│  App Router │
└──────┬──────┘
       │
       ├─────────────────────────────────┐
       │                                 │
┌──────▼──────┐                   ┌─────▼──────┐
│   API Routes │                   │  Database  │
│             │                   │  (Turso)   │
│ - /upload   │◄─────────────────►│            │
│ - /search   │                   │  SQLite    │
│ - /documents│                   └────────────┘
└──────┬──────┘
       │
       │ (Future: Vector DB, S3, LLM)
       ▼
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── upload/route.ts          # File upload handler
│   │   ├── search/route.ts          # Search endpoint
│   │   └── documents/[id]/route.ts  # Document CRUD
│   ├── courses/
│   │   └── [id]/
│   │       ├── page.tsx             # Course home
│   │       ├── search/page.tsx      # Search interface
│   │       └── documents/
│   │           └── [documentId]/page.tsx  # Document viewer
│   ├── layout.tsx
│   ├── page.tsx                     # Home page
│   └── globals.css
├── components/
│   ├── FileUpload.tsx               # Drag-drop upload
│   ├── DocumentList.tsx             # Document grid
│   └── ui/                          # shadcn/ui components
├── db/
│   ├── index.ts                     # Database client
│   ├── schema.ts                    # Drizzle schema
│   └── seeds/                       # Sample data
└── lib/
    └── utils.ts                     # Utility functions
```

## 🧪 Testing

### Manual Testing Workflow

1. **Navigate to home page**
   - Should see "Introduction to AI" course
   - Click "Manage" or "Ask"

2. **Upload a document**
   - Drag a PDF onto the upload zone
   - Verify status changes from "Queued" to "Indexed"
   - Check for validation errors with large/invalid files

3. **Search for content**
   - Click "Ask Questions" button
   - Try example queries
   - Verify citations appear
   - Click "Open Document" to view source

4. **Delete a document**
   - Click trash icon
   - Confirm deletion
   - Verify document is removed

### API Testing with curl

```bash
# Search query
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"courseId": 1, "query": "What is backpropagation?", "topK": 6}'

# Get document
curl http://localhost:3000/api/documents/1

# Delete document
curl -X DELETE http://localhost:3000/api/documents/1
```

## 🔒 Security Considerations

### Current Implementation
- File type validation
- File size limits (50MB)
- SQL injection protection (Drizzle ORM)
- Input sanitization

### Production Requirements
- Course-scoped access checks on every API call
- User authentication and session management
- Encrypted object storage
- PII stripping during text extraction
- Rate limiting on search queries
- CORS configuration
- Signed URLs for document access

## 📈 Analytics & Logging

The application tracks:
- **search_logs**: Query text, latency, results count
- **events**: Upload, delete, search operations with actor and timestamp

### Future Analytics
- Common queries per course
- Search-to-click-through rates
- Document popularity
- Average query latency
- Failed search patterns

## 🎓 Educational Use Cases

1. **Exam Preparation**
   - "What topics were covered in week 5?"
   - "Explain the main theorem from chapter 3"

2. **Assignment Help**
   - "What is the due date for project 2?"
   - "How do I approach problem 5?"

3. **Concept Review**
   - "What's the difference between X and Y?"
   - "Give me examples of Z from the lectures"

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI primitives
- **Database**: Turso (LibSQL), Drizzle ORM
- **Deployment**: Vercel-ready
- **Future**: OpenAI API, Weaviate/Qdrant, S3, BullMQ

## 📝 Development Notes

### Mock Data
The search API currently returns mock citations based on keyword matching. In production, this would be replaced with actual vector similarity search.

### Document Storage
Uploaded files are processed in-memory and not persisted to disk in this demo. Production would use S3-compatible storage.

### PDF Rendering
The document viewer shows a placeholder. Production would use `react-pdf` for actual rendering.

## 🚢 Production Deployment Checklist

- [ ] Set up Weaviate or Qdrant cluster
- [ ] Configure OpenAI API keys
- [ ] Set up S3 bucket with encryption
- [ ] Deploy worker service (Celery/BullMQ)
- [ ] Implement authentication (NextAuth.js)
- [ ] Add rate limiting
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure CORS policies
- [ ] Run security audit
- [ ] Create backup strategy
- [ ] Set up CI/CD pipeline
- [ ] Load test search endpoints
- [ ] Prepare offline evaluation dataset (40-60 Q&A pairs)

## 📄 License

This project is for educational purposes.

---

**Built with ❤️ for students who want to learn smarter, not harder.**