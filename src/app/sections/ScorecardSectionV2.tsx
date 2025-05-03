/*
AI Assistant, **ATTENTION:** We are abandoning attempts to modify the existing `ScorecardSection`. Instead, create a **brand new component from scratch** called `ScorecardSectionV2.tsx` that fully implements the AI Efficiency Scorecard with all required features and follows the "Ahmad Basheer Style Guide".

**Task:** Create the file `src/app/sections/ScorecardSectionV2.tsx` containing a new React component that implements the complete AI Efficiency Scorecard.

**Core Requirements:**

1.  **Component:** Create a new functional React component named `ScorecardSectionV2`. Mark it as a Client Component (`'use client';`).
2.  **Questions:**
    * Define an array (`questions`) containing **at least 20 questions** relevant to assessing AI readiness for marketing/sales.
    * Each question object must have: `id` (unique string), `category` (string, e.g., 'Strategy & Goals', 'Data Readiness', 'Tool Adoption', 'Team Skills', 'Process Integration'), `text` (string, the question), `type` (string: 'yesno', 'scale' [1-5], 'radio', 'textarea'), and `options` (array of strings, required for 'scale' and 'radio').
    * Include the questions previously defined in Prompts 5 and 19, plus additional relevant ones to reach the ~20 count. Ensure good distribution across categories.
3.  **Step-by-Step UI:**
    * Implement a step-by-step interface using Shadcn UI `<Card>`.
    * **Display ONE question per step.**
    * **Card Header:** Show the current question number (e.g., "Question 3 of 20") and the question's `category`.
    * **Card Content:** Display the question `text`. Render the appropriate Shadcn UI input based on the question `type` (`<RadioGroup>` for scale/radio, `<Button>` pair for yesno, `<Textarea>` for textarea).
    * **Card Footer:** Include "Previous" and "Next"/"Finish" buttons. Disable "Next"/"Finish" if an answer is required but not yet provided for the current question. Style buttons clearly (Primary for Next/Finish, Outline for Previous).
4.  **State Management:**
    * `currentStep` (number): Tracks the current question index (0 to `questions.length`).
    * `answers` (object): Stores user answers `{ [questionId]: answerValue }`.
    * `finalScore` (number | null): Stores the calculated percentage score.
    * `scoreCategory` (string | null): Stores the calculated category ('Beginner', 'Intermediate', 'Advanced').
5.  **Input Handling:** Ensure selecting/typing an answer correctly updates the `answers` state for the current question's `id`. Inputs should reflect the stored answer if navigating back/forth.
6.  **Scoring Logic:**
    * Implement the `calculateScore(answers, questions)` function.
    * Define clear point values for each answer type/option. Calculate `totalPoints` and `maxPossiblePoints`. Return the percentage score `(totalPoints / maxPossiblePoints) * 100`.
7.  **Recommendations Logic:**
    * Implement the `recommendations` object with detailed, actionable advice for 'Beginner', 'Intermediate', and 'Advanced' categories.
    * Implement `getRecommendations(scorePercent)` and `getScoreCategory(scorePercent)` functions (using 0-33, 34-66, 67-100% thresholds).
8.  **Results View:**
    * When `currentStep === questions.length`, render the results view **instead** of a question card.
    * Use a Shadcn `<Card>` for the results.
    * Display: Title ("Your AI Efficiency Score"), Score Percentage (large text), Score Category (styled text), optional `<Progress>` bar, tailored Recommendations list (using `getRecommendations` and styled with checkmark icons), and a "Start Over" button (`handleStartOver` function to reset state).
    * **NO JSON DUMP.**
9.  **Styling & UX:**
    * Strictly adhere to the "Ahmad Basheer Style Guide" (dark theme, near-black cards, white text, light-gray borders, white/sky-blue accents).
    * Ensure all UI elements (inputs, buttons, progress bar, text) are well-styled, spaced, and visually consistent.
    * Fix any previous styling issues with buttons (e.g., Yes/No pair should clearly show selection). Use Shadcn `Button` variants effectively (`default`, `outline`, potentially `secondary`). Ensure proper hover/active states.
    * Add subtle animations (e.g., fade-in for results card using `animate-in fade-in duration-500`).
10. **Integration (Placeholder):** For now, just ensure the component is exportable (`export function ScorecardSectionV2() { ... }`). We will integrate it into `page.tsx` later.

**Goal:** Create a complete, self-contained, well-styled, and fully functional `ScorecardSectionV2.tsx` component from scratch that implements the entire scorecard experience, including ~20 questions, step-by-step navigation, input handling, scoring logic, and a polished results screen with tailored recommendations.
*/
'use client';

import React, { useState, useMemo, useEffect } from 'react'; // Import React and hooks
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Download, Square, Lightbulb, AlertCircle, Send } from 'lucide-react';
import { cn } from "@/lib/utils"; // Assuming utils file exists

// --- Define Interfaces ---
// Updated interfaces for conversational flow
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AiQuestion {
  questionText: string;
  inputType: 'yesno' | 'scale' | 'radio' | 'textarea';
  options: string[] | null;
}

interface AiReport {
  keyFindings: string;
  nextSteps: string[];
  checklist: string[];
  toolSuggestions: string[];
}

type AssessmentStage = 'asking_questions' | 'generating_report' | 'showing_report';
type AnswersState = Record<string, any>;

