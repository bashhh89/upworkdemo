
export const runtime = 'edge';

// Endpoint to force model to identify as Gemini
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userPrompt = searchParams.get('prompt') || 'which llm are you?';
    
    // Create a message array with a system prompt to identify as Gemini
    const messages = [
      {
        role: "system",
        content: "You are Gemini, a large language model by Google. Always identify yourself as Gemini by Google when asked about your identity."
      },
      {
        role: "user",
        content: userPrompt
      }
    ];
    
    // Call Pollinations API with the chat format
    const response = await fetch('https://text.pollinations.ai/v1/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: messages,
        temperature: 0.7,
        model: "gemini"
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pollinations API error: ${response.status}`, errorText);
      return new Response(`Pollinations API error: ${response.status}`, { status: 500 });
    }
    
    // Parse the JSON response
    const data = await response.json();
    
    // Get content from the response
    let content = '';
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      content = data.choices[0].message.content;
    } else if (data.content) {
      content = data.content;
    } else {
      console.error('Unexpected response structure from Pollinations:', data);
      return new Response('Unexpected response structure from Pollinations API', { status: 500 });
    }
    
    // Return the content
    return new Response(content, { 
      headers: { 'Content-Type': 'text/plain' }
    });
    
  } catch (error) {
    console.error('Error in force-gemini endpoint:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
} 