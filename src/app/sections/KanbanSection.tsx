
'use client';

import { useState, useMemo } from 'react'; // Added useMemo
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Imported Shadcn Select components
import { KanbanTaskDetailModal } from '@/components/kanban-task-detail-modal';
import { PipelineCustomizationModal } from '@/components/pipeline-customization-modal'; // Import the new modal

interface Task {
  id: UniqueIdentifier;
  content: string;
  phase: string; // Corresponds to a stage name
  priority: string;
  pipelineId: string; // Added pipelineId
}

// Define Pipeline interface
interface Pipeline {
  id: string;
  name: string;
  type: string; // e.g., 'tasks', 'leads', 'custom'
  stages: string[]; // Array of stage names (columns)
}

interface TasksState {
  [pipelineId: string]: {
    [stage: string]: Task[];
  };
}

// Mock Pipeline Data
const initialPipelines: Pipeline[] = [
  {
    id: 'tasks-pipeline',
    name: 'Task Management',
    type: 'tasks',
    stages: ['To Do', 'In Progress', 'Done'],
  },
  {
    id: 'leads-pipeline',
    name: 'Sales Leads [Planned]',
    type: 'leads',
    stages: ['New Lead', 'Contacted', 'Qualified', 'Closed'],
  },
];

// Mock Task Data (updated to include pipelineId)
const initialTasks: TasksState = {
  'tasks-pipeline': {
    'To Do': [
      { id: 'task-1', content: 'Audit current tech stack', phase: 'To Do', priority: 'High', pipelineId: 'tasks-pipeline' },
      { id: 'task-2', content: 'Define initial KPIs', phase: 'To Do', priority: 'Medium', pipelineId: 'tasks-pipeline' },
      { id: 'task-3', content: 'Document existing processes', phase: 'To Do', priority: 'Medium', pipelineId: 'tasks-pipeline' },
    ],
    'In Progress': [
      { id: 'task-4', content: 'Map customer journey', phase: 'In Progress', priority: 'High', pipelineId: 'tasks-pipeline' },
      { id: 'task-5', content: 'Evaluate AI vendors', phase: 'In Progress', priority: 'Medium', pipelineId: 'tasks-pipeline' },
    ],
    'Done': [
      { id: 'task-6', content: 'Identify key processes', phase: 'Done', priority: 'High', pipelineId: 'tasks-pipeline' },
      { id: 'task-7', content: 'Initial team training', phase: 'Done', priority: 'Medium', pipelineId: 'tasks-pipeline' },
    ],
  },
  'leads-pipeline': {
    'New Lead': [
       { id: 'lead-1', content: 'Contact potential client A', phase: 'New Lead', priority: 'High', pipelineId: 'leads-pipeline' },
       { id: 'lead-2', content: 'Research company B', phase: 'New Lead', priority: 'Medium', pipelineId: 'leads-pipeline' },
    ],
    'Contacted': [],
    'Qualified': [],
    'Closed': [],
  },
};


