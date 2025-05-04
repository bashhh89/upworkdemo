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
import { PlusCircle, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Task {
  id: UniqueIdentifier;
  content: string;
  phase: string;
  priority: string;
  pipelineId: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  created?: string;
  labels?: string[];
}

// Define Pipeline interface
interface Pipeline {
  id: string;
  name: string;
  type: string; // e.g., 'tasks', 'leads', 'custom'
  stages: string[]; // Array of stage names (columns)
  customFields?: {
    id: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
  }[];
}

interface TasksState {
  [pipelineId: string]: {
    [stage: string]: Task[];
  };
}

// Add this interface for task types to handle different pipeline contexts
interface TaskTypeConfig {
  [pipelineType: string]: {
    itemName: string;  // What we call items in this pipeline (task, lead, candidate, etc.)
    fields: {
      name: string;
      label: string;
      type: 'text' | 'textarea' | 'select' | 'date';
      required?: boolean;
      options?: { value: string; label: string }[];
    }[];
  };
}

// Configuration for different pipeline types
const PIPELINE_TYPE_CONFIG: TaskTypeConfig = {
  'tasks': {
    itemName: 'Task',
    fields: [
      { name: 'content', label: 'Task Description', type: 'textarea', required: true },
      { name: 'priority', label: 'Priority', type: 'select', 
        options: [
          { value: 'High', label: 'High' },
          { value: 'Medium', label: 'Medium' },
          { value: 'Low', label: 'Low' }
        ]
      }
    ]
  },
  'leads': {
    itemName: 'Lead',
    fields: [
      { name: 'content', label: 'Company/Lead Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'priority', label: 'Priority', type: 'select',
        options: [
          { value: 'High', label: 'High Value' },
          { value: 'Medium', label: 'Medium Value' },
          { value: 'Low', label: 'Low Value' }
        ]
      },
      { name: 'dueDate', label: 'Follow-up Date', type: 'date' }
    ]
  },
  'recruitment': {
    itemName: 'Candidate',
    fields: [
      { name: 'content', label: 'Candidate Name', type: 'text', required: true },
      { name: 'description', label: 'Notes', type: 'textarea' },
      { name: 'priority', label: 'Experience Level', type: 'select',
        options: [
          { value: 'High', label: 'Senior' },
          { value: 'Medium', label: 'Mid-level' },
          { value: 'Low', label: 'Junior' }
        ]
      }
    ]
  },
  'custom': {
    itemName: 'Item',
    fields: [
      { name: 'content', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'priority', label: 'Priority', type: 'select',
        options: [
          { value: 'High', label: 'High' },
          { value: 'Medium', label: 'Medium' },
          { value: 'Low', label: 'Low' }
        ]
      }
    ]
  }
};

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
    name: 'Sales Leads',
    type: 'leads',
    stages: ['New Lead', 'Contacted', 'Qualified', 'Closed'],
  },
  {
    id: 'recruitment-pipeline',
    name: 'Recruitment',
    type: 'recruitment', 
    stages: ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'],
  }
];

// Mock Task Data (updated to include all pipeline types)
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
      { id: 'lead-1', content: 'Acme Corporation', phase: 'New Lead', priority: 'High', pipelineId: 'leads-pipeline', description: 'Interested in AI solutions' },
      { id: 'lead-2', content: 'TechStart Inc.', phase: 'New Lead', priority: 'Medium', pipelineId: 'leads-pipeline', description: 'Small startup looking for marketing automation' },
    ],
    'Contacted': [],
    'Qualified': [],
    'Closed': [],
  },
  'recruitment-pipeline': {
    'Applied': [
      { id: 'candidate-1', content: 'John Smith', phase: 'Applied', priority: 'High', pipelineId: 'recruitment-pipeline', description: 'Frontend Developer with 5 years experience' },
      { id: 'candidate-2', content: 'Lisa Johnson', phase: 'Applied', priority: 'Medium', pipelineId: 'recruitment-pipeline', description: 'UI/UX Designer' },
    ],
    'Screening': [],
    'Interview': [],
    'Offer': [],
    'Hired': [],
  }
};

// Add this to keep track of form field values for different fields
interface FormValues {
  [key: string]: string;
}

// Add this new interface for creating a task directly via modal
interface AddTaskModalState {
  isOpen: boolean;
  stageName: string;
}

