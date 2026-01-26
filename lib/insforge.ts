import { createClient } from '@insforge/sdk';

export const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://t9vd6nnz.ap-southeast.insforge.app',
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_API_KEY
});
