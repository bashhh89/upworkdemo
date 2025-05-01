import { NextResponse } from 'next/server';

// Pollinations API URLs for different models
const POLLINATIONS_URLS = {
  openai: 'https://text.pollinations.ai/openai',
  searchgpt: 'https://text.pollinations.ai/openai' // Changed to /openai endpoint which supports all models
};

export async function POST(request: Request) {
  try {
    // Get the request body
    const requestData = await request.json();
    console.log('Request received from frontend:', JSON.stringify(requestData, null, 2));
    
    // Determine which API endpoint to use based on model
    const model = requestData.model || "openai";
    const apiUrl = POLLINATIONS_URLS[model] || POLLINATIONS_URLS.openai;
    
    // Build the appropriate payload for the selected model
    let pollinationsPayload: any = {
      messages: requestData.messages,
      temperature: requestData.temperature || 0.7,
      response_format: requestData.response_format || { type: "text" }
    };
    
    // Add model-specific parameters
    if (model === 'searchgpt') {
      pollinationsPayload.model = "searchgpt";
      // Include webpage_context if provided
      if (requestData.webpage_context && Array.isArray(requestData.webpage_context)) {
        pollinationsPayload.webpage_context = requestData.webpage_context;
      }
    } else {
      // For standard models
      pollinationsPayload.model = requestData.model || "openai";
    }
    
    console.log(`Sending request to Pollinations API:`, JSON.stringify(pollinationsPayload, null, 2));
    
    // Call the Pollinations API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pollinationsPayload),
    });
    
    // Get the raw response for debugging
    const responseText = await response.text();
    console.log(`Pollinations API response status: ${response.status}`);
    console.log(`Pollinations API response headers:`, Object.fromEntries(response.headers));
    console.log(`Pollinations API response body (first 500 chars):`, responseText.substring(0, 500));
    
    if (!response.ok) {
      throw new Error(`Pollinations API responded with status: ${response.status}, body: ${responseText.substring(0, 200)}...`);
    }
    
    // Parse the response body
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing response JSON:', parseError);
      console.error('Invalid JSON response from Pollinations:', responseText);
      throw new Error('Invalid JSON response from Pollinations API');
    }
    
    // Handle different response formats based on the model
    let content = '';
    
    if (model === 'searchgpt') {
      if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        // Handle standard OpenAI format which searchgpt now uses
        content = data.choices[0].message.content;
      } else {
        // Fallback for potential older searchgpt format
        content = data.answer || data.content || "";
        if (!content) {
          console.error('Unexpected searchgpt response structure:', data);
          throw new Error('Could not extract content from Pollinations SearchGPT API response');
        }
      }
    } else {
      // Standard OpenAI-compatible format
      if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        content = data.choices[0].message.content;
      } else {
        console.error('Unexpected response structure from Pollinations:', data);
        throw new Error('Unexpected response structure from Pollinations API');
      }
    }
    
    // Extra JSON validation and cleaning for JSON response format requests
    let cleanedContent = content;
    if (pollinationsPayload.response_format?.type === "json_object") {
      try {
        // Clean the content if it looks like a JSON string but has issues
        cleanedContent = cleanJsonString(content);
        
        // Validate by parsing (this will throw if invalid)
        JSON.parse(cleanedContent);
        
        console.log('Successfully validated JSON response');
      } catch (jsonError) {
        console.error('LLM returned invalid JSON despite json_object format:', jsonError);
        console.log('Attempting to extract JSON from response...');
        
        // Try to extract JSON from the response if it's embedded in text/markdown
        try {
          // Extract JSON from markdown code blocks if present
          const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            cleanedContent = cleanJsonString(jsonMatch[1]);
            // Verify it's valid
            JSON.parse(cleanedContent);
            console.log('Successfully extracted JSON from code block');
          } else {
            // Look for what seems like a JSON object
            const possibleJson = content.match(/\{[\s\S]*\}/);
            if (possibleJson) {
              cleanedContent = cleanJsonString(possibleJson[0]);
              // Verify it's valid
              JSON.parse(cleanedContent);
              console.log('Successfully extracted JSON object from text');
            } else {
              // If all else fails, create a fallback JSON
              cleanedContent = JSON.stringify({
                error: "Could not parse LLM response as JSON",
                originalContent: content.substring(0, 100) + "..."
              });
            }
          }
        } catch (extractError) {
          console.error('Failed to extract valid JSON:', extractError);
          // Create a minimal valid JSON as fallback
          cleanedContent = JSON.stringify({
            error: "Failed to extract valid JSON",
            originalContent: content.substring(0, 100) + "..."
          });
        }
      }
    }
    
    // Return the content from the response
    return NextResponse.json({ 
      content: cleanedContent,
      status: 'success' 
    });
    
  } catch (error) {
    console.error('Error in Pollinations API route handler:', error);
    
    // Return a structured error response
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Helper function to clean and fix common JSON string issues
function cleanJsonString(jsonString: string): string {
  let cleaned = jsonString.trim();
  
  // Remove any markdown code block delimiters
  cleaned = cleaned.replace(/```json|```/g, '').trim();
  
  // Remove control characters
  cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  
  // Fix common JSON syntax errors
  cleaned = cleaned
    .replace(/,\s*}/g, '}') // Remove trailing commas in objects
    .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
    .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensure property names are in double quotes
    .replace(/:\s*'/g, ': "') // Replace single quotes in values with double quotes (start)
    .replace(/'\s*,/g, '",') // Replace single quotes in values with double quotes (end with comma)
    .replace(/'\s*}/g, '"}') // Replace single quotes in values with double quotes (end with brace)
    .replace(/'\s*]/g, '"]') // Replace single quotes in values with double quotes (end with bracket)
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/\n/g, '\\n'); // Escape newlines
  
  // Ensure the string is properly wrapped in curly braces
  if (!cleaned.trim().startsWith('{')) {
    cleaned = '{' + cleaned;
  }
  if (!cleaned.trim().endsWith('}')) {
    cleaned = cleaned + '}';
  }
  
  return cleaned;
} 