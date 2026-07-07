// File: src/components/ProjectNotes.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, X, FileText, Clock, User } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

export default function ProjectNotes({ projectId, userRole }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms & Edit States
  const [isCreating, setIsCreating] = useState(false);
  const [newContent, setNewContent] = useState('');
  
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Strict check based on your PRD: Only Admins can modify notes
  const isAdmin = userRole === 'admin';

  const fetchNotes = async () => {
    try {
      const response = await axiosInstance.get(`/notes/${projectId}`);
      setNotes(response.data[0]?.data || response.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch notes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [projectId]);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!isAdmin || !newContent.trim()) return;

    try {
      await axiosInstance.post(`/notes/${projectId}`, { content: newContent });
      setNewContent('');
      setIsCreating(false);
      fetchNotes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create note');
    }
  };

  const handleUpdateNote = async (e, noteId) => {
    e.preventDefault();
    if (!isAdmin || !editContent.trim()) return;

    try {
      await axiosInstance.put(`/notes/${projectId}/n/${noteId}`, { content: editContent });
      setEditingNoteId(null);
      setEditContent('');
      fetchNotes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!isAdmin || !window.confirm('Are you sure you want to delete this project note?')) return;
    try {
      await axiosInstance.delete(`/notes/${projectId}/n/${noteId}`);
      fetchNotes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete note');
    }
  };

  const startEditing = (note) => {
    setEditingNoteId(note._id);
    setEditContent(note.content);
  };

  if (loading) {
    return <div className="animate-pulse h-40 bg-slate-100 rounded-2xl w-full mt-4"></div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" /> Executive Logs & Notes
          </h2>
          <p className="text-xs text-slate-500 mt-1">High-level project documentation and updates.</p>
        </div>
        
        {isAdmin && !isCreating && (
          <button 
            onClick={() => setIsCreating(true)} 
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-sm transition"
          >
            <Plus className="h-4 w-4" /> Add Note
          </button>
        )}
      </div>

      {/* Note Creation Form (Admin Only) */}
      {isCreating && (
        <div className="mb-8 bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl animate-fadeIn">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-indigo-900">Draft New Note</h3>
            <button onClick={() => setIsCreating(false)} className="text-indigo-400 hover:text-indigo-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleCreateNote}>
            <textarea
              required
              rows="4"
              placeholder="Record architectural decisions, meeting summaries, or project milestones..."
              className="w-full text-sm px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none resize-none mb-3 shadow-sm"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
            <div className="flex justify-end">
              <button type="submit" className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition">
                Publish Note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-4">
        {notes.length === 0 && !isCreating && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-500 text-sm font-medium">
            No executive notes have been published for this project yet.
          </div>
        )}

        {notes.map((note) => (
          <div key={note._id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-indigo-100 transition group">
            
            {/* Inline Edit Form */}
            {editingNoteId === note._id ? (
              <form onSubmit={(e) => handleUpdateNote(e, note._id)} className="w-full animate-fadeIn">
                <textarea
                  required
                  rows="4"
                  className="w-full text-sm px-4 py-3 bg-slate-50 border border-indigo-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none resize-none mb-3"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setEditingNoteId(null)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              // Standard View
              <>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed mb-4">
                  {note.content}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                      <User className="h-3.5 w-3.5" /> 
                      {note.createdBy?.username || 'Unknown User'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => startEditing(note)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition" title="Edit Note">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteNote(note._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition" title="Delete Note">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}