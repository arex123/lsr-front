import { useState, useEffect } from "react";
import { problemAPI } from "../utils/api";

/**
 * NotesModal Component
 * Displays and manages notes for a specific problem
 */
const NotesModal = ({ isOpen, onClose, problemId, problemName }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch notes when modal opens
  useEffect(() => {
    if (isOpen && problemId) {
      fetchNotes();
    }
  }, [isOpen, problemId]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await problemAPI.getNotes(problemId);
      setNotes(response.notes || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      alert("Failed to fetch notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) {
      alert("Please enter some content for the note.");
      return;
    }

    setSaving(true);
    try {
      const response = await problemAPI.addNote(problemId, newNoteContent);
      setNotes([...notes, response.note]);
      setNewNoteContent("");
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to add note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNote = async (noteId) => {
    if (!editingContent.trim()) {
      alert("Note content cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const response = await problemAPI.updateNote(problemId, noteId, editingContent);
      setNotes(notes.map(note => 
        note._id === noteId ? response.note : note
      ));
      setEditingNoteId(null);
      setEditingContent("");
    } catch (error) {
      console.error("Error updating note:", error);
      alert("Failed to update note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }

    setSaving(true);
    try {
      await problemAPI.deleteNote(problemId, noteId);
      setNotes(notes.filter(note => note._id !== noteId));
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (note) => {
    setEditingNoteId(note._id);
    setEditingContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditingContent("");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">📝 Notes</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{problemName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold leading-none"
            title="Close"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">Loading notes...</div>
        ) : (
          <>
            {/* Existing Notes - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {notes.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                    <p className="text-lg">No notes yet</p>
                    <p className="text-sm mt-2">Add your first note below!</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note._id}
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {editingNoteId === note._id ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={4}
                            placeholder="Edit your note..."
                            disabled={saving}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={cancelEditing}
                              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                              disabled={saving}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateNote(note._id)}
                              className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors disabled:bg-blue-300 dark:disabled:bg-blue-800"
                              disabled={saving}
                            >
                              {saving ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(note.updatedAt || note.createdAt)}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditing(note)}
                                className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1"
                                title="Edit note"
                                disabled={saving}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note._id)}
                                className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                                title="Delete note"
                                disabled={saving}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{note.content}</p>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add New Note - Fixed at bottom */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Add New Note</h3>
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-400 dark:placeholder-gray-500"
                rows={4}
                placeholder="Write your thoughts, approaches, gotchas, patterns, or anything helpful..."
                disabled={saving}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleAddNote}
                  className="px-6 py-2 bg-green-500 dark:bg-green-600 text-white rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-colors disabled:bg-green-300 dark:disabled:bg-green-800 font-semibold"
                  disabled={saving || !newNoteContent.trim()}
                >
                  {saving ? "Adding..." : "➕ Add Note"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Footer - Fixed */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;

