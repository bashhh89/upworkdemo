'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Zap, Code, Target, ArrowRight } from 'lucide-react';

export function AboutSection() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img src="/logo.png" alt="Ahmad Basheer" className="w-16 h-16 rounded-full border-2 border-blue-500/50" />
            <div>
              <h1 className="text-4xl font-bold text-white">About Ahmad Basheer</h1>
              <p className="text-zinc-400">Your AI Translator</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <Card className="bg-zinc-900/80 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-400" />
                The Gap I Live In
              </CardTitle>
            </CardHeader>
            <CardContent className="text-zinc-300 space-y-4">
              <p>
                Most businesses see a massive gap between their day-to-day problems and the promise of Artificial Intelligence. 
                I live in that gap—and build the agents that bridge it.
              </p>
              <p>
                I'm not a developer. I'm your <strong className="text-blue-400">AI Translator</strong>—the force that turns tech buzz into systems that actually work. 
                Ten years in business taught me one thing: scale doesn't come from hype. It comes from clarity, logic, and clean automation.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-zinc-900/80 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  What I Do
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Translator</Badge>
                  <span className="text-sm text-zinc-300">From vague idea to executable automation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Builder</Badge>
                  <span className="text-sm text-zinc-300">From demo bot to full-stack system that scales</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Reality Check</Badge>
                  <span className="text-sm text-zinc-300">If it won't work, I'll tell you. If it will, I'll build it to last</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/80 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  My Approach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-300">
                <p>• I'll challenge your idea until it survives impact</p>
                <p>• I don't build tools I wouldn't use myself</p>
                <p>• If you're optimizing noise, not value—I'll walk</p>
                <p>• I respect your time. I expect the same back.</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-zinc-900/80 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Code className="h-5 w-5 text-green-400" />
                Results That Matter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-2">20hrs → 2hrs</div>
                  <div className="text-sm text-zinc-400">SOW Generator for AI consultancy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-2">24/7</div>
                  <div className="text-sm text-zinc-400">Agent Ops with real scalability</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-2">Zero Fluff</div>
                  <div className="text-sm text-zinc-400">n8n workflows that actually work</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button 
              onClick={() => window.open('https://www.linkedin.com/in/abashh/', '_blank')}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Let's Work Together
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}