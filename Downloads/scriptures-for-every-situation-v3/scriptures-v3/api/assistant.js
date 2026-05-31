export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(200).json({ demo: true, message: 'OPENAI_API_KEY is not configured. Using local recommendations only.' });
  try {
    const { situation, topics = [] } = req.body || {};
    const topicTitles = topics.slice(0, 30).map(t => `${t.title}: ${t.description}`).join('\n');
    const prompt = `You are a careful Christian scripture assistant. A user says: "${situation}". Choose relevant topics from this list and provide: 1) relevant topic names, 2) 5 Bible references, 3) a short encouragement, 4) 5 prayer points, 5) a 7-day reading plan. Avoid claiming certainty about God's private will. Use pastoral, biblical, concise language. Topics:\n${topicTitles}`;
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: 'You provide scripture-centered, non-denominational Christian encouragement.' }, { role: 'user', content: prompt }], temperature: 0.4 })
    });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: data?.error?.message || 'AI request failed' });
    return res.status(200).json({ answer: data.choices?.[0]?.message?.content || '' });
  } catch (e) { return res.status(500).json({ error: e.message }); }
}
