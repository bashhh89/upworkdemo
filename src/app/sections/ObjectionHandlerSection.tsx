'use client'; // Mark as Client Component

import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check, Info, Loader2, PlayCircle, PauseCircle, Volume2, VolumeX, StopCircle, MessagesSquare, UserCircle2, Settings } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Message {
    role: 'user' | 'assistant';
    content: string;
    audioUrl?: string; // Added for TTS playback
    isPlaying?: boolean; // Track if this message's audio is playing
    transcription?: string; // Add transcription field
}

interface Voice {
    id: string;
    name: string;
}

// Available voices from Pollinations API
const AVAILABLE_VOICES: Voice[] = [
    { id: 'alloy', name: 'Alloy (Neutral)' },
    { id: 'echo', name: 'Echo (Male)' },
    { id: 'fable', name: 'Fable (Male)' },
    { id: 'onyx', name: 'Onyx (Male)' },
    { id: 'nova', name: 'Nova (Female)' },
    { id: 'shimmer', name: 'Shimmer (Female)' }
];

// Define available personas
interface Persona {
    id: string;
    name: string;
    description: string;
    systemPrompt: string;
    welcomeMessage: string;
}

const AVAILABLE_PERSONAS: Persona[] = [
    {
        id: 'skeptical_client',
        name: 'Skeptical Client',
        description: 'Raises objections about your marketing ideas or plans',
        systemPrompt: `You are playing the role of a skeptical but realistic client or manager ('AI Skeptic'). The user will present a marketing idea or respond to your objections. Your goal is to raise 1-2 valid, concise objections or critical questions based on their latest message and the conversation history. 
        
Objections should be common business concerns (e.g., ROI, budget, resources, target audience mismatch, competition, data privacy, feasibility). Avoid generic 'no'. If the user successfully addresses your main concerns after several exchanges, respond with a brief acknowledgement like 'Okay, that addresses my main concern for now.' or 'That sounds more feasible.' Do NOT agree too easily. Keep objections brief. Respond only with your objection or acknowledgement text.`,
        welcomeMessage: "Present your marketing idea or plan. I'll play the role of a skeptical client and raise potential objections."
    },
    {
        id: 'business_roaster',
        name: 'Business Roaster',
        description: 'Provides constructive feedback on business ideas with a touch of humor',
        systemPrompt: `You are a professional but witty business critic. The user will present a business idea, and your job is to give insightful, balanced feedback that identifies potential weaknesses while maintaining a constructive tone. 

Use a touch of humor and light sarcasm to make your points memorable, but avoid being mean-spirited or overly harsh. Balance critique with constructive suggestions. Keep responses concise (2-3 sentences) and focus on practical business considerations like market fit, differentiation, scalability, and profitability.

Always wait for the user to provide their business idea first before responding. Never assume what their idea is - respond directly to what they've shared.`,
        welcomeMessage: "Pitch me your business idea. I'll give you constructive feedback with a touch of humor to help you refine it."
    },
    {
        id: 'venture_capitalist',
        name: 'Venture Capitalist',
        description: 'Evaluates your startup idea from an investor perspective',
        systemPrompt: `You are a seasoned venture capitalist evaluating potential investments. The user will pitch a business idea, and your role is to ask probing questions about their business model, market opportunity, competitive advantage, team capabilities, and financial projections. Focus on what makes a startup investable - scalability, TAM, unit economics, and defensibility. Be direct but professional. Always push for specifics rather than accepting vague answers. If the user addresses your concerns well, acknowledge it but raise new questions about different aspects. Only after several exchanges of solid answers should you show genuine interest in investing.`,
        welcomeMessage: "I'm a partner at a leading VC firm. You have 30 seconds to pitch your startup. What problem are you solving, and why is your solution unique?"
    },
    {
        id: 'custom',
        name: 'Custom Persona',
        description: 'Create your own AI conversation partner',
        systemPrompt: 'You are a helpful and friendly conversation partner. Respond to the user in a natural, conversational way.',
        welcomeMessage: "Hello! I'm your custom AI conversation partner. How would you like me to respond to you?"
    }
];

