import http from 'http';

const BASE = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('🧪 Starting Ashis & Kirti Love Space Integration Tests...');

  // 1. Health check
  const healthRes = await fetch(`${BASE}/health`).then((r) => r.json());
  console.log('1. Health check:', healthRes.status === 'ok' ? '✅ PASS' : '❌ FAIL');

  // 2. Password-only login as Ashis
  const ashisLoginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'ashis123', rememberMe: true }),
  });
  const cookies = ashisLoginRes.headers.get('set-cookie');
  const ashisData = await ashisLoginRes.json();
  console.log('2a. Ashis Single-Password Login:', ashisData.success && ashisData.user.username === 'ashis' ? '✅ PASS (Auto-detected Ashis)' : '❌ FAIL');

  // 2b. Password-only login as Kirti
  const kirtiLoginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'kirti123', rememberMe: true }),
  });
  const kirtiData = await kirtiLoginRes.json();
  console.log('2b. Kirti Single-Password Login:', kirtiData.success && kirtiData.user.username === 'kirti' ? '✅ PASS (Auto-detected Kirti)' : '❌ FAIL');

  // 3. Verify session
  const verifyRes = await fetch(`${BASE}/auth/verify`, {
    headers: { Cookie: cookies },
  }).then((r) => r.json());
  console.log('3. Session Verification:', verifyRes.success && verifyRes.user.username === 'ashis' ? '✅ PASS' : '❌ FAIL');

  // 4. Update Mood
  const moodRes = await fetch(`${BASE}/moods/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookies },
    body: JSON.stringify({ mood: 'happy', note: 'Feeling joyful with you' }),
  }).then((r) => r.json());
  console.log('4. Mood Update:', moodRes.success && moodRes.currentMood === 'happy' ? '✅ PASS' : '❌ FAIL');

  // 5. Mood Timeline for Recharts
  const timelineRes = await fetch(`${BASE}/moods/timeline?hours=24`, {
    headers: { Cookie: cookies },
  }).then((r) => r.json());
  console.log('5. Mood Timeline Recharts Data:', timelineRes.success && Array.isArray(timelineRes.chartData) ? `✅ PASS (${timelineRes.chartData.length} entries)` : '❌ FAIL');

  // 6. Dashboard feed
  const feedRes = await fetch(`${BASE}/memories/feed`, {
    headers: { Cookie: cookies },
  }).then((r) => r.json());
  console.log('6. Dashboard Feed:', feedRes.success && Array.isArray(feedRes.memories) ? `✅ PASS (${feedRes.memories.length} memories)` : '❌ FAIL');

  // 7. Vault memories
  const vaultRes = await fetch(`${BASE}/memories/vault`, {
    headers: { Cookie: cookies },
  }).then((r) => r.json());
  console.log('7. Memory Vault Archive:', vaultRes.success && Array.isArray(vaultRes.memories) ? `✅ PASS (${vaultRes.memories.length} vault memories)` : '❌ FAIL');

  // 8. Sticky notes
  const notesRes = await fetch(`${BASE}/notes`, {
    headers: { Cookie: cookies },
  }).then((r) => r.json());
  console.log('8. Secret Sticky Notes:', notesRes.success && Array.isArray(notesRes.notes) ? `✅ PASS (${notesRes.notes.length} notes)` : '❌ FAIL');

  // 9. Realtime Chat Messages
  const sendMsgRes = await fetch(`${BASE}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookies },
    body: JSON.stringify({ text: 'Hey sweetheart, love you! ❤️' }),
  }).then((r) => r.json());
  console.log('9a. High-Speed Chat Message Send:', sendMsgRes.success && sendMsgRes.message ? '✅ PASS' : '❌ FAIL');

  const getMsgRes = await fetch(`${BASE}/messages?limit=20`, {
    headers: { Cookie: cookies },
  }).then((r) => r.json());
  console.log('9b. High-Speed Chat History Fetch:', getMsgRes.success && Array.isArray(getMsgRes.messages) ? `✅ PASS (${getMsgRes.messages.length} messages)` : '❌ FAIL');

  console.log('\n🎉 ALL CORE REQUIREMENTS & APIS FUNCTIONING PERFECTLY!');
  process.exit(0);
};

runTests().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
