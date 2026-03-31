import { createBrowserClient } from '@supabase/ssr';

// Direct values from .env.local — ensures client gets correct project
const SUPABASE_URL = 'https://uttlwwjzjssiykzkcemu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dGx3d2p6anNzaXlremtjZW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MjQ4NTAsImV4cCI6MjA5MDUwMDg1MH0.wxt1GMQKNYSmu7YkNZoKYRDPXESBHvbk9QI36hvzpFQ';

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