export default function KanbanSection() {
  const { toast } = useToast();
  const [pipelines, setPipelines] = useState<Pipeline[]>(initialPipelines);
  const [activePipelineId, setActivePipelineId] = useState(initialPipelines[0].id);
  const [tasks, setTasks] = useState<TasksState>(initialTasks); // Tasks are now nested by pipeline and stage
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [aiGoalInput, setAiGoalInput] = useState(''); // Used for task generation (specific to task pipeline)
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

  // State for the modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // Renamed for clarity
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false); // State for customization modal

  // Handler for card click (Detail Modal)
  const handleCardClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  // Handler to close the Detail Modal
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTask(null);
  };

   // Handler to close the Customization Modal
  const handleCloseCustomizationModal = () => {
    setIsCustomizationModalOpen(false);
  };

  // Handler to save a new pipeline
  const handleSaveNewPipeline = (newPipeline: Pipeline) => {
    setPipelines([...pipelines, newPipeline]);
    // Optionally set the new pipeline as active: setActivePipelineId(newPipeline.id);
    setTasks({ ...tasks, [newPipeline.id]: Object.fromEntries(newPipeline.stages.map(stage => [stage, []])) }); // Initialize empty tasks for new pipeline
    handleCloseCustomizationModal();
    toast({ title: "Success!", description: `Pipeline "${newPipeline.name}" created.` });
  };


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Get the currently active pipeline
  const activePipeline = useMemo(() => {
    return pipelines.find(p => p.id === activePipelineId);
  }, [pipelines, activePipelineId]);

  // Get tasks for the active pipeline, grouped by stage
   const activePipelineTasks = useMemo(() => {
    return tasks[activePipelineId] || {};
  }, [tasks, activePipelineId]);


  // Find container logic updated for nested structure
  function findContainer(id: UniqueIdentifier, currentTasks: TasksState) {
     for (const [pipelineId, pipelineTasks] of Object.entries(currentTasks)) {
       for (const [stage, stageTasks] of Object.entries(pipelineTasks)) {
         if (stageTasks.some(task => task.id === id)) {
           return { pipelineId, stage };
         }
       }
     }
     return null; // Task not found
   }


  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || !activePipeline) return; // Ensure activePipeline exists

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeLocation = findContainer(activeId, tasks); // Updated findContainer call
    // Over can be a task (move within stage/pipeline) or a column (move to new stage/pipeline)
    const overLocation = findContainer(overId, tasks); // Check if overId is a task

    const overIsColumn = activePipeline.stages.includes(String(overId)); // Check if overId is a stage in the active pipeline

    if (!activeLocation) return; // Should not happen if activeId is a task

    // If dragging over a column title within the active pipeline
    if (overIsColumn && activeLocation.pipelineId === activePipelineId) {
        const destinationStage = String(overId);
        setTasks(prevTasks => {
            const taskToMove = prevTasks[activeLocation.pipelineId][activeLocation.stage].find(task => task.id === activeId);
            if (!taskToMove) return prevTasks;

            const updatedTasks = { ...prevTasks };
            // Remove task from old stage
            updatedTasks[activeLocation.pipelineId][activeLocation.stage] = updatedTasks[activeLocation.pipelineId][activeLocation.stage].filter(task => task.id !== activeId);
            // Add task to new stage, update its phase
            updatedTasks[activeLocation.pipelineId][destinationStage] = [...updatedTasks[activeLocation.pipelineId][destinationStage], { ...taskToMove, phase: destinationStage }];

            return updatedTasks;
        });
        return; // Stop further processing if moved to a column
    }


     // If dragging over another task (either in the same or different stage/pipeline)
     if (overLocation) {
       setTasks(prevTasks => {
         const taskToMove = prevTasks[activeLocation.pipelineId][activeLocation.stage].find(task => task.id === activeId);
         if (!taskToMove) return prevTasks;

         const updatedTasks = { ...prevTasks };

         // Remove from old location
         updatedTasks[activeLocation.pipelineId][activeLocation.stage] = updatedTasks[activeLocation.pipelineId][activeLocation.stage].filter(task => task.id !== activeId);

         // Add to new location
         const overItems = updatedTasks[overLocation.pipelineId][overLocation.stage];
         const overIndex = overItems.findIndex(item => item.id === overId);

         const newPhase = overLocation.stage; // New phase is the stage of the over task

         if (overIndex >= 0) {
            // Insert before the over task
            updatedTasks[overLocation.pipelineId][overLocation.stage].splice(overIndex, 0, { ...taskToMove, phase: newPhase, pipelineId: overLocation.pipelineId });
         } else {
             // Should not happen if overLocation is a task, but as fallback
            updatedTasks[overLocation.pipelineId][overLocation.stage].push({ ...taskToMove, phase: newPhase, pipelineId: overLocation.pipelineId });
         }

         return updatedTasks;
       });
     }
   }


  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!activePipeline) return; // Ensure activePipeline exists

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeLocation = findContainer(activeId, tasks);
    const overLocation = findContainer(overId, tasks);
    const overIsColumn = activePipeline.stages.includes(String(overId)); // Check if overId is a stage in the active pipeline


    if (!activeLocation) return; // Should not happen if activeId is a task

    // Handle drops onto a column title within the active pipeline
    if (overIsColumn && activeLocation.pipelineId === activePipelineId) {
        const destinationStage = String(overId);
         setTasks(prevTasks => {
            const taskToMove = prevTasks[activeLocation.pipelineId][activeLocation.stage].find(task => task.id === activeId);
             if (!taskToMove) return prevTasks;

             const updatedTasks = { ...prevTasks };
             // Remove task from old stage
             updatedTasks[activeLocation.pipelineId][activeLocation.stage] = updatedTasks[activeLocation.pipelineId][activeLocation.stage].filter(task => task.id !== activeId);
             // Add task to new stage, update its phase
             updatedTasks[activeLocation.pipelineId][destinationStage] = [...updatedTasks[activeLocation.pipelineId][destinationStage], { ...taskToMove, phase: destinationStage }];

             return updatedTasks;
         });
         return;
    }


    // Handle drops onto another task
    if (overLocation) {
       setTasks(prevTasks => {
         const taskToMove = prevTasks[activeLocation.pipelineId][activeLocation.stage].find(task => task.id === activeId);
          if (!taskToMove) return prevTasks;

         const updatedTasks = { ...prevTasks };

         // Remove from old location
         updatedTasks[activeLocation.pipelineId][activeLocation.stage] = updatedTasks[activeLocation.pipelineId][activeLocation.stage].filter(task => task.id !== activeId);

         // Add to new location using arrayMove
         const overItems = updatedTasks[overLocation.pipelineId][overLocation.stage];
         const oldIndex = prevTasks[activeLocation.pipelineId][activeLocation.stage].findIndex(task => task.id === activeId); // Use previous state for old index
         const newIndex = overItems.findIndex(item => item.id === overId);
         const newPhase = overLocation.stage; // New phase is the stage of the over task

         // If moving within the same stage/pipeline, use arrayMove
         if (activeLocation.pipelineId === overLocation.pipelineId && activeLocation.stage === overLocation.stage) {
            updatedTasks[activeLocation.pipelineId][activeLocation.stage] = arrayMove(overItems, oldIndex, newIndex).map(task => ({...task, phase: newPhase})); // Ensure phase is correct after move
         } else {
            // Moving to a different stage/pipeline, insert the task
             updatedTasks[overLocation.pipelineId][overLocation.stage] = [
                ...overItems.slice(0, newIndex),
                { ...taskToMove, phase: newPhase, pipelineId: overLocation.pipelineId },
                ...overItems.slice(newIndex)
             ];
         }

         return updatedTasks;
       });
     }
   }


  // Generate tasks function - specific to the 'tasks-pipeline'
  const handleGenerateTasks = async () => {
     if (activePipelineId !== 'tasks-pipeline') {
        toast({ title: "Feature Limited", description: "AI Task Generation is currently only available for the 'Task Management' pipeline.", variant: "default" });
        return;
     }

    const goal = aiGoalInput.trim();
    if (!goal) {
      toast({ title: "Input Required", description: "Please enter a goal or phase to generate tasks.", variant: "destructive" });
      return;
    }
    setIsGeneratingTasks(true);

    // Updated System Prompt for better JSON reliability
    const systemPrompt = `You are an assistant helping plan AI implementation for marketing agencies. Generate 3-5 actionable tasks based on the user's goal. Respond ONLY with a valid JSON object containing a single key "tasks" which holds an array of task objects. Each task object must have the following keys: 'content' (string, the task description), 'phase' (string, e.g., 'To Do', 'In Progress', 'Done' based on the Task Management pipeline stages), and 'priority' (string, e.g., 'High', 'Medium', 'Low'). Do not include any other text, explanations, markdown formatting, or code block fences before or after the JSON object. Example format: {"tasks": [{"content": "Task 1", "phase": "To Do", "priority": "Medium"}]}`;
    const userPrompt = `User Goal: ${goal}. Generate the tasks for the Task Management pipeline in the specified JSON format.`;


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

      // Validate individual tasks and assign to active pipeline/stage
      const newTasksWithIds = generatedTasks
        .filter(task =>
          task &&
          typeof task.content === 'string' && task.content.trim() !== '' &&
          typeof task.phase === 'string' && activePipeline?.stages.includes(task.phase) && // Validate phase against active pipeline stages
          typeof task.priority === 'string' && task.priority.trim() !== ''
        )
        .map(task => ({
          ...task,
          id: uuidv4(),
          pipelineId: activePipelineId, // Assign to the active pipeline
        }));

      if (newTasksWithIds.length === 0) {
        console.warn("No valid tasks found in AI response or phases did not match active pipeline stages:", generatedTasks);
         // Provide feedback if stages didn't match
         const aiPhases = generatedTasks.map((task: any) => task.phase).filter((phase: string) => typeof phase === 'string').join(', ');
         const expectedStages = activePipeline?.stages.join(', ');
         throw new Error(`AI generated tasks, but phases didn't match the '${activePipeline?.name}' pipeline stages. AI phases: [${aiPhases}]. Expected stages: [${expectedStages}].`);
      }


      console.log("Adding new tasks:", newTasksWithIds);
      setTasks(prevTasks => {
        const updatedPipelineTasks = { ...prevTasks[activePipelineId] };
        newTasksWithIds.forEach(task => {
          if (updatedPipelineTasks[task.phase]) {
            updatedPipelineTasks[task.phase] = [task, ...updatedPipelineTasks[task.phase]];
          } else {
             // Fallback if AI provided a phase not in the current pipeline stages (should be caught by validation filter)
            console.warn(`AI generated task with phase "${task.phase}" not in active pipeline stages. Adding to first stage.`);
             const firstStage = activePipeline?.stages[0];
             if (firstStage) {
                updatedPipelineTasks[firstStage] = [{...task, phase: firstStage}, ...updatedPipelineTasks[firstStage]];
             } else {
                console.error("Active pipeline has no stages to add task to.");
             }
          }
        });

        return {
          ...prevTasks,
          [activePipelineId]: updatedPipelineTasks,
        };
      });


      setAiGoalInput(''); // Clear input on success
      toast({ title: "Success!", description: `${newTasksWithIds.length} tasks generated and added to '${activePipeline?.name}'.` });

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


  // Filter tasks for the active pipeline
  const tasksForActivePipeline = useMemo(() => {
     return tasks[activePipelineId] || {};
  }, [tasks, activePipelineId]);


  if (!activePipeline) {
    return <div className="text-white">Loading pipeline...</div>; // Or handle error
  }

  return (
    <div className="space-y-8 text-white max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Kanban Task View</h1>
        <h2 className="text-xl font-semibold text-gray-400">Manage Implementation Tasks Across Pipelines</h2> {/* Updated subtitle */}
      </div>

      {/* Pipeline Selection and Creation */}
      <div className="flex items-center gap-6 mb-6"> {/* Generous gap */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-semibold">Pipeline:</span>
          <Select value={activePipelineId} onValueChange={setActivePipelineId}>
            <SelectTrigger className="w-[240px] bg-[#111111] border border-[#333333] text-white rounded-none focus:ring-offset-[#000000]"> {/* Styled Select Trigger */}
              <SelectValue placeholder="Select a pipeline" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0a0a] border border-[#333333] text-white rounded-none"> {/* Styled Select Content */}
              {pipelines.map(pipeline => (
                <SelectItem
                  key={pipeline.id}
                  value={pipeline.id}
                  className="focus:bg-[#333333] focus:text-white" // Styled Select Item on focus
                >
                  {pipeline.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
         <Button
            onClick={() => setIsCustomizationModalOpen(true)}
            className="bg-white text-black font-semibold hover:bg-gray-200 transition-colors duration-150 rounded-none" // Styled Button
          >
            Create New Pipeline
          </Button>
      </div>


       {/* AI Task Generation Input (Only for Task Management Pipeline) */}
       {activePipelineId === 'tasks-pipeline' && (
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <Input
              type="text"
              placeholder="Enter goal for AI tasks (e.g., Phase 2 deployment)"
              value={aiGoalInput}
              onChange={(e) => setAiGoalInput(e.target.value)}
              disabled={isGeneratingTasks}
              className="flex-grow bg-[#111111] border-gray-400 placeholder:text-gray-400 text-white rounded-none" // Styled Input
            />
            <Button onClick={handleGenerateTasks} disabled={isGeneratingTasks} className="w-full sm:w-auto bg-white text-black font-semibold hover:bg-gray-200 transition-colors duration-150 rounded-none"> {/* Styled Button */}
              {isGeneratingTasks ? "Generating..." : "Generate Tasks with AI"}
            </Button>
          </div>
       )}


      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-flow-col md:auto-cols-fr gap-6"> {/* Use a dynamic grid template based on active pipeline stages */}
           {activePipeline.stages.map((stage) => (
             <KanbanColumn
               key={stage} // Use stage name as key
               id={stage} // Use stage name as id for DND context
               title={stage} // Use stage name as title
               tasks={tasksForActivePipeline[stage] || []} // Pass tasks for this stage
               onCardClick={handleCardClick}
             />
           ))}
         </div>
       </DndContext>

       {/* Render the Task Detail Modal */}
       <KanbanTaskDetailModal
         task={selectedTask}
         isOpen={isDetailModalOpen} // Use isDetailModalOpen
         onClose={handleCloseDetailModal} // Use handleCloseDetailModal
       />

       {/* Render the Pipeline Customization Modal */}
       <PipelineCustomizationModal
         isOpen={isCustomizationModalOpen}
         onClose={handleCloseCustomizationModal}
         onSave={handleSaveNewPipeline}
       />
     </div>
   );
 }