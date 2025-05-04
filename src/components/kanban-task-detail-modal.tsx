import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UniqueIdentifier } from '@dnd-kit/core';
import { TagIcon, CalendarIcon, UserIcon, LayersIcon, StarIcon, AlertTriangleIcon, BookOpenIcon, ArrowRightIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface Task {
  id: UniqueIdentifier;
  content: string;
  description?: string;
  phase: string;
  priority: string;
  assignee?: string;
  dueDate?: string;
  created?: string;
  labels?: string[];
}

interface KanbanTaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function KanbanTaskDetailModal({ task, isOpen, onClose }: KanbanTaskDetailModalProps) {
  if (!task) return null;

  const getPriorityIndicator = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high':
        return 'bg-red-900/20 text-red-400 border-red-900/30';
      case 'medium':
        return 'bg-amber-900/20 text-amber-400 border-amber-900/30';
      case 'low':
        return 'bg-green-900/20 text-green-400 border-green-900/30';
      default:
        return 'bg-zinc-800/50 text-zinc-400 border-zinc-800';
    }
  };

  const getPhaseIndicator = (phase: string) => {
    switch(phase.toLowerCase()) {
      case 'to do':
      case 'todo':
      case 'new lead':
        return 'bg-blue-900/20 text-blue-400 border-blue-900/30';
      case 'in progress':
      case 'contacted':
        return 'bg-indigo-900/20 text-indigo-400 border-indigo-900/30';
      case 'done':
      case 'qualified':
        return 'bg-emerald-900/20 text-emerald-400 border-emerald-900/30';
      case 'closed':
        return 'bg-violet-900/20 text-violet-400 border-violet-900/30';
      default:
        return 'bg-zinc-800/50 text-zinc-400 border-zinc-800';
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-md p-0 overflow-hidden shadow-xl">
        <div className="relative z-10">
          {/* Header */}
          <div className="pt-6 px-8 pb-4 border-b border-zinc-900">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
              <div className="text-xs text-zinc-500 mb-2 font-mono">
                {task.id.toString().substring(0, 8)}
              </div>
              
              <DialogTitle className="text-2xl font-bold text-zinc-200">
                {task.content}
              </DialogTitle>
              
              <div className="flex items-center gap-3 mt-4">
                <div className={`px-3 py-1 rounded-sm text-xs font-medium ${getPhaseIndicator(task.phase)} border`}>
                  {task.phase}
                </div>
                <div className={`px-3 py-1 rounded-sm text-xs font-medium ${getPriorityIndicator(task.priority)} border`}>
                  {task.priority}
                </div>
                {task.labels && task.labels.map((label, idx) => (
                  <div key={idx} className="px-3 py-1 rounded-sm text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
                    {label}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* Custom styled tabs */}
          <Tabs defaultValue="details" className="mt-2">
            <TabsList className="flex w-full bg-transparent border-b border-zinc-900 px-8">
              <TabsTrigger
                value="details"
                className="px-5 py-3 data-[state=active]:text-zinc-200 data-[state=active]:border-zinc-200 data-[state=active]:border-b-2 text-zinc-500 rounded-none bg-transparent font-medium transition-all"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="ai-insights"
                className="px-5 py-3 data-[state=active]:text-zinc-200 data-[state=active]:border-zinc-200 data-[state=active]:border-b-2 text-zinc-500 rounded-none bg-transparent font-medium transition-all"
              >
                AI Insights
              </TabsTrigger>
              <TabsTrigger
                value="ai-actions-notes"
                className="px-5 py-3 data-[state=active]:text-zinc-200 data-[state=active]:border-zinc-200 data-[state=active]:border-b-2 text-zinc-500 rounded-none bg-transparent font-medium transition-all"
              >
                Actions & Notes
              </TabsTrigger>
            </TabsList>
            
            {/* Details Tab */}
            <TabsContent value="details" className="px-8 py-6">
              <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-6">
                <div className="bg-zinc-900 rounded-md p-6 border border-zinc-800">
                  <h3 className="text-base font-medium text-zinc-200 mb-3 flex items-center gap-2">
                    <BookOpenIcon className="h-4 w-4 text-zinc-400" />
                    Description
                  </h3>
                  <div className="text-zinc-400 text-sm leading-relaxed">
                    {task.description || 
                      <div className="text-zinc-500 italic">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      </div>
                    }
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-900 rounded-md p-4 border border-zinc-800 flex items-start gap-4">
                    <div className="h-8 w-8 rounded-md bg-zinc-800 flex items-center justify-center">
                      <CalendarIcon className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs">Due Date</p>
                      <p className="text-zinc-200 font-medium">{task.dueDate || "Not set"}</p>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-900 rounded-md p-4 border border-zinc-800 flex items-start gap-4">
                    <div className="h-8 w-8 rounded-md bg-zinc-800 flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs">Assignee</p>
                      <p className="text-zinc-200 font-medium">{task.assignee || "Unassigned"}</p>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-900 rounded-md p-4 border border-zinc-800 flex items-start gap-4">
                    <div className="h-8 w-8 rounded-md bg-zinc-800 flex items-center justify-center">
                      <TagIcon className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs">Status</p>
                      <p className="text-zinc-200 font-medium">{task.phase}</p>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-900 rounded-md p-4 border border-zinc-800 flex items-start gap-4">
                    <div className="h-8 w-8 rounded-md bg-zinc-800 flex items-center justify-center">
                      <StarIcon className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs">Priority</p>
                      <p className="text-zinc-200 font-medium">{task.priority}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-zinc-900 rounded-md p-6 border border-zinc-800">
                  <h3 className="text-base font-medium text-zinc-200 mb-4">Created</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-200">
                      AI
                    </div>
                    <div>
                      <p className="text-zinc-200 text-sm font-medium">AI Assistant</p>
                      <p className="text-zinc-500 text-xs">{task.created || new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
            
            {/* AI Insights Tab */}
            <TabsContent value="ai-insights" className="px-8 py-6">
              <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-6">
                <div className="bg-zinc-900 rounded-md p-6 border border-zinc-800">
                  <h3 className="text-lg font-medium text-zinc-200 mb-4 flex items-center gap-2">
                    <div className="h-5 w-5 rounded-md bg-zinc-800 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-zinc-400"></div>
                    </div>
                    AI Analysis
                  </h3>
                  
                  <div className="mt-4 space-y-3">
                    <div className="bg-zinc-900/80 rounded-md p-4 border border-zinc-800">
                      <p className="text-zinc-300 font-medium mb-2">Priority Assessment</p>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-600 rounded-full" style={{width: '65%'}}></div>
                      </div>
                      <p className="text-zinc-500 text-xs mt-2">This task is of moderate priority based on dependencies and timeline.</p>
                    </div>
                    
                    <div className="bg-zinc-900/80 rounded-md p-4 border border-zinc-800">
                      <p className="text-zinc-300 font-medium mb-2">Complexity Analysis</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-3 w-3 rounded-sm bg-zinc-600"></div>
                        ))}
                        {[4, 5].map(i => (
                          <div key={i} className="h-3 w-3 rounded-sm bg-zinc-800"></div>
                        ))}
                      </div>
                      <p className="text-zinc-500 text-xs mt-2">Moderate complexity requiring careful planning.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-zinc-900 rounded-md p-6 border border-zinc-800">
                  <h3 className="text-base font-medium text-zinc-200 mb-3">Recommended Next Steps</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-3 text-zinc-400">
                      <ArrowRightIcon className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span>Research available open-source tools for this task.</span>
                    </li>
                    <li className="flex items-center gap-3 text-zinc-400">
                      <ArrowRightIcon className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span>Evaluate potential security implications.</span>
                    </li>
                    <li className="flex items-center gap-3 text-zinc-400">
                      <ArrowRightIcon className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span>Collaborate with the design team on UI/UX aspects.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-zinc-900 rounded-md overflow-hidden border border-zinc-800">
                  <div className="bg-zinc-800/50 px-6 py-3 border-b border-zinc-800">
                    <h3 className="text-base font-medium text-zinc-200 flex items-center gap-2">
                      <AlertTriangleIcon className="h-4 w-4 text-zinc-400" />
                      Potential Roadblocks
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-md bg-zinc-800 flex items-center justify-center mt-0.5">
                        <div className="h-1 w-1 rounded-full bg-zinc-400"></div>
                      </div>
                      <div>
                        <p className="text-zinc-300 text-sm font-medium">Dependency</p>
                        <p className="text-zinc-500 text-sm">Requires completion of Task 3 before starting.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-md bg-zinc-800 flex items-center justify-center mt-0.5">
                        <div className="h-1 w-1 rounded-full bg-zinc-400"></div>
                      </div>
                      <div>
                        <p className="text-zinc-300 text-sm font-medium">Resource Constraint</p>
                        <p className="text-zinc-500 text-sm">Limited access to necessary data feeds.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
            
            {/* Actions & Notes Tab */}
            <TabsContent value="ai-actions-notes" className="px-8 py-6">
              <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-6">
                <div className="bg-zinc-900 rounded-md p-6 border border-zinc-800">
                  <h3 className="text-base font-medium text-zinc-200 mb-4">Add Notes or Task Context</h3>
                  <Textarea
                    placeholder="Add notes or ask AI a question about this task..."
                    className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 rounded-sm min-h-[150px] p-4 text-sm focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
                  />
                  
                  <div className="flex justify-end mt-4">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md py-2 px-6 text-sm transition-all">
                      Get AI Assistance
                    </Button>
                  </div>
                </div>
                
                <div className="bg-zinc-900 rounded-md p-6 border border-zinc-800">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-md bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-200">
                      AI
                    </div>
                    <div>
                      <p className="text-zinc-200 text-sm font-medium">AI Assistant</p>
                      <p className="text-zinc-500 text-xs">Generated Content</p>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-950 rounded-md p-4 border border-zinc-800 mt-2">
                    <p className="text-zinc-200 font-medium mb-2">AI response or generated content will appear here.</p>
                    <p className="text-zinc-500 text-sm">Example: AI could generate a brief task summary, suggest sub-tasks, or provide brainstorming bullet points based on your notes or the task details.</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <h3 className="text-base font-medium text-zinc-200">Resources</h3>
                  <a href="#" className="group">
                    <div className="bg-zinc-900 rounded-md p-4 border border-zinc-800 transition-all group-hover:border-zinc-700 group-hover:bg-zinc-800/80">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-zinc-800 flex items-center justify-center">
                          <BookOpenIcon className="h-4 w-4 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-zinc-200 text-sm font-medium group-hover:text-zinc-100 transition-colors">Best Practices for [Task Topic]</p>
                          <p className="text-zinc-500 text-xs">external-blog.com</p>
                        </div>
                      </div>
                    </div>
                  </a>
                  
                  <a href="#" className="group">
                    <div className="bg-zinc-900 rounded-md p-4 border border-zinc-800 transition-all group-hover:border-zinc-700 group-hover:bg-zinc-800/80">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-zinc-800 flex items-center justify-center">
                          <BookOpenIcon className="h-4 w-4 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-zinc-200 text-sm font-medium group-hover:text-zinc-100 transition-colors">[Relevant AI Tool] Overview</p>
                          <p className="text-zinc-500 text-xs">tool-website.com</p>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
