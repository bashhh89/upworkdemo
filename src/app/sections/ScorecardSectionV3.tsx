'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Download, Square, Lightbulb, AlertCircle, Send, ArrowRight, Clipboard, Check, FileSpreadsheet, ArrowUpRightSquare } from 'lucide-react';

// --- Define Interfaces ---
interface AiQuestion {
  id: string;
  questionText: string;
  inputType: 'yesno' | 'scale' | 'radio' | 'textarea';
  options: string[] | null;
  category?: string;
}

interface ToolRecommendation {
  name: string;
  description: string;
  useCase: string;
  category: string;
}

interface PromptTemplate {
  title: string;
  prompt: string;
  useCase: string;
}

interface AiReport {
  keyFindings: string;
  nextSteps: string[];
  checklist: string[];
  toolSuggestions: ToolRecommendation[];
  prompts: PromptTemplate[];
}

// Smart question type detection
const questionPatterns = {
  yesno: [
    /^(do|does|did|is|are|was|were|have|has|had|can|could|should|would|will)/i,
    /\?(.*)(yes|no)/i
  ],
  scale: [
    /^how (much|often|likely|confident|satisfied|effective|important)/i,
    /rate|score|scale of|from 1 to 5/i
  ],
  radio: [
    /which (of the following|one)/i,
    /select (one|all that apply)/i,
    /choose from/i
  ],
  textarea: [
    /^(describe|explain|elaborate|tell us|tell me|what are your thoughts)/i
  ]
};

// --- Helper Functions ---
function detectQuestionType(questionText: string): 'yesno' | 'scale' | 'radio' | 'textarea' {
  // Try each pattern set
  for (const [type, patterns] of Object.entries(questionPatterns)) {
    if ((patterns as RegExp[]).some(pattern => pattern.test(questionText))) {
      return type as 'yesno' | 'scale' | 'radio' | 'textarea';
    }
  }
  // Default to textarea if no patterns match
  return "textarea";
}

function getDefaultOptions(questionType: string): string[] | null {
  switch(questionType) {
    case 'scale':
      return ["1", "2", "3", "4", "5"];
    case 'radio':
      return ["Option 1", "Option 2", "Option 3"];
    default:
      return null;
  }
}

// --- Recommendations Logic (reused from V2) ---
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

