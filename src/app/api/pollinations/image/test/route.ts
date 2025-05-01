import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    console.log('Test image generation endpoint called');
    
    // Create a test prompt
    const testPrompt = "A simple blue logo with abstract geometric shapes on a white background, minimalist design";
    const model = "turbo";
    const width = 512;
    const height = 512;
    
    // Construct the Pollinations image URL directly
    const encodedPrompt = encodeURIComponent(testPrompt);
    const directImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&noCache=true&model=${model}`;
    
    console.log(`Testing direct URL: ${directImageUrl}`);
    
    // Test our own API endpoint
    const apiResponse = await fetch(new URL('/api/pollinations/image', request.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: testPrompt,
        model,
        width,
        height
      })
    });
    
    let apiResult = null;
    let apiError = null;
    
    try {
      apiResult = await apiResponse.json();
    } catch (e) {
      apiError = `Failed to parse API response: ${e instanceof Error ? e.message : String(e)}`;
    }
    
    // Test direct HEAD request to the Pollinations service
    let directHeadStatus = null;
    let directHeadHeaders = null;
    let directHeadError = null;
    
    try {
      const directHeadResponse = await fetch(directImageUrl, { method: 'HEAD' });
      directHeadStatus = directHeadResponse.status;
      directHeadHeaders = Object.fromEntries(directHeadResponse.headers);
    } catch (e) {
      directHeadError = `Direct HEAD request failed: ${e instanceof Error ? e.message : String(e)}`;
    }
    
    // Test direct GET request (this could be slow as it downloads the actual image)
    let directGetStatus = null;
    let directGetContentType = null;
    let directGetContentLength = null;
    let directGetError = null;
    
    try {
      const directGetResponse = await fetch(directImageUrl, { method: 'GET' });
      directGetStatus = directGetResponse.status;
      directGetContentType = directGetResponse.headers.get('Content-Type');
      directGetContentLength = directGetResponse.headers.get('Content-Length');
    } catch (e) {
      directGetError = `Direct GET request failed: ${e instanceof Error ? e.message : String(e)}`;
    }
    
    // Return diagnostics
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      testPrompt,
      apiEndpointResponse: {
        status: apiResponse.status,
        ok: apiResponse.ok,
        result: apiResult,
        error: apiError
      },
      directHeadRequest: {
        status: directHeadStatus,
        headers: directHeadHeaders,
        error: directHeadError
      },
      directGetRequest: {
        status: directGetStatus,
        contentType: directGetContentType,
        contentLength: directGetContentLength,
        error: directGetError
      },
      pollinations: {
        directImageUrl
      }
    });
  } catch (error) {
    console.error('Error in test image endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 