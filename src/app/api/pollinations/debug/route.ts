import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prompt = searchParams.get('prompt');
    const model = searchParams.get('model') || 'gemini';
    
    // Create log object to capture all information
    const debug = {
      requestInfo: {
        prompt,
        model,
        url: request.url,
        headers: Object.fromEntries(request.headers),
      },
      directApiResponse: null,
      directApiHeaders: null,
      ourApiResponse: null,
      ourApiHeaders: null,
      error: null,
      detectedModel: null
    };
    
    try {
      // Test direct Pollinations API
      const encodedPrompt = encodeURIComponent(prompt || 'which llm are you?');
      const directResponse = await fetch(`https://text.pollinations.ai/${encodedPrompt}?model=${model}`);
      
      // Capture response headers
      debug.directApiHeaders = Object.fromEntries(directResponse.headers);
      
      // Capture response text
      const directText = await directResponse.text();
      debug.directApiResponse = directText;
      
      // Try to detect model based on response
      debug.detectedModel = detectModel(directText);
      
    } catch (error) {
      debug.error = `Direct API error: ${error.message}`;
    }
    
    return NextResponse.json(debug);
    
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({ error: 'Debug endpoint error', details: error.message }, { status: 500 });
  }
}

// Helper function to detect model from response text
function detectModel(text: string): string {
  const geminiPatterns = [
    /gemini/i, 
    /google/i, 
    /trained by google/i,
    /i('m| am) gemini/i
  ];
  
  const gptPatterns = [
    /gpt/i, 
    /chatgpt/i, 
    /openai/i,
    /trained by openai/i,
    /i('m| am) (a language model developed by|created by|from) openai/i
  ];
  
  // Check for Gemini patterns
  for (const pattern of geminiPatterns) {
    if (pattern.test(text)) {
      return "GEMINI";
    }
  }
  
  // Check for GPT patterns
  for (const pattern of gptPatterns) {
    if (pattern.test(text)) {
      return "GPT/CHATGPT";
    }
  }
  
  return "UNKNOWN";
} 