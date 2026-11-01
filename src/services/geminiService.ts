import { GoogleGenAI } from '@google/genai';

export interface SlicedTaskStep {
  title: string;
  minutes: number;
}

export async function sliceTaskWithAI(taskName: string): Promise<SlicedTaskStep[]> {
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                 (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an ADHD study coach for a student who gets distracted easily and can only focus for 15-20 minutes at a time.
Break down this study task: "${taskName}" into 3 to 4 ultra-small, concrete, bite-sized micro-steps.
Each step must take 10 to 15 minutes.
Return ONLY valid JSON with this exact array format:
[
  {"title": "Step 1 description", "minutes": 15},
  {"title": "Step 2 description", "minutes": 15}
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: { title?: string; minutes?: number }) => ({
          title: item.title || 'Focus chunk',
          minutes: Math.min(25, Math.max(5, Number(item.minutes) || 15)),
        }));
      }
    } catch {
      // Fallback to intelligent template breakdown
    }
  }

  // Smart heuristic decomposition for quick, reliable offline usage
  const clean = taskName.trim();
  const lower = clean.toLowerCase();

  if (lower.includes('read') || lower.includes('chapter') || lower.includes('book') || lower.includes('article')) {
    return [
      { title: `Skim headings & bold terms in ${clean.slice(0, 30)}`, minutes: 10 },
      { title: `Deep read 4-5 core pages without phone`, minutes: 15 },
      { title: `Jot down 3 key takeaways or summary bullets`, minutes: 10 },
    ];
  } else if (lower.includes('problem') || lower.includes('math') || lower.includes('code') || lower.includes('exercise')) {
    return [
      { title: `Review example formula/concept for ${clean.slice(0, 25)}`, minutes: 10 },
      { title: `Solve first 2 practice problems solo`, minutes: 15 },
      { title: `Check answers & fix any mistakes`, minutes: 10 },
    ];
  } else if (lower.includes('essay') || lower.includes('write') || lower.includes('paper') || lower.includes('report')) {
    return [
      { title: `Outline 3 main bullet arguments & thesis`, minutes: 10 },
      { title: `Speed draft first paragraph / section (no editing)`, minutes: 15 },
      { title: `Polish flow and add 1 supporting citation`, minutes: 10 },
    ];
  }

  return [
    { title: `Clear desk & setup materials for: ${clean.slice(0, 30)}`, minutes: 5 },
    { title: `First 15-min deep focus sprint on: ${clean.slice(0, 30)}`, minutes: 15 },
    { title: `Wrap up, test yourself on 2 questions`, minutes: 10 },
  ];
}
