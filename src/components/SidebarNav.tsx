'use client';

import { cn } from '@/lib/utils';
import { ChevronRight, KanbanSquare, ClipboardList, BrainCircuit, Calculator, BookOpen, Image, Mic, MessageSquare, MessageSquareWarning, Globe, Palette, Home, Layers, User, Users, MessagesSquare, Sparkles, Menu, ChevronLeft, Plus, Trash2, CheckIcon, ArchiveIcon } from 'lucide-react'; // Added Plus and Trash2
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
}

// Group the navigation items
const navGroups: NavGroup[] = [
  {
    name: 'Navigation',
    items: [
      {
        name: 'Home',
        id: 'home',
        icon: Home
      },
      {
        name: 'Chat',
        id: 'pollinations-assistant',
        icon: MessageSquare,
        status: 'fully',
        subItems: [
          // Removing "All Threads" sub-item
        ]
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
  {
    name: 'Resources',
    items: [
      {
        name: 'Resource Library',
        id: 'resources',
        icon: BookOpen,
        status: 'planned'
      }
    ]
  }
];

export default function SidebarNav({ activeSection, onSectionChange, isExpanded, onToggleExpand }: SidebarNavProps & { isExpanded: boolean; onToggleExpand: () => void }) {
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
  
  const renderNavItem = (item: NavItem, isSubItem = false) => {
    const isActive = activeSection === item.id;
    const isParentActive = item.subItems?.some(subItem => activeSection === subItem.id);
    const Icon = item.icon;

    const buttonClasses = cn(
      "w-full flex items-center text-sm transition-colors duration-150 px-3 py-2",
      isExpanded ? "justify-start" : "justify-center",
      isActive
        ? isExpanded // Apply active style differently based on expanded state
           ? "text-white font-medium bg-[#0a0a0a]" // Expanded active: background
           : "text-white font-medium border border-sky-600 bg-[#0a0a0a] rounded-md" // Collapsed active: tile style
        : isExpanded // Apply default style differently based on expanded state
          ? "text-gray-300 hover:bg-[#111] hover:text-white" // Expanded default: simple hover
          : "text-gray-300 hover:bg-[#111] hover:text-white border border-[#333333] bg-[#0a0a0a] rounded-md" // Collapsed default: tile style
    );

    const contentClasses = cn("flex items-center flex-1", { "justify-center": !isExpanded });

    // Always render the button/link, hide text/status when collapsed
    const itemContent = (
       <div className={contentClasses}>
         <Icon className={cn("flex-shrink-0 h-4 w-4", isExpanded ? "mr-3" : "mr-0")} />
         {isExpanded && <span className="flex-1 text-left truncate text-white">{item.name}</span>}
         {isExpanded && item.status === 'partial' && <span className="ml-2 text-[#a0a0a0] text-xs">[WIP]</span>}
         {isExpanded && item.status === 'planned' && <span className="ml-2 text-[#a0a0a0] text-xs">[Planned]</span>}
         {isExpanded && item.subItems && !isSubItem && (
           <ChevronRight className={cn(
             "h-4 w-4 transition-transform ml-auto",
             isParentActive && "rotate-90"
           )} />
         )}
       </div>
    );


    if (item.externalLink) {
      return (
        <div key={item.id} className={cn("space-y-1", isSubItem ? (isExpanded ? "ml-6 mt-1" : "") : "")}>
          <Link href={item.externalLink} className={buttonClasses} legacyBehavior>
            {itemContent}
          </Link>
        </div>
      );
    }

    return (
      <div key={item.id} className={cn("space-y-1", isSubItem ? (isExpanded ? "ml-6 mt-1" : "") : "")}> {/* Adjusted margin for collapsed state */}
        <button onClick={() => onSectionChange(item.id)} className={buttonClasses}>
          {itemContent}
        </button>
        {(isParentActive || isActive) && isExpanded && item.subItems?.map((subItem, index) => (
          <React.Fragment key={`${item.id}-subitem-${index}-${subItem.id}`}>
            {renderNavItem(subItem, true)}
          </React.Fragment>
        ))}
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
  
  return (
    <div className={cn("flex flex-col h-full transition-width duration-300 ease-in-out", isExpanded ? "w-64" : "w-20")}>
      {/* Logo and Toggle */}
      <div className={cn("mb-6 flex items-center", isExpanded ? "justify-between px-3" : "justify-center px-3")}>
         {isExpanded && (
           <div>
             <h1 className="text-xl font-bold text-white">Deliver AI</h1>
             <p className="text-xs text-gray-500">Your AI Toolkit</p>
           </div>
         )}
         <button onClick={onToggleExpand} className="p-2 rounded-md hover:bg-[#111] text-gray-300 hover:text-white transition-colors">
           {isExpanded ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />} {/* Toggle icon */}
         </button>
      </div>
      {/* Nav groups */}
      <div className="flex-1 px-2 space-y-1 overflow-auto">
        {navGroups.map((group) => (
          <div key={group.name} className="mb-6">
            {isExpanded && (
              <h2 className="mb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {group.name}
              </h2>
            )}
            <div className="space-y-1">
              {group.items.map((item) => renderNavItem(item))}
            </div>
          </div>
        ))}
        
        {/* AI CHAT Section - Show even without context but with limited functionality */}
        <div className="mb-6">
          {isExpanded && (
            <h2 className="mb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              AI CHAT
            </h2>
          )}
          
          <div className="space-y-3">
            {/* New Thread Button - Only show when not on Chat page */}
            {/* Thread List - Only show when runtime is available */}
            {isExpanded && threadStore && runtimeAvailable && threadStore.threads && (
              <div className="mt-1"> {/* Adjusted margin */}
                {/* Thread List - Only show when runtime is available */}
                {threadStore.threads.length > 0 ? (
                  <div className="divide-y divide-[#222]">
                    {threadStore.threads.map((thread, index) => (
                      <React.Fragment key={thread.id || `thread-${index}`}>
                        {renderThreadItem(thread)}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                   isExpanded && ( // Only show message when expanded
                    (<div className="px-3 py-2 text-xs text-gray-500 italic">Chat threads will appear here when you start a chat.
                                          </div>)
                   )
                )}
              </div>
            )}

            {/* Show a message when expanded but runtime is not available */}
            {isExpanded && !runtimeAvailable && (
              <div className="px-3 py-2 text-xs text-gray-400">
                Chat threads will appear here when you start a chat
              </div>
            )}
          </div> {/* Closes div on line 434 */}
        </div> {/* Closes div on line 427 */}
      </div> {/* Closes div on line 412 */}
      {/* User profile */}
      <div className={cn("border-t border-[#333333] mt-auto px-3 py-4", isExpanded ? "block" : "flex flex-col items-center")}>
        <div className={cn("flex items-center", isExpanded ? "space-x-3" : "flex-col space-y-2")}>
          <div className="relative flex-shrink-0">
             <div className="h-10 w-10 bg-[#333] rounded-full flex items-center justify-center text-white">
               AB
             </div>
             <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-[#0a0a0a]"></span>
          </div>
          {isExpanded && (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Ahmad Basheer</span>
              <span className="text-xs text-gray-500">Pro Plan</span>
            </div>
          )}
        </div>
      </div>
      {/* Closes div on line 397 */}
    </div>
  );
}
