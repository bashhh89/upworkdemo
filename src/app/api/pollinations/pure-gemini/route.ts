
export const runtime = 'edge';

// Direct connection to Pollinations Gemini API with zero modifications
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prompt = searchParams.get('prompt');
    
    if (!prompt) {
      return new Response('Error: Missing prompt parameter', { status: 400 });
    }
    
    // Direct call to Pollinations with Gemini model using exact format from PowerShell example
    const encodedPrompt = encodeURIComponent(prompt);
    const response = await fetch(`https://text.pollinations.ai/${encodedPrompt}?model=gemini`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pollinations API error: ${response.status}`, errorText);
      return new Response(`Pollinations API error: ${response.status}`, { status: response.status });
    }
    
    // Get raw text response
    const text = await response.text();
    
    // Return the raw text response directly 
    return new Response(text, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
    
  } catch (error) {
    console.error('Error in Pollinations pure Gemini API:', error);
    return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
} 