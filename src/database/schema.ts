import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const tempTable = sqliteTable('temp', {
  id: int('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});

// 導出所有表格定義
export const schema = { tempTable };
