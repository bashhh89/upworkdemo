import React, { useState, useEffect, useRef } from 'react';
import { marketingPromptTemplates, PromptTemplate } from '@/lib/prompt-templates';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import CustomPromptForm from '@/components/CustomPromptForm';

interface PromptStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (promptText: string) => void;
}

const PromptStudioModal: React.FC<PromptStudioModalProps> = ({ isOpen, onClose, onSelectTemplate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedTemplateData, setSelectedTemplateData] = useState<PromptTemplate | null>(null);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [formHeight, setFormHeight] = useState(0);
  // Add state for custom prompts
  const [customPrompts, setCustomPrompts] = useState<PromptTemplate[]>([]);
  // Add state for custom prompt editing
  const [isEditingCustomPrompt, setIsEditingCustomPrompt] = useState(false);
  const [editingPromptData, setEditingPromptData] = useState<PromptTemplate | null>(null);
  
  const formRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  // Monitor form height to adjust padding
  useEffect(() => {
    if (selectedTemplateData && formRef.current) {
      setFormHeight(formRef.current.offsetHeight);
    } else {
      setFormHeight(0);
    }
  }, [selectedTemplateData, placeholderValues]);

  // Scroll to selected template when form appears
  useEffect(() => {
    if (selectedTemplateData && listRef.current) {
      const selectedElement = listRef.current.querySelector(`[data-template-id="${selectedTemplateData.id}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedTemplateData]);

  // Load custom prompts from localStorage when the modal opens
  useEffect(() => {
    if (isOpen) {
      try {
        const savedCustomPrompts = localStorage.getItem('customPromptTemplates');
        if (savedCustomPrompts) {
          const parsedPrompts: PromptTemplate[] = JSON.parse(savedCustomPrompts);
          setCustomPrompts(parsedPrompts);
        }
      } catch (error) {
        console.error('Error loading custom prompts from localStorage:', error);
      }
    }
  }, [isOpen]);

  // Function to save custom prompts to localStorage
  const saveCustomPrompts = (prompts: PromptTemplate[]) => {
    try {
      localStorage.setItem('customPromptTemplates', JSON.stringify(prompts));
    } catch (error) {
      console.error('Error saving custom prompts to localStorage:', error);
    }
  };

  const handlePlaceholderChange = (placeholder: string, value: string) => {
    setPlaceholderValues(prev => ({ ...prev, [placeholder]: value }));
  };

  const handleGeneratePrompt = () => {
    if (!selectedTemplateData) return;

    // Use the promptText from selectedTemplateData, which already has variables substituted
    let finalPrompt = selectedTemplateData.promptText;
    Object.keys(placeholderValues).forEach(placeholder => {
      const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
      finalPrompt = finalPrompt.replace(regex, placeholderValues[placeholder]);
    });

    onSelectTemplate(finalPrompt);
    setSelectedTemplateData(null); // Clear state to hide the form
    setPlaceholderValues({}); // Clear placeholder values
    onClose(); // Close the modal
  };

  const handleBack = () => {
    setSelectedTemplateData(null); // Clear state to show template list
    setPlaceholderValues({}); // Clear placeholder values
  };

  const handleTemplateClick = (template: PromptTemplate) => {
    // Check if template contains placeholders
    const placeholders = template.promptText.match(/\[(.*?)\]/g);
    
    if (placeholders && placeholders.length > 0) {
      // Extract placeholder names without brackets
      const placeholderNames = placeholders.map(
        p => p.replace(/[\[\]]/g, '')
      );
      
      // Create initial placeholder values object with empty strings
      const initialValues: Record<string, string> = {};
      placeholderNames.forEach(name => {
        initialValues[name] = '';
      });
      
      // Set template data and placeholder values to show the form
      setSelectedTemplateData(template);
      setPlaceholderValues(initialValues);
    } else {
      // No placeholders, directly call onSelectTemplate
      onSelectTemplate(template.promptText);
      onClose();
    }
  };

  // Combine built-in templates with custom templates
  const allTemplates = [...marketingPromptTemplates, ...customPrompts];

  // Calculate unique categories, now including "Custom" if custom prompts exist
  const baseCategories = ['All Categories', ...Array.from(new Set(marketingPromptTemplates.map(template => template.category))).filter(Boolean)];
  
  // Only add the "Custom" category if there are custom templates
  const uniqueCategories = customPrompts.length > 0 
    ? [...baseCategories, 'Custom'] 
    : baseCategories;

  // Filter templates based on search term and selected category
  const filteredTemplates = allTemplates.filter(template => {
    // Special handling for "Custom" category
    if (selectedCategory === 'Custom') {
      return customPrompts.includes(template) && 
             (searchTerm === '' ||
              template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
              template.promptText.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    // Normal filtering for other categories
    const categoryMatch = selectedCategory === 'All Categories' || template.category === selectedCategory;
    const searchMatch = searchTerm === '' ||
                      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      template.promptText.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // Handle saving a custom prompt (create or edit)
  const handleSaveCustomPrompt = (promptData: Omit<PromptTemplate, 'id'> & { id?: string }) => {
    let updatedPrompts: PromptTemplate[];
    
    if (promptData.id) {
      // Editing existing prompt
      updatedPrompts = customPrompts.map(prompt => 
        prompt.id === promptData.id 
          ? { ...promptData as PromptTemplate } 
          : prompt
      );
    } else {
      // Creating new prompt
      const newPrompt: PromptTemplate = {
        ...promptData,
        id: uuidv4()
      };
      updatedPrompts = [...customPrompts, newPrompt];
    }
    
    // Update state and localStorage
    setCustomPrompts(updatedPrompts);
    saveCustomPrompts(updatedPrompts);
    setIsEditingCustomPrompt(false);
  };
  
  // Handle deleting a custom prompt
  const handleDeleteCustomPrompt = (idToDelete: string) => {
    if (!window.confirm('Are you sure you want to delete this custom prompt?')) return;
    
    const updatedPrompts = customPrompts.filter(prompt => prompt.id !== idToDelete);
    setCustomPrompts(updatedPrompts);
    saveCustomPrompts(updatedPrompts);
  };

  return (
    <>
      {/* Overlay Div - Semi-transparent background */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      {/* Panel Container - Sliding side panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-xl bg-zinc-900 border-l border-zinc-800 flex flex-col z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'transform translate-x-0' : 'transform translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Panel Header */}
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-50">Prompt Studio</h2>
          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-zinc-50 transition-colors rounded-md w-8 h-8 flex items-center justify-center hover:bg-zinc-800"
            aria-label="Close panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Main Content Area with Two Columns Layout */}
        <div className="flex flex-grow overflow-hidden">
          {/* Categories Column */}
          <nav className="w-1/4 max-w-[260px] border-r border-zinc-800 p-3 overflow-y-auto flex-shrink-0">
            <div className="flex justify-end mb-3 px-2">
              {/* Create Custom Prompt button with improved styling */}
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1 transition-colors"
                aria-label="Create custom prompt"
                onClick={() => {
                  setEditingPromptData(null);
                  setIsEditingCustomPrompt(true);
                }}
              >
                <Plus size={14} />
                <span>Create</span>
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {uniqueCategories.map(category => (
                <button
                  key={category}
                  className={`category-tab flex items-center px-3 py-2 rounded-md text-sm w-full transition-colors ${
                    selectedCategory === category 
                      ? 'bg-zinc-700 text-zinc-50 font-medium' 
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </nav>

          {/* Templates Column - Right side container */}
          <div className="flex-grow flex flex-col overflow-hidden">
            {/* Search Bar - Fixed at top */}
            <div className="p-4 pb-2">
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-md py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Scrollable Templates List Container */}
            <div 
              ref={listRef}
              className="flex-grow overflow-y-auto px-4"
              style={{ 
                paddingBottom: selectedTemplateData ? `${formHeight + 16}px` : '16px'
              }}
            >
              <div className="space-y-3">
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((template: PromptTemplate) => (
                    <div
                      key={template.id}
                      data-template-id={template.id}
                      className={`template-card bg-zinc-800 rounded-lg p-4 cursor-pointer hover:bg-zinc-750 border transition-colors ${
                        selectedTemplateData?.id === template.id 
                          ? 'border-blue-500 ring-1 ring-blue-500' 
                          : 'border-zinc-700 hover:border-zinc-600'
                      }`}
                      onClick={() => handleTemplateClick(template)}
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-zinc-100 text-base">{template.title}</h3>
                        <span className="bg-zinc-700 text-zinc-300 text-xs px-2 py-1 rounded-full">
                          {customPrompts.includes(template) ? 'Custom' : template.category}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{template.description}</p>
                      {/* Visual indicator for templates with placeholders */}
                      {template.promptText.includes('[') && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-zinc-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <path d="M12 8v8m-4-4h8"></path>
                          </svg>
                          <span>Requires customization</span>
                        </div>
                      )}
                      
                      {/* Edit/Delete buttons for custom prompts */}
                      {customPrompts.some(p => p.id === template.id) && (
                        <div className="flex justify-end mt-2 gap-2">
                          <button
                            className="p-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-md text-zinc-300 hover:text-white transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPromptData(template);
                              setIsEditingCustomPrompt(true);
                            }}
                            aria-label="Edit prompt"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="p-1.5 bg-zinc-700 hover:bg-red-600 rounded-md text-zinc-300 hover:text-white transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomPrompt(template.id);
                            }}
                            aria-label="Delete prompt"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-zinc-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-zinc-500">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <p>No templates found matching your criteria.</p>
                    <button 
                      className="mt-2 text-zinc-500 hover:text-zinc-300 text-sm"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('All Categories');
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Contextual Slide-In Placeholder Form - Fixed at bottom */}
            <div 
              ref={formRef}
              className={`absolute bottom-0 left-[260px] right-0 bg-zinc-800 border-t border-zinc-700 rounded-t-lg shadow-lg transition-all duration-300 ease-in-out ${
                selectedTemplateData ? 'transform translate-y-0 opacity-100' : 'transform translate-y-full opacity-0'
              }`}
              style={{
                boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)'
              }}
            >
              {selectedTemplateData && (
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-medium text-zinc-100">
                      Customize <span className="text-blue-400">{selectedTemplateData.title}</span>
                    </h3>
                    <button 
                      onClick={handleBack}
                      className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm rounded-md flex items-center gap-1 hover:bg-zinc-700 px-2 py-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      <span>Cancel</span>
                    </button>
                  </div>

                  <div className="text-xs text-zinc-400 mb-3">
                    Fill in the placeholders below to customize your prompt:
                  </div>

                  <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                    {Object.keys(placeholderValues).map(placeholder => (
                      <div key={placeholder} className="flex flex-col gap-1">
                        <label htmlFor={placeholder} className="text-sm font-medium text-zinc-300">
                          {placeholder}:
                        </label>
                        <textarea
                          id={placeholder}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2 text-zinc-100 text-sm min-h-[60px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          value={placeholderValues[placeholder]}
                          onChange={(e) => handlePlaceholderChange(placeholder, e.target.value)}
                          placeholder={`Enter value for ${placeholder}...`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-700 flex justify-end">
                    <button
                      className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleGeneratePrompt}
                      disabled={Object.values(placeholderValues).some(val => !val.trim())}
                    >
                      Generate Prompt
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom Prompt Form Modal */}
      <CustomPromptForm
        isOpen={isEditingCustomPrompt}
        onClose={() => setIsEditingCustomPrompt(false)}
        onSave={handleSaveCustomPrompt}
        initialData={editingPromptData}
      />
    </>
  );
};

export default PromptStudioModal;