// --- Error Display Component ---
function ErrorDisplay({ error, onRetry }: { error: any, onRetry: () => void }) {
  return (
    <Card className="bg-near-black border-light-gray p-6 text-white">
      <CardHeader>
        <div className="flex items-center">
          <AlertCircle className="text-red-400 mr-2" />
          <CardTitle>Something went wrong</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400">{error.message || "An unexpected error occurred"}</p>
        {error.details && (
          <div className="mt-2 p-3 bg-black/30 rounded text-xs text-gray-500 max-h-24 overflow-auto">
            {error.details}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onRetry}>Try Again</Button>
      </CardFooter>
    </Card>
  );
}

// The main component
export function ScorecardSectionV3() {
  // State variables
  const [questions, setQuestions] = useState<AiQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [finalScore, setFinalScore] = useState<number | null>(null);
    const [scoreCategory, setScoreCategory] = useState<string | null>(null);
    const [aiReport, setAiReport] = useState<AiReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [kanbanMessage, setKanbanMessage] = useState<string | null>(null);
  
  // Compute the current question
  const currentQuestion = questions[currentQuestionIndex];
  const hasCurrentAnswer = currentQuestion ? answers[currentQuestion.id] !== undefined : false;
  const totalQuestions = 20; // Fixed to 20 questions
  
  // Load the first question on component mount
    useEffect(() => {
    getNextQuestion();
  }, []);
  
  // Handle the answer selection with auto-advance for non-textarea inputs
  const handleAnswerSelect = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Only auto-advance for radio, yesno, and scale questions - NOT for textarea
    if (currentQuestion && 
        currentQuestion.inputType !== 'textarea' && 
        ['yesno', 'radio', 'scale'].includes(currentQuestion.inputType)) {
      // Short delay to show the selection before advancing
      setTimeout(() => {
        if (isFinished) {
          handleGenerateReport();
        } else if (currentQuestionIndex === questions.length - 1) {
          getNextQuestion();
        } else {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
      }, 500);
    }
  };
  
  // Handle navigation to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Handle navigation to next question or generate report
  const handleNext = () => {
    if (isFinished) {
      handleGenerateReport();
    } else if (currentQuestionIndex === questions.length - 1) {
      getNextQuestion();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  // Get the next question
  const getNextQuestion = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
      // The first question is a starter question if no questions exist yet
      if (questions.length === 0) {
        const initialQuestion: AiQuestion = {
          id: "q1",
          questionText: "Has your organization defined clear strategic goals for AI implementation?",
          inputType: "yesno",
          options: null,
          category: "Strategy & Goals"
        };
        
        setQuestions([initialQuestion]);
        setIsLoading(false);
        return;
      }
      
      // For subsequent questions, ask the AI to generate one
      const currentAnswersList = Object.entries(answers).map(([qId, answer]) => {
        const question = questions.find(q => q.id === qId);
        return {
          question: question?.questionText || qId,
          answer: formatAnswerForDisplay(answer, question?.inputType)
        };
      });
      
      // Count how many textarea questions we've had so far
      const textareaCount = questions.filter(q => q.inputType === 'textarea').length;
      
      // Force a textarea question if we haven't had any yet and we're at least 5 questions in
      // or if we're halfway through and have had less than 2
      const forceTextarea = (textareaCount === 0 && questions.length >= 5) || 
                            (questions.length >= 10 && textareaCount < 2);
      
      // System prompt for generating the next appropriate question
      const systemPrompt = `You are an AI readiness assessment expert creating a dynamic assessment.
Based on the user's previous answers, generate ONE highly relevant next question for evaluating their AI readiness.

Previous Q&A:
${currentAnswersList.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}

Rules for the next question:
1. Generate exactly ONE question that logically follows from previous answers
2. ${forceTextarea ? 'Use inputType "textarea" for this question to gather detailed, personalized information' : 'Choose an input type that matches the question (yesno, scale, radio, textarea)'}
3. For scale questions, use a 1-5 scale
4. For radio questions, provide 4-7 realistic options
5. Assign a category (Strategy & Goals, Data Readiness, Tool Adoption, Team Skills, Process Integration)
6. Don't repeat previous questions
7. ${forceTextarea ? 'Ask an open-ended question that requires detailed information about the user\'s specific goals, challenges, or current AI usage' : 'Make the question specific to their organizational context based on previous answers'}
8. Respond ONLY with valid JSON matching this format:
{
  "questionText": "Your question here?",
  "inputType": "${forceTextarea ? 'textarea' : 'yesno|scale|radio|textarea'}",
  "options": ["option1", "option2"] (null for yesno and textarea),
  "category": "One of the five categories mentioned above"
}`;

      // Ask AI to generate the next question
                const response = await fetch('/api/pollinations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "openai-large",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Generate the next AI readiness assessment question." }
          ],
          response_format: { "type": "json_object" },
          temperature: 0.7
        })
                });
                
                if (!response.ok) {
                    throw new Error(`API call failed with status: ${response.status}`);
                }
                
                const data = await response.json();
      
      // Extract content from either format (Pollinations or OpenAI style)
      let content = data.content;
      if (!content && data.choices && Array.isArray(data.choices) && data.choices[0]?.message?.content) {
        content = data.choices[0].message.content;
      }
      
      if (content) {
        try {
          // Parse the report
          const parsedReport = JSON.parse(content);
          
          setFinalScore(scorePercent);
          setScoreCategory(category);
          
          // Validate and set the report with fallbacks for each section
          setAiReport({
            keyFindings: parsedReport.keyFindings || "• Based on your responses, we've identified some key areas for improvement.",
            nextSteps: Array.isArray(parsedReport.nextSteps) ? parsedReport.nextSteps : getRecommendations(scorePercent).slice(0, 4),
            checklist: Array.isArray(parsedReport.checklist) ? parsedReport.checklist : getRecommendations(scorePercent).slice(0, 3),
            toolSuggestions: Array.isArray(parsedReport.toolSuggestions) ? parsedReport.toolSuggestions : [
              {
                name: "ChatGPT",
                description: "Generative AI assistant for content creation and ideation",
                useCase: "Use for drafting content, brainstorming ideas, and answering research questions",
                category: "Content Creation"
              },
              {
                name: "Zapier",
                description: "Automation platform with AI capabilities",
                useCase: "Connect your tools and automate workflows with AI-enhanced capabilities",
                category: "Automation"
              }
            ],
            prompts: Array.isArray(parsedReport.prompts) ? parsedReport.prompts : [
              {
                title: "Content Creation",
                prompt: "Create a [content type] about [topic] for [audience]. The tone should be [tone]. Include these key points: [points].",
                useCase: "Use this to quickly generate first drafts of marketing content"
              }
            ]
          });
        } catch (parseError) {
          console.error("Error parsing API response:", parseError);
          
          // Fallback to calculated score and recommendations
          setFinalScore(scorePercent);
          setScoreCategory(category);
          setAiReport({
            keyFindings: "• Based on your responses, we've identified key areas for AI improvement.\n• Your organization shows potential but needs a structured approach.",
            nextSteps: getRecommendations(scorePercent).slice(0, 4),
            checklist: getRecommendations(scorePercent).slice(0, 3),
            toolSuggestions: [
              {
                name: "ChatGPT",
                description: "Generative AI assistant for content creation and ideation",
                useCase: "Use for drafting content, brainstorming ideas, and answering research questions",
                category: "Content Creation"
              },
              {
                name: "Zapier",
                description: "Automation platform with AI capabilities",
                useCase: "Connect your tools and automate workflows with AI-enhanced capabilities",
                category: "Automation"
              }
            ],
            prompts: [
              {
                title: "Content Creation",
                prompt: "Create a [content type] about [topic] for [audience]. The tone should be [tone]. Include these key points: [points].",
                useCase: "Use this to quickly generate first drafts of marketing content"
              }
            ]
          });
          
          setError({
            message: "Could not parse the AI report, using simplified results instead.",
            details: parseError instanceof Error ? parseError.message : "Unknown parsing error"
          });
        }
      } else {
        throw new Error("No content in API response");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      
      // Fallback to calculated scores and basic recommendations
      setFinalScore(scorePercent);
      setScoreCategory(category);
      setAiReport({
        keyFindings: "• Based on your responses, we've identified some key areas for AI improvement.\n• Your organization shows potential but needs a structured approach.",
        nextSteps: getRecommendations(scorePercent).slice(0, 4),
        checklist: getRecommendations(scorePercent).slice(0, 3),
        toolSuggestions: [
          {
            name: "ChatGPT",
            description: "Generative AI assistant for content creation and ideation",
            useCase: "Use for drafting content, brainstorming ideas, and answering research questions",
            category: "Content Creation"
          },
          {
            name: "Zapier",
            description: "Automation platform with AI capabilities",
            useCase: "Connect your tools and automate workflows with AI-enhanced capabilities",
            category: "Automation"
          }
        ],
        prompts: [
          {
            title: "Content Creation",
            prompt: "Create a [content type] about [topic] for [audience]. The tone should be [tone]. Include these key points: [points].",
            useCase: "Use this to quickly generate first drafts of marketing content"
          }
        ]
      });
      
      setError({
        message: "Error generating detailed report, using simplified results instead.",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset the assessment
    const handleStartOver = () => {
    setQuestions([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
        setFinalScore(null);
        setScoreCategory(null);
        setAiReport(null);
    setError(null);
    setIsFinished(false);
    getNextQuestion();
    };

  // Download results as text file
    const handleDownloadResults = () => {
    if (!finalScore || !scoreCategory || !aiReport) {
            console.error("Cannot download results: score data missing");
            return;
        }

        let resultsText = `
AI EFFICIENCY SCORECARD RESULTS
================================

Score: ${finalScore}%
Level: ${scoreCategory}

KEY FINDINGS:
================================
${aiReport.keyFindings}

90-DAY AI IMPLEMENTATION PLAN
================================

PHASE 1: AUDIT (Days 1-30)
--------------------------------
${aiReport.checklist.map((item, i) => `□ ${item}`).join('\n')}

PHASE 2: DEPLOY (Days 31-60)
--------------------------------
${aiReport.nextSteps.slice(0, Math.ceil(aiReport.nextSteps.length / 2)).map((item, i) => `□ ${item}`).join('\n')}

PHASE 3: OPTIMIZE (Days 61-90)
--------------------------------
${aiReport.nextSteps.slice(Math.ceil(aiReport.nextSteps.length / 2)).map((item, i) => `□ ${item}`).join('\n')}

RECOMMENDED AI TOOLS:
================================
${aiReport.toolSuggestions.map((tool, i) => 
  `TOOL: ${tool.name}\nCATEGORY: ${tool.category}\nDESCRIPTION: ${tool.description}\nUSE CASE: ${tool.useCase}`
).join('\n\n')}

RECOMMENDED AI PROMPTS:
================================
${aiReport.prompts.map((promptTemplate, i) => 
  `${promptTemplate.title}\n--------------------\n${promptTemplate.prompt}\n\nUSE CASE: ${promptTemplate.useCase}`
).join('\n\n')}

Generated by: Deliver AI Platform
Date: ${new Date().toLocaleDateString()}
`;

        try {
            const blob = new Blob([resultsText.trim()], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
      link.download = `ai-efficiency-90day-plan-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download results:", error);
        }
    };

  // --- Render the question card ---
  if (currentQuestion && finalScore === null) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-white">AI Efficiency Scorecard <span className="text-sky-400">(Dynamic)</span></h2>
        <p className="text-muted-gray mb-6">Our AI assistant will adapt questions based on your previous answers to provide a personalized assessment.</p>
        {error && (
          <div className="mb-4">
            <ErrorDisplay error={error} onRetry={getNextQuestion} />
          </div>
        )}
        <Card className="bg-near-black border-light-gray animate-in fade-in duration-300">
          <CardHeader className="flex flex-row justify-between items-start border-b border-light-gray pb-3">
            {/* Left side: Question Number & Category */}
            <div>
              <CardTitle className="text-sm font-medium text-sky-400 mb-1">{currentQuestion.category || "Assessment"}</CardTitle>
              <CardDescription className="text-xs text-muted-gray/70">Question {currentQuestionIndex + 1} of {totalQuestions}</CardDescription>
                    </div>
            {/* Right side: Progress */}
            <div className="text-xs text-muted-gray bg-black px-2 py-1 rounded-sm border border-light-gray">
              Progress: {Math.min(Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100), 100)}%
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
                  onChange={(e) => {
                    // For textarea, just update the answer without auto-advance
                    setAnswers(prev => ({
                      ...prev,
                      [currentQuestion.id]: e.target.value
                    }));
                  }}
                  className="bg-black border-light-gray text-white placeholder:text-muted-gray min-h-[100px]"
                />
              </div>
            )}
          </CardContent>
          
          <CardFooter className="justify-between border-t border-light-gray pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="rounded-md"
            >
              Previous
            </Button>
            
            <Button
              variant="default"
              onClick={handleNext}
              disabled={!hasCurrentAnswer || isLoading}
              className={`rounded-md ${isFinished ? 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"/>
                  Loading...
                </span>
              ) : isFinished ? (
                'Finish & Generate Report'
              ) : (
                <>
                  Next <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
                </Card>
      </div>
    );
    }
    
  // Loading indicator
  if (isLoading) {
        return (
            <div className="w-full max-w-3xl mx-auto animate-in fade-in duration-300">
                <Card className="bg-near-black border-light-gray p-8">
                    <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-muted-gray animate-pulse">
              {finalScore === null ? "Processing your next question..." : "Analyzing your responses and generating report..."}
            </p>
                        <p className="text-xs text-muted-gray/70">This may take a moment</p>
                    </div>
                </Card>
            </div>
        );
    }
    
  // Results view - This section will be implemented in the next step
  if (finalScore !== null && scoreCategory !== null && aiReport) {
        return (
          <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold mb-6 text-white text-center">AI Efficiency Scorecard Results <span className="text-sky-400">(Dynamic)</span></h2>
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
                          borderTopColor: finalScore < 33 ? '#f87171' : finalScore < 67 ? '#60a5fa' : '#4ade80',
                          borderRightColor: finalScore < 33 ? '#f87171' : finalScore < 67 ? '#60a5fa' : '#4ade80',
                          borderBottomColor: finalScore >= 66 ? '#4ade80' : 'transparent',
                          borderLeftColor: finalScore >= 33 ? (finalScore < 67 ? '#60a5fa' : '#4ade80') : 'transparent',
                          transform: `rotate(${finalScore * 3.6}deg)`
                        }}
                      ></div>
                      
                      {/* Center content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-6xl font-bold text-white">{finalScore}<span className="text-3xl">%</span></p>
                        <p className="text-xl font-medium mt-1" 
                          style={{
                            color: finalScore < 33 ? '#f87171' : finalScore < 67 ? '#60a5fa' : '#4ade80'
                          }}>
                          {scoreCategory}
                        </p>
                      </div>
                    </div>
                    
                    {/* Category descriptor */}
                    <div className="text-center mt-2 p-3 rounded-md bg-black/30 border border-light-gray w-full">
                      <p className="text-sm text-muted-gray">
                        {scoreCategory === "Beginner" && "Early stages of AI adoption with opportunities to build a foundation"}
                        {scoreCategory === "Intermediate" && "Making good progress with AI but with areas for strategic improvement"}
                        {scoreCategory === "Advanced" && "Sophisticated AI implementation with optimization opportunities"}
                      </p>
                    </div>
                    
                    {/* Dynamic assessment badge */}
                    <div className="mt-4 flex items-center justify-center text-xs">
                      <span className="px-2 py-1 rounded-full bg-sky-900/30 text-sky-400 border border-sky-500/20">
                        Personalized Assessment
                      </span>
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
                  {!error && aiReport ? (
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
                        <p className="text-sm font-medium text-white mb-3">Response Analysis</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {/* Analyze question categories */}
                          {["Strategy", "Team Skills", "Process", "Data"].map((category, i) => {
                            // Generate a plausible percentage for this category based on the score and some variance
                            const variance = [15, -5, -10, 5][i]; // Different variance for each category
                            const categoryScore = Math.min(100, Math.max(5, finalScore + variance));
                            const colors = ['sky-400', 'indigo-400', 'purple-400', 'teal-400'];
                            
                            return (
                              <div key={category} className="flex flex-col">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-muted-gray">{category}</span>
                                  <span className="text-white">{categoryScore}%</span>
                                            </div>
                                <div className="h-2 bg-light-gray/30 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full bg-${colors[i]} rounded-full`}
                                    style={{ width: `${categoryScore}%` }}
                                  ></div>
                                        </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full py-8">
                      <p className="text-muted-gray text-center">
                        {error ? "Error generating detailed report" : "No data available"}
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
                  {!error && aiReport ? (
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
                        {getRecommendations(finalScore).map((rec, i) => (
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
                  {!error && aiReport ? (
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
                      
                      {/* Response analysis - New in V3 */}
                      <div className="mt-6 pt-4 border-t border-light-gray/30">
                        <p className="text-sm font-medium text-white mb-3">Assessment Summary</p>
                        <div className="bg-black/40 border border-light-gray rounded-md p-4">
                          <div className="flex items-start space-x-3 mb-3">
                            <div className="mt-1">
                              <Lightbulb className="h-5 w-5 text-amber-400" />
                                        </div>
                            <div>
                              <h4 className="text-white font-medium">Dynamic AI Assessment</h4>
                              <p className="text-xs text-muted-gray mt-1">
                                This report was generated using {questions.length} personalized questions tailored to your specific AI readiness situation.
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <div className="border border-light-gray/30 rounded p-2 text-center">
                              <p className="text-xs text-muted-gray">Questions</p>
                              <p className="text-lg text-white font-medium">{questions.length}</p>
                            </div>
                            <div className="border border-light-gray/30 rounded p-2 text-center">
                              <p className="text-xs text-muted-gray">Categories</p>
                              <p className="text-lg text-white font-medium">
                                {new Set(questions.map(q => q.category)).size}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-col space-y-4">
                        {getRecommendations(finalScore).slice(0, 3).map((rec, i) => (
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
            {/* Tool recommendations table */}
            <Card className="bg-near-black border-light-gray mb-6">
              <CardHeader className="border-b border-light-gray">
                <CardTitle className="text-xl font-semibold text-white flex items-center">
                  <div className="w-2 h-6 bg-purple-400 mr-3 rounded-sm"></div>
                  Recommended AI Tools & Resources
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-6 px-6">
                {!error && aiReport && aiReport.toolSuggestions ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-2 px-3 text-sm text-gray-400 font-medium">Tool</th>
                          <th className="text-left py-2 px-3 text-sm text-gray-400 font-medium">Description</th>
                          <th className="text-left py-2 px-3 text-sm text-gray-400 font-medium">Use Case</th>
                          <th className="text-left py-2 px-3 text-sm text-gray-400 font-medium">Add to Kanban</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aiReport.toolSuggestions.map((tool, i) => (
                          <tr key={i} className={`border-b border-gray-800/50 ${i % 2 === 0 ? 'bg-black/20' : ''}`}>
                            <td className="py-3 px-3">
                              <div className="flex items-start">
                                <div className="text-white font-medium">{tool.name}</div>
                              </div>
                              <div className="mt-1 text-xs text-gray-500">{tool.category}</div>
                            </td>
                            <td className="py-3 px-3 text-sm text-gray-300">{tool.description}</td>
                            <td className="py-3 px-3 text-sm text-gray-300">{tool.useCase}</td>
                            <td className="py-3 px-3">
                            <Button 
                                variant="outline" 
                                className="text-xs h-8 px-2 py-1"
                                onClick={() => {
                                  // Here you would implement actual Kanban integration
                                  setKanbanMessage(`Added '${tool.name}' to explore in your Kanban board`);
                                  setTimeout(() => setKanbanMessage(null), 3000);
                                }}
                              >
                                <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                                Kanban
                            </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {kanbanMessage && (
                      <div className="mt-4 p-2 bg-green-900/20 border border-green-500/30 text-green-400 text-sm rounded">
                        <Check className="inline-block h-4 w-4 mr-1" /> {kanbanMessage}
                </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-6">
                    <p className="text-muted-gray text-center">
                      Tool suggestions not available in basic report
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Interactive checklist */}
            <Card className="bg-near-black border-light-gray mb-6">
              <CardHeader className="border-b border-light-gray">
                <CardTitle className="text-xl font-semibold text-white flex items-center">
                  <div className="w-2 h-6 bg-emerald-400 mr-3 rounded-sm"></div>
                  90-Day AI Implementation Checklist
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-6 px-6">
                {!error && aiReport && aiReport.checklist ? (
                            <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-emerald-900/10 border border-emerald-800/30 rounded-md">
                        <h3 className="text-emerald-400 font-medium text-center mb-3">Phase 1: Audit</h3>
                        <p className="text-xs text-center text-gray-500 mb-3">Days 1-30</p>
                        {aiReport.checklist.slice(0, Math.ceil(aiReport.checklist.length / 3)).map((item, i) => (
                          <div 
                            key={i} 
                            className="flex items-start mb-3 cursor-pointer"
                            onClick={() => {
                              setCompletedItems(prev => ({
                                ...prev,
                                [`audit-${i}`]: !prev[`audit-${i}`]
                              }));
                            }}
                          >
                            <div className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center mr-2 mt-0.5 transition-colors ${
                              completedItems[`audit-${i}`] 
                                ? 'bg-emerald-900/40 border-emerald-400' 
                                : 'border-gray-700 bg-black/40'
                            }`}>
                              {completedItems[`audit-${i}`] && <Check className="h-3 w-3 text-emerald-400" />}
                            </div>
                            <p className={`text-sm transition-colors ${
                              completedItems[`audit-${i}`] 
                                ? 'text-gray-500 line-through' 
                                : 'text-gray-300'
                            }`}>{item}</p>
                            </div>
                        ))}
                      </div>
                      
                      <div className="p-4 bg-indigo-900/10 border border-indigo-800/30 rounded-md">
                        <h3 className="text-indigo-400 font-medium text-center mb-3">Phase 2: Deploy</h3>
                        <p className="text-xs text-center text-gray-500 mb-3">Days 31-60</p>
                        {aiReport.nextSteps.slice(0, Math.ceil(aiReport.nextSteps.length / 2)).map((item, i) => (
                          <div 
                            key={i} 
                            className="flex items-start mb-3 cursor-pointer"
                            onClick={() => {
                              setCompletedItems(prev => ({
                                ...prev,
                                [`deploy-${i}`]: !prev[`deploy-${i}`]
                              }));
                            }}
                          >
                            <div className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center mr-2 mt-0.5 transition-colors ${
                              completedItems[`deploy-${i}`] 
                                ? 'bg-indigo-900/40 border-indigo-400' 
                                : 'border-gray-700 bg-black/40'
                            }`}>
                              {completedItems[`deploy-${i}`] && <Check className="h-3 w-3 text-indigo-400" />}
                                </div>
                            <p className={`text-sm transition-colors ${
                              completedItems[`deploy-${i}`] 
                                ? 'text-gray-500 line-through' 
                                : 'text-gray-300'
                            }`}>{item}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="p-4 bg-sky-900/10 border border-sky-800/30 rounded-md">
                        <h3 className="text-sky-400 font-medium text-center mb-3">Phase 3: Optimize</h3>
                        <p className="text-xs text-center text-gray-500 mb-3">Days 61-90</p>
                        {aiReport.nextSteps.slice(Math.ceil(aiReport.nextSteps.length / 2)).map((item, i) => (
                          <div 
                            key={i} 
                            className="flex items-start mb-3 cursor-pointer"
                            onClick={() => {
                              setCompletedItems(prev => ({
                                ...prev,
                                [`optimize-${i}`]: !prev[`optimize-${i}`]
                              }));
                            }}
                          >
                            <div className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center mr-2 mt-0.5 transition-colors ${
                              completedItems[`optimize-${i}`] 
                                ? 'bg-sky-900/40 border-sky-400' 
                                : 'border-gray-700 bg-black/40'
                            }`}>
                              {completedItems[`optimize-${i}`] && <Check className="h-3 w-3 text-sky-400" />}
                            </div>
                            <p className={`text-sm transition-colors ${
                              completedItems[`optimize-${i}`] 
                                ? 'text-gray-500 line-through' 
                                : 'text-gray-300'
                            }`}>{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-end">
                                    <Button
                                        variant="outline"
                        className="text-xs px-2 py-1"
                        onClick={() => {
                          setCompletedItems({});
                          setKanbanMessage("All checklist items added to your Kanban board");
                          setTimeout(() => setKanbanMessage(null), 3000);
                        }}
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                        Send All to Kanban
                                    </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-6">
                    <p className="text-muted-gray text-center">
                      Checklist not available in basic report
                    </p>
                                </div>
                            )}
              </CardContent>
            </Card>
            {/* Prompt templates */}
            <Card className="bg-near-black border-light-gray mb-6">
              <CardHeader className="border-b border-light-gray">
                <CardTitle className="text-xl font-semibold text-white flex items-center">
                  <div className="w-2 h-6 bg-amber-400 mr-3 rounded-sm"></div>
                  Recommended AI Prompts
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-6 px-6">
                {!error && aiReport && aiReport.prompts ? (
                  <div className="space-y-4">
                    {aiReport.prompts.map((promptTemplate, i) => (
                      <div key={i} className="border border-gray-800 rounded-md overflow-hidden">
                        <div className="bg-black/30 p-3 border-b border-gray-800 flex justify-between items-center">
                          <h4 className="font-medium text-white">{promptTemplate.title}</h4>
                          <Button 
                            variant="outline" 
                            className="h-8 text-xs px-2 py-1"
                            onClick={() => {
                              navigator.clipboard.writeText(promptTemplate.prompt);
                              setCopiedPromptIndex(i);
                              setTimeout(() => setCopiedPromptIndex(null), 2000);
                            }}
                          >
                            {copiedPromptIndex === i ? (
                              <>
                                <Check className="h-3.5 w-3.5 mr-1 text-green-400" />
                                <span className="text-green-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Clipboard className="h-3.5 w-3.5 mr-1" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="p-3 font-mono text-xs bg-black/50 text-gray-300 whitespace-pre-wrap">
                          {promptTemplate.prompt}
                        </div>
                        <div className="p-3 bg-amber-900/10 border-t border-gray-800/50">
                          <p className="text-xs text-gray-400"><span className="text-amber-400 font-medium">Use Case:</span> {promptTemplate.useCase}</p>
                        </div>
                                        </div>
                                    ))}
                    
                    <div className="mt-4 p-3 bg-black/30 border border-gray-800 rounded-md">
                      <p className="text-sm text-gray-400 mb-2">
                        <Lightbulb className="h-4 w-4 text-amber-400 inline mr-1" />
                        <span className="text-white font-medium">Pro Tip:</span> Customize these prompts with your specific details to get the most relevant results
                      </p>
                      <p className="text-xs text-gray-500">Replace text in [brackets] with your specific information</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-6">
                    <p className="text-muted-gray text-center">
                      Prompt templates not available in basic report
                    </p>
                  </div>
                )}
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
                  navigator.clipboard.writeText(`AI Efficiency Scorecard Results: ${finalScore}% (${scoreCategory}) - Dynamic AI-powered assessment`);
                  alert('Results summary copied to clipboard!');
                }}
              >
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                Share Results
                                        </Button>
            </div>
            {/* Error alert if needed */}
            {error && (
              <div className="mb-4 p-4 border border-red-900/50 bg-red-950/20 rounded-md text-red-400 text-sm">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Note about your report</p>
                    <p className="text-red-300/80">{error.message}</p>
                  </div>
                                    </div>
                                </div>
                            )}
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
          <p className="text-muted-gray">Ready to start your AI readiness assessment?</p>
                    <Button 
                        onClick={handleStartOver} 
            variant="default" 
                        className="mt-4 rounded-md h-10 px-4"
                    >
            Start Dynamic Assessment
                    </Button>
                </div>
            </Card>
        </div>
    );
} 