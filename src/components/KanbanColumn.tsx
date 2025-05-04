import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { UniqueIdentifier } from '@dnd-kit/core';
import { KanbanTaskCard } from './KanbanTaskCard';
import { Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";

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
  onCardClick: (task: Task) => void;
  handleAddTaskClick: () => void;
  activePipelineId?: string;
  itemName?: string;
}

export function KanbanColumn({ id, title, tasks, onCardClick, handleAddTaskClick, activePipelineId, itemName = 'Task' }: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-[600px] w-[300px] bg-zinc-900/60 p-5 rounded-xl border border-zinc-800 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-zinc-200 text-sm tracking-wide uppercase">{title}</h3>
        <div className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-full">{tasks.length}</div>
      </div>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-grow space-y-3 overflow-y-auto pr-2 pb-2 mb-2 custom-scrollbar">
          {tasks.map((task) => (
            <KanbanTaskCard key={task.id} task={task} onCardClick={onCardClick} />
          ))}
          {tasks.length === 0 && (
            <div className="text-center text-zinc-500 text-sm py-6 border border-dashed border-zinc-800 rounded-lg h-24 flex items-center justify-center">
              No {itemName.toLowerCase()}s yet
            </div>
          )}
        </div>
      </SortableContext>
      
      <Button
        onClick={handleAddTaskClick}
        className="w-full mt-auto bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/40 hover:text-zinc-100 transition-colors rounded-md text-sm h-9 flex items-center justify-center gap-1.5"
      >
        <Plus size={16} className="text-blue-300" />
        Add {itemName}
      </Button>
    </div>
  );
}
