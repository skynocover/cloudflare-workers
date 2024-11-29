import sharp from 'sharp';

/**
 * 將圖片壓縮到 224x224 並輸出 Uint8Array
 * @param imageData - 輸入的圖片數據 (Uint8Array)
 * @returns 壓縮後的 Uint8Array
 */
export async function resizeImage(imageData: Uint8Array): Promise<Uint8Array> {
  // 使用 sharp 處理圖片
  const resizedBuffer = await sharp(imageData)
    .resize(224, 224, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();

  // 將 Buffer 轉換為 Uint8Array
  return new Uint8Array(resizedBuffer);
}
