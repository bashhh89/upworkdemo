import { NextResponse } from 'next/server';

export const runtime = "edge";

// Available models from Pollinations API
const AVAILABLE_MODELS = [
  "gemini", "openai", "openai-fast", "openai-large", "mirexa", "mistral", 
  "llama", "unity", "deepseek", "sur", "phi", "searchgpt", "rtist"
];

// Helper function to check if a model is available
function isModelAvailable(model: string): boolean {
  return AVAILABLE_MODELS.includes(model.toLowerCase());
}

export async function POST(req: Request) {
  try {
    const { messages, model = "gemini", temperature } = await req.json();
    
    // Simply use Pollinations API directly with the provided model
    console.log(`Using model: ${model}`);
    
    // Use the documented OpenAI-compatible endpoint for all POST requests
    const apiUrl = `https://text.pollinations.ai/openai`;
    console.log(`Using endpoint: ${apiUrl}`);
    
    // Pass the payload directly, ensuring the model is specified in the body
    const payload = {
      messages: messages,
      model: model, // Specify the model in the payload
      temperature: temperature || 0.7 // Add default temperature if not provided
    };
    console.log("Sending payload:", JSON.stringify(payload)); // Log payload
    
    // Make the API call
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    // Get the response and return it directly
    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`);
      const errorText = await response.text();
      console.error(`Error details: ${errorText}`);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    // Return data directly with no modifications
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error",
      choices: [{
        message: {
          role: "assistant",
          content: "Sorry, there was an error processing your request. The Pollinations API might be experiencing issues. Please try again in a moment or use a different model."
        }
      }]
    }, { status: 500 });
  }
} 