'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Define Agent interface
interface Agent {
  id: string;
  name: string;
  status: 'Active' | 'Training' | 'Inactive';
  interactions: number;
  linkedPipeline?: string;
  linkedPipelineId?: string;
  createdAt: Date;
}

// Mock data for initial agents
const initialAgents: Agent[] = [
  {
    id: '1',
    name: 'Customer Support Agent',
    status: 'Active',
    interactions: 153,
    linkedPipeline: 'Customer Support Pipeline',
    createdAt: new Date('2023-10-12')
  },
  {
    id: '2',
    name: 'Lead Qualification Bot',
    status: 'Active',
    interactions: 89,
    linkedPipeline: 'Sales Leads Pipeline',
    createdAt: new Date('2023-11-05')
  },
  {
    id: '3',
    name: 'FAQ Assistant',
    status: 'Inactive',
    interactions: 42,
    createdAt: new Date('2023-09-18')
  },
  {
    id: '4',
    name: 'Product Recommendation Agent',
    status: 'Training',
    interactions: 0,
    linkedPipeline: 'Product Sales Pipeline',
    createdAt: new Date('2023-12-01')
  }
];

export default function AgentStudioPage() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [searchQuery, setSearchQuery] = useState('');

  // Load agents from localStorage on component mount
  useEffect(() => {
    try {
      // Get agents from localStorage if any exist
      const storedAgents = localStorage.getItem('mockAgents');
      if (storedAgents) {
        const parsedAgents = JSON.parse(storedAgents);
        // Convert string dates back to Date objects
        const processedAgents = parsedAgents.map((agent: any) => ({
          ...agent,
          createdAt: new Date(agent.createdAt)
        }));
        // Combine with initial agents (in a real app, you'd just use the API data)
        setAgents([...initialAgents, ...processedAgents]);
      }
    } catch (e) {
      console.error("Error loading agents from localStorage", e);
    }
  }, []);

  // Filter agents based on search query
  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get status color based on agent status
  const getStatusColor = (status: Agent['status']) => {
    switch(status) {
      case 'Active': return 'bg-green-500';
      case 'Training': return 'bg-yellow-500';
      case 'Inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto py-8 text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">AI Agent Studio</h1>
          <p className="text-gray-400 mt-2">Create, manage, and deploy specialized AI agents</p>
        </div>
        <Link href="/agent-studio/create">
          <Button className="bg-white text-black hover:bg-gray-200 rounded-none">
            Create New Agent
          </Button>
        </Link>
      </div>
      {/* Search and filter bar */}
      <div className="mb-8 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          className="bg-[#111111] border-[#333333] pl-10 text-white rounded-none"
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {/* Agents grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map(agent => (
          <Link href={`/agent-studio/${agent.id}`} key={agent.id}>
            <Card className="bg-[#111111] border-[#333333] hover:border-white transition-colors p-6 cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{agent.name}</h2>
                <div className={`${getStatusColor(agent.status)} px-2 py-1 rounded-full text-xs font-medium`}>
                  {agent.status}
                </div>
              </div>
              <div className="space-y-3 text-gray-400">
                <div className="flex justify-between">
                  <span>Interactions today:</span>
                  <span className="text-white font-medium">{agent.interactions}</span>
                </div>
                {(agent.linkedPipeline || agent.linkedPipelineId) && (
                  <div className="flex justify-between">
                    <span>Linked pipeline:</span>
                    <span className="text-white font-medium">{agent.linkedPipeline || agent.linkedPipelineId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span className="text-white font-medium">{agent.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      {/* Empty state */}
      {filteredAgents.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium mb-2">No agents found</h3>
          <p className="text-gray-400 mb-6">Create your first agent to get started</p>
          <Link href="/agent-studio/create">
            <Button className="bg-white text-black hover:bg-gray-200 rounded-none">
              Create New Agent
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
} 