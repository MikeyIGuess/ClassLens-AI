import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  role: text('role').notNull(),
  createdAt: text('created_at').notNull(),
});

export const courses = sqliteTable('courses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  term: text('term').notNull(),
  orgId: text('org_id'),
  createdAt: text('created_at').notNull(),
});

export const enrollments = sqliteTable('enrollments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  courseId: integer('course_id').notNull().references(() => courses.id),
  role: text('role').notNull(),
  createdAt: text('created_at').notNull(),
});

export const documents = sqliteTable('documents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  courseId: integer('course_id').notNull().references(() => courses.id),
  title: text('title').notNull(),
  fileKey: text('file_key').notNull(),
  checksum: text('checksum').notNull(),
  status: text('status').notNull(),
  pages: integer('pages'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const chunks = sqliteTable('chunks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  documentId: integer('document_id').notNull().references(() => documents.id),
  chunkIndex: integer('chunk_index').notNull(),
  startPage: integer('start_page'),
  endPage: integer('end_page'),
  startChar: integer('start_char'),
  endChar: integer('end_char'),
  textHash: text('text_hash').notNull(),
  embeddingId: text('embedding_id'),
  createdAt: text('created_at').notNull(),
});

export const searchLogs = sqliteTable('search_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  courseId: integer('course_id').notNull().references(() => courses.id),
  query: text('query').notNull(),
  latencyMs: integer('latency_ms').notNull(),
  resultsCount: integer('results_count').notNull(),
  createdAt: text('created_at').notNull(),
});

export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  kind: text('kind').notNull(),
  actorId: integer('actor_id'),
  targetId: integer('target_id'),
  payload: text('payload', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
});