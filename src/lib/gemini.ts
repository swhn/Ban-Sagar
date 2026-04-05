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
    throw new Error('VITE_GEMINI_API_KEY is not set. Add it to your environment variables.');
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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    });
  } catch (err) {
    throw new Error(`Network error calling Gemini API: ${err}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Gemini API ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Empty response from Gemini. The word may not be recognized.');
  }

  try {
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned) as GeneratedSlang;
  } catch {
    throw new Error(`Failed to parse Gemini response: ${text.slice(0, 200)}`);
  }
}
