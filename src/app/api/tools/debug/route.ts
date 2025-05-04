import { NextResponse } from 'next/server';
import { availableTools } from '@/lib/tool-utils';

export async function GET() {
  try {
    // Return a list of all available tools and their details
    return NextResponse.json({
      success: true,
      tools: availableTools,
      message: 'Tools debug endpoint operational'
    });
  } catch (error) {
    console.error('Error in tools debug API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve tools information',
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 