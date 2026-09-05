import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================
// 1. USERS
// ============================================================
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name'),
  role: text('role').default('admin'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================
// 2. API KEYS (Gemini keys — up to 100, with rotation logic)
// Store plain for personal project; optionally encrypt via ENCRYPTION_KEY
// ============================================================
export const apiKeys = pgTable(
  'api_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    keyValue: text('key_value').notNull(),
    provider: text('provider').notNull().default('gemini'),
    // 'active' | 'error' | 'disabled'
    status: text('status').notNull().default('active'),
    // lowest order_index = frontmost (active candidate); error moves to max+1
    orderIndex: integer('order_index').notNull().default(0),
    errorCount: integer('error_count').default(0),
    lastError: text('last_error'),
    lastUsedAt: timestamp('last_used_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    statusOrderIdx: index('api_keys_status_order_idx').on(
      table.status,
      table.orderIndex
    ),
  })
);

// ============================================================
// 2.5 TTS CACHE
// ============================================================
export const ttsCache = pgTable(
  'tts_cache',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    textHash: text('text_hash').notNull().unique(), // md5 or sha256 hash of the text
    audioUrl: text('audio_url').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    textHashIdx: index('tts_cache_text_hash_idx').on(table.textHash),
  })
);

// ============================================================
// 3. MODULES
// ============================================================
export const modules = pgTable('modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').unique().notNull(),       // e.g. "BRVT-AB-01"
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  category: text('category'),
  difficulty: text('difficulty').default('pemula'),
  estimatedMinutes: integer('estimated_minutes'),
  // 'draft' | 'tayang'
  status: text('status').default('draft'),
  // Full module JSON object (includes versi + modul wrapper)
  contentJson: jsonb('content_json').notNull(),
  orderIndex: integer('order_index').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================
// 4. MODULE SECTIONS PROGRESS
// ============================================================
export const moduleSectionsProgress = pgTable(
  'module_sections_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    moduleId: uuid('module_id')
      .notNull()
      .references(() => modules.id, { onDelete: 'cascade' }),
    sectionId: text('section_id').notNull(),
    completed: boolean('completed').default(false),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    uniqueProgress: uniqueIndex('unique_user_module_section').on(
      table.userId,
      table.moduleId,
      table.sectionId
    ),
  })
);

// ============================================================
// 5. USER NOTES
// ============================================================
export const userNotes = pgTable('user_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  moduleId: uuid('module_id')
    .notNull()
    .references(() => modules.id, { onDelete: 'cascade' }),
  sectionId: text('section_id'),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================
// 6. USER BOOKMARKS
// ============================================================
export const userBookmarks = pgTable(
  'user_bookmarks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    moduleId: uuid('module_id')
      .notNull()
      .references(() => modules.id, { onDelete: 'cascade' }),
    sectionId: text('section_id'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    uniqueBookmark: uniqueIndex('unique_user_module_section_bookmark').on(
      table.userId,
      table.moduleId,
      table.sectionId
    ),
  })
);

// ============================================================
// 7. AI CHAT HISTORY
// ============================================================
export const aiChatHistory = pgTable(
  'ai_chat_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    moduleSlug: text('module_slug'),
    // 'user' | 'assistant'
    role: text('role').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    userCreatedIdx: index('ai_chat_user_created_idx').on(
      table.userId,
      table.createdAt
    ),
  })
);

// ============================================================
// 8. USER SETTINGS
// ============================================================
export const userSettings = pgTable('user_settings', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  // 'normal' | 'besar'
  fontSize: text('font_size').default('normal'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================
// 9. TIKTOK PROMPTS (Saved TikTok Carousel Prompt Suites per Module)
// ============================================================
export const tiktokPrompts = pgTable(
  'tiktok_prompts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    moduleSlug: text('module_slug').notNull().unique(),
    moduleTitle: text('module_title').notNull(),
    promptsJson: jsonb('prompts_json').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    moduleSlugIdx: index('tiktok_prompts_module_slug_idx').on(table.moduleSlug),
  })
);

