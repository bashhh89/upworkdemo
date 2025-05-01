import { NextResponse } from 'next/server';

// Use the simpler direct TTS endpoint with verbatim text rendering
const POLLINATIONS_TTS_URL = 'https://text.pollinations.ai/openai-tts';

export async function POST(request: Request) {
  try {
    // Get the request body
    const requestData = await request.json();
    console.log('Audio request received:', JSON.stringify(requestData, null, 2));
    
    // The text to convert to speech
    const text = requestData.text || '';
    const voice = requestData.voice || 'nova';
    
    if (!text) {
      throw new Error('No text provided for speech synthesis');
    }
    
    // Construct a proper payload for Azure OpenAI's audio endpoint
    const ttsPayload = {
      model: "tts-1", // Use the TTS model
      input: text,
      voice: voice,
      response_format: "mp3", // Request mp3 format
      output_modality: "audio" // Explicitly request audio output
    };
    
    console.log("Sending TTS request with payload:", JSON.stringify(ttsPayload, null, 2));
    
    // Use POST request with the proper payload
    const response = await fetch(POLLINATIONS_TTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ttsPayload),
    });
    
    // Log response status for debugging
    console.log(`Pollinations TTS API response status: ${response.status}`);
    
    if (!response.ok) {
      // For error responses, try to get text details
      const errorText = await response.text();
      throw new Error(`Pollinations TTS API error: ${response.status}, details: ${errorText.substring(0, 200)}...`);
    }
    
    // Check content type to make sure we got audio
    const contentType = response.headers.get('Content-Type');
    console.log(`Response content type: ${contentType}`);
    if (!contentType || !contentType.includes('audio/')) {
      const responseText = await response.text();
      console.error("Received non-audio response:", responseText.substring(0, 500));
      throw new Error(`Unexpected content type: ${contentType || 'unknown'}`);
    }
    
    // Get the audio data as an ArrayBuffer
    const audioArrayBuffer = await response.arrayBuffer();
    
    // Return the audio data with proper headers
    return new NextResponse(audioArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
    
  } catch (error) {
    console.error('Error in Pollinations TTS API route handler:', error);
    
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