export default function KanbanSection() {
  const { toast } = useToast();
  const [pipelines, setPipelines] = useState<Pipeline[]>(initialPipelines);
  const [activePipelineId, setActivePipelineId] = useState(initialPipelines[0].id);
  const [tasks, setTasks] = useState<TasksState>(initialTasks);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [aiGoalInput, setAiGoalInput] = useState('');
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

  // State for the modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  
  // New state for add task modal
  const [addTaskModal, setAddTaskModal] = useState<AddTaskModalState>({
    isOpen: false,
    stageName: ''
  });
  const [formValues, setFormValues] = useState<FormValues>({
    content: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
  });

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

  // Get current pipeline type
  const activePipelineType = useMemo(() => {
    return pipelines.find(p => p.id === activePipelineId)?.type || 'custom';
  }, [pipelines, activePipelineId]);

  // Get the item name based on pipeline type
  const currentItemName = useMemo(() => {
    return PIPELINE_TYPE_CONFIG[activePipelineType]?.itemName || 'Item';
  }, [activePipelineType]);

  // Get the fields for the current pipeline type
  const currentFields = useMemo(() => {
    return PIPELINE_TYPE_CONFIG[activePipelineType]?.fields || PIPELINE_TYPE_CONFIG.custom.fields;
  }, [activePipelineType]);

  // Handler to open Add Task modal
  const handleOpenAddTaskModal = (stageName: string) => {
    setAddTaskModal({
      isOpen: true,
      stageName
    });

    // Reset form values
    const initialValues: FormValues = {};
    currentFields.forEach(field => {
      if (field.name === 'priority' && field.options && field.options.length > 0) {
        initialValues[field.name] = field.options[1]?.value || field.options[0]?.value || '';
      } else {
        initialValues[field.name] = '';
      }
    });
    setFormValues(initialValues);
  };

  // Handler to close Add Task modal
  const handleCloseAddTaskModal = () => {
    setAddTaskModal({
      isOpen: false,
      stageName: ''
    });
  };

  // Handler to save a new task from modal
  const handleSaveNewTask = () => {
    // Check required fields
    const contentField = currentFields.find(f => f.name === 'content');
    if (contentField?.required && !formValues.content?.trim()) {
      toast({ 
        title: "Error", 
        description: `${contentField.label} cannot be empty`, 
        variant: "destructive" 
      });
      return;
    }

    const newTask = {
      id: uuidv4(),
      content: formValues.content?.trim(),
      description: formValues.description || undefined,
      dueDate: formValues.dueDate || undefined,
      phase: addTaskModal.stageName,
      priority: formValues.priority || 'Medium',
      pipelineId: activePipelineId,
    };

    addTaskManually(newTask, addTaskModal.stageName, activePipelineId);
    handleCloseAddTaskModal();
  };

  // Handler to update form values
  const handleFormChange = (field: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handler to save a new pipeline
  const handleSaveNewPipeline = (newPipeline: Pipeline) => {
    setPipelines([...pipelines, newPipeline]);
    setTasks({ ...tasks, [newPipeline.id]: Object.fromEntries(newPipeline.stages.map(stage => [stage, []])) });
    handleCloseCustomizationModal();
    toast({ title: "Success!", description: `Pipeline "${newPipeline.name}" created.` });
  };

  // Function to add a task manually
  const addTaskManually = (taskData: Task, targetStageName: string, targetPipelineId: string) => {
    setTasks(prevTasks => {
      const updatedPipelineTasks = { ...prevTasks[targetPipelineId] };
      if (updatedPipelineTasks[targetStageName]) {
        updatedPipelineTasks[targetStageName] = [taskData, ...updatedPipelineTasks[targetStageName]];
      } else {
        updatedPipelineTasks[targetStageName] = [taskData];
      }
      return {
        ...prevTasks,
        [targetPipelineId]: updatedPipelineTasks,
      };
    });
    toast({ title: "Success!", description: `Task "${taskData.content}" added to stage "${targetStageName}".` });
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
    <div className="space-y-6 text-zinc-200 max-w-7xl mx-auto px-4">
      {/* Page Title */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-zinc-100">Kanban Task View</h1>
        <h2 className="text-base text-zinc-400">Manage Implementation Tasks Across Pipelines</h2>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/50">
        {/* Pipeline Selection */}
        <div className="flex items-center gap-3">
          <span className="text-zinc-400 text-sm font-medium">Pipeline:</span>
          <Select value={activePipelineId} onValueChange={setActivePipelineId}>
            <SelectTrigger className="w-[240px] bg-zinc-900 border-zinc-700 text-zinc-200 rounded-md focus:ring-zinc-600 focus-visible:ring-offset-zinc-900">
              <SelectValue placeholder="Select a pipeline" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-200 rounded-md">
              {pipelines.map(pipeline => (
                <SelectItem
                  key={pipeline.id}
                  value={pipeline.id}
                  className="focus:bg-zinc-800 focus:text-zinc-200"
                >
                  {pipeline.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Only show AI task generation for tasks pipeline */}
          {activePipelineId === 'tasks-pipeline' && (
            <div className="relative flex-grow w-full md:w-auto">
              <Input
                id="ai-task-input"
                type="text"
                placeholder="Generate tasks with AI..."
                value={aiGoalInput}
                onChange={(e) => setAiGoalInput(e.target.value)}
                disabled={isGeneratingTasks}
                className="pr-[130px] bg-zinc-800/80 border-zinc-700/50 text-zinc-200 placeholder:text-zinc-500 rounded-md h-10 focus-visible:ring-zinc-600 focus-visible:ring-offset-zinc-900"
              />
              <Button 
                onClick={handleGenerateTasks} 
                disabled={isGeneratingTasks || !aiGoalInput.trim()} 
                className="absolute right-0 top-0 rounded-l-none bg-zinc-700 hover:bg-zinc-600 text-zinc-200 font-medium h-10 px-3 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-blue-300" />
                {isGeneratingTasks ? "Generating..." : "Generate"}
              </Button>
            </div>
          )}
          
          <Button
            onClick={() => setIsCustomizationModalOpen(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-md flex items-center gap-1.5 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4 text-blue-300" />
            Create Pipeline
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto custom-scrollbar pb-4">
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            {activePipeline.stages.map((stage) => (
              <KanbanColumn
                key={stage}
                id={stage}
                title={stage}
                tasks={tasksForActivePipeline[stage] || []}
                onCardClick={handleCardClick}
                handleAddTaskClick={() => handleOpenAddTaskModal(stage)}
                activePipelineId={activePipelineId}
                itemName={currentItemName}
              />
            ))}
          </div>
        </div>
      </DndContext>

      {/* Render the Task Detail Modal */}
      <KanbanTaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />

      {/* Render the Pipeline Customization Modal */}
      <PipelineCustomizationModal
        isOpen={isCustomizationModalOpen}
        onClose={handleCloseCustomizationModal}
        onSave={handleSaveNewPipeline}
      />

      {/* Add Task Modal - updated for dynamic fields */}
      <Dialog open={addTaskModal.isOpen} onOpenChange={handleCloseAddTaskModal}>
        <DialogContent className="bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-md p-0 overflow-hidden shadow-xl">
          <DialogHeader className="px-6 pt-6 pb-5 border-b border-zinc-900">
            <DialogTitle className="text-xl font-semibold text-zinc-100">
              Add New {currentItemName}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 mt-1">
              Create a {currentItemName.toLowerCase()} in the "{addTaskModal.stageName}" stage
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-5 p-6">
            {currentFields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label htmlFor={`field-${field.name}`} className="block text-sm font-medium text-zinc-300">
                  {field.label} {field.required && <span className="text-red-400">*</span>}
                </label>
                
                {field.type === 'textarea' && (
                  <Textarea
                    id={`field-${field.name}`}
                    value={formValues[field.name] || ''}
                    onChange={(e) => handleFormChange(field.name, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    className="bg-zinc-800/80 border-zinc-700/50 text-zinc-200 placeholder:text-zinc-500 rounded-md min-h-[80px] p-3 focus-visible:ring-zinc-600 focus-visible:ring-offset-zinc-900"
                  />
                )}
                
                {field.type === 'text' && (
                  <Input
                    id={`field-${field.name}`}
                    value={formValues[field.name] || ''}
                    onChange={(e) => handleFormChange(field.name, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    className="w-full bg-zinc-800/80 border-zinc-700/50 text-zinc-200 placeholder:text-zinc-500 rounded-md h-10 focus-visible:ring-zinc-600 focus-visible:ring-offset-zinc-900"
                  />
                )}
                
                {field.type === 'select' && field.options && (
                  <Select 
                    value={formValues[field.name] || ''} 
                    onValueChange={(value) => handleFormChange(field.name, value)}
                  >
                    <SelectTrigger className="w-full bg-zinc-800/80 border-zinc-700/50 text-zinc-200 rounded-md focus:ring-zinc-600 focus-visible:ring-offset-zinc-900">
                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-200 rounded-md">
                      {field.options.map(option => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value} 
                          className="focus:bg-zinc-800 focus:text-zinc-200"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {field.type === 'date' && (
                  <Input
                    id={`field-${field.name}`}
                    type="date"
                    value={formValues[field.name] || ''}
                    onChange={(e) => handleFormChange(field.name, e.target.value)}
                    className="w-full bg-zinc-800/80 border-zinc-700/50 text-zinc-200 placeholder:text-zinc-500 rounded-md h-10 focus-visible:ring-zinc-600 focus-visible:ring-offset-zinc-900"
                  />
                )}
              </div>
            ))}
            
            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800/80 mt-2">
              <Button
                onClick={handleCloseAddTaskModal}
                variant="ghost"
                className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveNewTask}
                disabled={!formValues.content?.trim()}
                className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200 font-medium rounded-md"
              >
                Add {currentItemName}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}