import { supabase } from './src/supabaseClient.js';

async function checkSchema() {
  const { data, error } = await supabase.from('comedor').select('*').limit(1);
  console.log('Comedor error:', error);
  console.log('Comedor data:', data);
  
  const { data: d2, error: e2 } = await supabase.from('perfil_referente').select('*').limit(1);
  console.log('perfil_referente error:', e2);
  console.log('perfil_referente data:', d2);
}

checkSchema();
