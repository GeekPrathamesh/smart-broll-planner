import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function translateSegmentsBatch(segments) {
  const payload = segments.map((s, i) => ({
    id: i,
    text: s.text
  }));

  const prompt = `
Translate the following Hindi/Hinglish sentences into clear English.
Keep meaning unchanged.
Return JSON in the SAME ORDER.

Input:
${JSON.stringify(payload, null, 2)}
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  let content = res.choices[0].message.content.trim();

// Remove ```json or ``` wrappers if present
if (content.startsWith("```")) {
  content = content.replace(/```json|```/g, "").trim();
}

const translated = JSON.parse(content);


  return segments.map((seg, i) => ({
    ...seg,
    translated_text: translated[i].text
  }));
}
