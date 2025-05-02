import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react'; // Icon for removing stages
import { UniqueIdentifier } from '@dnd-kit/core'; // Assuming Task interface is similar
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for stages

interface Pipeline {
  id: string;
  name: string;
  type: string; // e.g., 'tasks', 'leads', 'custom'
  stages: string[]; // Array of stage names (columns)
}

interface PipelineCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pipeline: Pipeline) => void;
}

export function PipelineCustomizationModal({ isOpen, onClose, onSave }: PipelineCustomizationModalProps) {
  const [pipelineName, setPipelineName] = useState('');
  // State to manage stages being added/removed in the modal
  const [newPipelineStages, setNewPipelineStages] = useState<{ id: UniqueIdentifier; name: string }[]>([]);
  // State for the input field where the user types a new stage name
  const [currentStageInput, setCurrentStageInput] = useState('');


  const handleAddStage = () => {
    const stageName = currentStageInput.trim();
    if (stageName) {
      // Check if stage name already exists (optional, but good practice)
      if (newPipelineStages.some(stage => stage.name.toLowerCase() === stageName.toLowerCase())) {
          console.warn(`Stage "${stageName}" already exists.`);
          // Optionally show a toast message
          return;
      }
      setNewPipelineStages([...newPipelineStages, { id: uuidv4(), name: stageName }]);
      setCurrentStageInput(''); // Clear input after adding
    }
  };

  const handleRemoveStage = (id: UniqueIdentifier) => {
    setNewPipelineStages(newPipelineStages.filter(stage => stage.id !== id));
  };

  const handleSave = () => {
    if (pipelineName.trim() && newPipelineStages.length > 0) {
      const newPipeline: Pipeline = {
        id: uuidv4(), // Generate unique ID for the pipeline
        name: pipelineName.trim(),
        type: 'custom', // Mark as custom
        stages: newPipelineStages.map(stage => stage.name), // Pass the list of stage names
      };
      onSave(newPipeline); // Call the parent save handler
      // Reset form state
      setPipelineName('');
      setNewPipelineStages([]);
      setCurrentStageInput('');
      onClose();
    } else {
      // Basic validation feedback (could use toast)
      console.warn("Pipeline name and at least one stage are required.");
    }
  };

  // Placeholder for AI Suggestion
  const handleAISuggestStages = () => {
    console.log("AI Suggest Stages button clicked - Placeholder");
    // Implement AI call here in the future
    // For now, maybe add some mock stages
     setNewPipelineStages([
       { id: uuidv4(), name: 'AI Suggested Stage A' },
       { id: uuidv4(), name: 'AI Suggested Stage B' },
        { id: uuidv4(), name: 'AI Suggested Stage C' },
     ]);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl bg-[#0a0a0a] text-white border border-[#333333] rounded-none p-8"> {/* Styled modal */}
        <DialogHeader className="border-b border-[#333333] pb-4 mb-6"> {/* Sharp header with border */}
          <DialogTitle className="text-2xl font-bold text-white">Create New Pipeline</DialogTitle> {/* Title */}
        </DialogHeader>

        <div className="flex flex-col gap-6"> {/* Content area with generous spacing */}
          {/* Pipeline Name Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="pipeline-name" className="font-semibold text-white">Pipeline Name</label>
            <Input
              id="pipeline-name"
              value={pipelineName}
              onChange={(e) => setPipelineName(e.target.value)}
              placeholder="e.g., Client Onboarding, Bug Tracking"
              className="bg-[#000000] border border-[#333333] text-white placeholder:text-gray-500 rounded-none p-3" // Styled Input
            />
          </div>

          {/* Stages Management Area */}
          <div className="flex flex-col gap-4">
            <h4 className="text-lg font-semibold text-white border-b border-[#333333] pb-2">Define Stages</h4> {/* Section title */}
            <div className="flex flex-col gap-2"> {/* List of current stages */}
              {newPipelineStages.map(stage => (
                <div key={stage.id} className="flex items-center justify-between bg-[#1a1a1a] border border-[#333333] p-3 rounded-none text-sm text-white"> {/* Styled stage item */}
                  <span>{stage.name}</span>
                  <Button
                    variant="ghost"
                    onClick={() => handleRemoveStage(stage.id)}
                    className="text-gray-400 hover:text-white hover:bg-transparent p-1 h-auto rounded-none" // Styled remove button
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
               {newPipelineStages.length === 0 && (
                 <div className="text-center text-gray-400 text-sm py-4 border border-dashed border-[#333333] p-4 rounded-none">
                   Add stages here to define your pipeline columns.
                 </div>
               )}
            </div>
             <div className="flex gap-2"> {/* Input and button for adding stages */}
              <Input
                value={currentStageInput}
                onChange={(e) => setCurrentStageInput(e.target.value)}
                placeholder="New Stage Name"
                className="flex-grow bg-[#000000] border border-[#333333] text-white placeholder:text-gray-500 rounded-none p-3" // Styled Input
                onKeyPress={(e) => { if (e.key === 'Enter') handleAddStage(); }} // Add stage on Enter key press
              />
               <Button onClick={handleAddStage} className="bg-white text-black font-semibold hover:bg-gray-200 transition-colors duration-150 rounded-none"> {/* Styled Button */}
                Add Stage
              </Button>
            </div>

             {/* AI Suggestion Button */}
             <Button
               onClick={handleAISuggestStages}
               variant="outline"
               className="bg-[#000000] text-white border border-[#333333] hover:bg-[#1a1a1a] transition-colors duration-150 rounded-none font-semibold self-start" // Styled Button
             >
               Suggest Stages with AI (Placeholder)
             </Button>
          </div>

          {/* Save Button */}
           <Button
             onClick={handleSave}
             className="mt-6 bg-white text-black font-semibold hover:bg-gray-200 transition-colors duration-150 rounded-none self-end" // Styled Button, positioned at the end
           >
            Create Pipeline
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}