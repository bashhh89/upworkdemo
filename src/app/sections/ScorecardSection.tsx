'use client';

import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

type QuestionType = 'radio' | 'yesno' | 'textarea' | 'scale';

interface Question {
  id: string;
  category: string;
  text: string;
  type: QuestionType;
  options?: string[];
  labels?: Record<string, string>;
}

const questions: Question[] = [
  // Strategy & Goals
  {
    id: 'goal_clarity',
    category: 'Strategy & Goals',
    text: 'Are your AI implementation goals clearly documented and communicated?',
    type: 'yesno'
  },
  {
    id: 'budget_allocated',
    category: 'Strategy & Goals',
    text: 'Is there a dedicated budget allocated for AI tools and training?',
    type: 'yesno'
  },
  {
    id: 'leadership_buyin',
    category: 'Strategy & Goals',
    text: 'How strong is leadership buy-in for AI initiatives?',
    type: 'scale',
    options: ['1', '2', '3', '4', '5'],
    labels: {
      '1': 'Very Low',
      '2': 'Low',
      '3': 'Moderate',
      '4': 'High',
      '5': 'Very High'
    }
  },
  {
    id: 'strategy_alignment',
    category: 'Strategy & Goals',
    text: 'How closely is your AI strategy aligned with overall business objectives?',
    type: 'scale',
    options: ['1', '2', '3', '4', '5'],
    labels: {
      '1': 'Not at all aligned',
      '2': 'Slightly aligned',
      '3': 'Moderately aligned',
      '4': 'Mostly aligned',
      '5': 'Completely aligned'
    }
  },

  // Data Readiness
  {
    id: 'data_quality',
    category: 'Data Readiness',
    text: 'How would you rate the quality and completeness of your customer data?',
    type: 'scale',
    options: ['1', '2', '3', '4', '5'],
    labels: {
      '1': 'Very Poor',
      '2': 'Poor',
      '3': 'Average',
      '4': 'Good',
      '5': 'Excellent'
    }
  },
  {
    id: 'data_governance',
    category: 'Data Readiness',
    text: 'Do you have clear data governance policies in place?',
    type: 'yesno'
  },
  {
    id: 'data_integration',
    category: 'Data Readiness',
    text: 'How easily can data be shared between your key marketing/sales systems?',
    type: 'radio',
    options: ['Very Difficult', 'Difficult', 'Moderate', 'Easy', 'Very Easy']
  },
  {
    id: 'data',
    category: 'Data Readiness',
    text: 'How much of your customer data is centralized and easily accessible?',
    type: 'radio',
    options: ['Very Little', 'Some', 'Most', 'Fully Centralized']
  },

  // Tool Adoption
  {
    id: 'tools',
    category: 'Tool Adoption',
    text: 'Are you currently using any AI tools in your marketing or sales workflow?',
    type: 'yesno'
  },
  {
    id: 'tool_usage_freq',
    category: 'Tool Adoption',
    text: 'If using AI tools, how frequently are they utilized by the intended teams?',
    type: 'radio',
    options: ['Rarely', 'Occasionally', 'Regularly', 'Daily']
  },
  {
    id: 'tool_satisfaction',
    category: 'Tool Adoption',
    text: 'How satisfied is your team with the current AI tools?',
    type: 'scale',
    options: ['1', '2', '3', '4', '5'],
    labels: {
      '1': 'Very Dissatisfied',
      '2': 'Dissatisfied',
      '3': 'Neutral',
      '4': 'Satisfied',
      '5': 'Very Satisfied'
    }
  },
  {
    id: 'tool_evaluation',
    category: 'Tool Adoption',
    text: 'Do you have a process to regularly evaluate the effectiveness of your AI tools?',
    type: 'yesno'
  },

  // Team Skills
  {
    id: 'familiarity',
    category: 'Team Skills',
    text: 'How familiar is your team with current AI marketing/sales tools?',
    type: 'scale',
    options: ['1', '2', '3', '4', '5'],
    labels: {
      '1': 'Not at all familiar',
      '2': 'Slightly familiar',
      '3': 'Moderately familiar',
      '4': 'Very familiar',
      '5': 'Extremely familiar'
    }
  },
  {
    id: 'team_training',
    category: 'Team Skills',
    text: 'Has your team received specific training on AI tools or concepts?',
    type: 'yesno'
  },
  {
    id: 'analytical_skills',
    category: 'Team Skills',
    text: 'How would you rate your team\'s ability to interpret data and AI-driven insights?',
    type: 'scale',
    options: ['1', '2', '3', '4', '5'],
    labels: {
      '1': 'Very Low',
      '2': 'Low',
      '3': 'Moderate',
      '4': 'High',
      '5': 'Very High'
    }
  },
  {
    id: 'skill_gap',
    category: 'Team Skills',
    text: 'What specific AI skill gaps do you need to address on your team?',
    type: 'textarea'
  },

  // Process Integration
  {
    id: 'kpis',
    category: 'Process Integration',
    text: 'Do you have clearly defined KPIs for your marketing/sales efforts?',
    type: 'yesno'
  },
  {
    id: 'process_mapping',
    category: 'Process Integration',
    text: 'Have you mapped out the specific processes where AI will be integrated?',
    type: 'yesno'
  },
  {
    id: 'change_management',
    category: 'Process Integration',
    text: 'Is there a change management plan to handle the introduction of AI tools?',
    type: 'yesno'
  },
  {
    id: 'bottleneck',
    category: 'Process Integration',
    text: 'What\'s the biggest bottleneck in your current sales process?',
    type: 'textarea'
  }
];

