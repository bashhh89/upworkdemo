import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('Image generation API request received');
    const requestData = await request.json();
    console.log('Image generation request data:', JSON.stringify(requestData, null, 2));
    
    const { prompt, model = 'turbo', width = 512, height = 512 } = requestData;

    if (!prompt) {
      console.error('Missing prompt in image generation request');
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Validate model - only allow turbo or flux
    const validModels = ['turbo', 'flux'];
    if (!validModels.includes(model)) {
      console.error(`Invalid model: ${model}. Valid models are: ${validModels.join(', ')}`);
      return NextResponse.json(
        { error: 'Invalid model. Use "turbo" or "flux"' },
        { status: 400 }
      );
    }

    // Construct the Pollinations image URL
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&noCache=true&model=${model}`;
    
    console.log(`Generated Pollinations image URL: ${imageUrl}`);
    
    // For better reliability, let's check if the URL is accessible
    try {
      const testResponse = await fetch(imageUrl, { method: 'HEAD' });
      if (!testResponse.ok) {
        console.error(`Image URL test failed with status: ${testResponse.status}`);
      } else {
        console.log('Image URL is accessible');
      }
    } catch (testError) {
      console.warn(`Warning: Image URL test failed: ${testError instanceof Error ? testError.message : String(testError)}`);
      // Continue anyway as this is just a validation check
    }

    const responseData = {
      success: true,
      imageUrl,
      prompt,
      model,
      width,
      height,
      timestamp: new Date().toISOString()
    };
    
    console.log('Returning image generation response:', JSON.stringify(responseData, null, 2));
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in Pollinations image API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate image', 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 