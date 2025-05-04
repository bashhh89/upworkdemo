"use client";

import React from 'react';
import Link from 'next/link';
import { MapPin, Gauge, Wand2 } from 'lucide-react';

export default function AiImplementationPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-16 md:py-24 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
          Stop Downloading PDFs. Start Implementing AI.
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-3xl mb-10">
          Get your personalized 90-Day AI Roadmap, Efficiency Scorecard, and AI-powered tools – all within one interactive platform designed for marketing leaders.
        </p>
        
        <div className="w-full max-w-3xl mb-10">
          <div className="relative aspect-video rounded-lg border border-gray-800 overflow-hidden bg-[#111] flex items-center justify-center">
            <div className="w-1/3 h-1/3 opacity-70 flex items-center justify-center">
              <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
        
        <Link 
          href="#access" 
          className="bg-white text-black font-semibold px-8 py-4 rounded-md hover:bg-gray-100 transition-colors"
          scroll={true}
        >
          Get Instant Access
        </Link>
      </section>
      {/* Features/Benefits Section */}
      <section className="py-16 md:py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            What You Get
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="border border-gray-800 rounded-lg p-6 hover:border-gray-700 hover:bg-[#111] transition-all">
              <div className="flex justify-center mb-6">
                <div className="p-3 rounded-full bg-[#111] border border-gray-800">
                  <MapPin size={24} />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Dynamic Roadmap</h3>
              <p className="text-gray-400 text-center">
                A tailored 90-day implementation plan designed specifically for your business needs and resources.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="border border-gray-800 rounded-lg p-6 hover:border-gray-700 hover:bg-[#111] transition-all">
              <div className="flex justify-center mb-6">
                <div className="p-3 rounded-full bg-[#111] border border-gray-800">
                  <Gauge size={24} />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Instant Scorecard</h3>
              <p className="text-gray-400 text-center">
                Evaluate your current AI readiness with our efficiency scorecard, providing actionable insights.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="border border-gray-800 rounded-lg p-6 hover:border-gray-700 hover:bg-[#111] transition-all">
              <div className="flex justify-center mb-6">
                <div className="p-3 rounded-full bg-[#111] border border-gray-800">
                  <Wand2 size={24} />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">AI-Powered Tools</h3>
              <p className="text-gray-400 text-center">
                Access to a suite of specialized AI tools designed to enhance your marketing operations.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Access/Form Placeholder Section */}
      <section id="access" className="py-16 md:py-24 px-4">
        <div className="max-w-md mx-auto border border-gray-800 rounded-lg p-8 bg-[#0a0a0a]">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            Unlock Your Personalized AI Toolkit
          </h2>
          
          <p className="text-gray-400 text-center mb-8">
            Enter your details below to gain instant access...
          </p>
          
          <div className="space-y-6">
            <div className="w-full">
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
              <div className="w-full px-4 py-3 bg-[#111] border border-gray-800 rounded-md text-gray-500 cursor-not-allowed">
                example@company.com
              </div>
            </div>
            
            <button 
              disabled
              className="w-full bg-gray-700 text-gray-300 font-semibold px-5 py-3 rounded-md cursor-not-allowed"
            >
              Get Instant Access (Demo Only)
            </button>
          </div>
        </div>
        
        {/* Social Proof */}
        <p className="text-gray-400 italic text-center mt-12">
          Trusted by innovative marketing teams.
        </p>
      </section>
      {/* Footer */}
      <footer className="py-8 border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-gray-500 text-sm text-center">
            © 2025 AI Implementation Platform
          </p>
        </div>
      </footer>
      {/* Back to Home Link */}
      <div className="fixed bottom-6 right-6">
        <Link
          href="/"
          className="bg-[#111] text-white font-semibold px-4 py-2 rounded-md hover:bg-[#222] transition-colors border border-gray-800 flex items-center gap-2"
          legacyBehavior>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
} 