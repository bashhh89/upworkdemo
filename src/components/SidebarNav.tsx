'use client';

import { cn } from '@/lib/utils';
import { ChevronRight, KanbanSquare, ClipboardList, BrainCircuit, Calculator, BookOpen, Image, Mic, MessageSquare, MessageSquareWarning, Globe, Palette, Home, Layers, User, Users, MessagesSquare, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface NavItem {
  name: string;
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: NavItem[];
  externalLink?: string;
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
        name: 'AI Implementation',
        id: 'ai-implementation',
        icon: Sparkles,
        externalLink: '/ai-implementation'
      }
    ]
  },
  {
    name: 'Strategic Tools',
    items: [
      {
        name: '90-Day Roadmap',
        id: 'roadmap',
        icon: ClipboardList,
        subItems: [
          {
            name: 'Kanban Task View',
            id: 'kanban',
            icon: KanbanSquare
          }
        ]
      },
      {
        name: 'AI Efficiency Scorecard',
        id: 'scorecard',
        icon: BrainCircuit
      },
      {
        name: 'ROI Calculator',
        id: 'roi',
        icon: Calculator
      }
    ]
  },
  {
    name: 'AI Creative Tools',
    items: [
      {
        name: 'AI Brand Foundation',
        id: 'brand_foundation',
        icon: Palette
      },
      {
        name: 'AI Idea Generator',
        id: 'generator',
        icon: Layers
      },
      {
        name: 'Contextual Deal Writer',
        id: 'contextual-deal-writer',
        icon: ClipboardList
      },
      {
        name: 'AI Image Generator',
        id: 'image_generator',
        icon: Image
      },
      {
        name: 'AI Voiceover',
        id: 'voiceover_generator',
        icon: Mic
      }
    ]
  },
  {
    name: 'Analysis & Insights',
    items: [
      {
        name: 'Website Intelligence',
        id: 'website_scanner',
        icon: Globe
      },
      {
        name: 'Talk To Website',
        id: 'talk_to_website',
        icon: MessagesSquare
      },
      {
        name: 'Executive Persona',
        id: 'executive_persona',
        icon: User
      },
      {
        name: 'Ideal Customer Profile',
        id: 'ideal_customer_profile',
        icon: Users
      },
      {
        name: 'AI Marketing Critique',
        id: 'critique',
        icon: MessageSquare
      },
      {
        name: 'AI Objection Practice',
        id: 'objection_handler',
        icon: MessageSquareWarning
      }
    ]
  },
  {
    name: 'Resources',
    items: [
      {
        name: 'Resource Library',
        id: 'resources',
        icon: BookOpen
      }
    ]
  }
];

export default function SidebarNav({ activeSection, onSectionChange }: SidebarNavProps) {
  const renderNavItem = (item: NavItem, isSubItem = false) => {
    const isActive = activeSection === item.id;
    const isParentActive = item.subItems?.some(subItem => activeSection === subItem.id);
    const Icon = item.icon;

    const buttonClasses = cn(
      "w-full flex items-center px-3 py-2 rounded-md text-sm transition-colors duration-150",
      isSubItem ? "text-xs" : "text-sm",
      isActive 
        ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-medium" 
        : isParentActive 
          ? "bg-slate-800/50 text-white" 
          : "text-gray-300 hover:bg-slate-800/30 hover:text-white"
    );

    // If it has an external link, render a Link component
    if (item.externalLink) {
      return (
        <div key={item.id} className={cn("space-y-1", isSubItem ? "ml-6 mt-1" : "")}>
          <Link 
            href={item.externalLink}
            className={buttonClasses}
          >
            <Icon className={cn("flex-shrink-0", isSubItem ? "h-3.5 w-3.5 mr-1.5" : "h-4 w-4 mr-2")} />
            <span className="flex-1 text-left truncate">{item.name}</span>
          </Link>
        </div>
      );
    }

    return (
      <div key={item.id} className={cn("space-y-1", isSubItem ? "ml-6 mt-1" : "")}>
        <button
          onClick={() => onSectionChange(item.id)}
          className={buttonClasses}
        >
          <Icon className={cn("flex-shrink-0", isSubItem ? "h-3.5 w-3.5 mr-1.5" : "h-4 w-4 mr-2")} />
          <span className="flex-1 text-left truncate">{item.name}</span>
          {item.subItems && !isSubItem && (
            <ChevronRight className={cn(
              "h-4 w-4 transition-transform",
              isParentActive && "rotate-90"
            )} />
          )}
        </button>
        {(isParentActive || isActive) && item.subItems?.map(subItem => renderNavItem(subItem, true))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Deliver AI</h1>
        <p className="text-xs text-gray-500">Your AI Toolkit</p>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 space-y-6 overflow-y-auto scrollbar-hide">
        {navGroups.map((group) => (
          <div key={group.name} className="space-y-1">
            <h2 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {group.name}
            </h2>
            <div className="space-y-1">
              {group.items.map(item => renderNavItem(item))}
            </div>
          </div>
        ))}
      </nav>

      {/* User section at bottom */}
      <div className="mt-auto pt-4 border-t border-gray-800 flex items-center px-3 py-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">AB</span>
        </div>
        <div className="ml-2">
          <p className="text-sm font-medium text-white">Ahmad Basheer</p>
          <p className="text-xs text-gray-500">Pro Plan</p>
        </div>
      </div>
    </div>
  );
}