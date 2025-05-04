import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define path for reading proposals
const PROPOSALS_FILE = path.join(process.cwd(), 'data', 'proposals.json');

// Using the most compatible form for Next.js route handlers
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    // Check if file exists
    try {
      await fs.access(PROPOSALS_FILE);
    } catch {
      return NextResponse.json({ error: 'Proposals file not found' }, { status: 404 });
    }
    
    // Read the file
    const fileContent = await fs.readFile(PROPOSALS_FILE, 'utf-8');
    let proposals;
    
    try {
      proposals = JSON.parse(fileContent);
    } catch {
      return NextResponse.json({ error: 'Invalid proposals data format' }, { status: 500 });
    }
    
    if (!Array.isArray(proposals)) {
      return NextResponse.json({ error: 'Invalid proposals data structure' }, { status: 500 });
    }
    
    // Find the proposal
    const proposal = proposals.find(p => p.id === id);
    
    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }
    
    // Return the proposal data
    return NextResponse.json(proposal);
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposal', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 