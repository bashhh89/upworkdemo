'use client';

import React from 'react';
import { Thread } from '@/types';

interface ThreadSidebarProps {
  threads: Thread[];
  activeThreadId: string | null;
  createNewThread: () => void;
  switchToThread: (threadId: string) => void;
}

export function ThreadSidebar({
  threads,
  activeThreadId,
  createNewThread,
  switchToThread
}: ThreadSidebarProps) {
  return (
    <div className="w-80 bg-[#111111] border-r border-[#333333] flex flex-col">
      {/* Thread Header */}
      <div className="p-4 border-b border-[#333333]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Conversations</h2>
          <button
            onClick={createNewThread}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
          >
            New Chat
          </button>
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {threads.map((thread) => (
          <div
            key={thread.id}
            onClick={() => switchToThread(thread.id)}
            className={`p-3 border-b border-[#333333] cursor-pointer hover:bg-[#1a1a1a] transition-colors ${
              activeThreadId === thread.id ? 'bg-[#1a1a1a] border-l-2 border-l-blue-500' : ''
            }`}
          >
            <div className="text-white text-sm font-medium truncate">
              {thread.name || 'New Conversation'}
            </div>
            <div className="text-gray-400 text-xs mt-1">
              {thread.messages.length} messages
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}