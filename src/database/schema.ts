import { int, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const tempTable = sqliteTable('temp', {
  id: int('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});

export const imagesTable = sqliteTable('images', {
  id: int('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  url: text('url').notNull(),
  aiAnalysis: text('ai_analysis').notNull(),
  violatesRules: integer('violates_rules').notNull(),
});

// 導出所有表格定義
export const schema = { tempTable, imagesTable };
