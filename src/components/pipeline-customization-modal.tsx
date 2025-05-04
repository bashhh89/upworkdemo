import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, PlusCircle, ArrowRight, ArrowLeft, Check, Settings, Plus } from 'lucide-react';
import { UniqueIdentifier } from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Pipeline template options with presets
const PIPELINE_TEMPLATES = [
  { 
    id: 'tasks', 
    name: 'Task Management', 
    icon: '📋', 
    description: 'For tracking projects and team tasks',
    stages: ['To Do', 'In Progress', 'Done'],
    defaultFields: [
      { id: 'description', label: 'Description', type: 'textarea', required: false },
      { id: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'], required: true },
      { id: 'assignee', label: 'Assignee', type: 'text', required: false },
      { id: 'due_date', label: 'Due Date', type: 'date', required: false },
    ]
  },
  { 
    id: 'sales', 
    name: 'Sales Pipeline', 
    icon: '💰', 
    description: 'For tracking leads and sales opportunities',
    stages: ['New Lead', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed'],
    defaultFields: [
      { id: 'company', label: 'Company', type: 'text', required: true },
      { id: 'contact', label: 'Contact Person', type: 'text', required: false },
      { id: 'value', label: 'Deal Value', type: 'text', required: false },
      { id: 'description', label: 'Notes', type: 'textarea', required: false },
      { id: 'next_followup', label: 'Next Follow-up', type: 'date', required: false },
    ]
  },
  { 
    id: 'recruitment', 
    name: 'Recruitment', 
    icon: '👥', 
    description: 'For managing hiring and candidate tracking',
    stages: ['Applied', 'Screening', 'Interview', 'Technical Test', 'Offer', 'Hired'],
    defaultFields: [
      { id: 'position', label: 'Position', type: 'text', required: true },
      { id: 'experience', label: 'Experience', type: 'select', options: ['Junior', 'Mid-level', 'Senior'], required: false },
      { id: 'source', label: 'Source', type: 'text', required: false },
      { id: 'resume', label: 'Resume Link', type: 'text', required: false },
      { id: 'notes', label: 'Interview Notes', type: 'textarea', required: false },
    ]
  },
  { 
    id: 'marketing', 
    name: 'Marketing Campaigns', 
    icon: '📢', 
    description: 'For tracking marketing initiatives',
    stages: ['Planning', 'Creating', 'Reviewing', 'Live', 'Analysis'],
    defaultFields: [
      { id: 'campaign', label: 'Campaign Name', type: 'text', required: true },
      { id: 'target', label: 'Target Audience', type: 'text', required: false },
      { id: 'budget', label: 'Budget', type: 'text', required: false },
      { id: 'channels', label: 'Channels', type: 'text', required: false },
      { id: 'start_date', label: 'Start Date', type: 'date', required: false },
      { id: 'end_date', label: 'End Date', type: 'date', required: false },
    ]
  },
  { 
    id: 'custom', 
    name: 'Custom Pipeline', 
    icon: '⚙️', 
    description: 'Build a pipeline for your specific workflow',
    stages: [],
    defaultFields: [
      { id: 'title', label: 'Title', type: 'text', required: true },
      { id: 'description', label: 'Description', type: 'textarea', required: false },
    ]
  }
];

// Field type options
const FIELD_TYPES = [
  { id: 'text', name: 'Text', description: 'Single line of text' },
  { id: 'textarea', name: 'Long Text', description: 'Multiple lines of text' },
  { id: 'select', name: 'Dropdown', description: 'Select from options' },
  { id: 'date', name: 'Date', description: 'Calendar date picker' },
  { id: 'number', name: 'Number', description: 'Numeric values only' },
  { id: 'checkbox', name: 'Checkbox', description: 'Yes/No toggle' },
];

type FieldType = 'text' | 'textarea' | 'select' | 'date' | 'number' | 'checkbox';

interface CustomField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // For select type
}

interface Pipeline {
  id: string;
  name: string;
  type: string;
  stages: string[];
  customFields: CustomField[];
}

interface PipelineCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pipeline: Pipeline) => void;
}

