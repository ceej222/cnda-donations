import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type Donor = {
  id: string;
  name: string;
  created_at: string;
  big_donation: boolean;
};

export type Settings = {
  id: number;
  celebration_active: boolean;
  // Legacy fields — may or may not exist depending on which migrations ran.
  total_raised?: number;
  goal?: number;
};

let _browser: SupabaseClient | null = null;

function makeBrowserClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  return createClient(url, anonKey, {
    realtime: { params: { eventsPerSecond: 10 } },
  });
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_browser) _browser = makeBrowserClient();
    // @ts-expect-error dynamic proxy
    return _browser[prop];
  },
});

export function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
