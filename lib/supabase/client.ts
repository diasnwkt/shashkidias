import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    // Return a no-op proxy during build-time SSR — real calls happen client-side only
    return new Proxy({} as SupabaseClient, {
      get(_, prop) {
        if (prop === 'auth') {
          return new Proxy({}, {
            get() { return () => Promise.resolve({ data: null, error: null }) },
          })
        }
        return () => Promise.resolve({ data: null, error: null })
      },
    })
  }
  _client = createBrowserClient(url, key)
  return _client
}
