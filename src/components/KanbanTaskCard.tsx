import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from "@/components/ui/card";
import { UniqueIdentifier } from '@dnd-kit/core';
import { Badge } from "@/components/ui/badge";

interface Task {
  id: UniqueIdentifier;
  content: string;
  phase: string;
  priority: string;
}

interface TaskCardProps {
  task: Task;
  onCardClick: (task: Task) => void;
}

export function KanbanTaskCard({ task, onCardClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  // Determine priority color
  const getPriorityColor = () => {
    switch(task.priority.toLowerCase()) {
      case 'high':
        return 'bg-red-900/20 text-red-400 border-red-900/30';
      case 'medium':
        return 'bg-amber-900/20 text-amber-400 border-amber-900/30';
      case 'low':
        return 'bg-green-900/20 text-green-400 border-green-900/30';
      default:
        return 'bg-zinc-800/50 text-zinc-400 border-zinc-800';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <div onClick={() => onCardClick(task)} className="cursor-pointer group">
        <Card className="bg-zinc-800/90 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-700 p-4 rounded-lg shadow-sm transition-all duration-150 min-h-[90px] flex flex-col justify-between">
          <p className="text-sm font-medium text-zinc-200 break-words line-clamp-2 mb-2">{task.content}</p>
          
          <div className="flex justify-between items-center mt-auto pt-2 border-t border-zinc-700/30">
            <Badge variant="outline" className={`text-[10px] px-2 py-0 h-5 rounded font-medium ${getPriorityColor()}`}>
              {task.priority}
            </Badge>
            <span className="text-xs text-zinc-500">{task.phase}</span>
          </div>
        </Card>
      </div>
    </div>
  );
} 