interface Answers {
  [key: string]: string | boolean | null;
}

// Recommendations based on score category
const recommendations = {
  Beginner: [
    "Focus on foundational AI education for your team.",
    "Identify 1-2 high-impact, low-complexity processes for an initial AI pilot.",
    "Prioritize improving data collection and organization.",
    "Explore introductory AI tools for tasks like content ideation or basic automation.",
    "Start with a small budget allocation specifically for AI experimentation."
  ],
  Intermediate: [
    "Expand AI tool usage to more team members and processes.",
    "Focus on integrating AI tools with your existing CRM and marketing platforms.",
    "Develop clear SOPs and best practices for AI tool usage.",
    "Invest in training to enhance data analysis and prompt engineering skills.",
    "Begin measuring ROI on existing AI implementations to justify further expansion."
  ],
  Advanced: [
    "Explore advanced AI applications like hyper-personalization and predictive analytics.",
    "Automate complex workflows using multi-step AI processes.",
    "Focus on optimizing AI model performance and ROI tracking.",
    "Establish an internal AI 'Center of Excellence' to share knowledge and drive innovation.",
    "Consider developing custom AI solutions for your unique business challenges."
  ]
};

// Function to calculate score
function calculateScore(answers: Answers, questions: Question[]): { scorePercent: number, totalPoints: number, maxPoints: number } {
  let totalPoints = 0;
  let maxPossiblePoints = 0;

  questions.forEach(q => {
    const answer = answers[q.id];
    let points = 0;
    let maxQPoints = 0;

    // Define scoring logic based on question type
    if (q.type === 'yesno') {
      maxQPoints = 2; // Max points for yes/no questions
      if (answer === true) points = 2; // Yes is good
    } 
    else if (q.type === 'scale') {
      maxQPoints = 5; // Max points for scale questions
      const numAnswer = parseInt(answer as string, 10);
      if (!isNaN(numAnswer) && numAnswer >= 1 && numAnswer <= 5) {
        points = numAnswer;
      }
    } 
    else if (q.type === 'radio' && q.options) {
      maxQPoints = q.options.length;
      
      // Different logic based on the question
      if (q.id === 'data_integration') {
        // Points based on how easily data can be shared
        const optionMapping: Record<string, number> = {
          'Very Difficult': 1,
          'Difficult': 2,
          'Moderate': 3,
          'Easy': 4,
          'Very Easy': 5
        };
        points = optionMapping[answer as string] || 0;
      } 
      else if (q.id === 'data') {
        // Points based on centralization
        const optionMapping: Record<string, number> = {
          'Very Little': 1,
          'Some': 2,
          'Most': 3,
          'Fully Centralized': 4
        };
        points = optionMapping[answer as string] || 0;
      }
      else if (q.id === 'tool_usage_freq') {
        // Points based on frequency
        const optionMapping: Record<string, number> = {
          'Rarely': 1,
          'Occasionally': 2,
          'Regularly': 3,
          'Daily': 4
        };
        points = optionMapping[answer as string] || 0;
      }
    } 
    else if (q.type === 'textarea') {
      maxQPoints = 1; // One point for providing an answer
      if (answer && typeof answer === 'string' && answer.trim().length > 0) {
        points = 1;
      }
    }

    totalPoints += points;
    maxPossiblePoints += maxQPoints;
  });

  const scorePercent = maxPossiblePoints > 0 ? Math.round((totalPoints / maxPossiblePoints) * 100) : 0;
  return { scorePercent, totalPoints, maxPoints: maxPossiblePoints };
}

// Function to determine score category
function getScoreCategory(scorePercent: number): string {
  if (scorePercent <= 33) return "Beginner";
  if (scorePercent <= 66) return "Intermediate";
  return "Advanced";
}

// Function to get recommendations based on score
function getRecommendations(scorePercent: number): string[] {
  if (scorePercent <= 33) return recommendations.Beginner;
  if (scorePercent <= 66) return recommendations.Intermediate;
  return recommendations.Advanced;
}

