import { getCloudflareContext } from '@opennextjs/cloudflare';

let r2: R2Bucket | null = null;

export const getR2 = async (): Promise<R2Bucket> => {
  try {
    if (r2) return r2;
    const { env } = await getCloudflareContext();
    r2 = env.AKRAFT_R2;
    return r2;
  } catch (error) {
    console.error('Failed to initialize R2:', error);
    throw error;
  }
};
