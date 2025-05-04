
export const runtime = 'edge';

// Direct connection to Google's Gemini API
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prompt = searchParams.get('prompt');
    
    if (!prompt) {
      return new Response('Error: Missing prompt parameter', { status: 400 });
    }

    // Use official Google AI Studio Gemini API
    // This requires a Google API key to be set
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      return new Response('Error: GOOGLE_API_KEY not configured in environment variables', { status: 500 });
    }
    
    // Call the official Google Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Gemini API error: ${response.status}`, errorText);
      return new Response(`Google Gemini API error: ${response.status}`, { status: response.status });
    }
    
    const data = await response.json();
    
    // Extract content from the official Gemini API response format
    let content = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content && 
        data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      content = data.candidates[0].content.parts[0].text;
    }
    
    // Return the raw text response
    return new Response(content, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
    
  } catch (error) {
    console.error('Error in Google Gemini API:', error);
    return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
} 