export default function ScorecardSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [scoreCategory, setScoreCategory] = useState<string | null>(null);

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const hasAnswer = answers[currentQuestion?.id] !== undefined && answers[currentQuestion?.id] !== '';

  const handleAnswer = (value: string | boolean) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleFinish();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleFinish = () => {
    const { scorePercent } = calculateScore(answers, questions);
    setFinalScore(scorePercent);
    setScoreCategory(getScoreCategory(scorePercent));
    setCurrentStep(questions.length); // Move to results view
  };

  const handleStartOver = () => {
    setAnswers({});
    setCurrentStep(0);
    setFinalScore(null);
    setScoreCategory(null);
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'radio':
      case 'scale':
        return (
          <RadioGroup 
            className="space-y-3"
            value={answers[currentQuestion.id] as string || ''} 
            onValueChange={handleAnswer}
          >
            {currentQuestion.options?.map((option) => (
              <div key={option} className="flex items-center space-x-3">
                <RadioGroupItem
                  value={option}
                  id={`${currentQuestion.id}-${option}`}
                />
                <Label 
                  htmlFor={`${currentQuestion.id}-${option}`}
                  className="text-white"
                >
                  {currentQuestion.labels?.[option] || option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'yesno':
        return (
          <div className="flex space-x-4">
            <Button
              variant={answers[currentQuestion.id] === true ? "default" : "outline"}
              onClick={() => handleAnswer(true)}
              className={answers[currentQuestion.id] === true ? "" : "text-white"}
            >
              Yes
            </Button>
            <Button
              variant={answers[currentQuestion.id] === false ? "default" : "outline"}
              onClick={() => handleAnswer(false)}
              className={answers[currentQuestion.id] === false ? "" : "text-white"}
            >
              No
            </Button>
          </div>
        );

      case 'textarea':
        return (
          <Textarea
            value={answers[currentQuestion.id] as string || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full bg-[#111111] border-[#333333] text-white"
          />
        );

      default:
        return null;
    }
  };

  // Results View
  if (currentStep >= questions.length && finalScore !== null && scoreCategory !== null) {
    return (
      <div className="max-w-4xl mx-auto pb-12">
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl font-bold text-white">AI Efficiency Scorecard</h1>
          <p className="text-gray-400">Results & Recommendations</p>
        </div>

        <Card className="w-full max-w-2xl mx-auto bg-[#0a0a0a] border-[#333333] text-white animate-in fade-in duration-500">
          <CardHeader className="text-center border-b border-[#333333] pb-4">
            <CardTitle className="text-2xl font-semibold text-white">Your AI Readiness Score</CardTitle>
            <CardDescription className="text-gray-400 pt-1">Based on your responses</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-6xl font-bold text-white">{finalScore}%</p>
              <p className="text-xl font-medium text-sky-400">{scoreCategory} Level</p>
              <Progress value={finalScore} className="w-3/4 mx-auto mt-4 h-2.5 [&>*]:bg-sky-400 rounded-full" />
            </div>
            <div className="pt-4">
              <h4 className="font-semibold text-white mb-3 text-lg">Recommendations:</h4>
              <ul className="space-y-2.5">
                {getRecommendations(finalScore).map((rec, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-300 leading-relaxed">
                    <CheckCircle className="h-4 w-4 mr-2.5 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="bg-[#111111] rounded-lg p-4 border border-[#222222]">
                <h4 className="font-medium text-white mb-2">Strongest Areas</h4>
                <p className="text-sm text-gray-400">
                  Based on your responses, you show strength in understanding the potential of AI and having leadership support. 
                  Continue to build on these foundations.
                </p>
              </div>
              <div className="bg-[#111111] rounded-lg p-4 border border-[#222222]">
                <h4 className="font-medium text-white mb-2">Areas for Improvement</h4>
                <p className="text-sm text-gray-400">
                  Focus on improving your data infrastructure and team training to maximize AI effectiveness. 
                  A solid data foundation is critical for AI success.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-center pt-6 border-t border-[#333333]">
            <Button 
              onClick={handleStartOver} 
              variant="outline"
              className="bg-[#0a0a0a] hover:bg-[#111111] border-[#333333] text-white"
            >
              Start Over
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Questions View
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold text-white">AI Efficiency Scorecard</h1>
        <p className="text-gray-400">Answer these questions to gauge your current AI readiness and receive personalized recommendations.</p>
      </div>

      <Card className="bg-[#0a0a0a] border-[#333333] text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500">
                {currentQuestion.category}
              </span>
              <CardTitle className="text-lg mt-1">
                Question {currentStep + 1}
              </CardTitle>
            </div>
            <span className="text-xs px-2 py-1 bg-[#111111] rounded-full border border-[#333333]">
              {currentStep + 1} of {questions.length}
            </span>
          </div>
          <CardDescription className="text-base text-gray-300 mt-2">
            {currentQuestion.text}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderQuestion()}
        </CardContent>
        <CardFooter className="flex justify-between border-t border-[#333333] pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="text-white border-[#333333] hover:bg-[#111111] disabled:opacity-50"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!hasAnswer}
            variant="default"
            className="bg-white text-black hover:bg-gray-200 disabled:opacity-50"
          >
            {isLastQuestion ? 'Finish' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 