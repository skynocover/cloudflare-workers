import * as nsfwjs from 'nsfwjs';

export const classifyImage = async (base64Image: string) => {
  const img = document.createElement('img');
  img.src = base64Image;

  return new Promise((resolve) => {
    img.onload = async () => {
      // 創建 canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      // 將圖片繪製到 canvas
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      // 載入模型並進行分類
      const model = await nsfwjs.load();
      const result = await model.classify(img);
      resolve(result);
    };
  });
};
