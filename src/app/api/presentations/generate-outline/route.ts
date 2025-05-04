import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/pollinations-api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, numSlides, language, pageStyle, model } = body;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    // Build the AI prompt
    const prompt = `You are an expert presentation creator. Generate a presentation outline based on the following:
- Topic: ${topic}
- Number of slides: ${numSlides}
- Language: ${language}
- Page style: ${pageStyle}

Instructions:
- Create exactly ${numSlides} slides (or as close as makes sense for the topic).
- For each slide, provide a title and 2-5 bullet points.
- Output ONLY a valid JSON array of objects, where each object is a slide: { "title": "Slide Title", "points": ["Bullet point 1", "Bullet point 2"] }
- Do not include any explanation, markdown, or text outside the JSON array.

Example output:
[
  { "title": "Introduction to Quantum Computing", "points": ["Definition of quantum computing", "Brief history", "Why it matters"] },
  { "title": "Key Concepts", "points": ["Qubits", "Superposition", "Entanglement"] }
]
`;

    // Call the AI model (use provided model or fallback to openai)
    const aiResponse = await generateText(prompt, { model: model || "openai" });

    // Try to parse the AI's response as JSON
    let outline;
    try {
      outline = JSON.parse(aiResponse);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response as JSON." }, { status: 500 });
    }

    // Validate the outline structure
    if (!Array.isArray(outline) || !outline.every(
      (slide) =>
        typeof slide === "object" &&
        typeof slide.title === "string" &&
        Array.isArray(slide.points) &&
        slide.points.every((pt) => typeof pt === "string")
    )) {
      return NextResponse.json({ error: "AI response JSON structure invalid." }, { status: 500 });
    }

    return NextResponse.json(outline, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to generate or parse outline." }, { status: 500 });
  }
} 