export function PipelineCustomizationModal({ isOpen, onClose, onSave }: PipelineCustomizationModalProps) {
  // Wizard steps: 1. Choose template, 2. Configure stages, 3. Configure fields
  const [step, setStep] = useState(1);
  
  // Pipeline configuration state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [pipelineName, setPipelineName] = useState('');
  const [stages, setStages] = useState<{ id: UniqueIdentifier; name: string }[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  
  // Stage management
  const [currentStageInput, setCurrentStageInput] = useState('');
  
  // Custom field management
  const [currentFieldForm, setCurrentFieldForm] = useState<CustomField>({
    id: '',
    label: '',
    type: 'text',
    required: false,
  });
  const [isAddingField, setIsAddingField] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [optionsInput, setOptionsInput] = useState('');

  // Reset the form when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setStep(1);
    setSelectedTemplate('');
    setPipelineName('');
    setStages([]);
    setCustomFields([]);
    setCurrentStageInput('');
    setCurrentFieldForm({
      id: '',
      label: '',
      type: 'text',
      required: false,
    });
    setIsAddingField(false);
    setEditingFieldId(null);
    setOptionsInput('');
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = PIPELINE_TEMPLATES.find(t => t.id === templateId);
    
    if (template) {
      // Set default name with a unique identifier
      setPipelineName(`${template.name} ${new Date().toLocaleDateString()}`);
      
      // Set default stages from template
      setStages(template.stages.map(stage => ({
        id: uuidv4(),
        name: stage
      })));
      
      // Set default fields from template
      setCustomFields(template.defaultFields.map(field => ({
        id: uuidv4(),
        label: field.label,
        type: field.type as FieldType,
        required: field.required,
        options: field.options,
      })));
    }
  };

  // Stage management
  const handleAddStage = () => {
    const stageName = currentStageInput.trim();
    if (stageName) {
      if (stages.some(stage => stage.name.toLowerCase() === stageName.toLowerCase())) {
        console.warn(`Stage "${stageName}" already exists.`);
        return;
      }
      setStages([...stages, { id: uuidv4(), name: stageName }]);
      setCurrentStageInput('');
    }
  };

  const handleRemoveStage = (id: UniqueIdentifier) => {
    setStages(stages.filter(stage => stage.id !== id));
  };

  // Field management
  const handleAddField = () => {
    if (!currentFieldForm.label.trim()) {
      return;
    }
    
    const newField: CustomField = {
      ...currentFieldForm,
      id: uuidv4(),
      // Parse options if it's a select field
      options: currentFieldForm.type === 'select' 
        ? optionsInput.split(',').map(opt => opt.trim()).filter(opt => opt !== '')
        : undefined
    };
    
    setCustomFields([...customFields, newField]);
    setCurrentFieldForm({
      id: '',
      label: '',
      type: 'text',
      required: false,
    });
    setOptionsInput('');
    setIsAddingField(false);
  };

  const handleRemoveField = (id: string) => {
    setCustomFields(customFields.filter(field => field.id !== id));
  };
  
  const handleEditField = (field: CustomField) => {
    setCurrentFieldForm({...field});
    setEditingFieldId(field.id);
    if (field.type === 'select' && field.options) {
      setOptionsInput(field.options.join(', '));
    }
    setIsAddingField(true);
  };
  
  const handleUpdateField = () => {
    setCustomFields(customFields.map(field => 
      field.id === editingFieldId 
        ? {
            ...currentFieldForm,
            options: currentFieldForm.type === 'select' 
              ? optionsInput.split(',').map(opt => opt.trim()).filter(opt => opt !== '')
              : undefined
          } 
        : field
    ));
    setCurrentFieldForm({
      id: '',
      label: '',
      type: 'text',
      required: false,
    });
    setOptionsInput('');
    setEditingFieldId(null);
    setIsAddingField(false);
  };

  // Pipeline save
  const handleSavePipeline = () => {
    if (!pipelineName.trim() || stages.length === 0) {
      return;
    }
    
    const newPipeline: Pipeline = {
      id: uuidv4(),
      name: pipelineName.trim(),
      type: selectedTemplate,
      stages: stages.map(stage => stage.name),
      customFields: customFields,
    };
    
    onSave(newPipeline);
    resetForm();
    onClose();
  };

  // Navigation
  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSavePipeline();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-md p-0 overflow-hidden shadow-xl">
        <DialogHeader className="bg-zinc-950 px-6 pt-6 pb-5 border-b border-zinc-900">
          <DialogTitle className="text-xl font-semibold text-zinc-100">
            {step === 1 ? 'Create New Pipeline' : 
             step === 2 ? `Configure Stages: ${pipelineName}` : 
             `Configure Fields: ${pipelineName}`}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 mt-1">
            {step === 1 ? 'Choose a template to get started or create a custom pipeline' : 
             step === 2 ? 'Define the stages or columns for your workflow' : 
             'Add custom fields to track information in your pipeline'}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {/* Step 1: Choose Template */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PIPELINE_TEMPLATES.map(template => (
                  <div 
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedTemplate === template.id 
                        ? 'bg-zinc-800/80 border-blue-500/50' 
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{template.icon}</div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-zinc-200">{template.name}</h3>
                        <p className="text-sm text-zinc-400">{template.description}</p>
                      </div>
                      {selectedTemplate === template.id && (
                        <div className="h-5 w-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                          <Check className="h-3 w-3 text-blue-400" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4">
                <label htmlFor="pipeline-name" className="block text-sm font-medium text-zinc-300">
                  Pipeline Name
                </label>
                <Input
                  id="pipeline-name"
                  value={pipelineName}
                  onChange={(e) => setPipelineName(e.target.value)}
                  placeholder="Give your pipeline a name"
                  className="bg-zinc-800/80 border-zinc-700/50 text-zinc-200 placeholder:text-zinc-500 rounded-md h-10 focus-visible:ring-zinc-600 focus-visible:ring-offset-zinc-900"
                />
              </div>
            </div>
          )}

          {/* Step 2: Configure Stages */}
          {step === 2 && (
            <div className="space-y-5">
              <ScrollArea className="h-[280px] pr-4 -mr-4">
                <div className="space-y-3">
                  {stages.map((stage, index) => (
                    <div 
                      key={stage.id} 
                      className="flex items-center justify-between bg-zinc-800/50 border border-zinc-700/30 p-3 pl-5 rounded-md text-zinc-200 group"
                    >
                      <div className="flex items-center">
                        <span className="text-zinc-500 text-sm mr-3">{index + 1}</span>
                        <span>{stage.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStage(stage.id)}
                        className="opacity-60 group-hover:opacity-100 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 h-7 w-7 p-0 rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {stages.length === 0 && (
                    <div className="text-center text-zinc-500 text-sm py-10 border border-dashed border-zinc-700/30 rounded-md bg-zinc-800/20">
                      Add stages to define your pipeline workflow
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="flex gap-2 mt-2">
                <Input
                  value={currentStageInput}
                  onChange={(e) => setCurrentStageInput(e.target.value)}
                  placeholder="New Stage Name"
                  className="flex-grow bg-zinc-800/80 border-zinc-700/50 text-zinc-200 placeholder:text-zinc-500 rounded-md h-10 focus-visible:ring-zinc-600 focus-visible:ring-offset-zinc-900"
                  onKeyPress={(e) => { if (e.key === 'Enter') handleAddStage(); }}
                />
                <Button 
                  onClick={handleAddStage} 
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-md flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4 text-blue-300" />
                  <span>Add</span>
                </Button>
              </div>
              
              <div className="text-sm text-zinc-400 mt-3">
                <p>Add all the stages in your workflow, from start to finish. You can drag and drop to rearrange them later.</p>
              </div>
            </div>
          )}

          {/* Step 3: Configure Fields */}
          {step === 3 && (
            <div className="space-y-5">
              {!isAddingField ? (
                <>
                  <ScrollArea className="h-[280px] pr-4 -mr-4">
                    <div className="space-y-3">
                      {customFields.map((field) => (
                        <div 
                          key={field.id} 
                          className="flex items-center justify-between bg-zinc-800/50 border border-zinc-700/30 p-3 rounded-md text-zinc-200 group"
                        >
                          <div className="flex-grow">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{field.label}</span>
                              {field.required && <span className="text-xs text-red-400">Required</span>}
                            </div>
                            <div className="text-xs text-zinc-400 flex items-center gap-2 mt-1">
                              <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                                {FIELD_TYPES.find(t => t.id === field.type)?.name || field.type}
                              </span>
                              {field.type === 'select' && field.options && (
                                <span className="text-zinc-500">Options: {field.options.join(', ')}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditField(field)}
                              className="opacity-60 group-hover:opacity-100 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 h-7 w-7 p-0 rounded-md"
                            >
                              <Settings className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveField(field.id)}
                              className="opacity-60 group-hover:opacity-100 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 h-7 w-7 p-0 rounded-md"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {customFields.length === 0 && (
                        <div className="text-center text-zinc-500 text-sm py-10 border border-dashed border-zinc-700/30 rounded-md bg-zinc-800/20">
                          Add custom fields to track information in your pipeline
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  
                  <Button 
                    onClick={() => setIsAddingField(true)} 
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-md flex items-center justify-center gap-1.5 mt-2"
                  >
                    <Plus className="w-4 h-4 text-blue-300" />
                    <span>Add New Field</span>
                  </Button>
                </>
              ) : (
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-md p-4 space-y-4">
                  <h3 className="font-medium text-zinc-200 pb-2 border-b border-zinc-800">
                    {editingFieldId ? 'Edit Field' : 'Add New Field'}
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-300">
                      Field Label
                    </label>
                    <Input
                      value={currentFieldForm.label}
                      onChange={(e) => setCurrentFieldForm({...currentFieldForm, label: e.target.value})}
                      placeholder="e.g., Priority, Due Date, Assignee"
                      className="w-full bg-zinc-800/80 border-zinc-700/50 text-zinc-200 placeholder:text-zinc-500 rounded-md"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-300">
                      Field Type
                    </label>
                    <Select 
                      value={currentFieldForm.type} 
                      onValueChange={(value) => setCurrentFieldForm({...currentFieldForm, type: value as FieldType})}
                    >
                      <SelectTrigger className="w-full bg-zinc-800/80 border-zinc-700/50 text-zinc-200 rounded-md">
                        <SelectValue placeholder="Select field type" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-200 rounded-md">
                        {FIELD_TYPES.map(type => (
                          <SelectItem 
                            key={type.id} 
                            value={type.id} 
                            className="focus:bg-zinc-800 focus:text-zinc-200"
                          >
                            <div className="flex flex-col">
                              <span>{type.name}</span>
                              <span className="text-xs text-zinc-400">{type.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {currentFieldForm.type === 'select' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-zinc-300">
                        Options (comma separated)
                      </label>
                      <Input
                        value={optionsInput}
                        onChange={(e) => setOptionsInput(e.target.value)}
                        placeholder="e.g., High, Medium, Low"
                        className="w-full bg-zinc-800/80 border-zinc-700/50 text-zinc-200 placeholder:text-zinc-500 rounded-md"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="field-required"
                      checked={currentFieldForm.required}
                      onChange={(e) => setCurrentFieldForm({...currentFieldForm, required: e.target.checked})}
                      className="rounded border-zinc-700 bg-zinc-800 text-blue-500"
                    />
                    <label htmlFor="field-required" className="text-sm text-zinc-300">
                      This field is required
                    </label>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsAddingField(false);
                        setEditingFieldId(null);
                        setCurrentFieldForm({
                          id: '',
                          label: '',
                          type: 'text',
                          required: false,
                        });
                        setOptionsInput('');
                      }}
                      className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={editingFieldId ? handleUpdateField : handleAddField}
                      disabled={!currentFieldForm.label.trim() || (currentFieldForm.type === 'select' && !optionsInput.trim())}
                      className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
                    >
                      {editingFieldId ? 'Update' : 'Add'} Field
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between p-6 pt-0">
          <Button
            onClick={step === 1 ? onClose : handleBack}
            variant="ghost"
            className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md"
          >
            {step === 1 ? 'Cancel' : (
              <div className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </div>
            )}
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={(step === 1 && (!selectedTemplate || !pipelineName.trim())) ||
                     (step === 2 && stages.length === 0)}
            className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200 font-medium rounded-md flex items-center gap-1.5"
          >
            {step < 3 ? (
              <>
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : 'Create Pipeline'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}