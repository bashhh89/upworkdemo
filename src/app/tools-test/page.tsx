"use client";

import React, { useState, useEffect } from 'react';
import { availableTools } from '@/lib/tool-utils';
import { ToolDefinition, ToolResult } from '@/types/tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Users, Target, Send } from 'lucide-react';
import ExecutivePersonaForm from '@/components/ExecutivePersonaForm';
import WebsiteScannerForm from '@/components/WebsiteScannerForm';
import ToolResultSummary from '@/components/ToolResultSummary';

export default function ToolsTestPage() {
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [toolResult, setToolResult] = useState<ToolResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleToolSelect = (toolName: string) => {
    const tool = availableTools.find(t => t.name === toolName);
    if (tool) {
      setSelectedTool(tool);
      setParameters({});
      setToolResult(null);
      setError(null);
    }
  };

  const handleParameterChange = (name: string, value: string) => {
    setParameters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedTool) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(selectedTool.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parameters),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      setToolResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderToolForm = () => {
    if (!selectedTool) return null;

    switch (selectedTool.name) {
      case 'Executive Persona':
        return (
          <ExecutivePersonaForm
            initialParameters={parameters}
            onSubmit={(params) => {
              setParameters(params);
              handleSubmit(new Event('submit') as any);
            }}
            onCancel={() => setSelectedTool(null)}
          />
        );
      case 'Website Intelligence Scanner':
        return (
          <WebsiteScannerForm
            initialParameters={parameters}
            onSubmit={(params) => {
              setParameters(params);
              handleSubmit(new Event('submit') as any);
            }}
            onCancel={() => setSelectedTool(null)}
          />
        );
      default:
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>{selectedTool.name}</CardTitle>
              <CardDescription>{selectedTool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {selectedTool.requiredParameters.map((param) => (
                  <div key={param.name} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      {param.label} {param.required && <span className="text-red-500">*</span>}
                    </label>
                    {param.type === 'select' ? (
                      <Select
                        value={parameters[param.name] || ''}
                        onValueChange={(value) => handleParameterChange(param.name, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${param.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {param.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={param.type}
                        placeholder={param.placeholder}
                        value={parameters[param.name] || ''}
                        onChange={(e) => handleParameterChange(param.name, e.target.value)}
                        required={param.required}
                      />
                    )}
                  </div>
                ))}
              </form>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSelectedTool(null)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? 'Processing...' : 'Run Tool'}
              </Button>
            </CardFooter>
          </Card>
        );
    }
  };

  // Tool icon mapping
  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'Website Intelligence Scanner':
        return <Globe className="h-5 w-5" />;
      case 'Executive Persona':
        return <Users className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Tools Testing Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {availableTools.map((tool) => (
          <Card 
            key={tool.name} 
            className="cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => handleToolSelect(tool.name)}
          >
            <CardHeader className="flex flex-row items-center gap-2">
              {getToolIcon(tool.name)}
              <div>
                <CardTitle className="text-lg">{tool.name}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </div>
            </CardHeader>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToolSelect(tool.name);
                }}
              >
                Select Tool
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {selectedTool && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{selectedTool.name}</h2>
          {renderToolForm()}
        </div>
      )}
      
      {error && (
        <div className="mb-8 p-4 bg-red-800/20 border border-red-800 rounded-md text-red-400">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      {toolResult && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Tool Results</h2>
          <ToolResultSummary result={toolResult} />
          
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-2">Raw Response</h3>
            <pre className="bg-gray-800 p-4 rounded-md overflow-x-auto">
              {JSON.stringify(toolResult, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
