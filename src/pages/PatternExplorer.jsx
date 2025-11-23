import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patternAPI, problemAPI } from '../utils/api';

const PatternExplorer = () => {
    const [patterns, setPatterns] = useState([]);
    const [solvedIds, setSolvedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedPattern, setExpandedPattern] = useState(null);
    const [editingProblem, setEditingProblem] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', url: '', difficulty: 'Easy', tags: '', notes: '' });

    const navigate = useNavigate();

    const loadData = async () => {
        try {
            setError(null);
            // Load patterns first as they are most important
            const patternsData = await patternAPI.getAllPatterns();
            setPatterns(patternsData.patterns || []);

            // Try to load solved problems, but don't block if it fails
            try {
                const solvedData = await problemAPI.getSolvedProblems();
                setSolvedIds(new Set(solvedData.solvedProblemIds || []));
            } catch (err) {
                console.warn('Failed to load solved problems:', err);
                // Don't set main error, just continue without solved status
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            setError('Failed to load patterns. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const togglePattern = (patternId) => {
        if (expandedPattern === patternId) {
            setExpandedPattern(null);
        } else {
            setExpandedPattern(patternId);
        }
    };

    const handleEditClick = (problem, e) => {
        e.stopPropagation();
        setEditingProblem(problem);
        setEditForm({
            title: problem.title || '',
            url: problem.url || problem.link || '',
            difficulty: problem.difficulty || 'Easy',
            tags: problem.tags ? problem.tags.join(', ') : '',
            notes: problem.notes || ''
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await problemAPI.update(editingProblem._id, {
                title: editForm.title,
                url: editForm.url,
                difficulty: editForm.difficulty,
                tags: editForm.tags.split(',').map(t => t.trim()).filter(t => t),
                notes: editForm.notes
            });

            setEditingProblem(null);
            loadData(); // Reload to show changes
            alert('Problem updated successfully!');
        } catch (error) {
            console.error('Failed to update problem:', error);
            alert('Failed to update problem');
        }
    };

    const filteredPatterns = patterns.filter(pattern =>
        pattern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pattern.problems.some(p => p.problemId?.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center text-red-400">
                    <p className="text-xl font-semibold mb-2">Error</p>
                    <p>{error}</p>
                    <button
                        onClick={loadData}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">DSA Patterns</h1>
                        <p className="text-gray-400 mt-2">Curated list of patterns for technical interviews</p>
                    </div>
                    <div className="w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search patterns or problems..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Patterns List */}
                <div className="space-y-4">
                    {filteredPatterns.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No patterns found.
                        </div>
                    ) : (
                        filteredPatterns.map((pattern) => {
                            const problems = pattern.problems.map(p => p.problemId).filter(Boolean);
                            const totalProblems = problems.length;
                            const solvedCount = problems.filter(p => solvedIds.has(p._id)).length;
                            const progress = totalProblems > 0 ? (solvedCount / totalProblems) * 100 : 0;
                            const isExpanded = expandedPattern === pattern._id;

                            return (
                                <div key={pattern._id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                    {/* Accordion Header */}
                                    <div
                                        onClick={() => togglePattern(pattern._id)}
                                        className="p-4 sm:p-6 cursor-pointer hover:bg-gray-750 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-white mb-1">{pattern.name}</h3>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="px-2 py-0.5 rounded bg-blue-900/30 text-blue-400 border border-blue-800/50">
                                                    {pattern.category}
                                                </span>
                                                <span className="text-gray-400">
                                                    ({solvedCount} / {totalProblems})
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 w-full sm:w-1/3">
                                            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <svg
                                                className={`w-6 h-6 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Accordion Body */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-700 bg-gray-800/50">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-gray-800 text-gray-400 uppercase font-medium">
                                                        <tr>
                                                            <th className="px-6 py-3 w-12">Status</th>
                                                            <th className="px-6 py-3">Problem</th>
                                                            <th className="px-6 py-3 w-32">Difficulty</th>
                                                            <th className="px-6 py-3 w-24 text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-700">
                                                        {problems.map((problem) => (
                                                            <tr key={problem._id} className="hover:bg-gray-700/50 transition-colors">
                                                                <td className="px-6 py-4">
                                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${solvedIds.has(problem._id)
                                                                            ? 'bg-green-500 border-green-500 text-white'
                                                                            : 'border-gray-600'
                                                                        }`}>
                                                                        {solvedIds.has(problem._id) && (
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <a
                                                                        href={problem.url || problem.link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="font-medium text-white hover:text-blue-400 transition-colors"
                                                                    >
                                                                        {problem.title}
                                                                    </a>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${problem.difficulty === 'Easy' ? 'bg-green-900/30 text-green-400' :
                                                                            problem.difficulty === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                                                                                'bg-red-900/30 text-red-400'
                                                                        }`}>
                                                                        {problem.difficulty}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <button
                                                                        onClick={(e) => handleEditClick(problem, e)}
                                                                        className="text-gray-500 hover:text-blue-400 transition-colors"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingProblem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-white">Edit Problem</h3>
                            <button
                                onClick={() => setEditingProblem(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Link (URL)</label>
                                <input
                                    type="url"
                                    value={editForm.url}
                                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Difficulty</label>
                                    <select
                                        value={editForm.difficulty}
                                        onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
                                    <input
                                        type="text"
                                        value={editForm.tags}
                                        onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                                <textarea
                                    value={editForm.notes}
                                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                    rows="3"
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingProblem(null)}
                                    className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatternExplorer;
