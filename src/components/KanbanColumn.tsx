import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { UniqueIdentifier } from '@dnd-kit/core';
import { KanbanTaskCard } from './KanbanTaskCard';

interface Task {
  id: UniqueIdentifier;
  content: string;
  phase: string;
  priority: string;
}

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
}

export function KanbanColumn({ id, title, tasks }: KanbanColumnProps) {
  return (
    <div className="flex flex-col flex-1 min-h-[200px] bg-[#0a0a0a] p-4 rounded-lg border border-[#333333]">
      <h3 className="font-semibold mb-4 text-white">{title}</h3>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-grow space-y-3">
          {tasks.map((task) => (
            <KanbanTaskCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-4">Drop tasks here</div>
          )}
        </div>
      </SortableContext>
    </div>
  );
} 