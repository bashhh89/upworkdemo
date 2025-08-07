import { NextResponse } from 'next/server';
import { getAllModels } from '@/lib/pollinations-api';

export const runtime = 'edge';

export async function GET() {
  try {
    // Use the getAllModels function from the pollinations-api library
    const models = await getAllModels();
    
    return NextResponse.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch models',
        imageModels: [],
        textModels: [],
        audioVoices: []
      },
      { status: 500 }
    );
  }
} 