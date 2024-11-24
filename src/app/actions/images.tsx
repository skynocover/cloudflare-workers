'use server';

import { getDB } from '@/database/index';
import { imagesTable } from '@/database/schema';
import { getR2 } from '@/lib/R2';

interface UploadImageParams {
  title: string;
  base64Image: string;
  contentType: string;
  aiAnalysis: string;
  violatesRules: boolean;
}

export const getImages = async () => {
  const db = await getDB();
  const images = await db.select().from(imagesTable).all();
  return images;
};

export async function uploadImage({
  title,
  base64Image,
  contentType,
  aiAnalysis,
  violatesRules,
}: UploadImageParams) {
  try {
    // 確保 base64Image 是正確的格式
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

    // 使用 Uint8Array 替代 Buffer
    const imageData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // 生成唯一的檔案名稱
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;

    const R2 = await getR2();
    const db = await getDB();

    // 上傳到 R2，使用 Uint8Array
    const temp = await R2.put(fileName, imageData, {
      httpMetadata: { contentType },
    });

    // 構建公開訪問的 URL
    // const imageUrl = `${process.env.R2_URL}/${fileName}`;
    const imageUrl = `/api/images/${fileName}`;

    // 儲存到 D1 資料庫
    await db.insert(imagesTable).values({
      title,
      url: imageUrl,
      aiAnalysis,
      violatesRules: violatesRules ? 1 : 0,
    });
  } catch (error) {
    console.error('Upload failed:', error);
    return { success: false, error: 'Upload failed' };
  }
}
