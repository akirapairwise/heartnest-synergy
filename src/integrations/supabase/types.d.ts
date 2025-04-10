
// This is a helper declaration file to augment the existing types

declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    from(table: 'partner_codes'): any;
  }
}
