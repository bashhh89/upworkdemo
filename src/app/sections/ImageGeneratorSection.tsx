'use client';

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, RefreshCw, Image as ImageIcon, Palette, Sparkles } from 'lucide-react';

export default function ImageGeneratorSection() {
    const { toast } = useToast();
    const [promptInput, setPromptInput] = useState('');
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState('pollinations');
    const [imageSize, setImageSize] = useState('1024x576');
    const [imageStyle, setImageStyle] = useState('realistic');
    const [generationHistory, setGenerationHistory] = useState<Array<{url: string, prompt: string, timestamp: Date}>>([]);

    const models = [
        { id: 'pollinations', name: 'Pollinations AI', description: 'Fast, high-quality image generation' },
        { id: 'flux', name: 'Flux Pro', description: 'Advanced artistic generation' },
        { id: 'midjourney', name: 'Midjourney Style', description: 'Artistic and creative outputs' }
    ];

    const sizes = [
        { id: '1024x1024', name: 'Square (1024x1024)', aspect: '1:1' },
        { id: '1024x576', name: 'Landscape (1024x576)', aspect: '16:9' },
        { id: '576x1024', name: 'Portrait (576x1024)', aspect: '9:16' },
        { id: '1536x1024', name: 'Wide (1536x1024)', aspect: '3:2' }
    ];

    const styles = [
        { id: 'realistic', name: 'Realistic', description: 'Photorealistic images' },
        { id: 'artistic', name: 'Artistic', description: 'Creative and stylized' },
        { id: 'minimalist', name: 'Minimalist', description: 'Clean and simple' },
        { id: 'cinematic', name: 'Cinematic', description: 'Movie-like quality' },
        { id: 'abstract', name: 'Abstract', description: 'Non-representational art' }
    ];

    const promptSuggestions = [
        "Professional headshot of a business executive, studio lighting, corporate background",
        "Modern tech startup office space, bright and innovative, team collaboration",
        "Luxury product photography, elegant lighting, premium brand aesthetic",
        "Social media marketing graphic, vibrant colors, engaging design",
        "Website hero banner, clean design, technology theme, blue and white",
        "E-commerce product showcase, white background, professional lighting"
    ];

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

        try {
            const encodedPrompt = encodeURIComponent(currentPrompt);
            const [width, height] = imageSize.split('x');
            
            // Enhanced prompt with style
            const stylePrompt = imageStyle !== 'realistic' ? `, ${imageStyle} style` : '';
            const fullPrompt = `${currentPrompt}${stylePrompt}`;
            
            // Construct the URL based on selected model
            let apiUrl = '';
            switch (selectedModel) {
                case 'pollinations':
                    apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${width}&height=${height}&seed=${Date.now()}&nologo=true`;
                    break;
                case 'flux':
                    apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${width}&height=${height}&seed=${Date.now()}&model=flux&nologo=true`;
                    break;
                default:
                    apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${width}&height=${height}&seed=${Date.now()}&nologo=true`;
            }

            setGeneratedImageUrl(apiUrl);

        } catch (e) {
            console.error("Error setting up image generation:", e);
            setError("An unexpected error occurred while preparing the image request.");
            toast({ title: "Error", description: "Could not prepare image request.", variant: "destructive" });
            setIsLoading(false);
        }
    };

    const handleDownloadImage = async () => {
        if (!generatedImageUrl) return;
        
        try {
            const response = await fetch(generatedImageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-generated-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast({ title: "Downloaded", description: "Image saved to your downloads folder." });
        } catch (error) {
            toast({ title: "Download Failed", description: "Could not download the image.", variant: "destructive" });
        }
    };

    const handleCopyImageUrl = () => {
        if (generatedImageUrl) {
            navigator.clipboard.writeText(generatedImageUrl);
            toast({ title: "Copied", description: "Image URL copied to clipboard." });
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setPromptInput(suggestion);
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
        setError(null);
        setIsLoading(false);
        
        // Add to history
        if (generatedImageUrl) {
            setGenerationHistory(prev => [{
                url: generatedImageUrl,
                prompt: promptInput,
                timestamp: new Date()
            }, ...prev.slice(0, 9)]); // Keep last 10 generations
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-600/20 rounded-lg">
                        <ImageIcon className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">AI Image Generator</h1>
                        <p className="text-zinc-400">Create stunning visuals with AI-powered image generation</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel - Controls */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Model Selection */}
                    <Card className="bg-zinc-900/80 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                AI Model
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedModel} onValueChange={setSelectedModel}>
                                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-zinc-700">
                                    {models.map(model => (
                                        <SelectItem key={model.id} value={model.id} className="text-white">
                                            <div>
                                                <div className="font-medium">{model.name}</div>
                                                <div className="text-xs text-zinc-400">{model.description}</div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Settings */}
                    <Card className="bg-zinc-900/80 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-zinc-300 mb-2 block">Image Size</label>
                                <Select value={imageSize} onValueChange={setImageSize}>
                                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-800 border-zinc-700">
                                        {sizes.map(size => (
                                            <SelectItem key={size.id} value={size.id} className="text-white">
                                                <div className="flex items-center justify-between w-full">
                                                    <span>{size.name}</span>
                                                    <Badge variant="secondary" className="ml-2 text-xs">
                                                        {size.aspect}
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-zinc-300 mb-2 block">Style</label>
                                <Select value={imageStyle} onValueChange={setImageStyle}>
                                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-800 border-zinc-700">
                                        {styles.map(style => (
                                            <SelectItem key={style.id} value={style.id} className="text-white">
                                                <div>
                                                    <div className="font-medium">{style.name}</div>
                                                    <div className="text-xs text-zinc-400">{style.description}</div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Prompt Suggestions */}
                    <Card className="bg-zinc-900/80 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-white text-sm">Prompt Suggestions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {promptSuggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="w-full text-left p-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel - Generation */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Prompt Input */}
                    <Card className="bg-zinc-900/80 border-zinc-800">
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-zinc-300 mb-2 block">
                                        Describe your image
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="e.g., Professional headshot of a business executive, studio lighting, corporate background"
                                        value={promptInput}
                                        onChange={(e) => setPromptInput(e.target.value)}
                                        disabled={isLoading}
                                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-12"
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateImage(); }}
                                    />
                                </div>
                                <Button 
                                    onClick={handleGenerateImage} 
                                    disabled={isLoading || !promptInput.trim()}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12"
                                >
                                    {isLoading ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon className="h-4 w-4 mr-2" />
                                            Generate Image
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Generated Image */}
                    <Card className="bg-zinc-900/80 border-zinc-800">
                        <CardContent className="p-6">
                            <div className="min-h-[400px] flex items-center justify-center bg-zinc-800 rounded-lg relative overflow-hidden">
                                {isLoading && (
                                    <div className="absolute inset-0 bg-zinc-900/80 flex items-center justify-center z-10">
                                        <div className="text-center">
                                            <RefreshCw className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-2" />
                                            <p className="text-zinc-400">Generating your image...</p>
                                        </div>
                                    </div>
                                )}

                                {error && !isLoading && (
                                    <div className="text-center text-red-400">
                                        <p>{error}</p>
                                    </div>
                                )}

                                {generatedImageUrl && (
                                    <div className="w-full">
                                        <img
                                            key={generatedImageUrl}
                                            src={generatedImageUrl}
                                            alt={promptInput || 'Generated AI Image'}
                                            className="w-full h-auto rounded-lg"
                                            onLoad={handleImageLoad}
                                            onError={handleImageError}
                                        />
                                        
                                        {!isLoading && (
                                            <div className="flex gap-2 mt-4">
                                                <Button
                                                    onClick={handleDownloadImage}
                                                    variant="outline"
                                                    className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download
                                                </Button>
                                                <Button
                                                    onClick={handleCopyImageUrl}
                                                    variant="outline"
                                                    className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                                >
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Copy URL
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!isLoading && !error && !generatedImageUrl && (
                                    <div className="text-center text-zinc-400">
                                        <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Your generated image will appear here</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Generation History */}
                    {generationHistory.length > 0 && (
                        <Card className="bg-zinc-900/80 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-white text-sm">Recent Generations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {generationHistory.map((item, index) => (
                                        <div key={index} className="group cursor-pointer" onClick={() => {
                                            setGeneratedImageUrl(item.url);
                                            setPromptInput(item.prompt);
                                        }}>
                                            <img
                                                src={item.url}
                                                alt={item.prompt}
                                                className="w-full h-24 object-cover rounded-md group-hover:opacity-80 transition-opacity"
                                            />
                                            <p className="text-xs text-zinc-400 mt-1 truncate">{item.prompt}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
} 