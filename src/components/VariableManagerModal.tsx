import React, { useState, useEffect } from 'react';

interface VariableManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const localStoragePrefix = 'promptVariable_';

// Define default variables to pre-populate when none exist
const defaultVariables = {
  myCompany: 'Deliver AI',
  myMainProduct: 'AI Action Launchpad Platform',
  myTargetAudience: 'B2B Sales Professionals and Marketing Managers',
  myCoreBenefit: 'integrating multiple AI tools into one seamless workflow to save time and boost productivity',
  myWebsiteURL: '[Your Website URL]'
};

const VariableManagerModal: React.FC<VariableManagerModalProps> = ({ isOpen, onClose }) => {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [newVariableName, setNewVariableName] = useState('');
  const [newVariableValue, setNewVariableValue] = useState('');

  // Load variables from localStorage when the modal opens
  useEffect(() => {
    if (isOpen) {
      const loadedVariables: Record<string, string> = {};
      
      // Load existing variables from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(localStoragePrefix)) {
          const variableName = key.substring(localStoragePrefix.length);
          const variableValue = localStorage.getItem(key);
          if (variableValue !== null) {
            loadedVariables[variableName] = variableValue;
          }
        }
      }
      
      // Add default variables if they don't already exist
      let variablesAdded = false;
      Object.entries(defaultVariables).forEach(([name, value]) => {
        if (!loadedVariables.hasOwnProperty(name)) {
          loadedVariables[name] = value;
          localStorage.setItem(localStoragePrefix + name, value);
          variablesAdded = true;
        }
      });
      
      if (variablesAdded) {
        console.log('Added default variables to help with testing');
      }
      
      setVariables(loadedVariables);
    }
  }, [isOpen]);

  const handleAddVariable = () => {
    if (newVariableName.trim() === '') {
      // Basic validation
      alert('Variable name cannot be empty.');
      return;
    }

    const updatedVariables = { ...variables, [newVariableName]: newVariableValue };
    setVariables(updatedVariables);
    localStorage.setItem(localStoragePrefix + newVariableName, newVariableValue);
    setNewVariableName('');
    setNewVariableValue('');
  };

  const handleUpdateVariable = (variableName: string, value: string) => {
    const updatedVariables = { ...variables, [variableName]: value };
    setVariables(updatedVariables);
    localStorage.setItem(localStoragePrefix + variableName, value);
  };

  const handleDeleteVariable = (variableName: string) => {
    const updatedVariables = { ...variables };
    delete updatedVariables[variableName];
    setVariables(updatedVariables);
    localStorage.removeItem(localStoragePrefix + variableName);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay Div */}
      <div
        className={`fixed inset-0 bg-black/75 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      {/* Panel Div */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-zinc-900 border-l border-zinc-800 flex flex-col z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'transform translate-x-0' : 'transform translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white">Manage Prompt Variables</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close panel">X</button>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto">
          {/* Existing Variables List */}
          <h3 className="text-lg font-semibold text-white mb-4">Existing Variables</h3>
          <div className="flex flex-col gap-4 mb-8">
            {Object.keys(variables).length > 0 ? (
              Object.keys(variables).map(variableName => (
                <div key={variableName} className="bg-zinc-800 rounded-md p-4 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-400">{variableName}:</label>
                  <textarea
                    className="input-field w-full bg-zinc-700 rounded p-2 text-white text-sm min-h-[60px]"
                    value={variables[variableName]}
                    onChange={(e) => handleUpdateVariable(variableName, e.target.value)}
                  />
                  <button
                    className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm self-end"
                    onClick={() => handleDeleteVariable(variableName)}
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400">No variables defined yet.</div>
            )}
          </div>

          {/* Add New Variable Form */}
          <h3 className="text-lg font-semibold text-white mb-4">Add New Variable</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="newVariableName" className="text-sm font-semibold text-gray-400 mb-1 block">Variable Name:</label>
              <input
                id="newVariableName"
                type="text"
                className="input-field w-full bg-zinc-800 rounded p-2 text-white text-sm"
                value={newVariableName}
                onChange={(e) => setNewVariableName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="newVariableValue" className="text-sm font-semibold text-gray-400 mb-1 block">Variable Value:</label>
              <textarea
                id="newVariableValue"
                className="input-field w-full bg-zinc-800 rounded p-2 text-white text-sm min-h-[80px]"
                value={newVariableValue}
                onChange={(e) => setNewVariableValue(e.target.value)}
              />
            </div>
            <button
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 self-end"
              onClick={handleAddVariable}
            >
              Add Variable
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VariableManagerModal;