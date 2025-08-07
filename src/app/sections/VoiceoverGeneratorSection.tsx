'use client';

import React, { useState, useEffect } from 'react';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Slider } from '../../components/ui/slider';
import { 
  Mic, 
  Play, 
  Pause, 
  Download, 
  Copy, 
  Volume2, 
  Settings, 
  MessageSquare, 
  AudioWaveform,
  Clock,
  User,
  Sparkles,
  RefreshCw,
  Share,
  History,
  Zap
} from 'lucide-react';

export function VoiceoverGeneratorSection() {
    const [textInput, setTextInput] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('nova'); // Default to nova (best quality)
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeMode, setActiveMode] = useState<'conversation' | 'tts'>('tts');
    const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string, audio?: string}>>([]);
    const [voiceHistory, setVoiceHistory] = useState<Array<{text: string, voice: string, url: string, timestamp: Date}>>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const { toast } = useToast();

    // Enhanced voice options with descriptions and characteristics
    const voices = [
        { 
            id: 'nova', 
            name: 'Nova', 
            description: 'Warm, engaging female voice - perfect for narration',
            gender: 'Female',
            style: 'Professional',
            accent: 'American'
        },
        { 
            id: 'alloy', 
            name: 'Alloy', 
            description: 'Neutral, versatile voice - great for any content',
            gender: 'Neutral',
            style: 'Balanced',
            accent: 'American'
        },
        { 
            id: 'echo', 
            name: 'Echo', 
            description: 'Clear, authoritative male voice - ideal for presentations',
            gender: 'Male',
            style: 'Authoritative',
            accent: 'American'
        },
        { 
            id: 'fable', 
            name: 'Fable', 
            description: 'Storytelling voice with character - perfect for content',
            gender: 'Male',
            style: 'Expressive',
            accent: 'British'
        },
        { 
            id: 'onyx', 
            name: 'Onyx', 
            description: 'Deep, confident male voice - great for serious content',
            gender: 'Male',
            style: 'Deep',
            accent: 'American'
        },
        { 
            id: 'shimmer', 
            name: 'Shimmer', 
            description: 'Bright, energetic female voice - perfect for marketing',
            gender: 'Female',
            style: 'Energetic',
            accent: 'American'
        }
    ];

    const conversationStarters = [
        "Hi there! How can I help you today?",
        "Welcome! What would you like to know?",
        "Hello! I'm here to assist you with anything you need.",
        "Greetings! What can I do for you?",
        "Hey! Ready to chat about whatever's on your mind?"
    ];

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

    const handleGenerateAudio = async (mode: 'conversation' | 'tts' = activeMode) => {
        setIsLoading(true);
        setAudioUrl(null);
        setError(null);

        if (!textInput.trim()) {
            setError('Please enter text to generate audio.');
            setIsLoading(false);
            return;
        }

        try {
            let payload;
            
            if (mode === 'conversation') {
                // Conversation mode - AI responds and speaks
                payload = {
                    "model": "openai-audio",
                    "messages": [
                        { "role": "system", "content": "You are a helpful AI assistant. Respond naturally and conversationally." },
                        ...conversationHistory.map(msg => ({ role: msg.role, content: msg.content })),
                        { "role": "user", "content": textInput }
                    ],
                    "modalities": ["text", "audio"],
                    "audio": { 
                        "voice": selectedVoice,
                        "format": "mp3"
                    }
                };
            } else {
                // TTS mode - direct text to speech
                payload = {
                    "model": "openai-audio",
                    "messages": [{ "role": "user", "content": textInput }],
                    "modalities": ["text", "audio"],
                    "audio": { 
                        "voice": selectedVoice,
                        "format": "mp3"
                    }
                };
            }

            const response = await fetch('https://text.pollinations.ai/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error: ${response.status} - ${errorText}`);
            }

            const responseData = await response.json();

            if (responseData.choices && responseData.choices[0]?.message?.audio?.data) {
                const audioBase64 = responseData.choices[0].message.audio.data;
                const textResponse = responseData.choices[0].message.content || textInput;
                
                // Convert Base64 to Blob
                const byteCharacters = atob(audioBase64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const audioBlob = new Blob([byteArray], { type: 'audio/mpeg' });
                
                if (audioUrl) {
                    URL.revokeObjectURL(audioUrl);
                }
                
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);

                // Add to history
                const historyItem = {
                    text: mode === 'conversation' ? textResponse : textInput,
                    voice: selectedVoice,
                    url: url,
                    timestamp: new Date()
                };
                setVoiceHistory(prev => [historyItem, ...prev.slice(0, 9)]);

                // Update conversation history if in conversation mode
                if (mode === 'conversation') {
                    setConversationHistory(prev => [
                        ...prev,
                        { role: 'user', content: textInput },
                        { role: 'assistant', content: textResponse, audio: url }
                    ]);
                }

                toast({
                    title: "Success",
                    description: `Audio generated with ${voices.find(v => v.id === selectedVoice)?.name} voice`,
                });

            } else {
                throw new Error('Unexpected API response format');
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

    const handlePlayPause = () => {
        if (!audioUrl) return;

        if (currentAudio && !currentAudio.paused) {
            currentAudio.pause();
            setIsPlaying(false);
        } else {
            const audio = new Audio(audioUrl);
            audio.play();
            setCurrentAudio(audio);
            setIsPlaying(true);
            
            audio.onended = () => {
                setIsPlaying(false);
                setCurrentAudio(null);
            };
        }
    };

    const handleDownload = () => {
        if (!audioUrl) return;
        
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = `voice-${selectedVoice}-${Date.now()}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast({
            title: "Downloaded",
            description: "Audio file saved to your downloads folder",
        });
    };

    const handleCopyUrl = () => {
        if (audioUrl) {
            navigator.clipboard.writeText(audioUrl);
            toast({
                title: "Copied",
                description: "Audio URL copied to clipboard",
            });
        }
    };

    const handleVoicePreview = async (voiceId: string) => {
        const previewText = "Hi there! This is how I sound. I'm ready to help you create amazing voiceovers.";
        const originalText = textInput;
        const originalVoice = selectedVoice;
        
        setTextInput(previewText);
        setSelectedVoice(voiceId);
        
        await handleGenerateAudio('tts');
        
        setTextInput(originalText);
        setSelectedVoice(originalVoice);
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                        <Mic className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">AI Voice Studio</h1>
                        <p className="text-zinc-400">Professional text-to-speech and conversational AI with premium voices</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Mode Selector */}
                <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as 'conversation' | 'tts')} className="mb-8">
                    <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border-zinc-800">
                        <TabsTrigger value="tts" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                            <AudioWaveform className="h-4 w-4 mr-2" />
                            Text-to-Speech
                        </TabsTrigger>
                        <TabsTrigger value="conversation" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            AI Conversation
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="tts" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Panel - Voice Selection */}
                            <div className="lg:col-span-1 space-y-6">
                                <Card className="bg-zinc-900/80 border-zinc-800">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Voice Selection
                                        </CardTitle>
                                        <CardDescription>Choose from premium AI voices</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {voices.map(voice => (
                                            <div 
                                                key={voice.id}
                                                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                                    selectedVoice === voice.id 
                                                        ? 'border-blue-500 bg-blue-500/10' 
                                                        : 'border-zinc-700 hover:border-zinc-600'
                                                }`}
                                                onClick={() => setSelectedVoice(voice.id)}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium text-white">{voice.name}</h4>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {voice.gender}
                                                        </Badge>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleVoicePreview(voice.id);
                                                        }}
                                                        disabled={isLoading}
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <Play className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-zinc-400 mb-2">{voice.description}</p>
                                                <div className="flex gap-1">
                                                    <Badge variant="outline" className="text-xs">{voice.style}</Badge>
                                                    <Badge variant="outline" className="text-xs">{voice.accent}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Panel - Text Input & Generation */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="bg-zinc-900/80 border-zinc-800">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <Settings className="h-4 w-4" />
                                            Text Input
                                        </CardTitle>
                                        <CardDescription>Enter your text for professional voiceover generation</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Textarea
                                            placeholder="Enter your text here... You can include SSML tags for advanced control like <break time='1s'/> for pauses."
                                            value={textInput}
                                            onChange={(e) => setTextInput(e.target.value)}
                                            className="min-h-[200px] bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 resize-none"
                                            disabled={isLoading}
                                        />
                                        
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setTextInput("Welcome to our company! We're excited to help you achieve your goals.")}
                                                className="text-xs border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                            >
                                                Business Welcome
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setTextInput("In this tutorial, we'll walk you through the step-by-step process.")}
                                                className="text-xs border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                            >
                                                Tutorial Intro
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setTextInput("Thank you for watching! Don't forget to subscribe for more content.")}
                                                className="text-xs border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                            >
                                                Video Outro
                                            </Button>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button 
                                                onClick={() => handleGenerateAudio('tts')} 
                                                disabled={isLoading || !textInput.trim()}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Zap className="h-4 w-4 mr-2" />
                                                        Generate Voice
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Audio Player */}
                                <Card className="bg-zinc-900/80 border-zinc-800">
                                    <CardContent className="p-6">
                                        <div className="min-h-[120px] flex items-center justify-center bg-zinc-800 rounded-lg relative">
                                            {isLoading && (
                                                <div className="text-center">
                                                    <RefreshCw className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-2" />
                                                    <p className="text-zinc-400">Generating your voiceover...</p>
                                                </div>
                                            )}

                                            {error && !isLoading && (
                                                <div className="text-center text-red-400">
                                                    <p>{error}</p>
                                                </div>
                                            )}

                                            {audioUrl && !isLoading && (
                                                <div className="w-full">
                                                    <audio controls src={audioUrl} className="w-full mb-4" key={audioUrl}>
                                                        Your browser does not support the audio element.
                                                    </audio>
                                                    
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={handlePlayPause}
                                                            variant="outline"
                                                            className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                                        >
                                                            {isPlaying ? (
                                                                <><Pause className="h-4 w-4 mr-2" /> Pause</>
                                                            ) : (
                                                                <><Play className="h-4 w-4 mr-2" /> Play</>
                                                            )}
                                                        </Button>
                                                        <Button
                                                            onClick={handleDownload}
                                                            variant="outline"
                                                            className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                                        >
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Download
                                                        </Button>
                                                        <Button
                                                            onClick={handleCopyUrl}
                                                            variant="outline"
                                                            className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                                        >
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Copy URL
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {!isLoading && !error && !audioUrl && (
                                                <div className="text-center text-zinc-400">
                                                    <Volume2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                    <p>Your generated voice will appear here</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="conversation" className="space-y-6">
                        <Card className="bg-zinc-900/80 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    AI Conversation
                                </CardTitle>
                                <CardDescription>Chat with AI and get spoken responses</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Conversation History */}
                                <div className="min-h-[300px] max-h-[400px] overflow-y-auto bg-zinc-800 rounded-lg p-4 space-y-3">
                                    {conversationHistory.length === 0 ? (
                                        <div className="text-center text-zinc-400 py-8">
                                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>Start a conversation with the AI</p>
                                            <div className="mt-4 space-y-2">
                                                {conversationStarters.map((starter, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setTextInput(starter)}
                                                        className="block w-full text-left p-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                                                    >
                                                        "{starter}"
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        conversationHistory.map((msg, index) => (
                                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] rounded-lg p-3 ${
                                                    msg.role === 'user' 
                                                        ? 'bg-blue-600 text-white' 
                                                        : 'bg-zinc-700 text-white'
                                                }`}>
                                                    <p className="text-sm">{msg.content}</p>
                                                    {msg.audio && (
                                                        <audio controls src={msg.audio} className="w-full mt-2 h-8">
                                                            Your browser does not support the audio element.
                                                        </audio>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="flex gap-2">
                                    <Textarea
                                        placeholder="Type your message..."
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[60px] resize-none"
                                        disabled={isLoading}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleGenerateAudio('conversation');
                                            }
                                        }}
                                    />
                                    <Button 
                                        onClick={() => handleGenerateAudio('conversation')} 
                                        disabled={isLoading || !textInput.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                                    >
                                        {isLoading ? (
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Voice History */}
                {voiceHistory.length > 0 && (
                    <Card className="bg-zinc-900/80 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <History className="h-4 w-4" />
                                Recent Generations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {voiceHistory.map((item, index) => (
                                    <div key={index} className="p-3 bg-zinc-800 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge variant="outline" className="text-xs">
                                                {voices.find(v => v.id === item.voice)?.name}
                                            </Badge>
                                            <span className="text-xs text-zinc-400">
                                                {item.timestamp.toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-300 mb-2 line-clamp-2">{item.text}</p>
                                        <audio controls src={item.url} className="w-full h-8">
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
