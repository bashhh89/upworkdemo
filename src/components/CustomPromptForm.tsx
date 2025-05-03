import React, { useState, useEffect } from 'react';
import { PromptTemplate } from '@/lib/prompt-templates';
import { X } from 'lucide-react';

interface CustomPromptFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promptData: Omit<PromptTemplate, 'id'> & { id?: string }) => void;
  initialData?: PromptTemplate | null;
}

const CustomPromptForm: React.FC<CustomPromptFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Custom');
  const [promptText, setPromptText] = useState('');

  // Reset form when opening/closing or when initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Editing mode - populate form with existing data
        setTitle(initialData.title);
        setDescription(initialData.description);
        setCategory(initialData.category);
        setPromptText(initialData.promptText);
      } else {
        // Create mode - reset form
        setTitle('');
        setDescription('');
        setCategory('Custom');
        setPromptText('');
      }
    }
  }, [isOpen, initialData]);

  // Form validation
  const isFormValid = title.trim() !== '' && promptText.trim() !== '';

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    const promptData = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'Custom',
      promptText: promptText.trim(),
      ...(initialData?.id ? { id: initialData.id } : {})
    };
    
    onSave(promptData);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div 
        className="fixed inset-0 bg-black/70 z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div 
          className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden transition-all duration-300 transform"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-50">
              {initialData ? 'Edit Custom Prompt' : 'Create Custom Prompt'}
            </h2>
            <button 
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-50 transition-colors rounded-md w-8 h-8 flex items-center justify-center hover:bg-zinc-800"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 overflow-y-auto max-h-[calc(90vh-60px)]">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="prompt-title" className="block text-sm font-medium text-zinc-300 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="prompt-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter a descriptive title..."
                  required
                />
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="prompt-description" className="block text-sm font-medium text-zinc-300 mb-1">
                  Description
                </label>
                <input
                  id="prompt-description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Briefly describe what this prompt does..."
                />
              </div>
              
              {/* Category */}
              <div>
                <label htmlFor="prompt-category" className="block text-sm font-medium text-zinc-300 mb-1">
                  Category
                </label>
                <input
                  id="prompt-category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Category (default: Custom)"
                />
              </div>
              
              {/* Prompt Text */}
              <div>
                <label htmlFor="prompt-text" className="block text-sm font-medium text-zinc-300 mb-1">
                  Prompt Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="prompt-text"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-h-[200px]"
                  placeholder="Enter your prompt text here..."
                  rows={8}
                  required
                />
                <p className="mt-1 text-xs text-zinc-400">
                  Tip: Use [placeholders] for variables you want to customize later.
                </p>
              </div>
              
              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {initialData ? 'Update Prompt' : 'Save Prompt'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CustomPromptForm; 