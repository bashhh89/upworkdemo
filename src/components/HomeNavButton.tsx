'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Home, ChevronUp, Wrench, MessageSquare, Globe, Users, Target, ExternalLink, Sparkles } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export default function HomeNavButton({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className={compact ? "" : "fixed bottom-6 right-6 z-50"}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            className={compact 
              ? "h-8 text-xs text-gray-400 hover:text-white" 
              : "h-12 w-12 rounded-full shadow-lg"}
            variant={compact ? "ghost" : (open ? "outline" : "default")}
          >
            {compact ? (
              <div className="flex items-center gap-1">
                <Home className="h-4 w-4 mr-1" />
                {open ? <ChevronUp className="h-3 w-3" /> : "Menu"}
              </div>
            ) : (
              open ? <ChevronUp className="h-5 w-5" /> : <Home className="h-5 w-5" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={compact ? "end" : "end"} className="w-56">
          <DropdownMenuLabel>Navigation</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link href="/" className="flex cursor-pointer items-center w-full">
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/agent-studio" className="flex cursor-pointer items-center w-full">
              <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
              <span>AI Agent Studio</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/chat" className="flex cursor-pointer items-center w-full">
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Chat</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Tools</DropdownMenuLabel>
          
          <DropdownMenuItem asChild>
            <Link href="/test-tools" className="flex cursor-pointer items-center w-full">
              <Wrench className="mr-2 h-4 w-4" />
              <span>Tool Testing Center</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/tools-test" className="flex cursor-pointer items-center w-full">
              <Wrench className="mr-2 h-4 w-4" />
              <span>Advanced Tool Tester</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Quick Tools</DropdownMenuLabel>
          
          <DropdownMenuItem asChild>
            <Link href="/chat?tool=website" className="flex cursor-pointer items-center w-full">
              <Globe className="mr-2 h-4 w-4 text-blue-500" />
              <span>Website Scanner</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/chat?tool=executive" className="flex cursor-pointer items-center w-full">
              <Users className="mr-2 h-4 w-4 text-purple-500" />
              <span>Executive Persona</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/chat?tool=deal" className="flex cursor-pointer items-center w-full">
              <Target className="mr-2 h-4 w-4 text-green-500" />
              <span>Deal Writer</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 