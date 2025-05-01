'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ListChecks,
  DatabaseZap,
  Target,
  Wrench,
  BarChart3,
  Settings,
  Users,
  Workflow,
  Calculator,
  Repeat,
  Scaling,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import React from 'react';

interface ActivityItem {
  id: string;
  value: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
}

interface Phase {
  id: string;
  value: string;
  title: string;
  activities: ActivityItem[];
}

const roadmapPhases: Phase[] = [
  // --- PHASE 1 ---
  {
    id: 'phase-1',
    value: 'phase-1',
    title: 'Phase 1: Audit & Foundation (Days 1-30)',
    activities: [
      { id: 'p1-act-1', value: 'p1-act-1', title: 'Process Identification', icon: ListChecks, items: [
        "Customer journey mapping and touchpoint analysis",
        "Content creation and distribution workflows <span class=\"text-sky-400/80 ml-1 text-xs\">[Example Use Case: AI generating initial blog post outlines based on keywords.]</span>",
        "Lead scoring and qualification processes <a href=\"#template-placeholder\" class=\"text-sky-400/80 hover:text-sky-300 underline underline-offset-2 ml-1 text-xs\">[Template Idea: Develop a standardized scoring rubric incorporating AI predictive factors.]</a>",
        "Campaign performance tracking"
      ]},
      { id: 'p1-act-2', value: 'p1-act-2', title: 'Technology & Data Assessment', icon: DatabaseZap, items: [
        "Evaluate existing tools and integrations",
        "Assess data quality and accessibility <span class=\"text-sky-400/80 ml-1 text-xs\">[Checklist Item: Verify data fields needed for AI personalization (e.g., industry, job title, past interactions).]</span>",
        "Identify data gaps and collection needs",
        "Review compliance and security requirements <span class=\"text-sky-400/80 ml-1 text-xs\">[Key Question: Does our data handling for AI training comply with privacy policies?]</span>"
      ]},
      { id: 'p1-act-3', value: 'p1-act-3', title: 'KPI Definition', icon: Target, items: [
        "Time savings in routine tasks <span class=\"text-sky-400/80 ml-1 text-xs\">[Example KPI: Increase lead qualification rate by 15% using AI scoring.]</span>",
        "Lead qualification accuracy",
        "Content creation efficiency",
        "Customer response time improvement <a href=\"#template-placeholder\" class=\"text-sky-400/80 hover:text-sky-300 underline underline-offset-2 ml-1 text-xs\">[Template Idea: Create a monthly AI performance dashboard template.]</a>"
      ]},
      { id: 'p1-act-4', value: 'p1-act-4', title: 'AI Tool Selection', icon: Wrench, items: [
        "Evaluate vendor solutions and capabilities <span class=\"text-sky-400/80 ml-1 text-xs\">[Checklist Item: Score vendors on integration ease with current CRM.]</span>",
        "Compare pricing and ROI potential",
        "Check integration requirements",
        "Assess ease of implementation <span class=\"text-sky-400/80 ml-1 text-xs\">[Example Use Case: Pilot an AI email writer for A/B testing subject lines.]</span>"
      ]},
      { id: 'p1-act-5', value: 'p1-act-5', title: 'Performance Baseline', icon: BarChart3, items: [
        "Document current process times <span class=\"text-sky-400/80 ml-1 text-xs\">[Example Baseline: Current average sales cycle length is 45 days.]</span>",
        "Measure existing conversion rates",
        "Track resource utilization",
        "Calculate current operational costs"
      ]},
    ]
  },
  // --- PHASE 2 ---
  {
    id: 'phase-2',
    value: 'phase-2',
    title: 'Phase 2: Deploy (Days 31-60)',
    activities: [
      { id: 'p2-act-1', value: 'p2-act-1', title: 'AI Tool Configuration & Setup', icon: Settings, items: [
        "Install and configure selected AI platforms (e.g., CRM plugins, sales intelligence tools, content generators).",
        "Set up user accounts, roles, and permissions. <span class=\"text-sky-400/80 ml-1 text-xs\">[Checklist Item: Define access levels (e.g., admin, user, viewer) for AI platforms.]</span>",
        "Establish API integrations with existing systems (CRM, email marketing, etc.).",
        "Define initial prompts and templates for core use cases (e.g., email outreach, lead scoring). <span class=\"text-sky-400/80 ml-1 text-xs\">[Example Prompt (Sales Email): \"Write a concise (<100 words) outreach email to a marketing manager at a SaaS company introducing our AI-powered analytics tool, highlighting the benefit of saving time on reporting.\"]</span>"
      ]},
      { id: 'p2-act-2', value: 'p2-act-2', title: 'Workflow Integration & Pilots', icon: Workflow, items: [
        "Integrate AI tools into specific sales/marketing workflows identified in Phase 1. <span class=\"text-sky-400/80 ml-1 text-xs\">[Example Use Case: Automatically generate first-draft social media posts from approved blog content.]</span>",
        "Launch pilot programs with a small group of users for key processes (e.g., AI-assisted prospecting, content brief generation).",
        "Develop standard operating procedures (SOPs) for using new AI tools. <a href=\"#template-placeholder\" class=\"text-sky-400/80 hover:text-sky-300 underline underline-offset-2 ml-1 text-xs\">[Template Idea: Create an SOP template for AI content review and approval.]</a>",
        "Monitor initial usage and technical performance."
      ]},
      { id: 'p2-act-3', value: 'p2-act-3', title: 'Team Training & Enablement', icon: Users, items: [
        "Conduct training sessions for relevant teams on how to use the new AI tools effectively and ethically. <span class=\"text-sky-400/80 ml-1 text-xs\">[Checklist Item: Include modules on responsible AI use and data privacy in training.]</span>",
        "Provide documentation, tutorials, and best practice guides. <a href=\"#template-placeholder\" class=\"text-sky-400/80 hover:text-sky-300 underline underline-offset-2 ml-1 text-xs\">[Template Idea: Develop a one-page quick-start guide for each primary AI tool.]</a>",
        "Establish channels for user feedback and support.",
        "Address change management concerns and highlight benefits."
      ]},
      { id: 'p2-act-4', value: 'p2-act-4', title: 'Initial Performance Monitoring', icon: BarChart3, items: [
        "Set up dashboards or reports to track the KPIs defined in Phase 1. <span class=\"text-sky-400/80 ml-1 text-xs\">[Example Metric: Track adoption rate (% of team actively using the AI tool weekly).]</span>",
        "Monitor the performance of pilot programs against baseline metrics.",
        "Identify early wins and areas needing immediate adjustment.",
        "Collect qualitative feedback from pilot users. <span class=\"text-sky-400/80 ml-1 text-xs\">[Key Question: What is the biggest time-saver users experienced during the pilot?]</span>"
      ]},
    ]
  },
  // --- PHASE 3 ---
  {
    id: 'phase-3',
    value: 'phase-3',
    title: 'Phase 3: Optimize & Scale (Days 61-90)',
    activities: [
      { id: 'p3-act-1', value: 'p3-act-1', title: 'Performance Analysis & ROI Calculation', icon: Calculator, items: [
        "Analyze pilot results against KPIs defined in Phase 1. <span class=\"text-sky-400/80 ml-1 text-xs\">[Example Finding: AI-assisted email outreach reduced average response time by 25%.]</span>",
        "Calculate initial ROI based on performance improvements and costs. <a href=\"#template-placeholder\" class=\"text-sky-400/80 hover:text-sky-300 underline underline-offset-2 ml-1 text-xs\">[Template Idea: Use a standardized ROI calculation sheet comparing baseline vs. post-AI metrics.]</a>",
        "Identify key success factors and areas needing refinement.",
        "Refine performance tracking dashboards with actual data."
      ]},
      { id: 'p3-act-2', value: 'p3-act-2', title: 'Iteration & Optimization', icon: Repeat, items: [
        "Tweak AI configurations, prompts, and templates based on performance analysis. <span class=\"text-sky-400/80 ml-1 text-xs\">[Example Prompt Refinement: Modify lead scoring prompt to weigh 'recent website activity' higher based on pilot data.]</span>",
        "Optimize workflows further by embedding AI tools more deeply.",
        "A/B test different AI approaches (e.g., email subject lines, ad copy variations). <span class=\"text-sky-400/80 ml-1 text-xs\">[Example Use Case: Test AI-generated vs. human-written landing page headlines for conversion rate.]</span>",
        "Gather and incorporate ongoing user feedback for continuous improvement."
      ]},
      { id: 'p3-act-3', value: 'p3-act-3', title: 'Scaling & Expansion Planning', icon: Scaling, items: [
        "Develop a clear plan for scaling successful AI pilots to wider teams or processes. <span class=\"text-sky-400/80 ml-1 text-xs\">[Checklist Item: Secure budget and resources needed for full-scale rollout.]</span>",
        "Identify the next set of high-priority use cases for AI implementation based on learnings. <span class=\"text-sky-400/80 ml-1 text-xs\">[Key Question: Which currently manual marketing task shows the highest potential for AI automation based on pilot learnings?]</span>",
        "Update training materials and SOPs based on Phase 2/3 learnings.",
        "Communicate results, learnings, and future plans to stakeholders."
      ]},
      { id: 'p3-act-4', value: 'p3-act-4', title: 'Ongoing Learning & Adaptation', icon: BookOpen, items: [
        "Establish a process for staying updated on new AI tools and techniques relevant to sales/marketing. <a href=\"#template-placeholder\" class=\"text-sky-400/80 hover:text-sky-300 underline underline-offset-2 ml-1 text-xs\">[Template Idea: Create a shared internal wiki page for AI tool updates and best practices.]</a>",
        "Foster a culture of experimentation and data-driven decision-making regarding AI.",
        "Schedule regular (e.g., quarterly) reviews of AI tool performance and overall strategy. <span class=\"text-sky-400/80 ml-1 text-xs\">[Checklist Item: Include user satisfaction scores in quarterly AI reviews.]</span>",
        "Ensure ongoing compliance with data privacy regulations and ethical AI use principles."
      ]},
    ]
  }
];

