import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Added DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UniqueIdentifier } from '@dnd-kit/core';
import { TagIcon, CalendarIcon, UserIcon, LayersIcon } from 'lucide-react'; // Example icons for details

interface Task {
  id: UniqueIdentifier;
  content: string; // Task Title
  description?: string; // Added optional description
  phase: string;
  priority: string;
  assignee?: string; // Added optional assignee
  dueDate?: string; // Added optional dueDate
  created?: string; // Added optional created date
  labels?: string[]; // Added optional labels
  // Add other potential task details here
}

interface KanbanTaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function KanbanTaskDetailModal({ task, isOpen, onClose }: KanbanTaskDetailModalProps) {
  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="md:max-w-lg lg:max-w-xl xl:max-w-2xl bg-[#0a0a0a] text-white border border-[#333333] rounded-none p-8"> {/* Adjusted modal size, styled */}
        <DialogHeader className="border-b border-[#333333] pb-4 mb-6"> {/* Sharp header with border */}
          <DialogTitle className="text-3xl font-bold text-white">{task.content}</DialogTitle> {/* Task Title */}
          {/* Optional DialogDescription for subtitle - using Task ID as placeholder */}
          <DialogDescription className="text-sm text-[#a0a0a0]">Task ID: {task.id}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex flex-col gap-8"> {/* Tabs structure, generous gap */}
          <TabsList className="flex bg-[#000000] border border-[#333333] rounded-none p-0 h-auto"> {/* Styled TabsList, adjusted height */}
            <TabsTrigger
              value="details"
              className="flex-1 text-center text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white rounded-none border-r border-[#333333] last:border-r-0 px-6 py-3 font-semibold text-base transition-colors duration-150" // Styled TabsTrigger
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="ai-insights"
              className="flex-1 text-center text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white rounded-none border-r border-[#333333] last:border-r-0 px-6 py-3 font-semibold text-base transition-colors duration-150"
            >
              AI Insights
            </TabsTrigger>
            <TabsTrigger
              value="ai-actions-notes"
              className="flex-1 text-center text-white data-[state=active]:bg-[#333333] data-[state=active]:text-white rounded-none px-6 py-3 font-semibold text-base transition-colors duration-150"
            >
              AI Actions / Notes
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          {/* Details Tab */}
          <TabsContent value="details" className="flex flex-col gap-8 text-sm"> {/* Details Tab Content, generous gap */}
            {/* Description */}
            <div className="flex flex-col gap-3">
              <span className="font-semibold text-white text-base">Description:</span>
              <div className="bg-[#000000] border border-[#333333] p-4 text-[#a0a0a0] rounded-none min-h-[80px] overflow-y-auto"> {/* Styled Description Block */}
                {task.description || "No detailed description available for this task."}
                {/* Placeholder longer description if needed */}
                 {task.description ? '' : `
                 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                 Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                 Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                 `}
              </div>
            </div>

            {/* Key Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Two-column layout for key info */}
              <div className="flex flex-col gap-3">
                 <span className="font-semibold text-white text-base">Status:</span>
                 <div className="bg-[#000000] border border-[#333333] p-3 text-[#a0a0a0] rounded-none flex items-center gap-2"> {/* Styled Info Block */}
                   {task.phase}
                 </div>
               </div>
               <div className="flex flex-col gap-3">
                 <span className="font-semibold text-white text-base">Priority:</span>
                 <div className="bg-[#000000] border border-[#333333] p-3 text-[#a0a0a0] rounded-none flex items-center gap-2"> {/* Styled Info Block */}
                   {task.priority}
                 </div>
               </div>
               <div className="flex flex-col gap-3">
                 <span className="font-semibold text-white text-base">Phase:</span>
                 <div className="bg-[#000000] border border-[#333333] p-3 text-[#a0a0a0] rounded-none flex items-center gap-2"> {/* Styled Info Block */}
                   {task.phase} {/* Assuming phase is the same as status/column for simplicity here */}
                 </div>
               </div>
                <div className="flex flex-col gap-3">
                 <span className="font-semibold text-white text-base">Assignee:</span>
                 <div className="bg-[#000000] border border-[#333333] p-3 text-[#a0a0a0] rounded-none flex items-center gap-2"> {/* Styled Info Block */}
                    <UserIcon className="w-4 h-4 text-[#a0a0a0]" />
                   {task.assignee || "Unassigned"}
                 </div>
               </div>
                 <div className="flex flex-col gap-3">
                 <span className="font-semibold text-white text-base">Due Date:</span>
                 <div className="bg-[#000000] border border-[#333333] p-3 text-[#a0a0a0] rounded-none flex items-center gap-2"> {/* Styled Info Block */}
                    <CalendarIcon className="w-4 h-4 text-[#a0a0a0]" />
                   {task.dueDate || "Not set"}
                 </div>
               </div>
                <div className="flex flex-col gap-3">
                 <span className="font-semibold text-white text-base">Created:</span>
                 <div className="bg-[#000000] border border-[#333333] p-3 text-[#a0a0a0] rounded-none flex items-center gap-2"> {/* Styled Info Block */}
                    <CalendarIcon className="w-4 h-4 text-[#a0a0a0]" />
                   {task.created || "Date N/A"}
                 </div>
               </div>
            </div>

