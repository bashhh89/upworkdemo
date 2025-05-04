import { NextRequest, NextResponse } from "next/server";
import { generateText, generateImage } from "@/lib/pollinations-api";

interface SlideOutline {
  title: string;
  points: string[];
}

// Expected structure from the LLM
interface LlmSlideData {
  title: string;
  textContent: string;
  layoutType: 'standard' | 'image_left' | 'image_right' | 'cycle' | 'staircase' | string;
  items?: string[];
}

// Final structure sent to the frontend
interface FinalSlideResult {
  title: string;
  textContent: string;
  imageUrl: string | null;
  layoutType: string;
  items?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { outline, pageStyle, model, topic } = body;

    if (!Array.isArray(outline) || !outline.every(
      (slide: any) =>
        slide &&
        typeof slide.title === "string" &&
        Array.isArray(slide.points) &&
        slide.points.every((pt: any) => typeof pt === "string")
    )) {
      return NextResponse.json({ error: "Invalid or missing outline." }, { status: 400 });
    }

    // --- 1. Construct Enhanced Prompt for LLM --- 
    const slideOutlinesString = outline.map((s: SlideOutline, i: number) => 
      `Slide ${i + 1}: Title: "${s.title}", Points: [${s.points.map(p => `"${p}"`).join(", ")}]`
    ).join('\n');

    const layoutOptions = ['standard', 'image_left', 'image_right', 'cycle', 'staircase'];

    const fullPrompt = `You are an expert presentation writer. Generate content for a presentation based on the following outlines:
${slideOutlinesString}

For EACH slide, you MUST:
1. Generate a compelling title.
2. Generate detailed, presentation-friendly textContent expanding on the provided points. ${pageStyle ? `Use a "${pageStyle}" style/tone.` : ""}
3. Analyze the generated content and choose the MOST appropriate layoutType from this list: [${layoutOptions.join(", ")}]. Use 'cycle' or 'staircase' for lists/processes, 'image_left'/'image_right' if an image would be prominent, otherwise 'standard'.
4. If layoutType is 'cycle' or 'staircase', extract the key steps/items into a structured array called 'items'. If not applicable, omit the 'items' key.
5. Respond with ONLY a valid JSON object containing a single key "slides". The value of "slides" must be an array of JSON objects, where each object represents a slide and has the keys: "title" (string), "textContent" (string), "layoutType" (string from the allowed list), and optionally "items" (array of strings).

Example structure:
{
  "slides": [
    { "title": "...", "textContent": "...", "layoutType": "standard" },
    { "title": "...", "textContent": "...", "layoutType": "cycle", "items": ["...", "..."] }
  ]
}
`;

    // --- 2. Call LLM and Parse Response --- 
    let llmSlides: LlmSlideData[] = [];
    try {
      const llmResponseText = await generateText(fullPrompt, { model: model || "openai", json: true });
      const parsedResponse = JSON.parse(llmResponseText);
      if (!parsedResponse || !Array.isArray(parsedResponse.slides)) {
        throw new Error('Invalid JSON structure received from LLM.');
      }
      // Basic validation of parsed data could be added here
      llmSlides = parsedResponse.slides;

    } catch (err) {
      console.error("LLM Generation/Parsing Error:", err);
      // Fallback: Generate basic slides if LLM fails
      llmSlides = outline.map((slide: SlideOutline) => ({
        title: slide.title,
        textContent: slide.points.join('\n'),
        layoutType: 'standard',
      }));
    }

    // Helper for image fallback
    const placeholderImage = null;

    // Helper to extract keywords from text

    // --- 3. Generate Images and Combine Results --- 
    const finalSlides: FinalSlideResult[] = await Promise.all(
      llmSlides.map(async (llmSlide: LlmSlideData) => {
        let imageUrl: string | null = placeholderImage;
        try {
          // Summarize textContent for prompt
          const briefContent = llmSlide.textContent.length > 150 ? llmSlide.textContent.substring(0, 150) + '...' : llmSlide.textContent;
          const overallTopic = topic || '';
          const presentationStyle = pageStyle || 'professional';
          let styleHint = '';
          // Optionally inform style by layoutType
          switch (llmSlide.layoutType) {
            case 'image_left':
            case 'image_right':
              styleHint = 'illustrative, suitable as a background or side visual';
              break;
            case 'cycle':
            case 'staircase':
              styleHint = 'diagram, process, or flow illustration';
              break;
            default:
              styleHint = 'content-focused, visually appealing';
          }
          const imagePrompt = `Generate a visually appealing image for a ${presentationStyle} presentation slide titled "${llmSlide.title}". The slide content discusses: "${briefContent}". The overall presentation topic is "${overallTopic}". Style should be ${styleHint}. Image should be suitable as a primary visual or background for the slide content.`;
          imageUrl = await generateImage(imagePrompt, { model: "turbo", width: 1024, height: 768, nologo: true });
        } catch (err) {
          console.error(`Image generation failed for slide: ${llmSlide.title}`, err);
          imageUrl = placeholderImage;
        }

        return {
          title: llmSlide.title,
          textContent: llmSlide.textContent,
          imageUrl,
          layoutType: llmSlide.layoutType || 'standard',
          items: llmSlide.items || undefined,
        };
      })
    );

    // --- 4. Return Final Response --- 
    return NextResponse.json(finalSlides, { status: 200 });

  } catch (err) {
    console.error("Slide Generation API Error:", err);
    // Provide a more specific error message if possible
    const errorMessage = err instanceof Error ? err.message : "Failed to generate slides.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 