'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain, 
  Lightbulb, 
  CheckCircle, 
  Eye, 
  Zap,
  MessageSquare,
  Clock,
  Target,
  TrendingUp,
  Activity,
  History,
  Settings,
  ChevronRight,
  Play,
  Loader2
} from 'lucide-react';

interface ReasoningStep {
  id: string;
  step: string;
  reasoning: string;
  conclusion: string;
  confidence: number;
  status: 'pending' | 'in-progress' | 'completed';
  timestamp?: Date;
}

interface ReasoningPanelProps {
  steps: ReasoningStep[];
  activeStepId?: string;
  onStepSelect?: (stepId: string) => void;
  isLiveMode?: boolean;
}

export default function ReasoningPanel({ 
  steps, 
  activeStepId, 
  onStepSelect, 
  isLiveMode = false 
}: ReasoningPanelProps) {
  const [expandedStepId, setExpandedStepId] = useState<string | null>(activeStepId || null);

  const handleStepClick = (stepId: string) => {
    setExpandedStepId(expandedStepId === stepId ? null : stepId);
    if (onStepSelect) {
      onStepSelect(stepId);
    }
  };

  const getStatusIcon = (status: ReasoningStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-white" />;
      case 'in-progress':
        return <Loader2 className="h-4 w-4 text-white animate-spin" />;
      case 'pending':
        return <div className="w-2 h-2 bg-zinc-600 rounded-full"></div>;
      default:
        return null;
    }
  };

  const getStatusBorder = (status: ReasoningStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-white/10';
      case 'in-progress':
        return 'border-white/30';
      case 'pending':
        return 'border-zinc-700/50';
      default:
        return 'border-zinc-700/50';
    }
  };

  const getStatusBg = (status: ReasoningStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-white/5';
      case 'in-progress':
        return 'bg-white/10';
      case 'pending':
        return 'bg-transparent';
      default:
        return 'bg-transparent';
    }
  };

  const formatReasoningText = (text: string) => {
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      const trimmed = paragraph.trim();
      
      if (trimmed.match(/^[-*•]\s/)) {
        return (
          <div key={index} className="flex items-start gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-white/30 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-zinc-300 leading-relaxed">{trimmed.replace(/^[-*•]\s/, '')}</p>
          </div>
        );
      }
      
      if (trimmed.match(/^\d+\.\s/)) {
        const number = trimmed.match(/^(\d+)\.\s/)?.[1];
        const content = trimmed.replace(/^\d+\.\s/, '');
        return (
          <div key={index} className="flex items-start gap-3 mb-2">
            <div className="w-5 h-5 bg-white/10 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              {number}
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{content}</p>
          </div>
        );
      }
      
      if (trimmed.includes(':') && trimmed.length < 100) {
        const [title, ...rest] = trimmed.split(':');
        return (
          <div key={index} className="mb-3">
            <h4 className="text-sm font-semibold text-white/70 mb-1">{title.trim()}:</h4>
            {rest.length > 0 && (
              <p className="text-sm text-zinc-300 leading-relaxed pl-2">{rest.join(':').trim()}</p>
            )}
          </div>
        );
      }
      
      return (
        <p key={index} className="text-sm text-zinc-300 leading-relaxed mb-3">
          {trimmed}
        </p>
      );
    });
  };

  const formatConclusion = (text: string) => {
    if (text.length > 150) {
      return text.substring(0, 150) + '...';
    }
    return text;
  };

  const isStepActive = (stepId: string) => {
    if (isLiveMode) {
      return stepId === activeStepId;
    }
    return expandedStepId === stepId;
  };

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const progressPercentage = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  return (
    <div className="w-96 bg-black border-r border-zinc-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Reasoning</h2>
            <p className="text-xs text-zinc-400">
              {isLiveMode ? 'Processing...' : 'Analysis steps'}
            </p>
          </div>
          {isLiveMode && (
            <div className="ml-auto flex items-center gap-1">
              <Loader2 className="h-3 w-3 text-white animate-spin" />
              <span className="text-xs text-white/70">Active</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Progress</span>
            <span>{completedSteps}/{steps.length} steps</span>
          </div>
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {steps.map((step, index) => (
            <div key={step.id}>
              {/* Progress Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-12 w-px h-16 bg-zinc-800"></div>
              )}
              
              <div 
                className={`relative flex gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${getStatusBorder(step.status)} ${getStatusBg(step.status)} ${isStepActive(step.id) ? 'ring-1 ring-white/20' : 'hover:bg-white/5'}`}
                onClick={() => handleStepClick(step.id)}
              >
                {/* Status Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(step.status)}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {step.step}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-xs text-zinc-500">
                        {Math.round(step.confidence * 100)}%
                      </span>
                      <ChevronRight className={`h-3 w-3 text-zinc-400 transition-transform ${isStepActive(step.id) ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                  
                  <p className="text-xs text-zinc-400 line-clamp-2 mb-2">
                    {formatConclusion(step.conclusion)}
                  </p>

                  {step.timestamp && (
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <Clock className="h-3 w-3" />
                      {step.timestamp.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isStepActive(step.id) && (
                <div className="mt-3 ml-9 p-4 bg-white/5 rounded-lg border border-zinc-800">
                  {/* Reasoning Content */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-3 w-3 text-white/50" />
                      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Thinking Process
                      </span>
                    </div>
                    <div className="space-y-2">
                      {formatReasoningText(step.reasoning)}
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <span className="text-xs text-zinc-500">Confidence Level</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white transition-all duration-500"
                          style={{ width: `${step.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-white">
                        {Math.round(step.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800 bg-black">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Powered by GLM-4.5</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>{completedSteps}/{steps.length} steps</span>
          </div>
        </div>
      </div>
    </div>
  );
}
