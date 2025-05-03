import { useState } from 'react';
import { Globe, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface WebsiteScannerFormProps {
  initialParameters?: Record<string, string>;
  onSubmit: (parameters: Record<string, string>) => void;
  onCancel: () => void;
}

export default function WebsiteScannerForm({
  initialParameters = {},
  onSubmit,
  onCancel
}: WebsiteScannerFormProps) {
  const [url, setUrl] = useState(initialParameters.url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlError, setUrlError] = useState('');
  
  const validateUrl = (value: string) => {
    if (!value.trim()) {
      setUrlError('URL is required');
      return false;
    }
    
    try {
      // Add protocol if missing
      const urlWithProtocol = value.startsWith('http') ? value : `https://${value}`;
      new URL(urlWithProtocol);
      setUrlError('');
      return true;
    } catch (e) {
      setUrlError('Please enter a valid URL');
      return false;
    }
  };
  
  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value) validateUrl(value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure URL has a protocol
    let urlToSubmit = url;
    if (!url.startsWith('http')) {
      urlToSubmit = `https://${url}`;
    }
    
    if (!validateUrl(urlToSubmit)) return;
    
    setIsSubmitting(true);
    
    try {
      // Call the API endpoint directly with the URL
      const response = await fetch('/api/tools/website-scanner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlToSubmit }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scan website');
      }
      
      const data = await response.json();
      
      // Store the result in localStorage for sharing
      try {
        const existingResults = localStorage.getItem('toolResults');
        const resultsArray = existingResults ? JSON.parse(existingResults) : [];
        resultsArray.unshift(data); // Add new result at the beginning
        localStorage.setItem('toolResults', JSON.stringify(resultsArray));
      } catch (err) {
        console.error('Error saving result to localStorage', err);
      }
      
      onSubmit({ url: urlToSubmit });
    } catch (error: any) {
      console.error('Error analyzing website:', error);
      
      // Show error in UI
      setUrlError(error.message || 'Failed to analyze the website. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full border-blue-600/20 shadow-md shadow-blue-900/10">
      <CardHeader className="bg-gradient-to-r from-blue-900/20 to-blue-600/10 border-b border-blue-800/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-700 rounded-full">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl text-blue-100">Website Intelligence Scanner</CardTitle>
            <CardDescription>Analyze any website to extract business intelligence and insights</CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200" htmlFor="url">
              Website URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="url"
                className="bg-[#1a1a1a] border-gray-700 focus:border-blue-500 pl-10 pr-4"
                placeholder="e.g., microsoft.com"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            {urlError && <p className="text-red-500 text-xs mt-1">{urlError}</p>}
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="text-xs text-gray-400 italic">
              This tool will analyze the website and extract:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span>Key business information</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span>Content categories</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span>External links</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span>Media analysis</span>
              </div>
            </div>
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
            disabled={isSubmitting || !url.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? 'Analyzing...' : 'Scan Website'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 