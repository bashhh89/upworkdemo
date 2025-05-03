import { useState } from 'react';
import { Target, Building, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DealWriterFormProps {
  initialParameters?: Record<string, string>;
  onSubmit: (parameters: Record<string, string>) => void;
  onCancel: () => void;
}

const industries = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Other'];
const dealSizes = ['Small (<$10k)', 'Medium ($10k-$50k)', 'Large ($50k-$250k)', 'Enterprise (>$250k)'];

export default function DealWriterForm({
  initialParameters = {},
  onSubmit,
  onCancel
}: DealWriterFormProps) {
  const [parameters, setParameters] = useState<Record<string, string>>({
    company: initialParameters.company || '',
    industry: initialParameters.industry || '',
    dealSize: initialParameters.dealSize || ''
  });
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
      console.error('Error generating deal proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isFormValid = () => {
    return parameters.company?.trim() && 
           parameters.industry?.trim() && 
           parameters.dealSize?.trim();
  };
  
  return (
    <Card className="w-full border-green-600/20 shadow-md shadow-green-900/10">
      <CardHeader className="bg-gradient-to-r from-green-900/20 to-green-600/10 border-b border-green-800/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-700 rounded-full">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl text-green-100">Contextual Deal Writer</CardTitle>
            <CardDescription>Generate a personalized deal proposal for your prospect</CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200 flex items-center gap-2" htmlFor="company">
              <Building className="h-4 w-4 text-gray-400" />
              Company Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="company"
              className="bg-[#1a1a1a] border-gray-700 focus:border-green-500"
              placeholder="e.g., Acme Corporation"
              value={parameters.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200 flex items-center gap-2" htmlFor="industry">
              <Briefcase className="h-4 w-4 text-gray-400" />
              Industry <span className="text-red-500">*</span>
            </label>
            <Select
              value={parameters.industry}
              onValueChange={(value) => handleInputChange('industry', value)}
            >
              <SelectTrigger className="bg-[#1a1a1a] border-gray-700 focus:ring-green-500">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-gray-700">
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200 flex items-center gap-2" htmlFor="dealSize">
              <Target className="h-4 w-4 text-gray-400" />
              Deal Size <span className="text-red-500">*</span>
            </label>
            <Select
              value={parameters.dealSize}
              onValueChange={(value) => handleInputChange('dealSize', value)}
            >
              <SelectTrigger className="bg-[#1a1a1a] border-gray-700 focus:ring-green-500">
                <SelectValue placeholder="Select deal size" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-gray-700">
                {dealSizes.map((size) => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-black/20 p-3 rounded-md mt-2 border border-green-900/30">
            <h4 className="text-xs font-medium text-green-300 mb-2">Deal Writer will generate:</h4>
            <ul className="text-xs text-gray-300 space-y-1">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-green-500"></div>
                <span>Customized Executive Summary</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-green-500"></div>
                <span>Industry-specific Value Propositions</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-green-500"></div>
                <span>Implementation Roadmap</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-green-500"></div>
                <span>Tailored ROI Analysis</span>
              </li>
            </ul>
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
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting ? 'Creating Proposal...' : 'Generate Proposal'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 