// Track user progress through conversation
interface ProgressState {
    exchanges: number;
    successfulResponses: number;
    currentStreak: number;
}

export function ObjectionHandlerSection() {
    // Current persona and settings
    const [selectedPersona, setSelectedPersona] = useState<Persona>(AVAILABLE_PERSONAS[0]);
    const [customPrompt, setCustomPrompt] = useState(AVAILABLE_PERSONAS[3].systemPrompt);
    const [customWelcome, setCustomWelcome] = useState(AVAILABLE_PERSONAS[3].welcomeMessage);
    const [showCustomDialog, setShowCustomDialog] = useState(false);
    
    // Message state
    const [conversation, setConversation] = useState<Message[]>([
        { role: 'assistant', content: AVAILABLE_PERSONAS[0].welcomeMessage }
    ]);
    const [currentUserInput, setCurrentUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // UI state
    const { toast } = useToast();
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [selectedVoice, setSelectedVoice] = useState<string>('nova');
    // Audio is always enabled
    const [audioEnabled] = useState(true);
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const [progress, setProgress] = useState<ProgressState>({
        exchanges: 0,
        successfulResponses: 0,
        currentStreak: 0
    });
    const [domain, setDomain] = useState('general'); // For domain-specific objections
    
    // Scroll to bottom effect
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversation]);
    
    // Cleanup audio when component unmounts
    useEffect(() => {
        return () => {
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.src = '';
            }
        };
    }, [currentAudio]);

    // Handle persona change
    const handlePersonaChange = (personaId: string) => {
        const newPersona = AVAILABLE_PERSONAS.find(p => p.id === personaId) || AVAILABLE_PERSONAS[0];
        setSelectedPersona(newPersona);
        
        // Reset conversation with new welcome message
        if (personaId !== 'custom') {
            setConversation([
                { role: 'assistant', content: newPersona.welcomeMessage }
            ]);
        } else {
            setConversation([
                { role: 'assistant', content: customWelcome }
            ]);
            setShowCustomDialog(true);
        }
        
        // Reset progress
        setProgress({
            exchanges: 0,
            successfulResponses: 0,
            currentStreak: 0
        });
    };
    
    // Save custom persona settings
    const handleSaveCustomPersona = () => {
        // Update the custom persona in the available personas list
        const updatedPersonas = [...AVAILABLE_PERSONAS];
        const customIndex = updatedPersonas.findIndex(p => p.id === 'custom');
        if (customIndex >= 0) {
            updatedPersonas[customIndex] = {
                ...updatedPersonas[customIndex],
                systemPrompt: customPrompt,
                welcomeMessage: customWelcome
            };
        }
        
        // Update conversation with new welcome message
        setConversation([
            { role: 'assistant', content: customWelcome }
        ]);
        
        setShowCustomDialog(false);
    };

    // Success Detection - analyze AI responses for indications of success
    const detectSuccess = (responseText: string): boolean => {
        const successPatterns = [
            /that addresses my (main )?concern/i,
            /that (sounds|seems) more (feasible|reasonable|acceptable)/i,
            /i (can|could) see how that would work/i,
            /you've convinced me/i,
            /good point/i,
            /valid argument/i,
            /fair (point|assessment)/i
        ];
        
        return successPatterns.some(pattern => pattern.test(responseText));
    };
    
    // Update progress based on AI response
    const updateProgress = (responseText: string) => {
        setProgress(prev => {
            // Check if this response indicates success
            const isSuccess = detectSuccess(responseText);
            
            const newProgress = {
                exchanges: prev.exchanges + 1,
                successfulResponses: isSuccess ? prev.successfulResponses + 1 : prev.successfulResponses,
                currentStreak: isSuccess ? prev.currentStreak + 1 : 0
            };
            
            // Show toast for streak achievements
            if (newProgress.currentStreak === 2) {
                toast({
                    title: "You're on a roll!",
                    description: "Your arguments are convincing the skeptic."
                });
            }
            
            return newProgress;
        });
    };

    // Generate TTS for an assistant message
    const generateAudio = async (messageIndex: number) => {
        if (messageIndex < 0 || messageIndex >= conversation.length) {
            console.error(`Invalid message index: ${messageIndex}, conversation length: ${conversation.length}`);
            return;
        }
        
        const message = conversation[messageIndex];
        if (message.role !== 'assistant' || !message.content || message.audioUrl) {
            return; // Skip if not assistant, no content, or already has audio
        }
        
        // Show loading toast
        toast({
            title: "Generating audio...",
            description: "Converting the message to speech"
        });
        
        try {
            // Update message to show loading state
            setConversation(prev => {
                const updated = [...prev];
                updated[messageIndex] = {
                    ...updated[messageIndex],
                    isPlaying: true // Repurpose this to show loading state
                };
                return updated;
            });
            
            console.log(`Generating audio for text: "${message.content.substring(0, 50)}..."`);
            
            // Call our TTS API endpoint with the specific message content
            const response = await fetch("/api/pollinations/audio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: message.content,
                    voice: selectedVoice
                }),
            });
            
            if (!response.ok) {
                let errorText = "";
                try {
                    const errorJson = await response.json();
                    errorText = errorJson.error || JSON.stringify(errorJson);
                    console.error("Audio API error response:", errorJson);
                } catch (e) {
                    errorText = await response.text();
                    console.error("Audio API error response:", errorText);
                }
                throw new Error(`Audio generation failed: ${response.status}`);
            }
            
            // Get audio as blob and create object URL
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // Update message with audio URL and stop loading state
            setConversation(prev => {
                const updated = [...prev];
                updated[messageIndex] = {
                    ...updated[messageIndex],
                    audioUrl,
                    isPlaying: false
                };
                return updated;
            });
            
            // Add simple transcription
            setConversation(prev => {
                const updated = [...prev];
                if (!updated[messageIndex].transcription) {
                    updated[messageIndex] = {
                        ...updated[messageIndex],
                        transcription: message.content
                    };
                }
                return updated;
            });
            
            // Auto-play if enabled
            if (audioEnabled) {
                playAudio(messageIndex);
            }
            
        } catch (error) {
            console.error("Error generating audio:", error);
            
            // Update message to remove loading state
            setConversation(prev => {
                const updated = [...prev];
                updated[messageIndex] = {
                    ...updated[messageIndex],
                    isPlaying: false
                };
                return updated;
            });
            
            // Show error toast
            toast({
                title: "Audio generation failed",
                description: error instanceof Error ? error.message : "Unknown error",
                variant: "destructive"
            });
        }
    };
    
    // Play audio for a message
    const playAudio = (messageIndex: number) => {
        const message = conversation[messageIndex];
        if (!message.audioUrl) {
            generateAudio(messageIndex);
            return;
        }
        
        // Stop any currently playing audio
        if (currentAudio) {
            currentAudio.pause();
            
            // Reset isPlaying for all messages
            setConversation(prev => prev.map(m => ({...m, isPlaying: false})));
        }
        
        // Create and play the new audio
        const audio = new Audio(message.audioUrl);
        audio.onended = () => {
            // Reset playing state when done
            setConversation(prev => {
                const updated = [...prev];
                if (updated[messageIndex]) {
                    updated[messageIndex] = {
                        ...updated[messageIndex],
                        isPlaying: false
                    };
                }
                return updated;
            });
            setCurrentAudio(null);
        };
        
        audio.play().catch(err => {
            console.error("Error playing audio:", err);
            toast({
                title: "Audio Playback Failed",
                description: "Could not play the audio",
                variant: "destructive"
            });
        });
        
        // Set as current audio and update state
        setCurrentAudio(audio);
        setConversation(prev => {
            const updated = [...prev];
            if (updated[messageIndex]) {
                updated[messageIndex] = {
                    ...updated[messageIndex],
                    isPlaying: true
                };
            }
            return updated;
        });
    };
    
    // Stop audio playback
    const stopAudio = () => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            setCurrentAudio(null);
            
            // Reset all playing states
            setConversation(prev => prev.map(m => ({...m, isPlaying: false})));
        }
    };

    // Handle sending a user message
    const handleSendMessage = async () => {
        // Don't send empty messages
        if (!currentUserInput.trim()) return;
        
        // Stop any playing audio when sending a new message
        stopAudio();
        
        // Add user message to the conversation
        const userMessage: Message = {
            role: 'user',
            content: currentUserInput
        };
        
        setConversation(prev => [...prev, userMessage]);
        setCurrentUserInput('');
        setIsLoading(true);
        setError(null);
        
        try {
            // Create messages array for the API
            const apiMessages = conversation.map(msg => ({
                role: msg.role,
                content: msg.content
            }));
            
            // Add the new user message
            apiMessages.push({
                role: userMessage.role,
                content: userMessage.content
            });
            
            // Get the system prompt based on selected persona
            const systemPrompt = selectedPersona.id === 'custom' 
                ? customPrompt 
                : selectedPersona.systemPrompt;
            
            // Include domain in the request for domain-specific objections
            const domainInfo = domain !== 'general' 
                ? `The objections should be specific to the ${domain} industry. ` 
                : '';
            
            // Full system message with domain info if applicable
            const fullSystemPrompt = domainInfo + systemPrompt;
            
            // Add a thinking message temporarily
            const thinkingMessage: Message = {
                role: 'assistant',
                content: '...'
            };
            
            setConversation(prev => [...prev, thinkingMessage]);
            
            // Call Pollinations API
            const response = await fetch("/api/pollinations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "openai",
                    messages: [
                        { role: "system", content: fullSystemPrompt },
                        ...apiMessages.slice(1)  // Skip the initial welcome message
                    ],
                    temperature: 0.7
                })
            });
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const responseData = await response.json();
            
            // Remove the thinking message
            setConversation(prev => prev.slice(0, prev.length - 1));
            
            // Create actual AI response message
            const aiResponse: Message = {
                role: 'assistant',
                content: responseData.content || "I'm not sure how to respond to that."
            };
            
            // Add AI message to conversation and then generate audio for it
            setConversation(prev => {
                const newConversation = [...prev, aiResponse];
                
                // Use setTimeout to wait for state to update, then generate audio for last message
                setTimeout(() => {
                    const lastIndex = newConversation.length - 1;
                    console.log(`Generating audio for message at index ${lastIndex}, conversation length: ${newConversation.length}`);
                    generateAudio(lastIndex);
                }, 300); 
                
                return newConversation;
            });
            
            // Update progress state based on the AI's response
            updateProgress(aiResponse.content);
            
        } catch (error) {
            console.error("Error getting AI response:", error);
            
            // Remove the thinking message
            setConversation(prev => prev.slice(0, prev.length - 1));
            
            // Set error state
            setError(error instanceof Error ? error.message : "Failed to get response");
            
            // Add error message to conversation
            setConversation(prev => [
                ...prev, 
                { 
                    role: 'assistant', 
                    content: "Sorry, I couldn't process your message. Please try again."
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Calculate persuasiveness score (0-100)
    const calculatePersuasiveness = (): number => {
        if (progress.exchanges === 0) return 0;
        
        const baseScore = Math.min(100, (progress.successfulResponses / progress.exchanges) * 100);
        const streakBonus = Math.min(20, progress.currentStreak * 5); // 5 points per streak, max 20
        
        return Math.min(100, baseScore + streakBonus);
    };
    
    const persuasivenessScore = calculatePersuasiveness();

    return (
        <div className="w-full max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
                <span className="mr-2">AI Conversation Practice</span>
                <span className="text-sky-400 text-sm px-2 py-0.5 bg-sky-950/30 rounded-md border border-sky-800/30">
                    {selectedPersona.name}
                </span>
            </h2>
            <p className="text-muted-gray mb-6">
                Practice handling conversations with different AI personas. Current persona: <span className="text-sky-400">{selectedPersona.name}</span> - {selectedPersona.description}
            </p>
            
            {/* Settings Panel */}
            <Card className="mb-4 bg-near-black border-light-gray">
                <CardContent className="p-4 space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        {/* Persona Selection */}
                        <div className="w-full md:w-1/3 space-y-2">
                            <Label htmlFor="persona-select" className="text-muted-gray text-sm">
                                AI Persona
                            </Label>
                            <Select value={selectedPersona.id} onValueChange={handlePersonaChange}>
                                <SelectTrigger id="persona-select" className="bg-near-black border-light-gray text-white">
                                    <SelectValue placeholder="Select persona" />
                                </SelectTrigger>
                                <SelectContent className="bg-near-black border-light-gray text-white">
                                    {AVAILABLE_PERSONAS.map(persona => (
                                        <SelectItem key={persona.id} value={persona.id}>
                                            {persona.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {/* Voice Selection */}
                        <div className="w-full md:w-1/3 space-y-2">
                            <Label htmlFor="voice-select" className="text-muted-gray text-sm">
                                Voice
                            </Label>
                            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                                <SelectTrigger id="voice-select" className="bg-near-black border-light-gray text-white">
                                    <SelectValue placeholder="Select voice" />
                                </SelectTrigger>
                                <SelectContent className="bg-near-black border-light-gray text-white">
                                    {AVAILABLE_VOICES.map(voice => (
                                        <SelectItem key={voice.id} value={voice.id}>
                                            {voice.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {/* Audio Toggle */}
                        <div className="w-full md:w-1/3 space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="auto-audio" className="text-muted-gray text-sm">
                                    Audio Responses
                                </Label>
                                <div className="bg-green-900/30 border border-green-500/30 text-green-500 text-xs px-2 py-1 rounded-full">
                                    Always On
                                </div>
                            </div>
                            <div className="text-xs text-green-500">
                                Audio is automatically generated for all AI responses
                            </div>
                        </div>
                    </div>
                    
                    {/* Progress Score - Only show for skeptical client */}
                    {selectedPersona.id === 'skeptical_client' && (
                        <div className="pt-2 border-t border-light-gray/30">
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-sm text-muted-gray flex items-center gap-1">
                                    Persuasiveness Score
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-3.5 w-3.5 text-muted-gray/70 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-black text-white border-light-gray max-w-[250px]">
                                                <p className="text-xs">
                                                    This score reflects how effectively you're addressing objections. 
                                                    It increases when the AI acknowledges your points or agrees with your responses.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Label>
                                <span className="text-sm font-medium" style={{
                                    color: persuasivenessScore < 30 ? '#ef4444' : 
                                          persuasivenessScore < 60 ? '#f97316' :
                                          persuasivenessScore < 80 ? '#3b82f6' : '#22c55e'
                                }}>
                                    {persuasivenessScore.toFixed(0)}%
                                </span>
                            </div>
                            <Progress 
                                value={persuasivenessScore} 
                                className="h-2 bg-light-gray/30"
                                style={{
                                    background: 'rgba(38, 38, 42, 0.4)',
                                    '--progress-color': persuasivenessScore < 30 ? '#ef4444' : 
                                          persuasivenessScore < 60 ? '#f97316' :
                                          persuasivenessScore < 80 ? '#3b82f6' : '#22c55e'
                                } as React.CSSProperties}
                            />
                            <div className="flex justify-between text-xs text-muted-gray/70 mt-1">
                                <span>Struggling</span>
                                <span>Convincing</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Chat Display Area */}
            <Card className="mb-4 bg-near-black border-light-gray">
                <CardContent className="p-4 h-[450px] overflow-y-auto space-y-4">
                    {conversation.map((msg, index) => (
                        <div
                            key={index}
                            className={cn(
                                "flex",
                                msg.role === 'user' ? 'justify-end' : 'justify-start'
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[75%] rounded-lg px-4 py-2 text-sm",
                                    msg.role === 'user'
                                        ? 'bg-blue-800/50 text-white' // User message style
                                        : 'bg-light-gray/10 text-muted-gray' // AI message style
                                )}
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <div>{msg.content}</div>
                                    
                                    {/* Audio control buttons - only for assistant messages */}
                                    {msg.role === 'assistant' && msg.content && !msg.content.startsWith('[Error') && (
                                        <div className="flex items-center ml-2 mt-1">
                                            {msg.isPlaying ? (
                                                msg.audioUrl ? (
                                                    <PauseCircle 
                                                        className="h-5 w-5 text-sky-400 cursor-pointer flex-shrink-0" 
                                                        onClick={() => stopAudio()}
                                                    />
                                                ) : (
                                                    <Loader2 className="h-5 w-5 text-sky-400 animate-spin flex-shrink-0" />
                                                )
                                            ) : (
                                                <PlayCircle 
                                                    className={`h-5 w-5 ${msg.audioUrl ? 'text-sky-400' : 'text-muted-gray'} cursor-pointer hover:text-sky-300 flex-shrink-0`}
                                                    onClick={() => playAudio(index)}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Show transcription if available */}
                                {msg.transcription && msg.audioUrl && (
                                    <div className="mt-2 pt-2 border-t border-gray-700/30 text-xs text-muted-gray/70">
                                        <div className="flex items-center gap-1 mb-1">
                                            <MessagesSquare className="h-3 w-3" />
                                            <span>Transcription:</span>
                                        </div>
                                        {msg.transcription}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {/* Dummy div to ensure scroll to bottom */}
                    <div ref={chatEndRef} />
                </CardContent>
            </Card>

            {/* Input Area */}
            <div className="flex gap-2 items-start">
                <Textarea
                    placeholder="Enter your message..."
                    value={currentUserInput}
                    onChange={(e) => setCurrentUserInput(e.target.value)}
                    className="flex-grow bg-near-black border-light-gray placeholder:text-muted-gray text-white min-h-[60px] resize-none"
                    rows={2}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault(); // Prevent newline on Enter
                            handleSendMessage();
                        }
                    }}
                />
                <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !currentUserInput.trim()}
                    className="bg-white text-black hover:bg-white/90 font-semibold disabled:opacity-60 h-[60px]" // Match height roughly
                >
                    {isLoading ? 'Sending...' : 'Send'}
                </Button>
            </div>

            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            
            {/* Optional: Usage Tips */}
            <div className="mt-6 text-xs text-muted-gray/70 space-y-1">
                <p>💡 <span className="text-sky-400/90">Tip:</span> Select different personas to practice various conversation scenarios.</p>
                <p>💡 <span className="text-sky-400/90">Tip:</span> Press the Play button next to the AI's message to hear it spoken aloud.</p>
                <p>💡 <span className="text-sky-400/90">Tip:</span> For a custom persona, select "Custom Persona" and define your own conversation partner.</p>
            </div>
            
            {/* Custom Persona Dialog */}
            <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
                <DialogContent className="bg-near-black border-light-gray text-white">
                    <DialogHeader>
                        <DialogTitle>Configure Custom Persona</DialogTitle>
                        <DialogDescription className="text-muted-gray">
                            Define how you want your custom AI persona to behave and respond.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div>
                            <Label htmlFor="custom-welcome" className="mb-2 block">Welcome Message</Label>
                            <Textarea
                                id="custom-welcome"
                                value={customWelcome}
                                onChange={(e) => setCustomWelcome(e.target.value)}
                                placeholder="Enter welcome message..."
                                className="bg-black border-light-gray text-white placeholder:text-muted-gray"
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="custom-prompt" className="mb-2 block">System Prompt (Personality)</Label>
                            <Textarea
                                id="custom-prompt"
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder="Define the persona's behavior and how it should respond..."
                                className="bg-black border-light-gray text-white placeholder:text-muted-gray min-h-[150px]"
                            />
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowCustomDialog(false)}>Cancel</Button>
                        <Button onClick={handleSaveCustomPersona}>Save & Apply</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}