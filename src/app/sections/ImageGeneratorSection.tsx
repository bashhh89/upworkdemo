'use client';

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function ImageGeneratorSection() {
    const { toast } = useToast();
    const [promptInput, setPromptInput] = useState('');
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateImage = async () => {
        const currentPrompt = promptInput.trim();
        if (!currentPrompt) {
            toast({ title: "Input Required", description: "Please enter a prompt for the image.", variant: "destructive" });
            setError("Please enter a prompt.");
            return;
        }

        setIsLoading(true);
        setGeneratedImageUrl(null);
        setError(null);
        console.log(`Generating image for prompt: "${currentPrompt}"`);

        try {
            const encodedPrompt = encodeURIComponent(currentPrompt);
            // Construct the URL - browser will fetch this when img src is set
            const apiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=576&seed=${Date.now()}&nologo=true`;
            console.log("Setting image URL:", apiUrl);

            // Set the URL for the img tag to load
            setGeneratedImageUrl(apiUrl);

        } catch (e) {
            console.error("Error setting up image generation:", e);
            setError("An unexpected error occurred while preparing the image request.");
            toast({ title: "Error", description: "Could not prepare image request.", variant: "destructive" });
            setIsLoading(false);
        } finally {
            // Set loading false slightly later ONLY IF NO ERROR OCCURRED DURING SETUP
            // The actual loading state for the image fetch is handled visually until onError or onLoad
            if (!error) {
                setTimeout(() => setIsLoading(false), 500); // Give browser time to start fetch
            }
        }
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const failedUrl = (e.target as HTMLImageElement).src;
        console.error('Image failed to load:', failedUrl);
        
        // Avoid setting error if it's just the placeholder failing
        if (failedUrl && !failedUrl.includes('placehold.co')) {
            setError(`Failed to load image from Pollinations. The generation might have failed or the URL is invalid. Prompt: "${promptInput}"`);
            toast({ title: "Image Load Error", description: "Could not load the generated image.", variant: "destructive"});
        }
        
        setGeneratedImageUrl(null);
        setIsLoading(false);
        
        // Prevent infinite loop if the placeholder itself fails
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.src = 'https://placehold.co/1024x576/0a0a0a/333333?text=Error+Loading+Image';
    };

    const handleImageLoad = () => {
        console.log("Image loaded successfully:", generatedImageUrl);
        setError(null);
        setIsLoading(false);
    }

    return (
        <div className="space-y-8 text-white max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-white">AI Marketing Image Generator</h2>
            <p className="text-gray-400 mb-6">Enter a prompt to generate a marketing image using AI (via Pollinations.ai).</p>

            <div className="flex flex-col sm:flex-row gap-2 mb-6">
                <Input
                    type="text"
                    placeholder="e.g., 'Luxury watch advertisement, studio lighting'"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    disabled={isLoading && generatedImageUrl === null}
                    className="flex-grow bg-[#111111] border-gray-400 placeholder:text-gray-400 text-white"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateImage(); }}
                />
                <Button onClick={handleGenerateImage} disabled={isLoading && generatedImageUrl === null} className="w-full sm:w-auto">
                    {isLoading && generatedImageUrl === null ? 'Preparing...' : 'Generate Image'}
                </Button>
            </div>

            {/* Image Display Area */}
            <div className="mt-6 min-h-[300px] flex items-center justify-center bg-[#111111] border border-dashed border-gray-400 rounded-md p-4 relative overflow-hidden">
                {/* Loading overlay - shown while isLoading OR generatedImageUrl is set but not yet loaded/errored */}
                {(isLoading || (generatedImageUrl && !error)) && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <p className="text-gray-400 animate-pulse">Loading Image...</p>
                    </div>
                )}

                {/* Error Message - shown if error exists AND we are not in the initial loading phase */}
                {error && !isLoading && <p className="text-red-500 text-center z-0">{error}</p>}

                {/* Image Tag - always rendered when URL is set, hidden by overlay while loading */}
                {generatedImageUrl && (
                    <img
                        key={generatedImageUrl}
                        src={generatedImageUrl}
                        alt={promptInput || 'Generated AI Image'}
                        className={`max-w-full max-h-[60vh] h-auto rounded-md z-0 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                    />
                )}

                {/* Initial Placeholder - shown only when not loading, no error, and no image URL */}
                {!isLoading && !error && !generatedImageUrl && (
                    <p className="text-gray-400 text-center z-0">Image will appear here</p>
                )}
            </div>
        </div>
    );
} 