export default function RoadmapSection() {
  return (
    <div className="space-y-8 text-white max-w-4xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Strategic 90-Day AI Roadmap</h1>
      </div>

      {/* Phase Indicator */}
      <div className="flex items-center justify-center space-x-2 md:space-x-4 my-6 text-sm">
        <span className="px-3 py-1 rounded-full bg-[#0a0a0a] border border-[#333333] text-white">
            Phase 1: Audit
        </span>
        <ArrowRight className="h-4 w-4 text-gray-500" />
        <span className="px-3 py-1 rounded-full bg-[#0a0a0a] border border-[#333333] text-white">
            Phase 2: Deploy
        </span>
        <ArrowRight className="h-4 w-4 text-gray-500" />
        <span className="px-3 py-1 rounded-full bg-[#0a0a0a] border border-[#333333] text-white">
            Phase 3: Optimize
        </span>
      </div>

      {/* Outer Accordion for Phases */}
      <Accordion type="single" collapsible className="space-y-4">
        {roadmapPhases.map((phase) => (
          <AccordionItem
            key={phase.id}
            value={phase.value}
            className="border border-[#333333] rounded-lg overflow-hidden bg-[#0a0a0a]"
          >
            {/* Phase Trigger */}
            <AccordionTrigger className="px-6 py-4 text-lg font-medium hover:bg-[#111111]/10 data-[state=open]:bg-[#111111]/5 data-[state=open]:border-b data-[state=open]:border-[#333333]">
              {phase.title}
            </AccordionTrigger>
            
            {/* Phase Content with Inner Accordion */}
            <AccordionContent className="bg-[#000000] px-4 py-4">
              {/* Inner Accordion for Activities */}
              <Accordion type="single" collapsible className="space-y-2">
                {phase.activities.map((activity) => {
                  const ActivityIcon = activity.icon;
                  return (
                    <AccordionItem
                      key={activity.id}
                      value={activity.value}
                      className="border border-[#333333] rounded-lg overflow-hidden bg-[#111111]"
                    >
                      {/* Activity Trigger */}
                      <AccordionTrigger className="px-6 py-3 hover:no-underline">
                        <div className="flex items-center">
                          <ActivityIcon className="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" />
                          <span className="text-left">{activity.title}</span>
                        </div>
                      </AccordionTrigger>
                      
                      {/* Activity Content */}
                      <AccordionContent className="px-6 pb-4">
                        <ul className="list-disc pl-9 space-y-2">
                          {activity.items.map((point, index) => (
                            <li key={index} className="text-gray-300" dangerouslySetInnerHTML={{ __html: point }}>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="text-sm text-gray-400 p-4 bg-[#111111] border border-[#333333] rounded-lg">
        <p className="font-medium mb-2">Pro Tip:</p>
        <p>Click on each Phase title, then each activity, to reveal detailed action items and recommendations. This structured approach ensures a thorough foundation for your AI implementation journey.</p>
      </div>
    </div>
  );
}