            {/* Labels/Tags */}
            <div className="flex flex-col gap-3">
               <span className="font-semibold text-white text-base">Labels:</span>
               <div className="flex flex-wrap gap-2"> {/* Container for labels */}
                 {(task.labels && task.labels.length > 0) ? (
                    task.labels.map((label, index) => (
                      <span key={index} className="bg-[#333333] text-white text-xs px-3 py-1 rounded-none border border-[#a0a0a0]"> {/* Styled Label Tag */}
                        {label}
                      </span>
                    ))
                 ) : (
                   <span className="text-[#a0a0a0] text-sm">No labels applied.</span>
                 )}
               </div>
             </div>

          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="flex flex-col gap-8"> {/* AI Insights Tab Content */}
             <h4 className="text-xl font-semibold text-white border-b border-[#333333] pb-2">AI Task Analysis & Insights</h4> {/* Section title */}

             {/* Suggested Next Steps */}
             <div className="flex flex-col gap-4">
               <h5 className="text-lg font-semibold text-white border-b border-[#333333] pb-1">Suggested Next Steps from AI:</h5>
                <ul className="list-none flex flex-col gap-3 pl-0"> {/* Styled List */}
                 <li className="flex items-start gap-2 text-sm text-[#a0a0a0]">
                   <div className="w-2 h-2 bg-white mt-1 rounded-full flex-shrink-0"></div> {/* Sharp Bullet */}
                   AI suggests researching available open-source tools for this task.
                 </li>
                 <li className="flex items-start gap-2 text-sm text-[#a0a0a0]">
                    <div className="w-2 h-2 bg-white mt-1 rounded-full flex-shrink-0"></div> {/* Sharp Bullet */}
                   Evaluate potential security implications.
                 </li>
                  <li className="flex items-start gap-2 text-sm text-[#a0a0a0]">
                     <div className="w-2 h-2 bg-white mt-1 rounded-full flex-shrink-0"></div> {/* Sharp Bullet */}
                   Collaborate with the design team on UI/UX aspects.
                 </li>
               </ul>
             </div>

             {/* Potential Roadblocks */}
             <div className="flex flex-col gap-4">
               <h5 className="text-lg font-semibold text-white border-b border-[#333333] pb-1">Potential Roadblocks Identified:</h5>
                <div className="bg-[#1a1a1a] border border-[#333333] p-4 text-sm text-[#a0a0a0] rounded-none flex flex-col gap-2"> {/* Styled Roadblock Block */}
                  <p><span className="font-semibold text-white">Dependency:</span> Requires completion of Task 3 before starting.</p>
                  <p><span className="font-semibold text-white">Resource Constraint:</span> Limited access to necessary data feeds.</p>
                </div>
             </div>

             {/* Related Resources */}
             <div className="flex flex-col gap-4">
                <h5 className="text-lg font-semibold text-white border-b border-[#333333] pb-1">Related Resources Suggested by AI:</h5>
                <div className="flex flex-col gap-3"> {/* Container for resource links/cards */}
                  <div className="bg-[#000000] border border-[#333333] p-3 text-sm text-white rounded-none hover:bg-[#1a1a1a] transition-colors duration-150 cursor-pointer"> {/* Styled Resource Item */}
                    <a href="#" className="flex flex-col">
                       <span className="font-semibold">Article: Best Practices for [Task Topic]</span>
                       <span className="text-xs text-gray-500">external-blog.com</span>
                    </a>
                  </div>
                   <div className="bg-[#000000] border border-[#333333] p-3 text-sm text-white rounded-none hover:bg-[#1a1a1a] transition-colors duration-150 cursor-pointer"> {/* Styled Resource Item */}
                    <a href="#" className="flex flex-col">
                       <span className="font-semibold">Tool: [Relevant AI Tool] Overview</span>
                       <span className="text-xs text-gray-500">tool-website.com</span>
                    </a>
                  </div>
                </div>
             </div>
          </TabsContent>

          {/* AI Actions / Notes Tab */}
          <TabsContent value="ai-actions-notes" className="flex flex-col gap-8"> {/* AI Actions / Notes Tab Content, generous gap */}
             <h4 className="text-xl font-semibold text-white border-b border-[#333333] pb-2">AI Collaboration & Notes</h4> {/* Section title */}

             <div className="flex flex-col gap-3">
               <span className="font-semibold text-white text-base">Your Notes:</span>
               <Textarea
                 placeholder="Add notes or ask AI a question about this task..."
                 className="bg-[#000000] border border-[#333333] text-white placeholder:text-gray-500 rounded-none min-h-[150px] p-4 text-sm" // Styled Textarea, increased min-height
               />
             </div>

             <div className="flex justify-end"> {/* Button Container */}
                <Button className="bg-white text-black font-semibold hover:bg-gray-200 transition-colors duration-150 rounded-none px-6 py-3 text-base"> {/* Prominent Styled Button */}
                 Get AI Assistance
               </Button>
             </div>

             {/* AI Generated Content Area */}
             <div className="flex flex-col gap-4">
               <h5 className="text-lg font-semibold text-white border-b border-[#333333] pb-1">AI Generated Content:</h5>
               <div className="bg-[#000000] border border-[#333333] p-4 text-sm text-[#a0a0a0] rounded-none min-h-[100px] overflow-y-auto"> {/* Styled AI Output Area */}
                  <p className="font-semibold text-white mb-2">AI response or generated content will appear here.</p>
                  <p>Example: AI could generate a brief task summary, suggest sub-tasks, or provide brainstorming bullet points based on your notes or the task details.</p>
                  <p>Placeholder for structured output (e.g., generated checklist, draft email snippet, code suggestion).</p>
               </div>
             </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}