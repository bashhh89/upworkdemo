// Simple test script for Pollinations API models
const testModels = async () => {
  try {
    console.log('Testing Pollinations API models endpoint...');
    
    const response = await fetch('https://text.pollinations.ai/models');
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Models data received:', JSON.stringify(data, null, 2));
    
    // Test a simple chat completion
    console.log('\nTesting basic chat completion with "gemini" model...');
    const chatResponse = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Hello, what is 2+2?' }
        ],
        model: 'gemini'
      })
    });
    
    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      throw new Error(`Chat API Error: ${chatResponse.status} - ${errorText}`);
    }
    
    const chatData = await chatResponse.json();
    console.log('Chat response:', JSON.stringify(chatData, null, 2));
    
    return { success: true, models: data, chatResponse: chatData };
  } catch (error) {
    console.error('API Test Error:', error);
    return { success: false, error: error.message };
  }
};

// Export as API route handler
export async function GET() {
  const result = await testModels();
  return new Response(JSON.stringify(result, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
} 