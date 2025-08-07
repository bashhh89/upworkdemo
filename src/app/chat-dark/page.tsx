'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Brain, Plus, History, Trash2, Copy } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  reasoning?: string;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  date: Date;
  messages: Message[];
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI assistant. How can I help you today?",
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReasoningEnabled, setIsReasoningEnabled] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dummyHistory: ChatHistoryItem[] = [
      {
        id: 'hist1',
        title: 'Project Brainstorming',
        date: new Date(Date.now() - 86400000),
        messages: [
          { id: 'm1', content: 'Help me brainstorm ideas for a new app.', role: 'user', timestamp: new Date(Date.now() - 86400000) },
          { id: 'm2', content: 'Sure! What kind of app are you thinking about?', role: 'assistant', timestamp: new Date(Date.now() - 86300000) },
        ],
      },
      {
        id: 'hist2',
        title: 'Learning about AI',
        date: new Date(Date.now() - 172800000),
        messages: [
          { id: 'm3', content: 'Explain machine learning in simple terms.', role: 'user', timestamp: new Date(Date.now() - 172800000) },
          { id: 'm4', content: 'Machine learning is a subset of AI...', role: 'assistant', timestamp: new Date(Date.now() - 172700000) },
        ],
      },
    ];
    setChatHistory(dummyHistory);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/glm-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          model: "glm-4.5-flash",
          thinking: isReasoningEnabled ? { type: "enabled" } : { type: "disabled" }
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.choices?.[0]?.message?.content || "Sorry, I couldn't get a response.",
        reasoning: data.choices?.[0]?.message?.reasoning,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, an error occurred. Please try again.",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: '1',
        content: "Hello! I'm your AI assistant. How can I help you today?",
        role: 'assistant',
        timestamp: new Date(),
      },
    ]);
    setShowHistory(false);
  };

  const handleLoadHistory = (historyItem: ChatHistoryItem) => {
    setMessages(historyItem.messages);
    setShowHistory(false);
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
      <header className="bg-gray-900 border-b border-gray-800 p-4 flex items-center gap-2">
        <Bot className="h-6 w-6 text-emerald-400" />
        <h1 className="text-xl font-semibold">AI Assistant</h1>
        <div className="ml-auto flex items-center gap-2">
          <button 
            onClick={handleNewChat}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            title="New Chat"
          >
            <Plus className="h-5 w-5 text-gray-400" />
          </button>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            title="History"
          >
            <History className="h-5 w-5 text-gray-400" />
          </button>
          <div className="flex items-center gap-2 ml-2">
            <Brain className={`h-4 w-4 ${isReasoningEnabled ? 'text-emerald-400' : 'text-gray-500'}`} />
            <label htmlFor="reasoning-toggle" className="text-sm text-gray-300 cursor-pointer">Reasoning</label>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input 
                type="checkbox" 
                id="reasoning-toggle"
                checked={isReasoningEnabled}
                onChange={() => setIsReasoningEnabled(!isReasoningEnabled)}
                className="sr-only"
              />
              <div 
                className={`block w-10 h-6 rounded-full ${isReasoningEnabled ? 'bg-emerald-500' : 'bg-gray-700'}`}
                onClick={() => setIsReasoningEnabled(!isReasoningEnabled)}
              >
                <div 
                  className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isReasoningEnabled ? 'transform translate-x-4' : ''}`}
                ></div>
              </div>
            </div>
          </div>
          <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse"></span>
          <span className="text-sm text-gray-400">Online</span>
        </div>
      </header>

      {showHistory && (
        <div className="w-64 bg-gray-900 border-r border-gray-800 h-full overflow-y-auto">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold mb-4">Chat History</h2>
            <button 
              onClick={handleNewChat}
              className="w-full flex items-center gap-2 p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </button>
          </div>
          <div className="divide-y divide-gray-800">
            {chatHistory.map((item) => (
              <div 
                key={item.id} 
                className="p-4 hover:bg-gray-800 cursor-pointer transition-colors flex justify-between items-start"
                onClick={() => handleLoadHistory(item)}
              >
                <div>
                  <h3 className="font-medium text-gray-200">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.date.toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={(e) => handleDeleteHistory(item.id, e)}
                  className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-red-400 transition-colors"
                  title="Delete chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${showHistory ? 'ml-0' : ''}`}>
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'assistant' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-emerald-900 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
            )}
            <div className="flex flex-col">
              {message.role === 'assistant' && message.reasoning && (
                <div className="mb-2 p-3 bg-gray-700 rounded-lg border-l-4 border-emerald-500">
                  <p className="text-xs font-semibold text-emerald-400 mb-1">Reasoning:</p>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{message.reasoning}</p>
                </div>
              )}
              <div className="relative group">
                <div
                  className={`max-w-[70%] lg:max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user' ? 'bg-emerald-700 text-white' : 'bg-gray-800 text-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-emerald-200' : 'text-gray-500'}`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
                <button 
                  onClick={() => handleCopy(message.content)}
                  className="absolute -bottom-2 -right-2 p-1 bg-gray-700 hover:bg-gray-600 text-gray-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                  title="Copy message"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
            {message.role === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-emerald-900 flex items-center justify-center">
                <Bot className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div className="bg-gray-800 text-gray-200 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                <span>AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={`border-t border-gray-800 p-4 ${showHistory ? 'ml-0' : ''}`}>
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 text-white rounded-lg px-4 py-3 flex items-center justify-center transition-colors"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ChatDarkPage() {
  return <ChatInterface />;
}
