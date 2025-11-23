import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patternAPI, problemAPI } from '../utils/api';

const PatternDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pattern, setPattern] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingProblem, setEditingProblem] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        link: '',
        difficulty: 'Easy',
        tags: '',
        notes: ''
    });

    const loadPattern = async () => {
        try {
            const data = await patternAPI.getPatternById(id);
            setPattern(data.pattern);
        } catch (error) {
            console.error('Failed to load pattern:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPattern();
    }, [id]);

    const handleEditClick = (problem) => {
        setEditingProblem(problem);
        setEditForm({
            title: problem.title || '',
            link: problem.link || '', // Note: API returns 'link' or 'url', check backend response structure. Backend model has 'url', but frontend might expect 'link'. Let's check.
            // Actually backend model has 'url'. The seed script used 'url' but mapped to 'link' in some places?
            // Wait, the seed script created problems with 'url'.
            // The getPatternById response populates problems.
            // Let's assume the problem object has 'url'.
            // But wait, the previous code in PatternDetail used problem.link.
            // Let's check if the problem object has link or url.
            // In seedPatternsWithProblems.js: url: problemData.url || "" (wait, seed script didn't have url in the input array, it had title and difficulty).
            // Ah, the seed script didn't add URLs!
            // But the BulkProblemEntry used 'url'.
            // Let's use 'url' as the source of truth, but fallback to 'link' if needed.
            // And when updating, send 'url'.
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

            // Close modal and reload pattern
            setEditingProblem(null);
            loadPattern();
            alert('Problem updated successfully!');
        } catch (error) {
            console.error('Failed to update problem:', error);
            alert('Failed to update problem');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!pattern) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">Pattern not found</p>
                    <button
                        onClick={() => navigate('/patterns')}
                        className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        ← Back to Patterns
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/patterns')}
                    className="mb-6 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Patterns
                </button>

                {/* Pattern Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 mb-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800 mb-3">
                                {pattern.category}
                            </span>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                {pattern.name}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                                {pattern.description}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-6">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Problems</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pattern.problems.length}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Difficulty Spread</p>
                                <div className="flex space-x-2 mt-1">
                                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                        {pattern.problems.filter(p => p.difficulty === 'Easy').length} Easy
                                    </span>
                                    <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                                        {pattern.problems.filter(p => p.difficulty === 'Medium').length} Med
                                    </span>
                                    <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                        {pattern.problems.filter(p => p.difficulty === 'Hard').length} Hard
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Problems List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Problems</h2>

                    {pattern.problems.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">No problems added to this pattern yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pattern.problems.map((problem, index) => (
                                <div
                                    key={problem._id}
                                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600 group"
                                >
                                    <div className="flex items-center space-x-4 flex-1">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-8">
                                            {index + 1}.
                                        </span>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                {problem.title || 'Untitled Problem'}
                                            </h3>
                                            {problem.tags && problem.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {problem.tags.map((tag, i) => (
                                                        <span
                                                            key={i}
                                                            className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {problem.notes && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{problem.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                            {problem.difficulty}
                                        </span>

                                        {/* Action Buttons */}
                                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditClick(problem)}
                                                className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                title="Edit Problem"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>

                                            {(problem.url || problem.link) && (
                                                <a
                                                    href={problem.url || problem.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Open Link"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingProblem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Problem</h3>
                            <button
                                onClick={() => setEditingProblem(null)}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Link (URL)
                                </label>
                                <input
                                    type="url"
                                    value={editForm.url}
                                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Difficulty
                                    </label>
                                    <select
                                        value={editForm.difficulty}
                                        onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Tags (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.tags}
                                        onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    value={editForm.notes}
                                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingProblem(null)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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

export default PatternDetail;
