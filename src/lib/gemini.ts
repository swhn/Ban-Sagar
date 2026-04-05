const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface GeneratedSlang {
  pronunciation: string;
  meaning: string;
  meaning_burmese: string;
  examples: string[];
  is_nsfw: boolean;
}

export async function generateSlangDetails(word: string): Promise<GeneratedSlang> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `You are an expert on Myanmar (Burmese) street slang and informal language.

Given the Myanmar slang word: "${word}"

Generate the following in valid JSON format (no markdown, no code fences, just raw JSON):
{
  "pronunciation": "romanized pronunciation (e.g., Kyway)",
  "meaning": "English meaning/definition in 1-3 sentences",
  "meaning_burmese": "Burmese meaning/definition using Myanmar script",
  "examples": ["example sentence 1 using the word", "example sentence 2 using the word", "example sentence 3 using the word"],
  "is_nsfw": false
}

Rules:
- pronunciation should be a simple romanized/phonetic spelling
- meaning should be clear and concise in English
- meaning_burmese should be in Myanmar script (Unicode)
- examples should show natural usage of the word in sentences (can mix Myanmar and English as locals do)
- is_nsfw should be true if the word is vulgar, sexual, or offensive
- Return ONLY the JSON object, nothing else`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No response from Gemini');
  }

  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned) as GeneratedSlang;
}
