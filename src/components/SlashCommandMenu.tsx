import { useState, useRef, useEffect } from 'react';
import { Command, LucideIcon, Wrench, Users, Target, Globe } from 'lucide-react';
import { availableTools } from '@/lib/tool-utils';
import { ToolDefinition } from '@/types/tools';

interface SlashCommandMenuProps {
  isOpen: boolean;
  onSelect: (tool: ToolDefinition) => void;
  onClose: () => void;
}

// Map tool names to their icons
const toolIcons: Record<string, LucideIcon> = {
  'Website Intelligence Scanner': Globe,
  'Executive Persona': Users,
};

export default function SlashCommandMenu({ isOpen, onSelect, onClose }: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % availableTools.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + availableTools.length) % availableTools.length);
          break;
        case 'Enter':
          e.preventDefault();
          onSelect(availableTools[selectedIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, selectedIndex, onSelect, onClose]);

  // Reset selected index when menu opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      
      // Scroll menu into view when opened
      if (menuRef.current) {
        menuRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [isOpen]);

  // Debug logging
  useEffect(() => {
    console.log('SlashCommandMenu render - isOpen:', isOpen);
  }, [isOpen]);

  // Handle click outside to close menu
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed bottom-[70px] left-4 right-4 max-w-[600px] max-h-80 mx-auto overflow-y-auto mb-2 bg-[#1a1a1a] border border-gray-700 rounded-md shadow-lg z-50"
      style={{
        boxShadow: '0 0 20px rgba(0,0,0,0.5)', 
        display: 'block',
        visibility: 'visible',
        opacity: 1
      }}
      data-slash-menu="true"
    >
      <div className="p-2 border-b border-gray-700 flex items-center bg-[#222] sticky top-0">
        <Command className="h-4 w-4 mr-2 text-blue-400" />
        <span className="text-sm text-gray-300 font-medium">Select a tool</span>
      </div>
      
      <div className="p-1">
        {availableTools.map((tool, index) => {
          const Icon = toolIcons[tool.name] || Wrench;
          
          return (
            <div
              key={tool.name}
              className={`p-2 rounded-md flex items-center gap-2 cursor-pointer ${
                selectedIndex === index ? 'bg-blue-600' : 'hover:bg-[#333]'
              }`}
              onClick={() => onSelect(tool)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <Icon className={`h-5 w-5 ${selectedIndex === index ? 'text-white' : 'text-gray-400'}`} />
              <div className="flex-1">
                <div className={`font-medium ${selectedIndex === index ? 'text-white' : 'text-gray-200'}`}>
                  {tool.name}
                </div>
                <div className={`text-xs ${selectedIndex === index ? 'text-blue-200' : 'text-gray-400'}`}>
                  {tool.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
