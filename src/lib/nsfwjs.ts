import * as tf from '@tensorflow/tfjs';
import * as nsfwjs from 'nsfwjs';

let model: nsfwjs.NSFWJS | null = null;

async function loadModel() {
  if (model) {
    return model;
  }

  // Dispose any existing tensors
  tf.engine().disposeVariables();

  model = await nsfwjs.load('http://localhost:3000/model/', { size: 224 });
  return model;
}

export async function checkNSFW(imageData: Uint8Array, width: number, height: number) {
  const model = await loadModel();
  //   const model = await nsfwjs.load('http://localhost:3000/model/', { size: 224 });

  const tensor = tf.tidy(() => {
    const decoded = tf.browser.fromPixels(
      {
        data: imageData,
        width: width,
        height: height,
      } as tf.PixelData,
      3,
    );

    const resized = tf.image.resizeBilinear(decoded, [width, height]);
    const expanded = resized.expandDims(0);
    return expanded.toFloat().div(127.5).sub(1);

    // // 計算保持長寬比的尺寸
    // const aspectRatio = width / height;
    // let newWidth = 224;
    // let newHeight = 224;

    // if (aspectRatio > 1) {
    //   // 寬圖
    //   newHeight = Math.round(224 / aspectRatio);
    // } else {
    //   // 長圖
    //   newWidth = Math.round(224 * aspectRatio);
    // }

    // // 先保持長寬比縮放
    // const resized = tf.image.resizeBilinear(decoded, [newHeight, newWidth]);
    // // 計算需要的padding
    // const padTop = Math.floor((224 - newHeight) / 2);
    // const padBottom = 224 - newHeight - padTop;
    // const padLeft = Math.floor((224 - newWidth) / 2);
    // const padRight = 224 - newWidth - padLeft;
    // // 使用pad函數填充到224x224
    // const padded = tf.pad(
    //   resized,
    //   [
    //     [padTop, padBottom],
    //     [padLeft, padRight],
    //     [0, 0],
    //   ],
    //   0,
    // );

    // const expanded = padded.expandDims(0);
    // return expanded.toFloat().div(127.5).sub(1);
  });

  const predictions = await model.classify(tensor as tf.Tensor3D);
  console.log('🚀 ~ file: nsfwjs.ts:32 ~ checkNSFW ~ predictions:', predictions);

  // Clean up
  tf.dispose(tensor);

  // Find NSFW score
  const nsfwScore = predictions.reduce((score, prediction) => {
    if (['Porn', 'Hentai', 'Sexy'].includes(prediction.className)) {
      return score + prediction.probability;
    }
    return score;
  }, 0);

  return {
    isNSFW: nsfwScore > 0.5,
    predictions,
  };
}

// Add a cleanup function
export function disposeModel() {
  if (model) {
    (model as any).model.dispose();
    model = null;
  }
  tf.engine().disposeVariables();
}
