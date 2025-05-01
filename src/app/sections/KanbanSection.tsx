'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn } from '@/components/KanbanColumn';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';

interface Task {
  id: UniqueIdentifier;
  content: string;
  phase: string;
  priority: string;
}

interface TasksState {
  [key: string]: Task[];
}

const initialTasks: TasksState = {
  todo: [
    { id: 'task-1', content: 'Audit current tech stack', phase: 'Phase 1', priority: 'High' },
    { id: 'task-2', content: 'Define initial KPIs', phase: 'Phase 1', priority: 'Medium' },
    { id: 'task-3', content: 'Document existing processes', phase: 'Phase 1', priority: 'Medium' },
  ],
  inprogress: [
    { id: 'task-4', content: 'Map customer journey', phase: 'Phase 1', priority: 'High' },
    { id: 'task-5', content: 'Evaluate AI vendors', phase: 'Phase 1', priority: 'Medium' },
  ],
  done: [
    { id: 'task-6', content: 'Identify key processes', phase: 'Phase 1', priority: 'High' },
    { id: 'task-7', content: 'Initial team training', phase: 'Phase 1', priority: 'Medium' },
  ],
};

const columnTitles = {
  todo: 'To Do',
  inprogress: 'In Progress',
  done: 'Done',
};

export default function KanbanSection() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<TasksState>(initialTasks);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [aiGoalInput, setAiGoalInput] = useState('');
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  function findContainer(id: UniqueIdentifier) {
    if (id in tasks) return id;

    for (const [containerId, containerTasks] of Object.entries(tasks)) {
      if (containerTasks.some(task => task.id === id)) {
        return containerId;
      }
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) return;

    if (activeContainer !== overContainer) {
      setTasks(prev => {
        const activeItems = prev[activeContainer];
        const overItems = prev[overContainer];

        const activeIndex = activeItems.findIndex(item => item.id === activeId);
        const overIndex = overItems.findIndex(item => item.id === overId);

        let newIndex: number;
        if (overId in prev) {
          newIndex = overItems.length + 1;
        } else {
          const isBelowOverItem = over && active.rect.current.translated &&
            active.rect.current.translated.top > over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;

          newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }

        const updatedTasks = {
          ...prev,
          [activeContainer]: [
            ...prev[activeContainer].filter(item => item.id !== active.id)
          ],
          [overContainer]: [
            ...prev[overContainer].slice(0, newIndex),
            tasks[activeContainer][activeIndex],
            ...prev[overContainer].slice(newIndex)
          ]
        };

        return updatedTasks;
      });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      setTasks(prev => {
        const items = prev[activeContainer];
        const oldIndex = items.findIndex(item => item.id === activeId);
        const newIndex = items.findIndex(item => item.id === overId);

        return {
          ...prev,
          [activeContainer]: arrayMove(items, oldIndex, newIndex),
        };
      });
    } else {
      setTasks(prev => {
        const activeItems = [...prev[activeContainer]];
        const overItems = [...prev[overContainer]];
        const activeIndex = activeItems.findIndex(item => item.id === activeId);
        const overIndex = overItems.findIndex(item => item.id === overId);

        let newIndex: number;
        if (overId in prev) {
          newIndex = overItems.length;
        } else {
          newIndex = overIndex >= 0 ? overIndex : overItems.length;
        }

        const item = activeItems[activeIndex];
        activeItems.splice(activeIndex, 1);
        overItems.splice(newIndex, 0, item);

        return {
          ...prev,
          [activeContainer]: activeItems,
          [overContainer]: overItems,
        };
      });
    }
  }

  const handleGenerateTasks = async () => {
    const goal = aiGoalInput.trim();
    if (!goal) {
      toast({ title: "Input Required", description: "Please enter a goal or phase to generate tasks.", variant: "destructive" });
      return;
    }
    setIsGeneratingTasks(true);

    // Updated System Prompt for better JSON reliability
    const systemPrompt = `You are an assistant helping plan AI implementation for marketing agencies. Generate 3-5 actionable tasks based on the user's goal. Respond ONLY with a valid JSON object containing a single key "tasks" which holds an array of task objects. Each task object must have the following keys: 'content' (string, the task description), 'phase' (string, e.g., 'Phase 1', 'Phase 2', 'Phase 3'), and 'priority' (string, e.g., 'High', 'Medium', 'Low'). Do not include any other text, explanations, markdown formatting, or code block fences before or after the JSON object. Example format: {"tasks": [{"content": "Task 1", "phase": "Phase X", "priority": "Medium"}]}`;
    const userPrompt = `User Goal: ${goal}. Generate the tasks in the specified JSON format.`;

    try {
      console.log("Sending AI Task Generation Request...");
      const response = await fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { "type": "json_object" }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", response.status, errorText);
        throw new Error(`AI API request failed: ${response.status}`);
      }

      const result = await response.json();
      console.log("AI Raw Response:", result);
      const aiContentString = result?.choices?.[0]?.message?.content;

      if (!aiContentString) {
        console.error("AI response content is missing:", result);
        throw new Error("AI response content is missing.");
      }

      // Parse the JSON *string* returned by the AI
      let parsedData;
      try {
        console.log("Attempting to parse AI content string:", aiContentString);
        parsedData = JSON.parse(aiContentString);
      } catch (parseError) {
        console.error("Failed to parse AI JSON response string:", aiContentString, parseError);
        throw new Error("AI returned invalid JSON format.");
      }

      // Validate the structure {"tasks": [...]}
      const generatedTasks = parsedData?.tasks;
      if (!Array.isArray(generatedTasks)) {
        console.error("Parsed data does not contain a 'tasks' array:", parsedData);
        throw new Error("AI response structure is incorrect (missing 'tasks' array).");
      }

      // Validate individual tasks (basic check)
      const validTasks = generatedTasks.filter(task =>
        task && // Check if task object exists
        typeof task.content === 'string' && task.content.trim() !== '' &&
        typeof task.phase === 'string' && task.phase.trim() !== '' &&
        typeof task.priority === 'string' && task.priority.trim() !== ''
      );

      if (validTasks.length === 0) {
        console.warn("No valid tasks found in AI response:", generatedTasks);
        throw new Error("AI generated response, but no valid tasks found.");
      }

      const newTasksWithIds = validTasks.map(task => ({
        ...task,
        id: uuidv4(), // Assign unique ID
      }));

      console.log("Adding new tasks:", newTasksWithIds);
      setTasks(prevTasks => ({
        ...prevTasks,
        todo: [...newTasksWithIds, ...prevTasks.todo], // Add to 'To Do' column
      }));

      setAiGoalInput(''); // Clear input on success
      toast({ title: "Success!", description: `${newTasksWithIds.length} tasks generated and added to 'To Do'.` });

    } catch (error) {
      console.error("Error in handleGenerateTasks:", error);
      toast({
        title: "Error Generating Tasks",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  return (
    <div className="space-y-8 text-white max-w-7xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Kanban Task View</h1>
        <h2 className="text-xl font-semibold text-gray-400">Manage Implementation Tasks</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <Input
          type="text"
          placeholder="Enter goal for AI tasks (e.g., Phase 2 deployment)"
          value={aiGoalInput}
          onChange={(e) => setAiGoalInput(e.target.value)}
          disabled={isGeneratingTasks}
          className="flex-grow bg-[#111111] border-gray-400 placeholder:text-gray-400 text-white"
        />
        <Button onClick={handleGenerateTasks} disabled={isGeneratingTasks} className="w-full sm:w-auto">
          {isGeneratingTasks ? "Generating..." : "Generate Tasks with AI"}
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(tasks).map(([columnId, columnTasks]) => (
            <KanbanColumn
              key={columnId}
              id={columnId}
              title={columnTitles[columnId as keyof typeof columnTitles]}
              tasks={columnTasks}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
} 