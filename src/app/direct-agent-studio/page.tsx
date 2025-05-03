'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DirectAgentStudio() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to agent-studio
    router.push('/agent-studio');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <p>Redirecting to Agent Studio...</p>
    </div>
  );
} 