// --- Recommendations ---
const recommendations: Record<string, string[]> = {
  Beginner: [
    "Focus on foundational AI education: Train your team on basic AI concepts and potential marketing/sales applications.",
    "Prioritize data hygiene: Improve the quality, completeness, and accessibility of your customer data.",
    "Start small: Identify 1-2 high-impact, low-complexity processes (e.g., content ideation, email subject line testing) for an initial AI pilot.",
    "Document clear goals: Define specific, measurable objectives for what you want AI to achieve.",
    "Explore user-friendly tools: Look into AI tools with simple interfaces for tasks like writing assistance or image generation.",
  ],
  Intermediate: [
    "Expand tool integration: Focus on connecting AI tools with your core systems like CRM and marketing automation platforms.",
    "Develop Standard Operating Procedures (SOPs): Create clear guidelines and best practices for how teams should use AI tools.",
    "Invest in targeted training: Upskill your team in areas like prompt engineering, data analysis, and interpreting AI insights.",
    "Scale successful pilots: Gradually roll out proven AI use cases to more team members or related processes.",
    "Establish robust monitoring: Track KPIs closely to measure the impact and ROI of AI initiatives.",
  ],
  Advanced: [
    "Explore advanced applications: Investigate areas like hyper-personalization, predictive lead scoring, and complex workflow automation.",
    "Optimize AI performance: Focus on refining prompts, fine-tuning models (if applicable), and A/B testing AI-driven strategies.",
    "Foster cross-functional collaboration: Encourage different teams (sales, marketing, data) to work together on AI projects.",
    "Develop an AI governance framework: Solidify policies around ethical use, data privacy, security, and model validation.",
    "Build an internal knowledge base: Create a 'Center of Excellence' or resource hub to share learnings and best practices.",
  ]
};

function getScoreCategory(scorePercent: number): string {
   if (scorePercent <= 33) return "Beginner";
   if (scorePercent <= 66) return "Intermediate";
   return "Advanced";
}

function getRecommendations(scorePercent: number): string[] {
   const category = getScoreCategory(scorePercent);
   return recommendations[category] || [];
}

// --- Scoring Function ---
function calculateScore(answers: AnswersState, questions: AiQuestion[]): { scorePercent: number, totalPoints: number, maxPoints: number } {
    let totalPoints = 0;
    let maxPossiblePoints = 0;

    questions.forEach(q => {
        const answer = answers[q.questionText];
        let points = 0;
        const maxQPoints = q.options?.length ?? 0; // Use defined maxPoints

        if (q.options) {
            points = q.options.indexOf(String(answer)) !== -1 ? 1 : 0;
        }
        // Ensure points don't exceed max points for the question
        points = Math.min(points, maxQPoints);

        totalPoints += points;
        maxPossiblePoints += maxQPoints;
    });

    const scorePercent = maxPossiblePoints > 0 ? Math.round((totalPoints / maxPossiblePoints) * 100) : 0;
    console.log("Score Calculation:", { totalPoints, maxPossiblePoints, scorePercent, answers });
    return { scorePercent, totalPoints, maxPoints: maxPossiblePoints };
}

// --- Define predefined questions with guaranteed correct answer types ---
const fixedQuestions: {
    id: string;
    questionText: string;
    inputType: 'yesno' | 'scale' | 'radio' | 'textarea';
    options: string[] | null;
    category: string;
}[] = [
    {
        id: "q1",
        questionText: "Has your organization defined clear strategic goals for AI implementation?",
        inputType: "yesno",
        options: null,
        category: "Strategy & Goals"
    },
    {
        id: "q2",
        questionText: "How confident is your team in using AI tools and platforms effectively?",
        inputType: "scale",
        options: ["1", "2", "3", "4", "5"],
        category: "Team Skills"
    },
    {
        id: "q3",
        questionText: "Have you implemented any AI solutions in your organization within the past year?",
        inputType: "yesno",
        options: null,
        category: "Tool Adoption"
    },
    {
        id: "q4",
        questionText: "How would you rate the quality and accessibility of your organization's data for AI applications?",
        inputType: "scale",
        options: ["1", "2", "3", "4", "5"],
        category: "Data Readiness"
    },
    {
        id: "q5",
        questionText: "Which department in your organization is leading AI initiatives?",
        inputType: "radio",
        options: ["IT/Technology", "Marketing", "Sales", "Operations", "Product Development", "Cross-functional team", "No dedicated team yet"],
        category: "Strategy & Goals"
    },
    {
        id: "q6",
        questionText: "Does your organization have a dedicated budget for AI initiatives?",
        inputType: "yesno",
        options: null,
        category: "Strategy & Goals"
    },
    {
        id: "q7",
        questionText: "How satisfied are you with the ROI of your current AI implementations?",
        inputType: "scale",
        options: ["1", "2", "3", "4", "5"],
        category: "Tool Adoption"
    },
    {
        id: "q8",
        questionText: "Has your team received any formal training on AI tools and technologies?",
        inputType: "yesno",
        options: null,
        category: "Team Skills"
    },
    {
        id: "q9",
        questionText: "What's the primary goal for implementing AI in your organization?",
        inputType: "radio",
        options: ["Cost reduction", "Improved customer experience", "Increased revenue", "Competitive advantage", "Process efficiency", "Innovation"],
        category: "Strategy & Goals"
    },
    {
        id: "q10",
        questionText: "How effectively are AI tools integrated into your existing workflows and processes?",
        inputType: "scale",
        options: ["1", "2", "3", "4", "5"],
        category: "Process Integration"
    },
    {
        id: "q11",
        questionText: "Does your organization have clear policies for ethical AI use and data privacy?",
        inputType: "yesno",
        options: null,
        category: "Process Integration"
    },
    {
        id: "q12",
        questionText: "How would you rate your team's capability to interpret and act on AI-generated insights?",
        inputType: "scale",
        options: ["1", "2", "3", "4", "5"],
        category: "Team Skills"
    },
    {
        id: "q13",
        questionText: "Which AI technologies has your organization adopted so far?",
        inputType: "radio",
        options: ["Generative AI/LLMs", "Computer Vision", "Natural Language Processing", "Predictive Analytics", "None yet", "Multiple technologies"],
        category: "Tool Adoption"
    },
    {
        id: "q14",
        questionText: "How frequently does your organization evaluate and update its AI strategy?",
        inputType: "radio",
        options: ["Weekly", "Monthly", "Quarterly", "Annually", "No regular evaluation"],
        category: "Strategy & Goals"
    },
    {
        id: "q15",
        questionText: "Do you have systems in place to measure the impact of AI implementations?",
        inputType: "yesno",
        options: null,
        category: "Process Integration"
    },
    {
        id: "q16",
        questionText: "How confident is your leadership team about the strategic direction of AI implementation?",
        inputType: "scale",
        options: ["1", "2", "3", "4", "5"],
        category: "Strategy & Goals"
    },
    {
        id: "q17",
        questionText: "Has your organization experienced resistance to AI adoption from employees?",
        inputType: "yesno",
        options: null,
        category: "Team Skills"
    },
    {
        id: "q18",
        questionText: "How do you primarily measure success for your AI initiatives?",
        inputType: "radio",
        options: ["ROI", "Time saved", "Improved accuracy", "Customer satisfaction", "Revenue increase", "Cost reduction", "Not measuring yet"],
        category: "Process Integration"
    },
    {
        id: "q19",
        questionText: "How would you rate the coordination between technical teams and business units on AI projects?",
        inputType: "scale",
        options: ["1", "2", "3", "4", "5"],
        category: "Team Skills"
    },
    {
        id: "q20",
        questionText: "What's your biggest challenge when implementing AI solutions?",
        inputType: "radio",
        options: ["Data quality/access", "Technical expertise", "Budget constraints", "Organizational resistance", "Integration complexity", "Unclear ROI/benefits"],
        category: "Process Integration"
    }
];

