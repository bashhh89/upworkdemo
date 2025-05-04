import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    // Test models list endpoint
    console.log('Testing models endpoint...');
    const modelsResponse = await fetch('https://text.pollinations.ai/models');
    
    if (!modelsResponse.ok) {
      throw new Error(`Models API request failed with status ${modelsResponse.status}`);
    }
    
    const modelsData = await modelsResponse.json();
    
    // Test a simple chat completion with gemini
    console.log('Testing chat with gemini...');
    const geminiResponse = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Say hello and tell me what 2+2 is' }
        ],
        model: 'gemini'
      })
    });
    
    let geminiResult;
    let geminiSuccess = geminiResponse.ok;
    
    if (geminiSuccess) {
      geminiResult = await geminiResponse.json();
    } else {
      geminiResult = await geminiResponse.text();
    }
    
    // Test a simple chat completion with openai
    console.log('Testing chat with openai...');
    const openaiResponse = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Say hello and tell me what 2+2 is' }
        ],
        model: 'openai'
      })
    });
    
    let openaiResult;
    let openaiSuccess = openaiResponse.ok;
    
    if (openaiSuccess) {
      openaiResult = await openaiResponse.json();
    } else {
      openaiResult = await openaiResponse.text();
    }
    
    // Return all test results
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      models: {
        success: true,
        data: modelsData
      },
      gemini: {
        success: geminiSuccess,
        status: geminiResponse.status,
        result: geminiResult
      },
      openai: {
        success: openaiSuccess,
        status: openaiResponse.status,
        result: openaiResult
      }
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 