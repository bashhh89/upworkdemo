'use client';

import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card"; // Use Card for output consistency


export function CritiqueSection() {
    const [userInput, setUserInput] = useState('');
    const [aiCritique, setAiCritique] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const handleGetCritique = async () => {
        const input = userInput.trim();
        if (!input) {
            toast({ title: "Input Required", description: "Please describe your marketing challenge or approach.", variant: "destructive"});
            return;
        }

        setIsLoading(true);
        setAiCritique(null);
        setError(null);

        const systemPrompt = "You are an expert, direct, but constructive marketing consultant AI. Analyze the user's description of their marketing challenge or approach. Provide critical feedback identifying 2-3 key weaknesses, missed opportunities, or potential strategic flaws. Frame the critique constructively, suggesting high-level areas for rethinking or improvement. Keep the tone professional and insightful, avoiding overly harsh or generic language. Focus on strategic insights. Respond with only the critique text, no greetings or closings.";
        const userPrompt = `Analyze and critique the following marketing description:\n\n${input}`;

        try {
            console.log("Sending AI Critique Request...");
            // NOTE: Using the backend proxy route we created earlier
            const response = await fetch("/api/pollinations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "openai", // Or another suitable model like mistral
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ],
                    // No response_format needed, expecting text
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("API Error Response:", response.status, errorText);
                throw new Error(`API request failed: ${response.status}`);
            }

            const result = await response.json(); // Our backend route should return JSON
            console.log("AI Raw Response:", result);

            // Extract content assuming our backend route returns OpenAI-like structure
            const critiqueText = result?.content || result?.choices?.[0]?.message?.content?.trim();

            if (!critiqueText) {
                 console.error("AI response content is missing or empty:", result);
                 throw new Error("AI did not provide a critique.");
            }

            setAiCritique(critiqueText);

        } catch (err) {
             console.error("Error fetching AI critique:", err);
             const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
             setError(`Failed to get critique: ${errorMessage}`);
             toast({ title: "Error", description: `Failed to get critique: ${errorMessage}`, variant: "destructive"});
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="w-full max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-white">AI Marketing Critique</h2>
            <p className="text-muted-gray mb-6">
                Describe your current marketing challenge, strategy, or a specific campaign, and get direct, constructive feedback from our AI consultant.
            </p>

            <div className="space-y-4">
                <Textarea
                    placeholder="Example: We primarily use SEO and infrequent email newsletters. Our main challenge is low lead quality..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="bg-near-black border-light-gray placeholder:text-muted-gray text-white min-h-[150px]"
                    rows={6}
                    disabled={isLoading}
                />
                <Button
                    onClick={handleGetCritique}
                    disabled={isLoading || !userInput.trim()}
                    className="w-full sm:w-auto bg-white text-black hover:bg-white/90 font-semibold disabled:opacity-60"
                >
                    {isLoading ? 'Analyzing...' : 'Get AI Critique'}
                </Button>
            </div>

            {/* Results Area */}
            <Card className="mt-8 bg-near-black border-light-gray min-h-[150px]">
                <CardContent className="p-6">
                     <h3 className="text-lg font-semibold text-white mb-4">AI Consultant Feedback:</h3>
                     {isLoading && (
                         <div className="flex items-center justify-center h-full">
                             <p className="text-muted-gray animate-pulse">AI is analyzing...</p>
                         </div>
                     )}
                     {error && !isLoading && (
                         <p className="text-red-500 text-sm">{error}</p>
                     )}
                     {!isLoading && !error && aiCritique && (
                         <p className="text-muted-gray whitespace-pre-line leading-relaxed">{aiCritique}</p>
                     )}
                     {!isLoading && !error && !aiCritique && (
                         <p className="text-muted-gray text-sm italic">Critique will appear here once generated.</p>
                     )}
                </CardContent>
            </Card>
        </div>
    );
} 