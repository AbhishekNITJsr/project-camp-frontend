// File: src/components/TaskBoard.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Paperclip, CheckCircle2, Circle, Trash2, X, AlertCircle, Clock } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function TaskBoard({ projectId, members, userRole }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null); // Holds full task details when opened

  // Form States
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', status: 'todo' });
  const [files, setFiles] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Permissions boolean
  const canEditTask = userRole === 'admin' || userRole === 'project_admin';

  const fetchTasks = async () => {
    try {
      const response = await axiosInstance.get(`/tasks/${projectId}`);
      setTasks(response.data[0]?.data || response.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  // --- Task Operations ---
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!canEditTask) return alert('Unauthorized');

    // Because backend expects attachments via multer (upload.array), we MUST send FormData
    const formData = new FormData();
    formData.append('title', newTask.title);
    formData.append('description', newTask.description);
    formData.append('assignedTo', newTask.assignedTo);
    formData.append('status', newTask.status);
    
    Array.from(files).forEach((file) => {
      formData.append('attachments', file);
    });

    try {
      await axiosInstance.post(`/tasks/${projectId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIsCreateOpen(false);
      setNewTask({ title: '', description: '', assignedTo: '', status: 'todo' });
      setFiles([]);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    }
  };

  const openTaskDetails = async (taskId) => {
    try {
      const response = await axiosInstance.get(`/tasks/${projectId}/t/${taskId}`);
      setSelectedTask(response.data[0]?.data || response.data?.data);
    } catch (err) {
      alert('Failed to load task details');
    }
  };

  const handleUpdateTask = async (updates) => {
    if (!canEditTask) return;
    try {
      const payload = { ...selectedTask, ...updates };
      await axiosInstance.put(`/tasks/${projectId}/t/${selectedTask._id}`, payload);
      setSelectedTask({ ...selectedTask, ...updates });
      fetchTasks(); // Refresh board
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async () => {
    if (!canEditTask || !window.confirm('Delete this task and all subtasks?')) return;
    try {
      await axiosInstance.delete(`/tasks/${projectId}/t/${selectedTask._id}`);
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  // --- Subtask Operations ---
  const handleCreateSubtask = async (e) => {
    e.preventDefault();
    if (!canEditTask || !newSubtaskTitle.trim()) return;
    try {
      const response = await axiosInstance.post(`/tasks/${projectId}/t/${selectedTask._id}/subtasks`, { title: newSubtaskTitle });
      const createdSubtask = response.data[0]?.data || response.data?.data;
      
      // Update local state to show immediately
      setSelectedTask({ ...selectedTask, subtasks: [...(selectedTask.subtasks || []), createdSubtask] });
      setNewSubtaskTitle('');
    } catch (err) {
      alert('Failed to create subtask');
    }
  };

  const handleToggleSubtask = async (subtask) => {
    // Anyone (Admin, Project Admin, Member) can complete subtasks per PRD
    try {
      const updatedStatus = !subtask.isCompleted;
      await axiosInstance.put(`/tasks/${projectId}/st/${subtask._id}`, { title: subtask.title, isCompleted: updatedStatus });
      
      // Update local state
      const updatedSubtasks = selectedTask.subtasks.map(st => st._id === subtask._id ? { ...st, isCompleted: updatedStatus } : st);
      setSelectedTask({ ...selectedTask, subtasks: updatedSubtasks });
    } catch (err) {
      alert('Failed to update subtask status');
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    if (!canEditTask) return;
    try {
      await axiosInstance.delete(`/tasks/${projectId}/st/${subtaskId}`);
      const updatedSubtasks = selectedTask.subtasks.filter(st => st._id !== subtaskId);
      setSelectedTask({ ...selectedTask, subtasks: updatedSubtasks });
    } catch (err) {
      alert('Failed to delete subtask');
    }
  };

  // --- UI Helpers ---
  const renderColumn = (statusKey, title) => {
    const columnTasks = tasks.filter(t => t.status === statusKey);
    return (
      <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col min-h-[500px]">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
          <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{columnTasks.length}</span>
        </div>
        
        <div className="flex flex-col gap-3 flex-1">
          {columnTasks.map(task => (
            <div 
              key={task._id} 
              onClick={() => openTaskDetails(task._id)}
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all"
            >
              <h4 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-1">{task.title}</h4>
              <p className="text-slate-500 text-xs line-clamp-2 mb-3">{task.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                <div className="flex -space-x-2">
                  {task.assignedTo && (
                    <img src={task.assignedTo.avatar?.url || "http://placehold.co/200x200"} alt="Assignee" className="h-6 w-6 rounded-full border-2 border-white bg-slate-100" title={task.assignedTo.username} />
                  )}
                </div>
                {task.attachments?.length > 0 && (
                  <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                    <Paperclip className="h-3.5 w-3.5" /> {task.attachments.length}
                  </div>
                )}
              </div>
            </div>
          ))}
          {columnTasks.length === 0 && (
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium">
              Drop tasks here
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="animate-pulse flex gap-4 mt-4 h-64 bg-slate-100 rounded-2xl"></div>;

  return (
    <div className="w-full">
      {/* Board Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-800">Sprint Board</h2>
        {canEditTask && (
          <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-sm transition">
            <Plus className="h-4 w-4" /> Add Task
          </button>
        )}
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderColumn('todo', 'To Do')}
        {renderColumn('in_progress', 'In Progress')}
        {renderColumn('done', 'Done')}
      </div>

      {/* --- Create Task Modal --- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-slate-100 relative">
            <button onClick={() => setIsCreateOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Task</h2>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
                <input required type="text" className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea rows="3" className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none resize-none" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assign To</label>
                  <select className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-xl bg-white outline-none" value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}>
                    <option value="">Select Member...</option>
                    {members.map(m => (
                      <option key={m.user?._id} value={m.user?._id}>{m.user?.username}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
                  <select className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-xl bg-white outline-none" value={newTask.status} onChange={e => setNewTask({...newTask, status: e.target.value})}>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Attachments (Max 5)</label>
                <input type="file" multiple max="5" onChange={(e) => setFiles(e.target.files)} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              </div>

              <button type="submit" className="w-full mt-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 transition">
                Generate Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- Task Details / Update Modal --- */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl border-l border-slate-100 flex flex-col animate-slideInRight overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start sticky top-0 bg-white z-10">
              <div className="flex-1">
                {canEditTask ? (
                  <input type="text" className="text-xl font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 outline-none w-full mb-2" value={selectedTask.title} onChange={(e) => handleUpdateTask({ title: e.target.value })} onBlur={(e) => handleUpdateTask({ title: e.target.value })} />
                ) : (
                  <h2 className="text-xl font-bold text-slate-900 mb-2">{selectedTask.title}</h2>
                )}
                
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {new Date(selectedTask.createdAt).toLocaleDateString()}</div>
                  {canEditTask ? (
                    <select className="bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-slate-700 outline-none font-bold" value={selectedTask.status} onChange={(e) => handleUpdateTask({ status: e.target.value })}>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  ) : (
                    <span className="bg-slate-100 px-2 py-1 rounded-lg font-bold uppercase">{selectedTask.status}</span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="h-5 w-5" /></button>
            </div>

            {/* Body */}
            <div className="p-6 flex-1 space-y-8">
              {/* Description */}
              <section>
                <h3 className="text-sm font-bold text-slate-800 mb-2">Description</h3>
                {canEditTask ? (
                  <textarea rows="4" className="w-full text-sm text-slate-600 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none focus:bg-white focus:ring-2 focus:ring-indigo-600" value={selectedTask.description} onChange={(e) => setSelectedTask({...selectedTask, description: e.target.value})} onBlur={(e) => handleUpdateTask({ description: e.target.value })} />
                ) : (
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedTask.description}</p>
                )}
              </section>

              {/* Subtasks */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800">Subtasks</h3>
                  <span className="text-xs font-medium text-slate-500">{selectedTask.subtasks?.filter(s => s.isCompleted).length || 0} / {selectedTask.subtasks?.length || 0} done</span>
                </div>
                
                <div className="space-y-2 mb-4">
                  {selectedTask.subtasks?.map(st => (
                    <div key={st._id} className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-xl hover:border-indigo-300 transition group">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleToggleSubtask(st)} className={`transition ${st.isCompleted ? 'text-green-500' : 'text-slate-300 hover:text-indigo-600'}`}>
                          {st.isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                        </button>
                        <span className={`text-sm font-medium ${st.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{st.title}</span>
                      </div>
                      {canEditTask && (
                        <button onClick={() => handleDeleteSubtask(st._id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {(!selectedTask.subtasks || selectedTask.subtasks.length === 0) && (
                    <div className="text-xs text-slate-400 font-medium italic px-1">No subtasks defined.</div>
                  )}
                </div>

                {canEditTask && (
                  <form onSubmit={handleCreateSubtask} className="flex gap-2">
                    <input type="text" placeholder="Add a new subtask..." className="flex-1 text-sm px-3.5 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600" value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)} />
                    <button type="submit" className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-200 transition">Add</button>
                  </form>
                )}
              </section>

              {/* Attachments Section */}
              {selectedTask.attachments?.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Paperclip className="h-4 w-4" /> Attachments</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedTask.attachments.map((file, i) => (
                      <a key={i} href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                        <div className="bg-indigo-100 text-indigo-700 p-2 rounded-md"><Paperclip className="h-3 w-3" /></div>
                        <span className="text-xs font-medium text-slate-600 truncate">{file.url.split('/').pop() || 'File Attachment'}</span>
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Footer / Danger Zone */}
            {canEditTask && (
              <div className="p-6 border-t border-slate-100 bg-slate-50 sticky bottom-0">
                <button onClick={handleDeleteTask} className="w-full flex justify-center items-center gap-2 py-2.5 bg-white border border-red-200 text-red-600 font-semibold rounded-xl text-sm hover:bg-red-50 transition shadow-sm">
                  <Trash2 className="h-4 w-4" /> Delete Task
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}