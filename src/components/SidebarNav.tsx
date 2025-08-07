'use client';

import { cn } from '@/lib/utils';
import { ChevronRight, KanbanSquare, ClipboardList, BrainCircuit, Calculator, BookOpen, Image, Mic, MessageSquare, MessageSquareWarning, Globe, Palette, Home, Layers, User, Users, MessagesSquare, Sparkles, Menu, ChevronLeft, Plus, Trash2, CheckIcon, ArchiveIcon, LayoutDashboard, Target, TrendingUp, BarChart3, PieChart, Building2, Brain } from 'lucide-react'; // Added Plus, Trash2, and LayoutDashboard
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select components
import { Button } from "@/components/ui/button"; // Import Button component
import { PollinationsModels, TextModel } from '@/lib/pollinations-api'; // Import Pollinations types
import React from 'react';

interface NavItem {
  name: string;
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: NavItem[];
  externalLink?: string;
  status?: 'fully' | 'partial' | 'planned';
}

interface NavGroup {
  name: string;
  items: NavItem[];
}

interface SidebarNavProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

// FIRE navigation that actually makes sense
const navGroups: NavGroup[] = [

  {
    name: 'Start Here',
    items: [
      {
        name: 'AI Chat Assistant',
        id: 'pollinations-assistant',
        icon: MessageSquare,
        status: 'fully'
      },
      {
        name: 'Brand Foundation',
        id: 'brand_foundation',
        icon: Palette,
        status: 'fully'
      }
    ]
  },
  {
    name: 'AI Solutions Showcase',
    items: [
      {
        name: 'Smart Image Generator',
        id: 'image_generator',
        icon: Image,
        status: 'fully'
      },
      {
        name: 'Website Intelligence',
        id: 'website_scanner',
        icon: Globe,
        status: 'fully'
      },
      {
        name: 'Executive Profiler',
        id: 'executive_persona',
        icon: User,
        status: 'fully'
      },
      {
        name: 'Voice Synthesis',
        id: 'voiceover_generator',
        icon: Mic,
        status: 'fully'
      }
    ]
  },
  {
    name: 'Decisions',
    items: [
      {
        name: 'ICP Builder',
        id: 'icp_builder',
        icon: Target,
        status: 'fully'
      }
    ]
  },
  {
    name: 'Business Intelligence',
    items: [
      {
        name: 'AI Readiness Score',
        id: 'scorecard',
        icon: BrainCircuit,
        status: 'fully'
      },
      {
        name: 'Customer Profiler',
        id: 'ideal_customer_profile',
        icon: Users,
        status: 'fully'
      },
      {
        name: 'Marketing Critic',
        id: 'critique',
        icon: MessageSquareWarning,
        status: 'fully'
      },
      {
        name: 'Brand Foundation',
        id: 'brand_foundation',
        icon: Palette,
        status: 'fully'
      }
    ]
  },
  {
    name: 'Advanced Tools',
    items: [
      {
        name: 'Agent Studio',
        id: 'agent-studio',
        icon: Sparkles,
        status: 'fully'
      },
      {
        name: 'Website Chat',
        id: 'talk_to_website',
        icon: MessagesSquare,
        status: 'fully'
      },
      {
        name: 'Objection Trainer',
        id: 'objection_handler',
        icon: MessageSquareWarning,
        status: 'fully'
      }
    ]
  }
];

