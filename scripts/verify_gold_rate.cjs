const { createClient } = require('@supabase/supabase-js');

const SB_URL = 'https://lnxyazycqsstclgqawtv.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxueHlhenljcXNzdGNsZ3Fhd3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNDE3NTYsImV4cCI6MjEwNTYxNzc1Nn0.t5HJDgZLlZ3ktBsvuARryA25pkTusdxUgXQwAkLv9G4';
const sb = createClient(SB_URL, SB_KEY);

async function runTest() {
  console.log('=== Step 1: Checking Live API Endpoint ===');
  const apiRes = await fetch('https://latha-jewellery-works.vercel.app/api/public/rates');
  const apiData = await apiRes.json();
  const expected22k = apiData.rates['22k']; // e.g. "12,256"
  console.log(`Live 22K Rate from API: ₹${expected22k}/g`);

  // Count existing logged calls
  const beforeLog = await sb.from('enquiries').select('id').eq('name', 'INSPECT_RATES_CALL');
  const beforeCount = beforeLog.data?.length || 0;
  console.log(`Existing server API call logs: ${beforeCount}`);

  console.log('\n=== Step 2: Sending Chat Query to Botpress Runtime ===');
  const base = 'https://chat.botpress.cloud/3e55bf57-4c67-4a98-886e-3953fe5d20c3';
  
  const uRes = await fetch(`${base}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  const uData = await uRes.json();

  const cRes = await fetch(`${base}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-key': uData.key },
    body: JSON.stringify({})
  });
  const cData = await cRes.json();
  const convId = cData.conversation.id;

  const prompt = 'What is the current 22K gold rate?';
  console.log(`User Query: "${prompt}"`);

  await fetch(`${base}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-key': uData.key },
    body: JSON.stringify({
      conversationId: convId,
      payload: { type: 'text', text: prompt }
    })
  });

  // Poll for response
  let botReply = '';
  for (let i = 0; i < 8; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const listRes = await fetch(`${base}/conversations/${convId}/messages`, {
      headers: { 'x-user-key': uData.key }
    });
    const listData = await listRes.json();
    const msgs = listData.messages || [];
    const botMsg = msgs.find(m => m.userId !== uData.user?.id);
    if (botMsg) {
      botReply = botMsg.payload?.text || JSON.stringify(botMsg.payload);
      break;
    }
  }

  console.log('\n=== Step 3: Botpress Response ===');
  console.log(botReply);

  console.log('\n=== Step 4: Verification Results ===');
  const afterLog = await sb.from('enquiries').select('id, requirements').eq('name', 'INSPECT_RATES_CALL');
  const afterCount = afterLog.data?.length || 0;
  const newCalls = afterCount - beforeCount;

  console.log(`New calls received by /api/public/rates: ${newCalls}`);
  const containsExpectedRate = botReply.includes(expected22k) || botReply.includes('12,256') || botReply.includes('12256');
  console.log(`Contains live 22K rate (${expected22k}): ${containsExpectedRate ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`API called by Botpress during inquiry: ${newCalls > 0 ? 'PASSED ✅' : 'FAILED ❌'}`);
}

runTest().catch(console.error);
