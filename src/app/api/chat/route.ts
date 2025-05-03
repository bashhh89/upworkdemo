import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const runtime = "edge";
export const maxDuration = 30;

// Default models available from the Pollinations API text endpoint
const DEFAULT_MODELS = [
  "openai",
  "openai-large",
  "qwen-coder",
  "llama",
  "llamascout",
  "mistral",
  "unity",
  "midijourney",
  "rtist",
  "searchgpt",
  "evil",
  "deepseek-reasoning",
  "deepseek-reasoning-large",
  "phi",
  "llama-vision",
  "hormoz",
  "hypnosis-tracy",
  "deepseek",
  "sur",
  "gemini"
  // Excluded: "openai-audio" as it's not for text chat
];

// Define code-specialized models that are prioritized for code generation
const CODE_SPECIALIZED_MODELS = ["qwen-coder", "deepseek", "phi", "openai-large"];

// Define timeout values
const STANDARD_TIMEOUT = 40000; // 40 seconds
const EXTENDED_TIMEOUT = 60000; // 60 seconds for complex requests

let cachedModels: string[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

// Helper function to fetch available models with caching
async function fetchAvailableModels(): Promise<string[]> {
  const now = Date.now();
  
  // Use cache if available and not expired
  if (cachedModels && (now - lastFetchTime < CACHE_TTL)) {
    return cachedModels;
  }
  
  try {
    console.log("Fetching available models from Pollinations API");
    const response = await fetch("https://text.pollinations.ai/models", {
      headers: {
        "Accept": "application/json",
        "Cache-Control": "no-cache"
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch models: ${response.status}`);
      return DEFAULT_MODELS;
    }
    
    const data = await response.json();
    
    let modelsList: string[] = [];
    
    // Handle different response formats from the API
    if (Array.isArray(data) && typeof data[0] === 'string') {
      modelsList = data.filter(id => id !== 'openai-audio');
    } else if (typeof data === 'object' && !Array.isArray(data)) {
      modelsList = Object.keys(data).filter(id => id !== 'openai-audio');
    }
    
    if (modelsList.length === 0) {
      return DEFAULT_MODELS;
    }
    
    // Update cache
    cachedModels = modelsList;
    lastFetchTime = now;
    console.log(`Cached ${modelsList.length} models from Pollinations API`);
    
    return modelsList;
  } catch (error) {
    console.error("Error fetching models:", error);
    return DEFAULT_MODELS;
  }
}

export async function POST(req: Request) {
  try {
    const { messages, model = "openai" } = await req.json();
    
    // Log the request for debugging
    console.log("Chat API request:", { 
      model,
      messageCount: messages.length,
      lastUserMessage: messages.find(m => m.role === 'user')?.content,
      containsImage: messages.some(m => 'image' in m) // Log if any message contains an image
    });
    
    // Fetch available models
    const availableModels = await fetchAvailableModels();
    
    // Ensure we're using a supported model or fall back to OpenAI
    const modelToUse = availableModels.includes(model) ? model : "openai";
    
    // Check if this is a code generation request
    const lastUserMessage = messages.find(m => m.role === 'user')?.content || '';
    
    // Enhanced detection for complex code generation requests
    const isCodeRequest = /code|create|generate|script|html|css|javascript|function|programming/i.test(lastUserMessage);
    const isComplexRequest = isCodeRequest && 
                            (lastUserMessage.length > 100 || 
                             /landing page|website|application|full|complete|app/i.test(lastUserMessage));
    
    // REMOVED: For code generation requests, prefer proven code-friendly models
    // We'll use exactly what the user selected
    let effectiveModel = modelToUse;
    
    // If we have images, ensure we use a model with vision capabilities
    const hasImages = messages.some(m => 'image' in m);
    if (hasImages) {
      console.log("Message contains image(s), using vision-capable model");
      // Force OpenAI-Large for vision capabilities if not already using a vision-capable model
      // llama-vision is another option but may be less reliable
      if (!['openai-large', 'llama-vision'].includes(effectiveModel)) {
        console.log(`Switching from ${effectiveModel} to openai-large for vision capabilities`);
        effectiveModel = 'openai-large';
      }
    }
    
    if (model !== modelToUse) {
      console.log(`Requested model '${model}' not found, falling back to 'openai'`);
    } else {
      console.log(`Using requested model: ${modelToUse}`);
    }
    
    // Use extended timeout for complex code requests
    const timeoutDuration = isComplexRequest ? EXTENDED_TIMEOUT : STANDARD_TIMEOUT;
    console.log(`Using timeout of ${timeoutDuration}ms for ${isComplexRequest ? 'complex' : 'standard'} request`);
    
    // Add system instruction to output thinking in <think> tags for specific models
    // This is especially useful for reasoning-focused models
    const thinkingModels = ['deepseek-reasoning', 'deepseek-reasoning-large', 'deepseek', 'llama', 'llamascout', 'phi', 'gemini'];
    
    // Process messages to convert our custom image format to the one expected by the OpenAI Vision API
    let enhancedMessages = messages.map(msg => {
      // If the message has an image property, we need to convert it to the OpenAI Vision format
      if ('image' in msg && msg.image) {
        // Create a content array with text and image
        return {
          role: msg.role,
          content: [
            { 
              type: "text", 
              text: msg.content || "What's in this image?" 
            },
            {
              type: "image_url",
              image_url: {
                url: msg.image // This should be a base64 data URL like "data:image/jpeg;base64,..."
              }
            }
          ]
        };
      }
      
      // For messages without images, keep them as is
      return msg;
    });
    
    // Check if there is already a system message
    const hasSystemMessage = enhancedMessages.some(m => m.role === 'system');
    
    // Default system instructions that all models should follow
    const defaultSystemMessage = `You are an AI assistant focused on helping users with their tasks, especially coding and development. 

When generating code examples, please follow these guidelines:
1. Always provide complete, runnable code that demonstrates best practices.
2. When asked to create or generate a webpage, interface, or anything visual, always include HTML, CSS, and JavaScript together, even if not explicitly requested.
3. Structure your code examples with proper indentation and comments to explain complex parts.
4. For web development, ensure your code examples are responsive and follow modern standards.
5. For React or any framework code, ensure the code is complete enough to run without major modifications.
6. When showing JavaScript features, include practical examples that demonstrate real-world use cases.

${hasImages ? "When analyzing images, be detailed and explain what you see clearly. If text is visible in the image, mention it." : ""}

When responding, first think through your reasoning step by step inside <think></think> tags before giving your final answer. This thinking will be shown to the user in a separate section.`;
    
    // Add or update system message
    if (hasSystemMessage) {
      // Enhance existing system message
      enhancedMessages = enhancedMessages.map(m => {
        if (m.role === 'system') {
          // Check if the message has a content array or a string
          if (Array.isArray(m.content)) {
            // For array content, add our instructions to the first text element
            return {
              ...m,
              content: m.content.map((c, i) => 
                i === 0 && c.type === 'text' 
                  ? { ...c, text: `${c.text}\n\n${defaultSystemMessage}` }
                  : c
              )
            };
          } else {
            // For string content, append our instructions
            return {
              ...m,
              content: `${m.content}\n\n${defaultSystemMessage}`
            };
          }
        }
        return m;
      });
    } else {
      // Add new system message at the beginning
      enhancedMessages.unshift({
        role: 'system',
        content: defaultSystemMessage
      });
    }
    
    // Log processed messages (for debugging)
    console.log("Sending to API with:", {
      model: effectiveModel,
      messageCount: enhancedMessages.length,
      hasImages: hasImages,
      firstUserMessageType: typeof enhancedMessages.find(m => m.role === 'user')?.content
    });
    
    // Format the request for Pollinations API
    const pollinationsPayload = {
      model: effectiveModel,
      messages: enhancedMessages,
      stream: false,
      max_tokens: 4000 // Add maximum token limit to prevent excessively large responses
    };
    
    try {
      // Call Pollinations API
      console.log(`Calling Pollinations API with model: ${effectiveModel}`);
      const response = await fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(pollinationsPayload),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(timeoutDuration)
      });
      
      // Detailed logging of response status
      console.log(`Pollinations API response status: ${response.status} (${response.statusText})`);
      
      if (!response.ok) {
        const errorBody = await response.text(); // Attempt to read response body for more details
        console.error(`Model ${effectiveModel} failed with status: ${response.status} (${response.statusText}). Body: ${errorBody}`);
        
        // Direct fallback for code generation requests to OpenAI
        const isCodeRequest = /code|create|generate|script|html|css|javascript|function|programming/i.test(lastUserMessage);
        
        if (isCodeRequest) {
          console.log("Code generation request detected, using openai model");
          
          // Try direct OpenAI call through pollinations
          const fallbackResponse = await fetch("https://text.pollinations.ai/openai", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              ...pollinationsPayload,
              model: "openai",
              max_tokens: 2000 // Reduced token limit for fallback
            }),
            signal: AbortSignal.timeout(30000)
          });
          
          console.log(`Fallback response status: ${fallbackResponse.status}`);
          
          if (fallbackResponse.ok) {
            const data = await fallbackResponse.json();
            return new Response(JSON.stringify({
              ...data,
              model: "openai (fallback)",
              original_model: effectiveModel
            }), {
              headers: { "Content-Type": "application/json" }
            });
          } else {
            // If fallback also fails, try qwen-coder as a last resort for code requests
            if (effectiveModel !== "qwen-coder") {
              console.log("Attempting final fallback to qwen-coder for code generation");
              try {
                const qwenFallbackResponse = await fetch("https://text.pollinations.ai/openai", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    ...pollinationsPayload,
                    model: "qwen-coder",
                    max_tokens: 2000 
                  }),
                  signal: AbortSignal.timeout(45000) // Extended timeout for qwen-coder
                });
                
                if (qwenFallbackResponse.ok) {
                  const qwenData = await qwenFallbackResponse.json();
                  return new Response(JSON.stringify({
                    ...qwenData,
                    model: "qwen-coder (fallback)",
                    original_model: effectiveModel
                  }), {
                    headers: { "Content-Type": "application/json" }
                  });
                }
              } catch (qwenError) {
                console.error("Error during qwen-coder fallback:", qwenError);
              }
            }
            
            // If all fallbacks fail, return a simpler response
            console.error("All fallback attempts failed");
            return new Response(JSON.stringify({
              choices: [{
                message: {
                  role: "assistant",
                  content: "I apologize, but I'm having trouble generating code right now. Please try again with a simpler request or try again later when the service has been restored."
                }
              }],
              model: "system"
            }), {
              headers: { "Content-Type": "application/json" }
            });
          }
        }
        
        // Only attempt fallback if not already using OpenAI
        if (effectiveModel !== "openai") {
          console.log(`Attempting fallback to openai model`);
          try {
            const fallbackResponse = await fetch("https://text.pollinations.ai/openai", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                ...pollinationsPayload,
                model: "openai"
              }),
              signal: AbortSignal.timeout(30000) // Increased timeout to 30 seconds for complex requests
            });
            
            if (fallbackResponse.ok) {
              const data = await fallbackResponse.json();
              return new Response(JSON.stringify({
                ...data,
                model: "openai (fallback)",
                original_model: effectiveModel
              }), {
                headers: { "Content-Type": "application/json" }
              });
            } else {
              const fallbackErrorBody = await fallbackResponse.text(); // Attempt to read response body
              console.error(`Fallback to OpenAI also failed with status: ${fallbackResponse.status} (${fallbackResponse.statusText}). Body: ${fallbackErrorBody}`);
              throw new Error(`Both ${effectiveModel} and fallback to OpenAI failed. Original status: ${response.status}, Fallback status: ${fallbackResponse.status}`);
            }
          } catch (fallbackError) {
            console.error("Error during fallback:", fallbackError);
            throw new Error(`Pollinations API error: ${response.status}. Fallback also failed.`);
          }
        } else {
          throw new Error(`Pollinations API error with OpenAI model: ${response.status}`);
        }
      }
      
      const data = await response.json();
      
      // Log the response for debugging
      console.log("Successful response from Pollinations API:", {
        model: effectiveModel,
        hasChoices: Boolean(data.choices),
        choicesLength: data.choices?.length,
        firstChoiceContentLength: data.choices?.[0]?.message?.content?.length || 0
      });
      
      return new Response(JSON.stringify({
        ...data,
        model: effectiveModel
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error calling Pollinations API:", error);
      throw error;
    }
    
  } catch (error) {
    console.error("Error in chat API route processing request:", error);
    // Log the specific error details if available
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    } else {
      console.error("Unknown error details:", error);
    }

    // Determine the specific error type for better user guidance
    let errorMessage = "Failed to process chat request";
    let content = "Sorry, I encountered an error processing your request. This might be because the request was too complex or the service is temporarily unavailable.";
    
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      errorMessage = "Request timeout";
      content = "Sorry, your request took too long to complete. For complex code generation like landing pages:\n\n" +
        "1. Break your request into smaller steps (structure first, then styling, then functionality)\n" +
        "2. Be specific about what framework you want to use (React, Vue, vanilla HTML/CSS)\n" +
        "3. Try again with more specific details about what you want";
    } else if (error.message?.includes('500')) {
      errorMessage = "Internal server error";
      content = "Sorry, the server encountered an internal error. This often happens with complex code generation requests. Try:\n\n" +
        "1. Breaking your request into smaller parts\n" +
        "2. Being more specific about technology requirements\n" +
        "3. Try again in a few moments when the service might be less busy";
    }

    // Return a more graceful fallback response
    return new Response(JSON.stringify({
      error: errorMessage,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      choices: [
        {
          message: {
            role: "assistant",
            content: content,
            model: "system"
          }
        }
      ]
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
