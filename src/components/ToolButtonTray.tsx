import { Globe, Users, Target, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { availableTools } from '@/lib/tool-utils';
import { ToolDefinition } from '@/types/tools';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface ToolButtonTrayProps {
  onSelectTool: (tool: ToolDefinition) => void;
}

export default function ToolButtonTray({ onSelectTool }: ToolButtonTrayProps) {
  // Map tool names to their icons and colors
  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'Website Intelligence Scanner':
        return <Globe className="h-4 w-4 text-blue-400 group-hover:text-blue-300" />;
      case 'Executive Persona':
        return <Users className="h-4 w-4 text-purple-400 group-hover:text-purple-300" />;
      case 'ICP Builder':
        return <Target className="h-4 w-4 text-green-400 group-hover:text-green-300" />;
      default:
        return <Wrench className="h-4 w-4 text-gray-400 group-hover:text-gray-300" />;
    }
  };

  const getToolColor = (toolName: string): string => {
    if (toolName.includes('Website')) return 'border-blue-800 hover:border-blue-600 hover:bg-blue-950/30';
    if (toolName.includes('Executive')) return 'border-purple-800 hover:border-purple-600 hover:bg-purple-950/30';
    if (toolName.includes('ICP')) return 'border-green-800 hover:border-green-600 hover:bg-green-950/30';
    return 'border-gray-700 hover:border-gray-600 hover:bg-gray-950/30';
  };

  return (
    <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
      <TooltipProvider>
        {availableTools.map((tool) => (
          <Tooltip key={tool.name}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`h-8 px-3 group flex items-center gap-2 whitespace-nowrap ${getToolColor(tool.name)}`}
                onClick={() => onSelectTool(tool)}
              >
                {getToolIcon(tool.name)}
                <span className="text-xs">{tool.name}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{tool.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