export default function SidebarNav({ activeSection, onSectionChange, isExpanded, onToggleExpand }: SidebarNavProps) {
  // State for models
  const [textModels, setTextModels] = useState<TextModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("openai");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Replace the useAssistantRuntime and useThreadList implementation
  const [runtimeAvailable, setRuntimeAvailable] = useState(false);
  // Mock runtime and threadStore with empty objects that have required methods
  const runtime = {
    updateConfig: (config: any) => console.log('Mock: updateConfig called with', config),
    setConfig: (config: any) => console.log('Mock: setConfig called with', config)
  };

  const threadStore = {
    threads: [],
    currentThreadId: null,
    setCurrentThread: (threadId: string) => console.log('Mock: setCurrentThread called with', threadId),
    createThread: () => {
      console.log('Mock: createThread called');
      return { id: 'mock-thread-' + Date.now() };
    },
    archiveThread: (threadId: string) => console.log('Mock: archiveThread called with', threadId)
  };

  // Set mounted state after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch available text models
  useEffect(() => {
    async function fetchModels() {
      try {
        setLoading(true);
        const response = await fetch('/api/pollinations/models');
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.statusText}`);
        }
        const data: PollinationsModels = await response.json();
        setTextModels(data.textModels);
      } catch (err) {
        console.error('Error loading text models:', err);
      } finally {
        setLoading(false);
      }
    }

    if (mounted) {
      fetchModels();
    }
  }, [mounted]);

  // Handle model selection change
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    // Update model in runtime config if available
    if (runtime && runtimeAvailable) {
      try {
        // Some versions use updateConfig, some use setConfig
        if (typeof runtime.updateConfig === 'function') {
          runtime.updateConfig({
            body: {
              model: value.startsWith("pollinations")
                ? value
                : value === "openai"
                  ? "gpt-4o"
                  : value
            }
          });
        } else if (typeof runtime.setConfig === 'function') {
          runtime.setConfig({
            body: {
              model: value.startsWith("pollinations")
                ? value
                : value === "openai"
                  ? "gpt-4o"
                  : value
            }
          });
        }
      } catch (e) {
        console.error("Error updating runtime config:", e);
      }
    }
  };

  // Create new thread
  const handleNewThread = () => {
    if (threadStore && runtimeAvailable) {
      threadStore.createThread();
      // Navigate to chat page if we're not already there
      onSectionChange('pollinations-assistant');
    } else {
      // Fallback to navigation only
      onSectionChange('pollinations-assistant');
    }
  };

  // Select a thread
  const handleSelectThread = (threadId: string) => {
    if (threadStore && runtimeAvailable) {
      threadStore.setCurrentThread(threadId);
      // If we're on a different page, navigate to the chat page
      if (activeSection !== 'pollinations-assistant') {
        onSectionChange('pollinations-assistant');
      }
    }
  };

  // Archive (delete) a thread
  const handleArchiveThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (threadStore && runtimeAvailable) {
      threadStore.archiveThread(threadId);
    }
  };

  const renderNavItem = (item: NavItem) => {
    const isActive = activeSection === item.id;
    const Icon = item.icon;

    // Adjusted classes for items within accordions
    const buttonClasses = cn(
      "w-full flex items-center text-sm transition-colors duration-150 px-3 py-2",
      isExpanded ? "justify-start" : "justify-center",
      isActive
        ? "text-white font-medium bg-[#0a0a0a]" // Active item style
        : "text-gray-300 hover:bg-[#111] hover:text-white" // Default item style
    );

    const contentClasses = cn("flex items-center flex-1", { "justify-center": !isExpanded });

    const getStatusColor = (status?: string) => {
      switch (status) {
        case 'fully': return 'bg-green-500';
        case 'partial': return 'bg-yellow-500';
        case 'planned': return 'bg-gray-500';
        default: return 'bg-green-500';
      }
    };

    const itemContent = (
       <div className={contentClasses}>
         <Icon className={cn("flex-shrink-0 h-4 w-4", isExpanded ? "mr-3" : "mr-0")} />
         {isExpanded && (
           <>
             <span className="flex-1 text-left truncate text-white">{item.name}</span>
             {item.status && (
               <div className={cn("h-2 w-2 rounded-full ml-2", getStatusColor(item.status))}></div>
             )}
           </>
         )}
       </div>
    );

    if (item.externalLink) {
      return (
        <div key={item.id}> {/* Removed conditional margin */}
          <Link href={item.externalLink} className={buttonClasses}>
            {itemContent}
          </Link>
        </div>
      );
    }

    return (
      <div key={item.id}> {/* Removed conditional margin */}
        <button onClick={() => onSectionChange(item.id)} className={buttonClasses}>
          {itemContent}
        </button>
      </div>
    );
  };

  // Render thread item
  const renderThreadItem = (thread: any) => {
    if (!isExpanded) return null; // Only render threads when sidebar is expanded

    const isActive = threadStore?.currentThreadId === thread.id;
    const threadTitle = thread.title || 'New Thread';
    const threadDate = new Date(thread.createdAt).toLocaleDateString();
    const messageCount = thread.messages?.length || 0;

    return (
      <div
        key={thread.id || `thread-${messageCount}`}
        className={cn(
          "px-3 py-2 cursor-pointer hover:bg-[#111] flex justify-between items-center",
          isActive && "bg-[#111] border-l-2 border-white"
        )}
        onClick={() => handleSelectThread(thread.id)}
      >
        <div className="truncate flex-1">
          <div className="font-medium truncate text-sm text-white">{threadTitle}</div>
          <div className="text-xs text-gray-400 flex items-center">
            <span className="mr-2">{threadDate}</span>
            <span className="text-xs text-gray-500">{messageCount} messages</span>
          </div>
        </div>
        <button
          onClick={(e) => handleArchiveThread(thread.id, e)}
          className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-[#222]"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  };

  // For server rendering
  if (!mounted) return null;

  // Top level items that are directly shown without accordion
  const topLevelItems = navGroups.find(group => group.name === 'Navigation')?.items || [];
  const accordionGroups = navGroups.filter(group => group.name !== 'Navigation') || [];

  return (
    <div className={cn("flex flex-col h-full transition-width duration-300 ease-in-out bg-[#111] border-r border-[#333]", isExpanded ? "w-64" : "w-20")}>
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between px-4 py-6">
        {isExpanded ? (
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Ahmad Basheer" className="w-8 h-8 rounded-lg" />
            <div>
              <div className="font-semibold text-white text-sm">Ahmad Basheer</div>
              <div className="text-xs text-gray-400">AI Solutions Developer</div>
            </div>
          </div>
        ) : (
          <img src="/logo.png" alt="Ahmad Basheer" className="w-8 h-8 rounded-lg" />
        )}
        <button
          onClick={onToggleExpand}
          className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[#222]"
        >
          {isExpanded ? <ChevronLeft className="h-4 w-4 text-gray-400" /> : <Menu className="h-4 w-4 text-gray-400" />}
        </button>
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto px-2 pb-6">
        {/* Top level navigation items (Dashboard, Chat, etc.) */}
        <div className="space-y-1 mb-2">
          {topLevelItems?.map(item => renderNavItem(item))}
        </div>

        {/* Threads section - Only show when threadStore is available */}
        {isExpanded && runtimeAvailable && threadStore && threadStore.threads && threadStore.threads.length > 0 && (
          <div className="mb-4">
            <h3 className="px-3 mb-1 text-xs uppercase tracking-wider text-gray-400">Threads</h3>
            <div className="space-y-1">
              {threadStore.threads?.map(renderThreadItem)}
            </div>
          </div>
        )}

        {/* Navigation accordions by group */}
        <Accordion
          type="multiple"
          className="space-y-1"
        >
          {accordionGroups?.map(group => (
            <AccordionItem
              key={group.name}
              value={group.name}
              className="border-b-0 px-0"
            >
              <AccordionTrigger className={cn(
                "py-2 px-3 hover:bg-[#111] hover:no-underline text-sm",
                isExpanded ? "justify-between" : "justify-center"
              )}>
                {isExpanded ? (
                  <span className="text-gray-300">{group.name}</span>
                ) : (
                  <span className="text-xs text-gray-500 rotate-90 w-1">•••</span>
                )}
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <div className={cn("space-y-1", isExpanded ? "pl-1" : "px-0")}>
                  {group.items?.map(item => renderNavItem(item))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Portfolio Footer */}
      <div className="border-t border-[#333333] mt-auto px-3 py-4">
        {isExpanded && (
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">Portfolio Showcase</p>
            <div className="flex justify-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-400">All Systems Operational</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
