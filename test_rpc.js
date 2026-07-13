import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nmufmmvcdyxbfsbcfkxz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tdWZtbXZjZHl4YmZzYmNma3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5Mzg0NzIsImV4cCI6MjA5OTUxNDQ3Mn0.P0eO3mgmxIYxF5zVlhfWebFB_37C_ifRLGRzqIRcJnA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testRpc() {
  console.log('Testing upsert RPC...');
  
  // Need a valid participant ID from the DB
  // For safety, I will just create a fake UUID and expect the "Participant not found" error,
  // which will prove the validation works!
  const fakeId = '123e4567-e89b-12d3-a456-426614174000';

  const { data, error } = await supabase.rpc('upsert_participant_rating', {
    p_participant_id: fakeId,
    p_prompt_number: 1,
    p_displayed_position: 1,
    p_actual_model: 'Model_A',
    p_metric_name: 'alignment',
    p_rating: 5,
  });

  console.log('Data:', data);
  console.log('Error:', error);
}

testRpc();
