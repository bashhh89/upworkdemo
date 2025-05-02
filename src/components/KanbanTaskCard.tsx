import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from "@/components/ui/card";
import { UniqueIdentifier } from '@dnd-kit/core';

interface Task {
  id: UniqueIdentifier;
  content: string;
  phase: string;
  priority: string;
}

interface TaskCardProps {
  task: Task;
  onCardClick: (task: Task) => void; // Added click handler prop
}

export function KanbanTaskCard({ task, onCardClick }: TaskCardProps) { // Destructure new prop
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      {/* Wrapped Card in a clickable div */}
      <div onClick={() => onCardClick(task)} className="cursor-pointer">
        <Card className="mb-3 bg-black border-[#333333] p-3 cursor-pointer"> {/* Changed cursor to pointer */}
          <p className="text-sm font-medium text-white break-words">{task.content}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">{task.phase}</span>
            <span className="text-xs text-gray-400">{task.priority}</span>
          </div>
        </Card>
      </div>
    </div>
  );
} 