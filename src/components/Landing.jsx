// File: src/components/Landing.jsx
import React from 'react';
import { ShieldCheck, CheckCircle2, FolderGit2, FileText, ArrowRight } from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: <ShieldCheck className="h-6 w-6 text-indigo-600" />,
      title: "3-Tier Role Access Control",
      description: "Strict permission matrices supporting Admins, Project Admins, and Team Members with JWT authentication."
    },
    {
      icon: <CheckCircle2 className="h-6 w-6 text-indigo-600" />,
      title: "Granular Task & Subtasks",
      description: "Break down complex workflows into actionable tasks and assign subtasks with real-time status tracking."
    },
    {
      icon: <FolderGit2 className="h-6 w-6 text-indigo-600" />,
      title: "Secure File Attachments",
      description: "Collaborate effectively by attaching essential project documents and assets directly to individual tasks."
    },
    {
      icon: <FileText className="h-6 w-6 text-indigo-600" />,
      title: "Project Notes & Logs",
      description: "Maintain high-level project documentation and notes managed exclusively by authorized leadership."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wide mb-8">
          Enterprise Project Management API
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Manage your engineering teams with <span className="text-indigo-600">absolute clarity.</span>
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Project Camp provides the collaborative structure teams need. Organize tasks, enforce strict role-based authorization, and track subtask milestones effortlessly.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
            Launch Workspace
            <ArrowRight className="h-5 w-5" />
          </button>
          <button className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            Explore API Docs
          </button>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Engineered for Robust Collaboration</h2>
            <p className="mt-4 text-slate-600">Built to handle complex permission structures and detailed project hierarchies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all">
                <div className="bg-white p-3 rounded-xl w-fit shadow-sm mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}