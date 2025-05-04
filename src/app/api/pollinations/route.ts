import { NextResponse } from 'next/server';

// Simple direct connection to Pollinations API
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prompt = searchParams.get('prompt');
    const model = searchParams.get('model') || 'gemini';
    
    if (!prompt) {
      return new Response('Error: Missing prompt parameter', { status: 400 });
    }
    
    // Direct call to Pollinations with no modifications or fallbacks
    const encodedPrompt = encodeURIComponent(prompt);
    const apiUrl = `https://text.pollinations.ai/${encodedPrompt}?model=${model}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Pollinations API error: ${response.status}`);
    }
    
    // Return the raw text response directly with no processing
    const textResponse = await response.text();
    return new Response(textResponse, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
    
  } catch (error) {
    console.error('Error in Pollinations API:', error);
    return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

export async function POST(request: Request) {
  try {
    // Get the request body
    const requestData = await request.json();
    
    // Determine which API endpoint to use based on model
    const model = requestData.model || "gemini";
    const apiUrl = model === 'gemini' 
      ? 'https://text.pollinations.ai/v1/gemini'
      : 'https://text.pollinations.ai/openai';
    
    // Pass the payload directly to Pollinations with no modifications
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...requestData,
        // For gemini endpoint, don't include model parameter
        model: model === 'gemini' ? undefined : model
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Pollinations API error: ${response.status}`);
    }
    
    // Return the response directly with no processing
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in Pollinations API:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 