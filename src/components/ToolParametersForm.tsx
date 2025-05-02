import { useState } from 'react';
import { ToolDefinition } from '@/types/tools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

interface ToolParametersFormProps {
  tool: ToolDefinition;
  initialParameters?: Record<string, string>;
  onSubmit: (parameters: Record<string, string>) => void;
  onCancel: () => void;
}

export default function ToolParametersForm({
  tool,
  initialParameters = {},
  onSubmit,
  onCancel
}: ToolParametersFormProps) {
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
      console.error('Error submitting parameters:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{tool.name}</CardTitle>
        <CardDescription>{tool.description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {tool.requiredParameters.map((param) => (
            <div key={param.name} className="space-y-2">
              <Label htmlFor={param.name}>
                {param.label}
                {param.required !== false && <span className="text-red-500 ml-1">*</span>}
              </Label>
              
              {param.type === 'select' ? (
                <Select
                  value={parameters[param.name] || ''}
                  onValueChange={(value) => handleInputChange(param.name, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${param.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {param.options?.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={param.name}
                  type={param.type === 'number' ? 'number' : 'text'}
                  placeholder={param.placeholder}
                  value={parameters[param.name] || ''}
                  onChange={(e) => handleInputChange(param.name, e.target.value)}
                  required={param.required !== false}
                />
              )}
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || 
              tool.requiredParameters
                .filter(param => param.required !== false)
                .some(param => !parameters[param.name] || parameters[param.name].trim() === '')}
          >
            {isSubmitting ? 'Processing...' : 'Run Tool'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 