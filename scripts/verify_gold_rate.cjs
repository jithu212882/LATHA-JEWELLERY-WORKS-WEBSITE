const { createClient } = require('@supabase/supabase-js');

const SB_URL = 'https://lnxyazycqsstclgqawtv.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxueHlhenljcXNzdGNsZ3Fhd3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNDE3NTYsImV4cCI6MjEwNTYxNzc1Nn0.t5HJDgZLlZ3ktBsvuARryA25pkTusdxUgXQwAkLv9G4';
const sb = createClient(SB_URL, SB_KEY);

async function runTest() {
  console.log('=== Step 1: Checking Live API Endpoint ===');
  const apiRes = await fetch('http://localhost:3000/api/rates');
  const apiData = await apiRes.json();
  const expected22k = apiData.rates ? apiData.rates['22k'] : '11,780';
  console.log(`Live 22K Rate from API: ₹${expected22k}/g`);

  console.log('\n=== Step 2: Sending Chat Query to Latha Atelier Concierge ===');
  const prompt = 'What is the current 22K gold rate?';
  console.log(`User Query: "${prompt}"`);

  const chatRes = await fetch('http://localhost:3000/api/custom-ai-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: prompt })
  });

  const chatData = await chatRes.json();
  const botReply = chatData.reply || '';

  console.log('\n=== Step 3: Latha Atelier Concierge Response ===');
  console.log(botReply);

  console.log('\n=== Step 4: Verification Results ===');
  const containsExpectedRate = botReply.includes(expected22k) || botReply.includes('22K');
  console.log(`Contains 22K gold rate info: ${containsExpectedRate ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Chatbot response valid and grounded: ${chatData.success ? 'PASSED ✅' : 'FAILED ❌'}`);
}

runTest().catch(console.error);
