'use client';

import { cn } from '@/lib/utils';
import { ChevronRight, KanbanSquare, ClipboardList, BrainCircuit, Calculator, BookOpen, Image, Mic, MessageSquare, MessageSquareWarning, Globe, Palette, Home, Layers, User, Users, MessagesSquare, Sparkles, Menu, ChevronLeft, Plus, Trash2, CheckIcon, ArchiveIcon, LayoutDashboard } from 'lucide-react'; // Added Plus, Trash2, and LayoutDashboard
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

// Group the navigation items
const navGroups: NavGroup[] = [
  {
    name: 'Navigation',
    items: [
      {
        name: 'Dashboard',
        id: 'home', // Changed id from 'dashboard' to 'home'
        icon: Layers,
        subItems: [
          {
            name: 'Overview',
            id: 'home',
            icon: Home
          },
          {
            name: 'Recent Projects',
            id: 'recent',
            icon: ClipboardList
          },
          {
            name: 'Saved Items',
            id: 'saved',
            icon: BookOpen
          }
        ]
      },
      {
        name: 'Chat',
        id: 'pollinations-assistant',
        icon: MessageSquare,
        status: 'fully',
        subItems: [
          // Removing "All Threads" sub-item
        ]
      },
      {
        name: 'AI Agent Studio',
        id: 'agent-studio',
        icon: Sparkles,
        status: 'fully',
        externalLink: '/agent-studio'
      },
      {
        name: 'Resource Library',
        id: 'resources',
        icon: BookOpen,
        status: 'planned'
      }
    ]
  },
  {
    name: 'Strategy & Planning',
    items: [
      {
        name: '90-Day Roadmap',
        id: 'roadmap',
        icon: ClipboardList,
        status: 'planned'
      },
      {
        name: 'AI Efficiency Scorecard',
        id: 'scorecard',
        icon: BrainCircuit,
        status: 'planned'
      },
      {
        name: 'ROI Calculator',
        id: 'roi',
        icon: Calculator,
        status: 'planned'
      },
      {
        name: 'Kanban Task View',
        id: 'kanban',
        icon: KanbanSquare,
        status: 'planned'
      }
    ]
  },
  {
    name: 'Audience & Market Insights',
    items: [
      {
        name: 'Website Intelligence',
        id: 'website_scanner',
        icon: Globe,
        status: 'partial'
      },
      {
        name: 'Talk To Website',
        id: 'talk_to_website',
        icon: MessagesSquare,
        status: 'planned'
      },
      {
        name: 'Executive Persona',
        id: 'executive_persona',
        icon: User,
        status: 'planned'
      },
      {
        name: 'Ideal Customer Profile',
        id: 'ideal_customer_profile',
        icon: Users,
        status: 'planned'
      }
    ]
  },
  {
    name: 'Sales & Marketing Execution',
    items: [
      {
        name: 'Contextual Deal Writer',
        id: 'contextual-deal-writer',
        icon: ClipboardList,
        status: 'partial'
      },
      {
        name: 'AI Marketing Critique',
        id: 'critique',
        icon: MessageSquare,
        status: 'planned'
      },
      {
        name: 'AI Objection Practice',
        id: 'objection_handler',
        icon: MessageSquareWarning,
        status: 'planned'
      }
    ]
  },
  {
    name: 'Creative Generation',
    items: [
      {
        name: 'AI Image Generator',
        id: 'image_generator',
        icon: Image,
        status: 'fully'
      },
      {
        name: 'AI Voiceover',
        id: 'voiceover_generator',
        icon: Mic,
        status: 'fully'
      },
      {
        name: 'AI Presentations',
        id: 'presentation-generator',
        icon: LayoutDashboard,
        status: 'planned'
      },
      {
        name: 'AI Brand Foundation',
        id: 'brand_foundation',
        icon: Palette,
        status: 'planned'
      },
      {
        name: 'AI Idea Generator',
        id: 'generator',
        icon: Layers,
        status: 'planned'
      }
    ]
  },
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

    const itemContent = (
       <div className={contentClasses}>
         <Icon className={cn("flex-shrink-0 h-4 w-4", isExpanded ? "mr-3" : "mr-0")} />
         {isExpanded && <span className="flex-1 text-left truncate text-white">{item.name}</span>}
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
    <div className={cn("flex flex-col h-full transition-width duration-300 ease-in-out", isExpanded ? "w-64" : "w-20")}>
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between px-4 py-6">
        {isExpanded ? (
          <span className="font-medium text-white">Deliver AI</span>
        ) : (
          <span className="w-8 h-8 bg-[#2563eb] rounded-full flex items-center justify-center text-white font-bold text-sm">AI</span>
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

      {/* User profile */}
      <div className={cn("border-t border-[#333333] mt-auto px-3 py-4", isExpanded ? "block" : "flex flex-col items-center")}>
        <div className={cn("flex items-center", isExpanded ? "space-x-3" : "flex-col space-y-2")}>
          <div className="relative">
            <div className="h-10 w-10 bg-[#333] rounded-full flex items-center justify-center text-white">
              AB
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-[#0a0a0a]"></span>
          </div>
          {isExpanded && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Ahmad Basheer</p>
              <p className="text-xs text-gray-500">Pro Plan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
