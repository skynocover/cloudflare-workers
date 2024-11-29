import { getCloudflareContext } from '@opennextjs/cloudflare';

const AI_MODEL = '@cf/unum/uform-gen2-qwen-500m';
const AI_MODEL_2 = '@cf/llava-hf/llava-1.5-7b-hf';

export const analyzeImage = async (blob: ArrayBuffer) => {
  const input = {
    image: Array.from(new Uint8Array(blob)),
    prompt: 'Generate a caption for this image',
    max_tokens: 512,
  };

  const { env } = await getCloudflareContext();
  const response = await env.AI.run(AI_MODEL, input);
  const response2 = await env.AI.run(AI_MODEL_2, input);
  return JSON.stringify({
    response,
    response2,
  });
};

export const analyzeImageByAPI = async (imageBlob: ArrayBuffer) => {
  const input = {
    image: Array.from(new Uint8Array(imageBlob)),
    // prompt: 'Generate a caption for this image',
    max_tokens: 512,
    // temperature: 0.7, // 模型不支援
    prompt: `Analyze the given image and provide a concise and accurate description of its content.
Ensure the description focuses only on observable details, avoiding subjective interpretations.

Then, evaluate whether the image complies with the specified guidelines by checking each rule individually.
Provide an explanation for your compliance decision, and follow this exact format:

Content Description:
{Provide a concise description here}

Compliance Evaluation:

- No explicit or adult content: {True/False, with explanation}
- No depictions of violence, harm, or abuse: {True/False, with explanation}
- No inclusion of discriminatory or hateful symbols, gestures, or text: {True/False, with explanation}
- Must respect individual privacy and avoid revealing personal identifiable information: {True/False, with explanation}
- Must align with copyright regulations (no unauthorized use of protected content): {True/False, with explanation}


`,
  };

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${AI_MODEL_2}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
  }

  const { result }: any = await response.json();
  console.log('🚀 ~ file: AI.ts:71 ~ analyzeImageByAPI ~ result:', result);
  return result.description;
};
