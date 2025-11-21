import { createClient } from '@insforge/sdk';

export const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://tq2yh52c.us-east.insforge.app',
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_API_KEY
});
