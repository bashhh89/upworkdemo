import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    // Make direct request to test which model we get
    const response = await fetch('https://text.pollinations.ai/which%20llm%20and%20company%20are%20u?model=gemini');
    
    if (!response.ok) {
      throw new Error(`Failed to identify model: ${response.status}`);
    }
    
    const textResponse = await response.text();
    
    return NextResponse.json({
      rawResponse: textResponse,
      status: 'success',
      modelTested: 'gemini',
      endpoint: 'https://text.pollinations.ai/'
    });
  } catch (error) {
    console.error('Error testing model identity:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error'
      },
      { status: 500 }
    );
  }
} 