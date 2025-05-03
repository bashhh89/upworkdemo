'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Home, ChevronUp, Wrench, MessageSquare, Globe, Users, Target, ExternalLink } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export default function HomeNavButton() {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            className="h-12 w-12 rounded-full shadow-lg"
            variant={open ? "outline" : "default"}
          >
            {open ? <ChevronUp className="h-5 w-5" /> : <Home className="h-5 w-5" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Navigation</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <Link href="/" passHref legacyBehavior>
            <DropdownMenuItem asChild>
              <a className="flex cursor-pointer items-center">
                <Home className="mr-2 h-4 w-4" />
                <span>Home</span>
              </a>
            </DropdownMenuItem>
          </Link>
          
          <Link href="/chat" passHref legacyBehavior>
            <DropdownMenuItem asChild>
              <a className="flex cursor-pointer items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Chat</span>
              </a>
            </DropdownMenuItem>
          </Link>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Tools</DropdownMenuLabel>
          
          <Link href="/test-tools" passHref legacyBehavior>
            <DropdownMenuItem asChild>
              <a className="flex cursor-pointer items-center">
                <Wrench className="mr-2 h-4 w-4" />
                <span>Tool Testing Center</span>
              </a>
            </DropdownMenuItem>
          </Link>
          
          <Link href="/tools-test" passHref legacyBehavior>
            <DropdownMenuItem asChild>
              <a className="flex cursor-pointer items-center">
                <Wrench className="mr-2 h-4 w-4" />
                <span>Advanced Tool Tester</span>
              </a>
            </DropdownMenuItem>
          </Link>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Quick Tools</DropdownMenuLabel>
          
          <Link href="/chat?tool=website" passHref legacyBehavior>
            <DropdownMenuItem asChild>
              <a className="flex cursor-pointer items-center">
                <Globe className="mr-2 h-4 w-4 text-blue-500" />
                <span>Website Scanner</span>
              </a>
            </DropdownMenuItem>
          </Link>
          
          <Link href="/chat?tool=executive" passHref legacyBehavior>
            <DropdownMenuItem asChild>
              <a className="flex cursor-pointer items-center">
                <Users className="mr-2 h-4 w-4 text-purple-500" />
                <span>Executive Persona</span>
              </a>
            </DropdownMenuItem>
          </Link>
          
          <Link href="/chat?tool=deal" passHref legacyBehavior>
            <DropdownMenuItem asChild>
              <a className="flex cursor-pointer items-center">
                <Target className="mr-2 h-4 w-4 text-green-500" />
                <span>Deal Writer</span>
              </a>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 