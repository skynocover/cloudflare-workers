import type { NextRequest } from 'next/server';
import { getDB } from '@/database';
import { tempTable } from '@/database/schema';

export async function GET(request: NextRequest) {
  const db = await getDB();

  db.select();

  const temp = await db.select().from(tempTable).all();

  return new Response(JSON.stringify(temp));
}
