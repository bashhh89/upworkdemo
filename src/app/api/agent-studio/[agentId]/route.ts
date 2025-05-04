import { NextResponse } from 'next/server';
import { AgentConfiguration } from '@/types/agent';
import { readAgentsFromFile, writeAgentsToFile } from '@/lib/agent-store';

interface RouteParams {
  params: {
    agentId: string;
  };
}

/**
 * GET /api/agent-studio/[agentId]
 * Retrieves details for a specific agent.
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { agentId } = params;
  console.log(`GET /api/agent-studio/[agentId] called for ID: ${agentId}`);

  try {
    const allAgents = await readAgentsFromFile();
    const agent = allAgents.find(a => a.id === agentId);

    if (!agent) {
      console.log(`Agent with ID ${agentId} not found.`);
      return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json(agent, { status: 200 });
  } catch (error) {
    console.error(`Error fetching agent ${agentId}:`, error);
    return NextResponse.json({ message: 'Error fetching agent' }, { status: 500 });
  }
}

/**
 * PUT /api/agent-studio/[agentId]
 * Updates details for a specific agent.
 */
export async function PUT(request: Request, { params }: RouteParams) {
  const { agentId } = params;
  console.log(`PUT /api/agent-studio/[agentId] called for ID: ${agentId}`);

  try {
    const body = await request.json();
    console.log(`PUT /api/agent-studio/[agentId] called with data:`, body);

    const currentAgents = await readAgentsFromFile();
    const agentIndex = currentAgents.findIndex(a => a.id === agentId);

    if (agentIndex === -1) {
      console.log(`Agent with ID ${agentId} not found for update.`);
      return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
    }

    const originalAgent = currentAgents[agentIndex];
    const updatedAgent: AgentConfiguration = {
      ...originalAgent,
      name: body.name ?? originalAgent.name,
      systemPrompt: body.systemPrompt ?? originalAgent.systemPrompt,
      knowledgeSources: body.knowledgeSources ?? originalAgent.knowledgeSources,
      settings: { ...originalAgent.settings, ...(body.settings ?? {}) },
      status: body.status ?? originalAgent.status,
      updatedAt: new Date().toISOString()
    };

    currentAgents[agentIndex] = updatedAgent;
    await writeAgentsToFile(currentAgents);

    return NextResponse.json(updatedAgent, { status: 200 });
  } catch (error) {
    console.error(`Error updating agent ${agentId}:`, error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON format' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error updating agent' }, { status: 500 });
  }
}

/**
 * DELETE /api/agent-studio/[agentId]
 * Deletes a specific agent.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  const { agentId } = params;
  console.log(`DELETE /api/agent-studio/[agentId] called for ID: ${agentId}`);

  try {
    const currentAgents = await readAgentsFromFile();
    const initialLength = currentAgents.length;
    const filteredAgents = currentAgents.filter(a => a.id !== agentId);

    if (filteredAgents.length === initialLength) {
      console.log(`Agent with ID ${agentId} not found for deletion.`);
      return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
    }

    await writeAgentsToFile(filteredAgents);
    console.log(`Agent ${agentId} deleted successfully.`);
    return NextResponse.json({ message: 'Agent deleted successfully' }, { status: 200 });
    // Or: return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting agent ${agentId}:`, error);
    return NextResponse.json({ message: 'Error deleting agent' }, { status: 500 });
  }
} 