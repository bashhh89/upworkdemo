'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentConfiguration } from '@/types/agent';
import { PlusCircle, AlertTriangle } from 'lucide-react';

export default function AgentStudioListPage() {
  const [agents, setAgents] = useState<AgentConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching agents from /api/agent-studio");
        const response = await fetch('/api/agent-studio');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
          console.error("API Error fetching agents:", response.status, errorData);
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data: AgentConfiguration[] = await response.json();
        console.log("Fetched agents:", data);
        setAgents(data);
      } catch (err) {
        console.error("Failed to fetch agents:", err);
        const message = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(`Failed to load agents: ${message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, []); // Empty dependency array to run only on mount

  return (
    <div className="container mx-auto py-8 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">AI Agent Studio</h1>
        <Link href="/agent-studio/create" passHref>
          <Button className="bg-white text-black hover:bg-gray-200 rounded-none">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Agent
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="text-center py-10">
          <div className="animate-pulse">Loading agents...</div>
          {/* Optional: Add a spinner here */}
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded relative text-center" role="alert">
          <AlertTriangle className="inline-block mr-2 h-5 w-5"/>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!isLoading && !error && agents.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <p>No agents created yet.</p>
          <p>Get started by creating one!</p>
        </div>
      )}

      {!isLoading && !error && agents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Link key={agent.id} href={`/agent-studio/${agent.id}`} passHref>
              <Card className="bg-[#111111] border-[#333333] hover:border-blue-500 transition-colors cursor-pointer h-full flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white text-xl mb-1">{agent.name}</CardTitle>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${ 
                        agent.status === 'Active' ? 'border-green-500 text-green-400' : 
                        agent.status === 'Training' ? 'border-yellow-500 text-yellow-400' : 'border-gray-500 text-gray-400'
                      }`}
                    >
                      {agent.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-400 text-sm line-clamp-2">
                    {/* Display a snippet of the prompt or a default description */}
                    {agent.systemPrompt ? `${agent.systemPrompt.substring(0, 80)}...` : 'No description available.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-end">
                  <div className="text-xs text-gray-500">
                    <span>Knowledge Sources: {agent.knowledgeSources?.length || 0}</span>
                    <span className="mx-2">|</span>
                    <span>Updated: {new Date(agent.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 