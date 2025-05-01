'use client';

import React, { useState, useEffect } from 'react';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../components/ui/use-toast';
import { Voicemail, Mic } from 'lucide-react'; // Example icons - using Mic in SidebarNav, but including both here for potential future use

export function VoiceoverGeneratorSection() {
    const [textInput, setTextInput] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('alloy'); // Default voice
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

    // useEffect for cleanup
    useEffect(() => {
        // This is the cleanup function that runs when the component unmounts
        // or before the effect runs again if audioUrl changes.
        return () => {
            if (audioUrl) {
                console.log("Revoking old audio URL:", audioUrl);
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]); // Dependency array includes audioUrl

    const handleGenerateAudio = async () => {
        setIsLoading(true);
        setAudioUrl(null);
        setError(null);

        if (!textInput.trim()) {
            setError('Please enter text to generate audio.');
            setIsLoading(false);
            return;
        }

        try {
            const payload = {
                "model": "openai-audio",
                "messages": [{ "role": "user", "content": textInput }],
                "voice": selectedVoice,
                "response_format": { "type": "audio" }
            };

            const response = await fetch('https://text.pollinations.ai/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('audio/mpeg')) {
                const audioBlob = await response.blob();
                // Revoke previous URL before creating a new one
                if (audioUrl) {
                    URL.revokeObjectURL(audioUrl);
                }
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
            } else {
                 const errorText = await response.text();
                 // Assuming non-audio content means an API error message
                 throw new Error(`Unexpected API response format. Details: ${errorText}`);
            }

        } catch (err: any) {
            console.error("Audio generation failed:", err);
            setError(`Generation failed: ${err.message}`);
            toast({
                title: "Error",
                description: `Failed to generate audio: ${err.message}`,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4 text-white">AI Voiceover Generator</h2>
            <p className="text-muted-gray mb-6">Enter text and select a voice to generate an audio voiceover using AI.</p>

            <div className="space-y-4">
                <Textarea
                    placeholder="Enter text here..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="bg-near-black border-light-gray placeholder:text-muted-gray text-white min-h-[150px]"
                    rows={6}
                    disabled={isLoading}
                />
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                     <Select value={selectedVoice} onValueChange={setSelectedVoice} disabled={isLoading}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-near-black border-light-gray text-white">
                            <SelectValue placeholder="Select Voice" />
                        </SelectTrigger>
                        <SelectContent className="bg-near-black border-light-gray text-white">
                            {voices.map(voice => (
                                <SelectItem key={voice} value={voice} className="focus:bg-light-gray/30 focus:text-white">
                                    {voice.charAt(0).toUpperCase() + voice.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleGenerateAudio} disabled={isLoading || !textInput.trim()} className="w-full sm:w-auto flex-grow sm:flex-grow-0">
                        {isLoading ? 'Generating...' : 'Generate Audio'}
                    </Button>
                </div>
            </div>

            {/* Audio Player / Status Area */}
            <div className="mt-6 min-h-[60px] p-4 bg-near-black border border-light-gray rounded-md flex items-center justify-center">
                {isLoading && <p className="text-muted-gray animate-pulse">Generating audio...</p>}
                {error && !isLoading && <p className="text-red-500 text-sm">{error}</p>}
                {audioUrl && !isLoading && !error && (
                    <audio controls src={audioUrl} className="w-full" key={audioUrl}>
                        Your browser does not support the audio element.
                    </audio>
                )}
                {!isLoading && !error && !audioUrl && (
                    <p className="text-muted-gray text-sm">Generated audio will appear here.</p>
                )}
            </div>
        </div>
    );
}