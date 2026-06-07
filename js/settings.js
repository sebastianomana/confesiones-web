import { supabase } from './supabase.js';

export async function isFeedVisible() {

  const { data } = await supabase
    .from('app_settings')
    .select()
    .eq('key', 'show_public_feed')
    .single();

  return data?.value === 'true';
}