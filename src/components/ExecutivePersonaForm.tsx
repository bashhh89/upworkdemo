import { useState } from 'react';
import { Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ExecutivePersonaFormProps {
  initialParameters?: Record<string, string>;
  onSubmit: (parameters: Record<string, string>) => void;
  onCancel: () => void;
}

export default function ExecutivePersonaForm({
  initialParameters = {},
  onSubmit,
  onCancel
}: ExecutivePersonaFormProps) {
  const [parameters, setParameters] = useState<Record<string, string>>(initialParameters);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (name: string, value: string) => {
    setParameters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      onSubmit(parameters);
    } catch (error) {
      console.error('Error submitting executive persona:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isFormValid = () => {
    return parameters.name?.trim() && 
           parameters.title?.trim() && 
           parameters.company?.trim();
  };
  
  return (
    <Card className="w-full border-purple-600/20 shadow-md shadow-purple-900/10">
      <CardHeader className="bg-gradient-to-r from-purple-900/20 to-purple-600/10 border-b border-purple-800/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-700 rounded-full">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl text-purple-100">Executive Persona Builder</CardTitle>
            <CardDescription>Enter the executive's information to generate a communication profile</CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200" htmlFor="name">
              Executive Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              className="bg-[#1a1a1a] border-gray-700 focus:border-purple-500"
              placeholder="e.g., Satya Nadella"
              value={parameters.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200" htmlFor="title">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              className="bg-[#1a1a1a] border-gray-700 focus:border-purple-500"
              placeholder="e.g., CEO"
              value={parameters.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200" htmlFor="company">
              Company <span className="text-red-500">*</span>
            </label>
            <Input
              id="company"
              className="bg-[#1a1a1a] border-gray-700 focus:border-purple-500"
              placeholder="e.g., Microsoft"
              value={parameters.company || ''}
              onChange={(e) => handleInputChange('company', e.target.value)}
              required
            />
          </div>
          
          <div className="text-xs text-gray-400 italic mt-2">
            This tool analyzes executives to help you communicate effectively based on their position, company context, and likely priorities.
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-gray-800 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="border-gray-700 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !isFormValid()}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isSubmitting ? 'Analyzing...' : 'Generate Persona'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 