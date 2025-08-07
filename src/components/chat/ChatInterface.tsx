'use client';

import React from 'react';
import { Message } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ChatInterfaceProps {
  messages: Message[];
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSend: () => void;
  isLoading: boolean;
  imageAttachment: string | null;
  setImageAttachment: (value: string | null) => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ChatInterface({
  messages,
  inputValue,
  setInputValue,
  handleSend,
  isLoading,
  imageAttachment,
  setImageAttachment,
  inputRef,
  fileInputRef,
  handleImageUpload
}: ChatInterfaceProps) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-4 ${
              message.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#111111] border border-[#333333] text-white'
            }`}>
              {message.image && (
                <img src={message.image} alt="Attached" className="max-w-full h-auto rounded mb-2" />
              )}
              <div className="whitespace-pre-wrap">{message.content}</div>
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
        {imageAttachment && (
          <div className="mb-3 p-2 bg-[#111111] border border-[#333333] rounded-lg">
            <img src={imageAttachment} alt="Attachment" className="max-h-20 rounded" />
            <button
              onClick={() => setImageAttachment(null)}
              className="ml-2 text-red-400 hover:text-red-300 text-sm"
            >
              Remove
            </button>
          </div>
        )}
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              className="min-h-[60px] max-h-[200px] resize-none bg-[#111111] border-[#333333] text-white placeholder-gray-400"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-[#333333] hover:bg-[#444444] text-white rounded-md transition-colors"
              disabled={isLoading}
            >
              📎
            </button>
            <Button
              onClick={handleSend}
              disabled={isLoading || (!inputValue.trim() && !imageAttachment)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}