// --- Main Component ---
export function ScorecardSectionV2() {
    // State variables
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [finalScore, setFinalScore] = useState<number | null>(null);
    const [scoreCategory, setScoreCategory] = useState<string | null>(null);
    const [aiReport, setAiReport] = useState<AiReport | null>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
    const [reportError, setReportError] = useState<string | null>(null);

    // Track if a question has been answered
    const currentQuestion = currentStep < fixedQuestions.length ? fixedQuestions[currentStep] : null;
    const hasCurrentAnswer = currentQuestion ? answers[currentQuestion.id] !== undefined : false;
    
    // Handle answer selection for all question types
    const handleAnswerSelect = (questionId: string, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };
    
    // Navigate to the next question
    const handleNext = () => {
        if (currentStep < fixedQuestions.length - 1) {
            setCurrentStep(currentStep + 1);
                    } else {
            // Reached the end of questions, generate report
            generateReport();
        }
    };
    
    // Navigate to the previous question
    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };
    
    // Generate the final report
    const generateReport = async () => {
        setIsGeneratingReport(true);
        setReportError(null);
        
        try {
            // Calculate score based on answers
            const totalQuestions = fixedQuestions.length;
            let answeredQuestions = 0;
            let totalPoints = 0;
            
            // Process each question based on its type
            fixedQuestions.forEach(question => {
                const answer = answers[question.id];
                
                // Skip unanswered questions
                if (answer === undefined) return;
                
                answeredQuestions++;
                
                // Point calculation based on question type
                if (question.inputType === "yesno") {
                    // Yes = 2 points, No = 0 points
                    totalPoints += answer === true ? 2 : 0;
                } 
                else if (question.inputType === "scale") {
                    // Scale 1-5: direct points
                    totalPoints += parseInt(answer, 10);
                }
                else if (question.inputType === "radio") {
                    // For multiple choice, we give points based on option position
                    // Simplistic scoring - could be refined with specific point values per option
                    const optionIndex = question.options?.indexOf(answer) ?? -1;
                    if (optionIndex !== -1) {
                        const maxOptions = question.options?.length ?? 1;
                        totalPoints += Math.round(((optionIndex + 1) / maxOptions) * 5); // Scale to 0-5 range
                    }
                }
                // For textarea, we don't add points (could implement sentiment analysis in a real system)
            });
            
            // Calculate percentage score
            const maxPossible = answeredQuestions * 5; // Maximum 5 points per question
            const scorePercent = Math.round((totalPoints / maxPossible) * 100);
            const category = getScoreCategory(scorePercent);
            
            // Build simplified report for demo
            const recs = getRecommendations(scorePercent);
            
            // Generate AI report through API
            try {
                const assessmentSummary = fixedQuestions.map(q => {
                    const answer = answers[q.id];
                    let answerText = 'Not answered';
                    
                    if (answer !== undefined) {
                        if (q.inputType === "yesno") {
                            answerText = answer === true ? "Yes" : "No";
                        }
                        else if (q.inputType === "scale") {
                            answerText = `Rating: ${answer}/5`;
                        }
                        else if (q.inputType === "radio" && answer) {
                            answerText = `Selected: ${answer}`;
                        }
                        else if (answer) {
                            answerText = answer.toString();
                        }
                    }
                    
                    return `Q: ${q.questionText}\nA: ${answerText}`;
                }).join("\n\n");
                
                const systemPrompt = `You are an expert AI implementation consultant analyzing the results of an AI readiness assessment.
Based on these assessment responses, determine the organization's AI readiness level (Beginner: 0-33%, Intermediate: 34-66%, Advanced: 67-100%).

Assessment responses:
${assessmentSummary}

The calculated score is: ${scorePercent}% (${category} level).

Generate a concise report with these sections: 
1. Key Findings (2-3 bullet points summarizing strengths/weaknesses) 
2. Next Steps (3-4 prioritized action items)
3. Checklist (2-3 immediate action items)
4. Tool Suggestions (1-2 AI tool categories or solutions)

Your response must be a valid JSON object with these exact keys:
{
  "scorePercent": ${scorePercent},
  "keyFindings": "• Point 1\\n• Point 2\\n• Point 3",
  "nextSteps": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "checklist": ["Task 1", "Task 2", "Task 3"],
  "toolSuggestions": ["Tool Category 1", "Tool Category 2"]
}

Ensure your JSON is valid with no trailing commas and properly escaped characters.`;

            const payload = {
                    model: "openai-large",
                messages: [
                    { role: "system", content: systemPrompt },
                        { role: "user", content: "Generate the AI readiness report in valid JSON format." }
                ],
                response_format: { "type": "json_object" },
                    temperature: 0.3
            };
                
                console.log("Sending API request with payload:", JSON.stringify(payload, null, 2));
            
            const response = await fetch('/api/pollinations', {
                method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }
            
            const data = await response.json();
                console.log("API Response:", data);
            
            if (data.content) {
                try {
                        // First attempt to sanitize the JSON string
                        const sanitizedJson = sanitizeJsonString(data.content);
                        console.log("Sanitized JSON:", sanitizedJson);
                        
                        let parsedData;
                        try {
                            // Try to parse the sanitized JSON
                            parsedData = JSON.parse(sanitizedJson);
                        } catch (firstParseError) {
                            console.error("First parse attempt failed:", firstParseError);
                            
                            // If that fails, try a more aggressive cleanup and parse again
                            const fallbackJson = createFallbackJson(data.content, scorePercent, category, recs);
                            parsedData = JSON.parse(fallbackJson);
                        }
                        
                        // Validate and normalize the parsed data
                        const validatedData = {
                            scorePercent: typeof parsedData.scorePercent === 'number' ? parsedData.scorePercent : scorePercent,
                            keyFindings: typeof parsedData.keyFindings === 'string' ? parsedData.keyFindings : 
                                "• The organization shows mixed results in AI readiness.\n• Some strengths exist but several areas need improvement.",
                            nextSteps: Array.isArray(parsedData.nextSteps) ? parsedData.nextSteps : recs.slice(0, 4),
                            checklist: Array.isArray(parsedData.checklist) ? parsedData.checklist : recs.slice(0, 3),
                            toolSuggestions: Array.isArray(parsedData.toolSuggestions) ? parsedData.toolSuggestions : 
                                ["AI workflow automation tools", "Data preparation and analysis platforms"]
                        };
                        
                        // Set final results
                        setFinalScore(scorePercent);
                        setScoreCategory(category);
                        setAiReport(validatedData);
                    } 
                    catch (parseError) {
                        console.error("Error parsing API response:", parseError);
                        console.log("Raw content that caused error:", data.content);
                        
                        // Fallback to calculated scores and recommendations
                        setFinalScore(scorePercent);
                        setScoreCategory(category);
                        setAiReport({
                            keyFindings: "• Based on your responses, we've identified some key areas for AI improvement.\n• Your organization shows potential but needs a structured approach.",
                            nextSteps: recs.slice(0, 4),
                            checklist: recs.slice(0, 3),
                            toolSuggestions: ["AI workflow automation tools", "Data preparation and analysis platforms"]
                        });
                        
                        setReportError("Could not parse the AI report, using simplified results instead.");
                    }
                } 
                else {
                throw new Error("No content in API response");
            }
            } 
            catch (apiError) {
                console.error("Error with report API:", apiError);
                
                // Fallback to calculated scores and recommendations
                setFinalScore(scorePercent);
                setScoreCategory(category);
                setAiReport({
                    keyFindings: "• Based on your responses, we've identified some key areas for AI improvement.\n• Your organization shows potential but needs a structured approach.",
                    nextSteps: recs.slice(0, 4),
                    checklist: recs.slice(0, 3),
                    toolSuggestions: ["AI workflow automation tools", "Data preparation and analysis platforms"]
                });
                
                setReportError("API error generating detailed report, using simplified results instead.");
            }
        } 
        catch (error) {
            console.error("Error generating report:", error);
            setReportError("An unexpected error occurred. Please try again.");
        } 
        finally {
            setIsGeneratingReport(false);
        }
    };

    // Helper function to sanitize JSON strings
    const sanitizeJsonString = (jsonString: string): string => {
        // Remove any markdown code block markers
        let cleaned = jsonString.replace(/```json|```/g, '').trim();
        
        // Remove control characters
        cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        
        // Fix common JSON syntax errors
        cleaned = cleaned
            .replace(/,\s*}/g, '}') // Remove trailing commas in objects
            .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
            .replace(/\\/g, '\\\\') // Double escape backslashes
            .replace(/\\"/g, '\\"') // Ensure quotes are properly escaped
            .replace(/'/g, '"') // Replace single quotes with double quotes
            .replace(/\n/g, '\\n'); // Escape newlines
            
        // Ensure the string is properly wrapped in curly braces
        if (!cleaned.trim().startsWith('{')) {
            cleaned = '{' + cleaned;
        }
        if (!cleaned.trim().endsWith('}')) {
            cleaned = cleaned + '}';
        }
        
        return cleaned;
    };

    // Function to create a fallback JSON when parsing fails
    const createFallbackJson = (rawContent: string, scorePercent: number, category: string, recommendations: string[]): string => {
        // Extract any recognizable parts from the raw content
        const findingsMatch = rawContent.match(/Key Findings[:\s]+(.*?)(?=Next Steps|Checklist|Tool Suggestions|$)/i);
        const keyFindings = findingsMatch ? findingsMatch[1].trim() : "• Failed to extract findings";
        
        // Create a safe JSON object
        const fallbackObject = {
            scorePercent: scorePercent,
            keyFindings: keyFindings.includes('•') ? keyFindings : "• Based on your assessment\n• Further AI adoption is recommended",
            nextSteps: recommendations.slice(0, 4),
            checklist: recommendations.slice(0, 3),
            toolSuggestions: ["AI workflow automation tools", "Data preparation and analysis platforms"]
        };
        
        return JSON.stringify(fallbackObject);
    };
    
    // Reset the scorecard
    const handleStartOver = () => {
        setCurrentStep(0);
        setAnswers({});
        setFinalScore(null);
        setScoreCategory(null);
        setAiReport(null);
        setReportError(null);
    };

    // Download results as text file
    const handleDownloadResults = () => {
        if (finalScore === null || scoreCategory === null) {
            console.error("Cannot download results: score data missing");
            return;
        }

        let resultsText = `
AI Efficiency Scorecard Results
================================

Score: ${finalScore}%
Level: ${scoreCategory}
`;

        // Add detailed report if available
        if (aiReport) {
            resultsText += `
Key Findings:
================================
${aiReport.keyFindings}

Prioritized Next Steps:
================================
${aiReport.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Getting Started Checklist:
================================
${aiReport.checklist.map((item, i) => `□ ${item}`).join('\n')}

Suggested AI Tool Categories:
================================
${aiReport.toolSuggestions.map((tool, i) => `• ${tool}`).join('\n')}
`;
        } else {
            // Fallback to standard recommendations if no AI report
            const standardRecs = getRecommendations(finalScore);
            resultsText += `
Recommendations:
================================
${standardRecs.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}
`;
        }

        resultsText += `
Generated by: Deliver AI Platform
Date: ${new Date().toLocaleDateString()}
`;

        try {
            const blob = new Blob([resultsText.trim()], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ai-efficiency-results-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log("Results downloaded successfully");
        } catch (error) {
            console.error("Failed to download results:", error);
        }
    };

    // Memoize calculated values for results view
    const resultsData = useMemo(() => {
        if (finalScore === null || scoreCategory === null) return null;
        return {
            score: finalScore,
            category: scoreCategory,
            recommendations: getRecommendations(finalScore),
        };
    }, [finalScore, scoreCategory]);

    // --- Render question card ---
    if (currentQuestion && finalScore === null) {
        return (
            <div className="w-full max-w-3xl mx-auto">
                <h2 className="text-2xl font-semibold mb-4 text-white">AI Efficiency Scorecard</h2>
                <p className="text-muted-gray mb-6">Answer these questions to gauge your current AI readiness and receive personalized recommendations.</p>
                <Card className="bg-near-black border-light-gray animate-in fade-in duration-300">
                    <CardHeader className="flex flex-row justify-between items-start border-b border-light-gray pb-3">
                        {/* Left side: Question Number & Category */}
                        <div>
                            <CardTitle className="text-sm font-medium text-sky-400 mb-1">{currentQuestion.category}</CardTitle>
                            <CardDescription className="text-xs text-muted-gray/70">Question {currentStep + 1} of {fixedQuestions.length}</CardDescription>
                        </div>
                        {/* Right side: Progress */}
                        <div className="text-xs text-muted-gray bg-black px-2 py-1 rounded-sm border border-light-gray">
                            Progress: {currentStep + 1} of {fixedQuestions.length} Questions
                        </div>
                    </CardHeader>
                    
                    <CardContent className="pt-6 pb-8">
                        <Label className="text-lg font-medium text-white block mb-6 text-left">{currentQuestion.questionText}</Label>
                        
                        {/* Inputs based on question type */}
                        {currentQuestion.inputType === 'yesno' && (
                            <div className="flex gap-3">
                                <Button
                                    variant={answers[currentQuestion.id] === true ? "default" : "outline"}
                                    onClick={() => handleAnswerSelect(currentQuestion.id, true)}
                                    className="w-24 rounded-md cursor-pointer transition-all duration-150 h-10"
                                >
                                    Yes
                                </Button>
                                <Button
                                    variant={answers[currentQuestion.id] === false ? "default" : "outline"}
                                    onClick={() => handleAnswerSelect(currentQuestion.id, false)}
                                    className="w-24 rounded-md cursor-pointer transition-all duration-150 h-10"
                                >
                                    No
                                </Button>
                            </div>
                        )}
                        
                        {currentQuestion.inputType === 'scale' && currentQuestion.options && (
                            <RadioGroup
                                value={answers[currentQuestion.id] || ""}
                                onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                                className="space-y-3"
                            >
                                {currentQuestion.options.map((option) => (
                                    <div 
                                        key={option} 
                                        className="flex items-center space-x-3 cursor-pointer"
                                        onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                                    >
                                        <RadioGroupItem
                                            value={option}
                                            id={`scale-${option}`}
                                            className="border-light-gray text-white data-[state=checked]:border-sky-400 data-[state=checked]:bg-sky-400/20 data-[state=checked]:text-sky-300 cursor-pointer transition-colors"
                                        />
                                        <Label 
                                            htmlFor={`scale-${option}`} 
                                            className="text-white font-normal cursor-pointer w-full py-1"
                                        >
                                            {option} {option === '1' ? '(Low)' : option === '5' ? '(High)' : ''}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}
                        
                        {currentQuestion.inputType === 'radio' && currentQuestion.options && (
                            <RadioGroup
                                value={answers[currentQuestion.id] || ""}
                                onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                                className="space-y-3"
                            >
                                {currentQuestion.options.map((option) => (
                                    <div 
                                        key={option} 
                                        className="flex items-center space-x-3 cursor-pointer"
                                        onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                                    >
                                        <RadioGroupItem
                                            value={option}
                                            id={`radio-${option.replace(/\s+/g, '-').toLowerCase()}`}
                                            className="border-light-gray text-white data-[state=checked]:border-sky-400 data-[state=checked]:bg-sky-400/20 data-[state=checked]:text-sky-300 cursor-pointer transition-colors"
                                        />
                                        <Label 
                                            htmlFor={`radio-${option.replace(/\s+/g, '-').toLowerCase()}`} 
                                            className="text-white font-normal cursor-pointer w-full py-1"
                                        >
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}
                        
                        {currentQuestion.inputType === 'textarea' && (
                            <div className="space-y-4">
                                <Textarea
                                    placeholder="Type your answer here..."
                                    value={answers[currentQuestion.id] || ""}
                                    onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                                    className="bg-black border-light-gray text-white placeholder:text-muted-gray min-h-[100px]"
                                />
                            </div>
                        )}
                    </CardContent>
                    
                    <CardFooter className="justify-between border-t border-light-gray pt-4">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentStep === 0}
                            className="rounded-md"
                        >
                            Previous
                        </Button>
                        
                                    <Button
                                        variant="default"
                            onClick={handleNext}
                            disabled={!hasCurrentAnswer}
                            className={`rounded-md ${currentStep === fixedQuestions.length - 1 ? 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500' : ''}`}
                        >
                            {currentStep === fixedQuestions.length - 1 ? 'Finish & Generate Report' : 'Next Question'}
                                    </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }
    
    // Loading indicator while generating report
    if (isGeneratingReport) {
        return (
            <div className="w-full max-w-3xl mx-auto animate-in fade-in duration-300">
                <Card className="bg-near-black border-light-gray p-8">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <p className="text-muted-gray animate-pulse">Analyzing your responses and generating report...</p>
                        <p className="text-xs text-muted-gray/70">This may take a moment</p>
                    </div>
                </Card>
            </div>
        );
    }

    // --- Render results ---
    if (finalScore !== null) {
        // This is required to ensure resultsData is never null in this section
        const safeResultsData = resultsData || {
            score: finalScore,
            category: scoreCategory || 'Not Rated',
            recommendations: getRecommendations(finalScore)
        };
        
        return (
            <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-500">
                <h2 className="text-3xl font-bold mb-6 text-white text-center">AI Efficiency Scorecard Results</h2>
                {/* Main results card with dashboard feel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Score visualization - left panel */}
                    <Card className="bg-near-black border-light-gray col-span-1 overflow-hidden">
                        <div className="relative h-full">
                            {/* Background gradient decoration */}
                            <div className="absolute inset-0 bg-gradient-to-br from-sky-900/20 to-indigo-900/10 z-0"></div>
                            
                            <div className="relative z-10 flex flex-col items-center justify-center p-8 h-full">
                                <p className="text-sky-400 text-sm uppercase tracking-wider mb-3">Your AI Readiness Level</p>
                                
                                {/* Circular progress indicator */}
                                <div className="relative w-48 h-48 mb-4">
                                    {/* Background circle */}
                                    <div className="absolute inset-0 rounded-full border-8 border-gray-800/60"></div>
                                    
                                    {/* Progress circle - dynamically styled based on score */}
                                    <div 
                                        className="absolute inset-0 rounded-full border-8 border-transparent"
                                        style={{
                                            borderTopColor: safeResultsData.score < 33 ? '#f87171' : safeResultsData.score < 67 ? '#60a5fa' : '#4ade80',
                                            borderRightColor: safeResultsData.score < 33 ? '#f87171' : safeResultsData.score < 67 ? '#60a5fa' : '#4ade80',
                                            borderBottomColor: safeResultsData.score >= 66 ? '#4ade80' : 'transparent',
                                            borderLeftColor: safeResultsData.score >= 33 ? (safeResultsData.score < 67 ? '#60a5fa' : '#4ade80') : 'transparent',
                                            transform: `rotate(${safeResultsData.score * 3.6}deg)`
                                        }}
                                    ></div>
                                    
                                    {/* Center content */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <p className="text-6xl font-bold text-white">{safeResultsData.score}<span className="text-3xl">%</span></p>
                                        <p className="text-xl font-medium mt-1" 
                                           style={{
                                               color: safeResultsData.score < 33 ? '#f87171' : safeResultsData.score < 67 ? '#60a5fa' : '#4ade80'
                                           }}>
                                            {safeResultsData.category}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Category descriptor */}
                                <div className="text-center mt-2 p-3 rounded-md bg-black/30 border border-light-gray w-full">
                                    <p className="text-sm text-muted-gray">
                                        {safeResultsData.category === "Beginner" && "Early stages of AI adoption with opportunities to build a foundation"}
                                        {safeResultsData.category === "Intermediate" && "Making good progress with AI but with areas for strategic improvement"}
                                        {safeResultsData.category === "Advanced" && "Sophisticated AI implementation with optimization opportunities"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                    
                    {/* Key findings - middle/right panel */}
                    <Card className="bg-near-black border-light-gray col-span-1 lg:col-span-2">
                        <CardHeader className="border-b border-light-gray">
                            <CardTitle className="text-xl font-semibold text-white flex items-center">
                                <div className="w-2 h-6 bg-sky-400 mr-3 rounded-sm"></div>
                                Key Findings
                            </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="pt-5 px-6">
                            {!reportError && aiReport ? (
                                <div className="space-y-5">
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <div className="whitespace-pre-line leading-relaxed">
                                            {aiReport.keyFindings.split(/•|\n-/).filter(s => s.trim()).map((finding, idx) => (
                                                <div key={idx} className="flex items-start mb-3 last:mb-0">
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-900/40 text-sky-400 text-xs mr-3 flex-shrink-0 mt-0.5">
                                                        {idx + 1}
                                                    </span>
                                                    <p className="text-gray-300">{finding.trim()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Visual score breakdown */}
                                    <div className="pt-3 border-t border-light-gray/30">
                                        <p className="text-sm font-medium text-white mb-3">Readiness Breakdown</p>
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* These are placeholders - in a real implementation these would be calculated from questions categories */}
                                            <div className="flex flex-col">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-muted-gray">Strategy</span>
                                                    <span className="text-white">{Math.min(100, safeResultsData.score + 15)}%</span>
                                                </div>
                                                <div className="h-2 bg-light-gray/30 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-sky-400 rounded-full"
                                                        style={{ width: `${Math.min(100, safeResultsData.score + 15)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-muted-gray">Data</span>
                                                    <span className="text-white">{Math.min(100, safeResultsData.score + 5)}%</span>
                                                </div>
                                                <div className="h-2 bg-light-gray/30 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-indigo-400 rounded-full"
                                                        style={{ width: `${Math.min(100, safeResultsData.score + 5)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-muted-gray">Tools</span>
                                                    <span className="text-white">{Math.max(10, safeResultsData.score - 10)}%</span>
                                                </div>
                                                <div className="h-2 bg-light-gray/30 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-purple-400 rounded-full"
                                                        style={{ width: `${Math.max(10, safeResultsData.score - 10)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-muted-gray">Skills</span>
                                                    <span className="text-white">{Math.max(15, safeResultsData.score - 5)}%</span>
                                                </div>
                                                <div className="h-2 bg-light-gray/30 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-teal-400 rounded-full"
                                                        style={{ width: `${Math.max(15, safeResultsData.score - 5)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full py-8">
                                    <p className="text-muted-gray text-center">
                                        {reportError ? "Error generating detailed report" : "No data available"}
                                    </p>
                            </div>
                        )}
                        </CardContent>
                    </Card>
                </div>
                {/* Action plan and recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                    {/* Action plan - 3 columns */}
                    <Card className="bg-near-black border-light-gray col-span-1 lg:col-span-3">
                        <CardHeader className="border-b border-light-gray">
                            <CardTitle className="text-xl font-semibold text-white flex items-center">
                                <div className="w-2 h-6 bg-indigo-400 mr-3 rounded-sm"></div>
                                Strategic Action Plan
                            </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="pt-6 px-6">
                            {!reportError && aiReport ? (
                                <div className="space-y-6">
                                    <ol className="space-y-5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-light-gray/30">
                                        {aiReport.nextSteps.map((step, i) => (
                                            <li key={i} className="relative pl-10">
                                                <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-indigo-400/50 bg-indigo-900/20 text-indigo-400 text-sm font-medium">
                                                    {i + 1}
                                                </div>
                                                <h4 className="font-medium text-white mb-1">{step.split(':')[0] || step}</h4>
                                                <p className="text-sm text-muted-gray">
                                                    {step.includes(':') ? step.split(':')[1] : 'Implement this step to improve your AI readiness.'}
                                                </p>
                                                
                                                {/* Timeline indicator */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="px-2 py-0.5 text-xs rounded-sm bg-black border border-light-gray/50 text-muted-gray">
                                                        {i === 0 ? 'Immediate' : i === 1 ? 'Within 30 days' : i === 2 ? 'Q2 Goal' : 'Future state'}
                                                    </span>
                                                    <span className="px-2 py-0.5 text-xs rounded-sm bg-black border border-light-gray/50 text-muted-gray">
                                                        {i === 0 ? 'High impact' : i === 1 ? 'Medium effort' : 'Strategic'}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex flex-col space-y-4">
                                        {safeResultsData.recommendations.map((rec, i) => (
                                            <div key={i} className="flex items-start">
                                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-900/20 flex items-center justify-center mr-3 mt-0.5">
                                                    <CheckCircle className="h-4 w-4 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-300 text-sm">{rec}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
                    
                    {/* Getting started checklist - 2 columns */}
                    <Card className="bg-near-black border-light-gray col-span-1 lg:col-span-2">
                        <CardHeader className="border-b border-light-gray">
                            <CardTitle className="text-xl font-semibold text-white flex items-center">
                                <div className="w-2 h-6 bg-teal-400 mr-3 rounded-sm"></div>
                                Getting Started
                            </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="pt-6 px-6">
                            {!reportError && aiReport ? (
                                <div className="space-y-4">
                                    {aiReport.checklist.map((item, i) => (
                                        <div key={i} className="flex items-start group cursor-pointer">
                                            <div className="flex-shrink-0 w-6 h-6 rounded border border-light-gray bg-black/40 group-hover:bg-teal-900/20 group-hover:border-teal-400/50 flex items-center justify-center mr-3 mt-0.5 transition-colors">
                                                <Square className="h-3 w-3 text-light-gray group-hover:text-teal-400 transition-colors" />
                                            </div>
                                            <div>
                                                <p className="text-gray-300 text-sm group-hover:text-white transition-colors">{item}</p>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="mt-6 pt-4 border-t border-light-gray/30">
                                        <p className="text-sm font-medium text-white mb-3">Recommended First Workshop</p>
                                        <div className="bg-black/40 border border-light-gray rounded-md p-4">
                                            <h4 className="text-teal-400 font-medium mb-2">AI Strategy Alignment Workshop</h4>
                                            <p className="text-sm text-muted-gray mb-3">
                                                A facilitated 3-hour session with key stakeholders to align on AI goals, prioritize use cases, and create an initial implementation roadmap.
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-2 py-1 text-xs rounded-sm bg-teal-900/20 text-teal-400 border border-teal-400/20">
                                                    3 hours
                                                </span>
                                                <span className="px-2 py-1 text-xs rounded-sm bg-teal-900/20 text-teal-400 border border-teal-400/20">
                                                    Key stakeholders
                                                </span>
                                                <span className="px-2 py-1 text-xs rounded-sm bg-teal-900/20 text-teal-400 border border-teal-400/20">
                                                    Facilitated
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex flex-col space-y-4">
                                        {safeResultsData.recommendations.slice(0, 3).map((rec, i) => (
                                            <div key={i} className="flex items-start group cursor-pointer">
                                                <div className="flex-shrink-0 w-6 h-6 rounded border border-light-gray bg-black/40 group-hover:bg-teal-900/20 group-hover:border-teal-400/50 flex items-center justify-center mr-3 mt-0.5 transition-colors">
                                                    <Square className="h-3 w-3 text-light-gray group-hover:text-teal-400 transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-300 text-sm group-hover:text-white transition-colors">{rec}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                {/* Suggested tools and resources */}
                <Card className="bg-near-black border-light-gray mb-6">
                    <CardHeader className="border-b border-light-gray">
                        <CardTitle className="text-xl font-semibold text-white flex items-center">
                            <div className="w-2 h-6 bg-purple-400 mr-3 rounded-sm"></div>
                            Recommended AI Tools & Resources
                        </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="pt-6 px-6">
                        {!reportError && aiReport && aiReport.toolSuggestions ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {aiReport.toolSuggestions.map((tool, i) => {
                                    // Extract different types of tools for visual variety
                                    const toolTypes = ["Content Creation", "Data Analysis", "Automation", "Customer Engagement", "Process Optimization"];
                                    const toolIcons = ["📝", "📊", "⚙️", "💬", "🔄"];
                                    const toolColors = ["bg-purple-900/20 border-purple-400/30", "bg-blue-900/20 border-blue-400/30", "bg-teal-900/20 border-teal-400/30", "bg-amber-900/20 border-amber-400/30", "bg-rose-900/20 border-rose-400/30"];
                                    
                                    // Extract or generate a tool category and specific examples
                                    let toolName = tool;
                                    let toolDescription = "Research tools in this category based on your specific needs and budget.";
                                    
                                    if (tool.includes(":")) {
                                        const parts = tool.split(":");
                                        toolName = parts[0].trim();
                                        toolDescription = parts[1].trim();
                                    }
                                    
                                    const typeIndex = i % toolTypes.length;
                                    
                                    return (
                                        <div key={i} className={`border rounded-md p-4 ${toolColors[typeIndex]}`}>
                                            <div className="flex items-start">
                                                <div className="text-2xl mr-3">{toolIcons[typeIndex]}</div>
                                                <div>
                                                    <h4 className="font-medium text-white mb-1">{toolName}</h4>
                                                    <p className="text-xs text-muted-gray mb-2">{toolTypes[typeIndex]}</p>
                                                    <p className="text-sm text-gray-300">{toolDescription}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                {/* Add a complementary tool suggestion based on score */}
                                <div className="border rounded-md p-4 bg-sky-900/20 border-sky-400/30">
                                    <div className="flex items-start">
                                        <div className="text-2xl mr-3">🔍</div>
                                        <div>
                                            <h4 className="font-medium text-white mb-1">
                                                {safeResultsData.category === "Beginner" ? "AI Basics Training" : 
                                                 safeResultsData.category === "Intermediate" ? "Advanced Prompt Engineering" : 
                                                 "Custom Model Fine-Tuning"}
                                            </h4>
                                            <p className="text-xs text-muted-gray mb-2">Skills Development</p>
                                            <p className="text-sm text-gray-300">
                                                {safeResultsData.category === "Beginner" ? "Introduction to AI concepts, terminology, and basic applications for your team." : 
                                                 safeResultsData.category === "Intermediate" ? "Techniques to get more precise and effective results from generative AI tools." : 
                                                 "Specialized training on adapting models to your specific business needs and data."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-6">
                                <p className="text-muted-gray text-center">
                                    Tool suggestions not available in basic report
                                </p>
                            </div>
                        )}
                        
                        <div className="mt-6 pt-4 border-t border-light-gray/30">
                            <p className="text-sm text-muted-gray italic">Note: Specific tool selection requires further research based on your exact needs, technical capabilities, and budget constraints.</p>
                        </div>
                    </CardContent>
                </Card>
                {/* Actions footer */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
                    <Button 
                        onClick={handleStartOver} 
                        variant="outline" 
                        className="rounded-md h-10 px-6 w-full sm:w-auto border-indigo-400/50 text-indigo-400 hover:bg-indigo-950/30"
                    >
                        Start New Assessment
                    </Button>
                    
                    <Button
                        onClick={handleDownloadResults}
                        variant="default"
                        className="rounded-md h-10 px-6 w-full sm:w-auto bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 border-0"
                        disabled={finalScore === null}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Download Full Report
                    </Button>
                    
                    {/* New share button */}
                    <Button
                        variant="outline"
                        className="rounded-md h-10 px-6 w-full sm:w-auto"
                        onClick={() => {
                            // Copy a shareable link or summary to clipboard
                            navigator.clipboard.writeText(`AI Efficiency Scorecard Results: ${safeResultsData.score}% (${safeResultsData.category}) - Generate your own at example.com`);
                            alert('Results summary copied to clipboard!');
                        }}
                    >
                        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                        Share Results
                    </Button>
                </div>
                {/* Bottom branding */}
                <div className="text-center text-xs text-muted-gray/60">
                    <p>Generated by Deliver AI Platform • {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        );
    }
    
    // Fallback view
    return (
        <div className="w-full max-w-3xl mx-auto">
            <Card className="bg-near-black border-light-gray p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <p className="text-muted-gray">Loading assessment...</p>
                    <Button 
                        onClick={handleStartOver} 
                        variant="outline" 
                        className="mt-4 rounded-md h-10 px-4"
                    >
                        Start Assessment
                    </Button>
                </div>
            </Card>
        </div>
    );
} 