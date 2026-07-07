// File: src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderPlus, Users, Shield, Briefcase, Plus, X } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

export default function Dashboard() {
  const [projectsData, setProjectsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [createLoading, setCreateLoading] = useState(false);

  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get('/projects/');
      const dataArray = response.data[0]?.data || response.data?.data || [];
      setProjectsData(dataArray);
    } catch (err) {
      setError('Failed to fetch workspaces.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await axiosInstance.post('/projects/', newProject);
      setNewProject({ name: '', description: '' });
      setIsOpen(false);
      fetchProjects(); // Refresh listing
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create workspace');
    } finally {
      setCreateLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    if (role === 'admin') return 'bg-red-50 text-red-700 border-red-200';
    if (role === 'project_admin') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Workspaces</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and access collaborative projects assigned to your profile.</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-sm transition-all self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}

      {/* Grid listing */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => <div key={n} className="h-44 bg-slate-100 rounded-2xl border border-slate-200" />)}
        </div>
      ) : projectsData.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 p-8 max-w-md mx-auto shadow-sm">
          <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No active projects</h3>
          <p className="text-slate-500 text-sm mt-1 mb-6">Get started by creating a collaborative environment or check back later.</p>
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700"
          >
            Create first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsData.map((item) => (
            <div
              key={item.project._id}
              onClick={() => navigate(`/projects/${item.project._id}`)}
              className="group cursor-pointer bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between min-h-[180px]"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-bold text-slate-900 text-xl group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {item.project.name}
                  </h3>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeColor(item.role)}`}>
                    <Shield className="h-3 w-3" /> {item.role}
                  </span>
                </div>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                  {item.project.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto text-slate-400 text-xs font-medium">
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-600">{item.project.members} {item.project.members === 1 ? 'member' : 'members'}</span>
                </div>
                <span>{new Date(item.project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Slider Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-100 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Create Workspace</h2>
            <p className="text-slate-500 text-xs mb-4">Establish your new project team ecosystem.</p>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., E-commerce Platform Architecture"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Summarize high level functional parameters..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm resize-none"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={createLoading}
                className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
              >
                {createLoading ? 'Building Space...' : 'Create Workspace'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}