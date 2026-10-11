import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

export const getPublishedSite = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    if (!url || !key) throw new Error('Website service is unavailable');
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith('sb_')) headers.delete('Authorization');
        headers.set('apikey', key);
        return fetch(input, { ...init, headers });
      } },
    });
    const { data: site, error } = await client.from('cms_published').select('name, pages').eq('id', data.id).maybeSingle();
    if (error) throw new Error('Unable to load website');
    return site;
  });