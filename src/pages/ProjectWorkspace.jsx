// File: src/pages/ProjectWorkspace.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Trash2, Edit3, UserPlus, ShieldAlert, ArrowLeft, Plus, Settings } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import TaskBoard from '../components/TaskBoard';

import ProjectNotes from '../components/ProjectNotes'; 


export default function ProjectWorkspace() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Core Data State
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [userRole, setUserRole] = useState('member'); // Fallback state

  // Visual View states
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // ['dashboard', 'members', 'settings']

  // Modification Form States
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ name: '', description: '' });
  const [addMemberData, setAddMemberData] = useState({ email: '', role: 'member' });

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Fetch exact project parameters
      const projectRes = await axiosInstance.get(`/projects/${projectId}`);
      const currentProject = projectRes.data[0]?.data || projectRes.data?.data;
      setProject(currentProject);
      setEditData({ name: currentProject.name, description: currentProject.description });

      // 2. Fetch project members listing
      const membersRes = await axiosInstance.get(`/projects/${projectId}/members`);
      const currentMembers = membersRes.data[0]?.data || membersRes.data?.data || [];
      setMembers(currentMembers);

      // 3. Resolve the current operator's explicit context permissions
      const contextUser = currentMembers.find(m => m.user?._id === user?._id);
      if (contextUser) setUserRole(contextUser.role);

    } catch (err) {
      console.error(err);
      alert('Access Denied or Workspace Missing');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId, user]);

  // Operational Updates
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.put(`/projects/${projectId}`, editData);
      setProject(res.data[0]?.data || res.data?.data);
      setEditMode(false);
      alert('Workspace infrastructure details configured successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Access Denied: Admin authorization required.');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you absolutely certain you want to purge this entire project infrastructure? This action is irreversible.')) return;
    try {
      await axiosInstance.delete(`/projects/${projectId}`);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Access Restriction Error');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(`/projects/${projectId}/members`, addMemberData);
      setAddMemberData({ email: '', role: 'member' });
      alert('Member resource index appended successfully.');
      fetchData(); // Trigger structural updates
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to authorize member reference.');
    }
  };

  const handleUpdateMemberRole = async (userId, targetRole) => {
    try {
      await axiosInstance.put(`/projects/${projectId}/members/${userId}`, { newRole: targetRole });
      alert('Member privilege index recalculated.');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Unauthorized action configuration.');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Revoke member terminal token access rights?')) return;
    try {
      await axiosInstance.delete(`/projects/${projectId}/members/${userId}`);
      alert('Member node de-provisioned.');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Privilege clearance required.');
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse font-medium">Synchronizing workspace metadata...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Structural navigation breadcrumb */}
      <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition text-sm font-medium mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      {/* Unified Banner Grid */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{project?.name}</h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">{project?.description}</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-800 font-semibold text-xs uppercase tracking-wider px-3 py-1.5 rounded-xl w-fit h-fit">
          My Status: {userRole}
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 mb-8 text-sm font-medium">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-3 ${activeTab === 'dashboard' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Overview Board
        </button>
        {/* ADD THIS NEW BUTTON */}
        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-3 ${activeTab === 'notes' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Project Logs
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 ${activeTab === 'members' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Team Directory ({members.length})
        </button>
        {userRole === 'admin' && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 ${activeTab === 'settings' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            System Settings
          </button>
        )}
      </div>

      {/* Render Component Blocks Contextually */}
      {activeTab === 'dashboard' && (
        <TaskBoard 
          projectId={projectId} 
          members={members} 
          userRole={userRole} 
        />
      )}
      {/* BLOCK FOR NOTES */}
      {activeTab === 'notes' && (
        <ProjectNotes projectId={projectId} userRole={userRole} />
      )}

      {activeTab === 'members' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Members list block */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm divide-y divide-slate-100">
            <div className="p-4 bg-slate-50/50 rounded-t-2xl font-bold text-slate-800 text-sm">Active Workspace Allocations</div>
            {members.map((member) => (
              <div key={member.user?._id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={member.user?.avatar?.url || "http://placehold.co/200x200"} alt="User Matrix node" className="h-10 w-10 rounded-full border border-slate-100 bg-slate-50" />
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{member.user?.username}</div>
                    <div className="text-slate-400 text-xs font-medium">Joined {new Date(member.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Role Mutation Block Control */}
                <div className="flex items-center gap-3">
                  {userRole === 'admin' && member.user?._id !== user?._id ? (
                    <>
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateMemberRole(member.user?._id, e.target.value)}
                        className="text-xs font-semibold border border-slate-200 bg-white p-1.5 rounded-lg focus:outline-none"
                      >
                        <option value="member">Member</option>
                        <option value="project_admin">Project Admin</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button onClick={() => handleRemoveMember(member.user?._id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-bold capitalize text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{member.role}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Optional: Add member panel block */}
          {userRole === 'admin' && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2 text-base">
                <UserPlus className="h-5 w-5 text-indigo-600" /> Provision Team Member
              </h3>
              <p className="text-slate-500 text-xs mb-4">Grant access directly to this project workspace instance via email alignment.</p>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Target Account Email</label>
                  <input
                    type="email"
                    required
                    placeholder="teammate@company.com"
                    className="w-full text-sm border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    value={addMemberData.email}
                    onChange={(e) => setAddMemberData({ ...addMemberData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Functional Role Strategy</label>
                  <select
                    className="w-full text-sm border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                    value={addMemberData.role}
                    onChange={(e) => setAddMemberData({ ...addMemberData, role: e.target.value })}
                  >
                    <option value="member">Member (Read / Basic updates)</option>
                    <option value="project_admin">Project Admin (Task creation powers)</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition">
                  Deploy Access Invitation
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && userRole === 'admin' && (
        <div className="max-w-2xl bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-600" /> Workspace Settings
            </h3>
            <p className="text-slate-500 text-xs">Modify the baseline parameters or remove this project entirely.</p>
          </div>

          <form onSubmit={handleUpdateProject} className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Project Name</label>
              <input
                type="text"
                required
                className="w-full text-sm border border-slate-200 px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Workspace Objective Description</label>
              <textarea
                rows="3"
                className="w-full text-sm border border-slate-200 px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              />
            </div>
            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition">
              Save Configuration Settings
            </button>
          </form>

          <div className="border-t border-slate-100 pt-6">
            <h4 className="text-red-700 font-bold text-sm mb-1 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" /> Danger Zone
            </h4>
            <p className="text-slate-500 text-xs mb-4">Purging this workspace instantly tears down all database indexes mapped under this tracking reference number.</p>
            <button
              onClick={handleDeleteProject}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-red-100 transition"
            >
              <Trash2 className="h-3.5 w-3.5" /> Purge Project Workspace Instance
            </button>
          </div>
        </div>
      )}
    </div>
  );
}