/**
 * Pollinations.AI API utilities
 * Based on APIDOCS.md documentation
 */

// Base URLs for different API endpoints
const IMAGE_API_URL = 'https://image.pollinations.ai';
const TEXT_API_URL = 'https://text.pollinations.ai';

// Interface for model responses
export interface ImageModel {
  id: string;
  name?: string;
}

export interface TextModel {
  id: string;
  name?: string;
  capabilities?: string[];
}

export interface AudioVoice {
  id: string;
  name?: string;
}

export interface PollinationsModels {
  imageModels: ImageModel[];
  textModels: TextModel[];
  audioVoices: AudioVoice[];
}

/**
 * Fetches all available Pollinations.AI models
 * @returns All image models, text models, and audio voices
 */
export async function getAllModels(): Promise<PollinationsModels> {
  try {
    // Fetch image models
    const imageModelsResponse = await fetch(`${IMAGE_API_URL}/models`);
    if (!imageModelsResponse.ok) {
      throw new Error(`Failed to fetch image models: ${imageModelsResponse.statusText}`);
    }
    const imageModels = await imageModelsResponse.json();
    
    // Fetch text models (including audio voices)
    const textModelsResponse = await fetch(`${TEXT_API_URL}/models`);
    if (!textModelsResponse.ok) {
      throw new Error(`Failed to fetch text models: ${textModelsResponse.statusText}`);
    }
    const textModelsData = await textModelsResponse.json();
    
    // Process the response based on the structure
    let textModels: TextModel[] = [];
    let audioVoices: AudioVoice[] = [];
    
    // Handle different possible response formats from the API
    if (Array.isArray(textModelsData)) {
      textModels = textModelsData.map(model => ({ id: model }));
    } else if (typeof textModelsData === 'object') {
      // Extract text models
      textModels = Object.keys(textModelsData)
        .filter(key => key !== 'openai-audio') // Filter out audio specific entry
        .map(key => ({ id: key }));
      
      // Extract audio voices
      const voicesData = textModelsData['openai-audio']?.voices;
      if (Array.isArray(voicesData)) {
        audioVoices = voicesData.map(voice => ({ id: voice }));
      }
    }
    
    return {
      imageModels: Array.isArray(imageModels) 
        ? imageModels.map(model => ({ id: model })) 
        : [],
      textModels,
      audioVoices
    };
  } catch (error) {
    console.error('Error fetching Pollinations.AI models:', error);
    return {
      imageModels: [],
      textModels: [],
      audioVoices: []
    };
  }
}

/**
 * Generate an image using Pollinations.AI
 * @param prompt Text description of the image
 * @param options Additional options like model, width, height, etc.
 * @returns URL to the generated image
 */
export async function generateImage(prompt: string, options: {
  model?: string;
  width?: number;
  height?: number;
  seed?: number;
  nologo?: boolean;
  enhance?: boolean;
}) {
  const params = new URLSearchParams();
  if (options.model) params.append('model', options.model);
  if (options.width) params.append('width', options.width.toString());
  if (options.height) params.append('height', options.height.toString());
  if (options.seed) params.append('seed', options.seed.toString());
  if (options.nologo) params.append('nologo', 'true');
  if (options.enhance) params.append('enhance', 'true');
  
  const encodedPrompt = encodeURIComponent(prompt);
  const url = `${IMAGE_API_URL}/prompt/${encodedPrompt}?${params.toString()}`;
  
  return url; // Return the image URL directly
}

/**
 * Generate text using Pollinations.AI
 * @param prompt The prompt text to send to the model
 * @param options Additional options like model, seed, etc.
 * @returns The generated text response
 */
export async function generateText(prompt: string, options: {
  model?: string;
  seed?: number;
  system?: string;
  json?: boolean;
} = {}) {
  try {
    const params = new URLSearchParams();
    if (options.model) params.append('model', options.model);
    if (options.seed) params.append('seed', options.seed.toString());
    if (options.system) params.append('system', encodeURIComponent(options.system));
    if (options.json) params.append('json', 'true');
    
    const encodedPrompt = encodeURIComponent(prompt);
    const response = await fetch(`${TEXT_API_URL}/${encodedPrompt}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to generate text: ${response.statusText}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
}

/**
 * Generate audio using Pollinations.AI
 * @param text Text to convert to speech
 * @param voice Voice to use for speech synthesis
 * @returns URL to the generated audio
 */
export function getAudioUrl(text: string, voice: string = 'alloy') {
  const encodedText = encodeURIComponent(text);
  const params = new URLSearchParams({
    model: 'openai-audio',
    voice
  });
  
  return `${TEXT_API_URL}/${encodedText}?${params.toString()}`;
} 