'use server';

import { eq } from 'drizzle-orm';

import { getDB } from '@/database/index';
import { imagesTable } from '@/database/schema';
import { getR2 } from '@/lib/R2';
import { analyzeImageByAPI } from '@/lib/AI';
// import { checkNSFW } from '@/lib/nsfwjs';
import { checkNSFW } from '@/lib/nsfwjs-node';
import { resizeImage } from '@/lib/resizeImage';
import sharp from 'sharp';
// import * as tf from '@tensorflow/tfjs';
import * as nsfwjs from 'nsfwjs';
import { azureContentSafety } from '@/lib/azure-content-safety';

interface UploadImageParams {
  title: string;
  base64Image: string;
  contentType: string;
}

export const getImages = async () => {
  const db = await getDB();
  const images = await db.select().from(imagesTable).all();
  return images;
};

export async function uploadImage({ title, base64Image, contentType }: UploadImageParams) {
  try {
    // 確保 base64Image 是正確的格式
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

    const { isNSFW, details } = await azureContentSafety(base64Data);
    // console.log({ isNSFW, details });
    // return;

    // 使用 Uint8Array 替代 Buffer
    const imageData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // // 如果圖片被判定為 NSFW，拒絕上傳
    // if (nsfwResult.isNSFW) {
    //   return {
    //     success: false,
    //     error: 'Image contains inappropriate content',
    //   };
    // }

    // 生成唯一的檔案名稱
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;

    const R2 = await getR2();
    const db = await getDB();

    // 上傳到 R2，使用 Uint8Array
    await R2.put(fileName, imageData, {
      httpMetadata: { contentType },
    });

    // 構建公開訪問的 URL
    const imageUrl = `${process.env.R2_URL}/${fileName}`;

    // 儲存到 D1 資料庫
    await db.insert(imagesTable).values({
      title,
      url: imageUrl,
      aiAnalysis: JSON.stringify(details),
      violatesRules: isNSFW ? 1 : 0,
    });
  } catch (error) {
    console.error('Upload failed:', error);
    return { success: false, error: 'Upload failed' };
  }
}

export async function deleteImage(imageUrl: string) {
  try {
    const R2 = await getR2();
    const db = await getDB();

    // 從 URL 中提取檔案名稱
    const fileName = imageUrl.split('/').pop();
    if (!fileName) {
      throw new Error('Invalid image URL');
    }

    // 從 R2 刪除檔案
    await R2.delete(fileName);

    // 從資料庫刪除記錄
    await db.delete(imagesTable).where(eq(imagesTable.url, imageUrl));

    return { success: true };
  } catch (error) {
    console.error('Delete failed:', error);
    return { success: false, error: 'Delete failed' };
  }
}
