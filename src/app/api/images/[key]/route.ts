import { getR2 } from '@/lib/R2';

export const GET = async (req: Request, context: any) => {
  try {
    const r2 = await getR2();
    const object = await r2.get(context.params.key);

    if (!object) {
      return new Response('Not Found', { status: 404 });
    }

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
      },
    });
  } catch (error) {
    console.error('Error fetching from R2:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
