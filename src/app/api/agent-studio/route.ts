import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { AgentConfiguration, KnowledgeSource } from '@/types/agent';
import { readAgentsFromFile, writeAgentsToFile, chunkText } from '@/lib/agent-store';
import fs from 'fs/promises';
import path from 'path';

/**
 * GET /api/agent-studio
 * Retrieves a list of all agents.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: Request) {
  console.log("GET /api/agent-studio called");
  try {
    const agents = await readAgentsFromFile();
    return NextResponse.json(agents, { status: 200 });
  } catch (error) {
    console.error("Error fetching agents from store:", error);
    return NextResponse.json({ message: 'Error fetching agents from store' }, { status: 500 });
  }
}

/**
 * POST /api/agent-studio
 * Creates a new agent, supporting file uploads via multipart/form-data.
 */
export async function POST(request: Request) {
  console.log("POST /api/agent-studio called");
  try {
    // Parse multipart form data
    const formData = await request.formData();

    // Extract text fields
    const name = formData.get('name') as string;
    const systemPrompt = formData.get('systemPrompt') as string;
    const status = (formData.get('status') as string) || 'Training';
    const userId = 'user_placeholder_new';
    // Settings may be sent as a JSON string
    let settings = {
      createCards: false,
      linkedPipelineId: null,
      initialMessages: [],
      suggestedReplies: [],
      primaryColor: '#6b7280'
    };
    const settingsRaw = formData.get('settings');
    if (settingsRaw) {
      try {
        settings = JSON.parse(settingsRaw as string);
      } catch (e) {
        console.warn('Failed to parse settings JSON, using default.', e);
      }
    }

    // Validate required fields
    if (!name || !systemPrompt) {
      return NextResponse.json({ message: 'Missing required fields: name and systemPrompt' }, { status: 400 });
    }

    // Ensure uploads directory exists
    const uploadsDir = path.resolve('./uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Process knowledge sources (files and others)
    const processedKnowledgeSources: KnowledgeSource[] = [];

    // Handle file uploads (expecting multiple files under 'knowledgeFiles')
    const fileEntries = formData.getAll('knowledgeFiles');
    for (const entry of fileEntries) {
      if (entry instanceof File) {
        const file = entry;
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const uniqueFilename = `${uuidv4()}-${file.name}`;
        const savePath = path.join(uploadsDir, uniqueFilename);
        await fs.writeFile(savePath, fileBuffer);

        // Extract text content for .txt files and chunk it
        let chunks: string[] | undefined = undefined;
        if (file.name.toLowerCase().endsWith('.txt')) {
          try {
            const textContent = await fs.readFile(savePath, 'utf-8');
            chunks = chunkText(textContent, 1000, 100);
          } catch (err) {
            console.error(`Failed to extract text from file ${file.name}:`, err);
          }
        }

        processedKnowledgeSources.push({
          type: 'file',
          name: file.name,
          status: 'ready',
          path: savePath,
          ...(chunks ? { chunks } : {})
        });
      }
    }

    // Handle other knowledge sources (e.g., URLs, text) if sent as JSON
    const otherSourcesRaw = formData.get('otherKnowledgeSources');
    if (otherSourcesRaw) {
      try {
        const otherSources = JSON.parse(otherSourcesRaw as string);
        if (Array.isArray(otherSources)) {
          // Process all sources asynchronously (especially URLs)
          const processedOtherSources = await Promise.all(
            otherSources.map(async (src: any) => {
              if (src && typeof src === 'object' && src.type && src.name) {
                if (src.type === 'url') {
                  // Fetch content from the URL
                  try {
                    const response = await fetch(src.name, { method: 'GET' });
                    if (!response.ok) {
                      console.error(`Failed to fetch URL: ${src.name} (status: ${response.status})`);
                      return { ...src, status: 'error' };
                    }
                    const contentType = response.headers.get('content-type') || '';
                    if (contentType.includes('text/html')) {
                      // Extract text from HTML using a simple regex (basic, not robust)
                      const html = await response.text();
                      const text = html.replace(/<[^>]*>/g, ''); // Basic HTML tag stripping
                      const chunks = chunkText(text, 1000, 100);
                      return { ...src, chunks, status: 'ready' };
                    } else if (contentType.includes('text/plain')) {
                      const text = await response.text();
                      const chunks = chunkText(text, 1000, 100);
                      return { ...src, chunks, status: 'ready' };
                    } else {
                      console.warn(`Unsupported content-type for URL: ${src.name} (${contentType})`);
                      return { ...src, status: 'error' };
                    }
                  } catch (err) {
                    console.error(`Error fetching URL: ${src.name}`, err);
                    return { ...src, status: 'error' };
                  }
                } else if (src.type === 'text') {
                  // Chunk text sources if content exists
                  if (src.content) {
                    const chunks = chunkText(src.content, 1000, 100);
                    return { ...src, chunks };
                  }
                  return src;
                } else {
                  // Unknown type, preserve as-is
                  return src;
                }
              }
              // If src is not valid, skip
              return null;
            })
          );
          // Filter out any nulls
          processedKnowledgeSources.push(...processedOtherSources.filter(Boolean));
        }
      } catch (e) {
        console.warn('Failed to parse otherKnowledgeSources JSON.', e);
      }
    }

    // Build new agent object
    const newAgent: AgentConfiguration = {
      id: `agent_${uuidv4().slice(0, 8)}`,
      userId,
      name,
      systemPrompt,
      knowledgeSources: processedKnowledgeSources,
      settings,
      status: status as 'Training' | 'Active' | 'Inactive',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to agents.json
    const currentAgents = await readAgentsFromFile();
    currentAgents.push(newAgent);
    await writeAgentsToFile(currentAgents);

    return NextResponse.json(newAgent, { status: 201 });
  } catch (error) {
    console.error("Error creating agent (form/file):", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON format' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error creating agent' }, { status: 500 });
  }
} 