import { drizzle } from 'drizzle-orm/d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { schema } from './schema';

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export const getDB = async () => {
  try {
    // 如果已經初始化過，直接返回實例
    if (db) return db;

    const { env } = await getCloudflareContext();

    if (!env.AKRAFT_D1) {
      throw new Error('Database connection not found');
    }

    // 創建新的 drizzle 實例
    db = drizzle(env.AKRAFT_D1, { schema });

    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};