// ============================================================
// 10. USER QUIZ ATTEMPTS
// ============================================================
export const userQuizAttempts = pgTable(
  'user_quiz_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    moduleId: uuid('module_id')
      .notNull()
      .references(() => modules.id, { onDelete: 'cascade' }),
    pgScore: integer('pg_score').notNull().default(0),
    essayScore: integer('essay_score').notNull().default(0),
    finalScore: integer('final_score').notNull().default(0),
    answersJson: jsonb('answers_json').notNull(),
    essayAnalysisJson: jsonb('essay_analysis_json'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userModuleIdx: index('user_quiz_attempts_user_module_idx').on(
      table.userId,
      table.moduleId
    ),
  })
);


// ============================================================
// 11. GLOSSARY (Master Tax Glossary per Module & Global)
// ============================================================
export const glossary = pgTable(
  'glossary',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    moduleId: uuid('module_id').references(() => modules.id, { onDelete: 'cascade' }),
    moduleSlug: text('module_slug').notNull(),
    kata: text('kata').notNull(),
    definisi: text('definisi').notNull(),
    penjelasanSederhana: text('penjelasan_sederhana'),
    contoh: text('contoh'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    moduleSlugKataIdx: index('glossary_module_slug_kata_idx').on(
      table.moduleSlug,
      table.kata
    ),
  })
);


// ============================================================

// ============================================================
// 12. DJP EXAM ATTEMPTS
// ============================================================
export const djpExamAttempts = pgTable(
  'djp_exam_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    mode: text('mode').notNull().default('all-100'),
    tkbScore: integer('tkb_score').notNull().default(0),
    essayScore: integer('essay_score').notNull().default(0),
    interviewScore: integer('interview_score').notNull().default(0),
    finalScore: integer('final_score').notNull().default(0),
    isPassed: boolean('is_passed').notNull().default(false),
    answersJson: jsonb('answers_json').notNull(),
    essayAnalysisJson: jsonb('essay_analysis_json'),
    interviewAnalysisJson: jsonb('interview_analysis_json'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    userModeIdx: index('djp_exam_attempts_user_mode_idx').on(
      table.userId,
      table.mode
    ),
  })
);

// RELATIONS
// ============================================================
export const usersRelations = relations(users, ({ many, one }) => ({
  apiKeys: many(apiKeys),
  moduleSectionsProgress: many(moduleSectionsProgress),
  userNotes: many(userNotes),
  userBookmarks: many(userBookmarks),
  aiChatHistory: many(aiChatHistory),
  userQuizAttempts: many(userQuizAttempts),
  userSettings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
}));

export const modulesRelations = relations(modules, ({ many }) => ({
  moduleSectionsProgress: many(moduleSectionsProgress),
  userNotes: many(userNotes),
  userBookmarks: many(userBookmarks),
  userQuizAttempts: many(userQuizAttempts),
  glossaryItems: many(glossary),
}));

export const glossaryRelations = relations(glossary, ({ one }) => ({
  module: one(modules, {
    fields: [glossary.moduleId],
    references: [modules.id],
  }),
}));

export const moduleSectionsProgressRelations = relations(
  moduleSectionsProgress,
  ({ one }) => ({
    user: one(users, {
      fields: [moduleSectionsProgress.userId],
      references: [users.id],
    }),
    module: one(modules, {
      fields: [moduleSectionsProgress.moduleId],
      references: [modules.id],
    }),
  })
);

export const userNotesRelations = relations(userNotes, ({ one }) => ({
  user: one(users, {
    fields: [userNotes.userId],
    references: [users.id],
  }),
  module: one(modules, {
    fields: [userNotes.moduleId],
    references: [modules.id],
  }),
}));

export const userBookmarksRelations = relations(userBookmarks, ({ one }) => ({
  user: one(users, {
    fields: [userBookmarks.userId],
    references: [users.id],
  }),
  module: one(modules, {
    fields: [userBookmarks.moduleId],
    references: [modules.id],
  }),
}));

export const aiChatHistoryRelations = relations(aiChatHistory, ({ one }) => ({
  user: one(users, {
    fields: [aiChatHistory.userId],
    references: [users.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const userQuizAttemptsRelations = relations(userQuizAttempts, ({ one }) => ({
  user: one(users, {
    fields: [userQuizAttempts.userId],
    references: [users.id],
  }),
  module: one(modules, {
    fields: [userQuizAttempts.moduleId],
    references: [modules.id],
  }),
}));

export const djpExamAttemptsRelations = relations(djpExamAttempts, ({ one }) => ({
  user: one(users, {
    fields: [djpExamAttempts.userId],
    references: [users.id],
  }),
}));
