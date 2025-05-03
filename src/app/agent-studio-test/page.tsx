'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AgentStudioTest() {
  return (
    <div className="container mx-auto py-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Agent Studio Test Page</h1>
      <p className="text-gray-400 mb-8">This is a test page to verify routing</p>
      <Link href="/agent-studio" legacyBehavior>
        <Button className="bg-white text-black hover:bg-gray-200 rounded-none">
          Go to Agent Studio
        </Button>
      </Link>
    </div>
  );
} 