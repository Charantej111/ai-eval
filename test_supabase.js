import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nmufmmvcdyxbfsbcfkxz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tdWZtbXZjZHl4YmZzYmNma3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5Mzg0NzIsImV4cCI6MjA5OTUxNDQ3Mn0.P0eO3mgmxIYxF5zVlhfWebFB_37C_ifRLGRzqIRcJnA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testUpsert() {
  const { data, error } = await supabase.from('responses').upsert(
    [
      {
        participant_id: '123e4567-e89b-12d3-a456-426614174000',
        prompt_number: 1,
        displayed_position: 1,
        actual_model: 'Model_A',
        metric_name: 'alignment',
        rating: 5,
      },
    ],
    { onConflict: 'participant_id,prompt_number,actual_model,metric_name' }
  );

  console.log('Error object:', JSON.stringify(error, null, 2));
}

testUpsert();
