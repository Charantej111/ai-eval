import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nmufmmvcdyxbfsbcfkxz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tdWZtbXZjZHl4YmZzYmNma3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5Mzg0NzIsImV4cCI6MjA5OTUxNDQ3Mn0.P0eO3mgmxIYxF5zVlhfWebFB_37C_ifRLGRzqIRcJnA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFetch() {
  // Let's get ALL participants first, so we have a valid participant ID
  const { data: participants } = await supabase.rpc('get_all_participants');
  console.log('Participants:', participants?.length);
  
  if (participants && participants.length > 0) {
    const pid = participants[0].id;
    console.log('Testing fetch for participant:', pid);
    
    // First let's insert a valid rating via our upsert RPC
    const { data: upsertData, error: upsertError } = await supabase.rpc('upsert_participant_rating', {
      p_participant_id: pid,
      p_prompt_number: 1,
      p_displayed_position: 1,
      p_actual_model: 'Model_A',
      p_metric_name: 'prompt_adherence',
      p_rating: 5,
    });
    console.log('Upsert result:', upsertData, upsertError);

    // Now fetch
    const { data, error } = await supabase.rpc('get_participant_responses', { pid });
    console.log('Fetched Data:', data);
    console.log('Fetch Error:', error);
  } else {
    console.log('No participants found in DB. Let us create one?');
  }
}

testFetch();
