import { NextResponse } from 'next/server';
import { getAllModels } from '@/lib/pollinations-api';

export const runtime = 'edge';

export async function GET() {
  try {
    const models = await getAllModels();
    return NextResponse.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
} 