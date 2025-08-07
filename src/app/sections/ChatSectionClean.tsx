'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Plus, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Thread {
  id: string;
  name: string;
  messages: Message[];
  lastUpdated: Date;
}

export default function ChatSection() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize with a default thread
  useEffect(() => {
    const defaultThread: Thread = {
      id: 'default',
      name: 'New Conversation',
      messages: [],
      lastUpdated: new Date()
    };
    setThreads([defaultThread]);
    setActiveThreadId('default');
  }, []);

  const createNewThread = () => {
    const newThread: Thread = {
      id: Date.now().toString(),
      name: 'New Conversation',
      messages: [],
      lastUpdated: new Date()
    };
    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
    setMessages([]);
  };

  const switchToThread = (threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      setActiveThreadId(threadId);
      setMessages(thread.messages);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/pollinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          model: selectedModel
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.',
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Update the thread
      setThreads(prev => prev.map(thread => 
        thread.id === activeThreadId 
          ? { ...thread, messages: finalMessages, lastUpdated: new Date() }
          : thread
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full w-full bg-[#0a0a0a] text-white">
      {/* Thread Sidebar */}
      <div className="w-80 bg-[#111111] border-r border-[#333333] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#333333]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Conversations</h2>
            <Button
              onClick={createNewThread}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
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
                {thread.name}
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {thread.messages.length} messages
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-[#333333] bg-[#0a0a0a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-blue-400" />
              <h1 className="text-white text-lg font-semibold">
                AI Chat Assistant
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-3 py-1.5 bg-[#333333] border border-[#444444] text-white text-sm rounded-md"
              >
                <option value="openai">OpenAI GPT-4</option>
                <option value="claude">Claude</option>
                <option value="gemini">Gemini</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400 max-w-md">
                <MessageSquare className="h-16 w-16 mx-auto mb-6 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-4">AI Playground</h3>
                <p className="text-lg mb-4">This is where the magic happens. Try asking:</p>
                <div className="space-y-2 text-left bg-zinc-800 rounded-lg p-4">
                  <div className="text-sm text-blue-400">• "Generate a marketing image for luxury watches"</div>
                  <div className="text-sm text-green-400">• "Create a voiceover for my video intro"</div>
                  <div className="text-sm text-purple-400">• "Analyze this website: example.com"</div>
                  <div className="text-sm text-orange-400">• "Write a deal proposal for a tech startup"</div>
                </div>
                <p className="text-sm mt-4 text-zinc-500">Or just chat normally - I'm here to help!</p>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-[#111111] border border-[#333333] text-white'
              }`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#111111] border border-[#333333] text-white rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[#333333] bg-[#0a0a0a]">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="min-h-[60px] max-h-[200px] resize-none bg-[#111111] border-[#333333] text-white placeholder-gray-400"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}