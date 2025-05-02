"use client";

import { useState, useEffect } from 'react';
import { PollinationsModels as PollinationsModelsType } from '@/lib/pollinations-api';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PollinationsModels() {
  const [models, setModels] = useState<PollinationsModelsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Handle client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchModels() {
      try {
        setLoading(true);
        const response = await fetch('/api/pollinations/models');
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.statusText}`);
        }
        const data = await response.json();
        setModels(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (mounted) {
      fetchModels();
    }
  }, [mounted]);

  // Show loading state before client-side hydration
  if (!mounted) {
    return <div className="p-4 text-center">Loading models...</div>;
  }

  if (loading) {
    return <div className="p-4 text-center">Loading Pollinations.AI models...</div>;
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-700">
        <h3 className="font-semibold">Error loading models</h3>
        <p>{error}</p>
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!models) {
    return <div className="p-4 text-center">No models available</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Pollinations.AI Models</h2>
      
      <Tabs defaultValue="image">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="image">
            Image Models ({models.imageModels.length})
          </TabsTrigger>
          <TabsTrigger value="text">
            Text Models ({models.textModels.length})
          </TabsTrigger>
          <TabsTrigger value="audio">
            Audio Voices ({models.audioVoices.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="image" className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Available Image Models</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {models.imageModels.map((model) => (
              <div 
                key={model.id}
                className="p-3 border rounded-md hover:bg-slate-50"
              >
                <span className="font-mono text-sm">{model.id}</span>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="text" className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Available Text Models</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {models.textModels.map((model) => (
              <div 
                key={model.id}
                className="p-3 border rounded-md hover:bg-slate-50"
              >
                <span className="font-mono text-sm">{model.id}</span>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="audio" className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Available Audio Voices</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {models.audioVoices.map((voice) => (
              <div 
                key={voice.id}
                className="p-3 border rounded-md hover:bg-slate-50"
              >
                <span className="font-mono text-sm">{voice.id}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>* Data fetched from Pollinations.AI API</p>
      </div>
    </div>
  );
} 