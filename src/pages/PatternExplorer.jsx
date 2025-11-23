import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patternAPI, problemAPI } from '../utils/api';
import EditProblemModal from '../components/EditProblemModal';

const PatternExplorer = () => {
    const [patterns, setPatterns] = useState([]);
    const [solvedIds, setSolvedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedPattern, setExpandedPattern] = useState(null);
    const [editingProblem, setEditingProblem] = useState(null);
    const [addingToPattern, setAddingToPattern] = useState(null); // Pattern ID to add to
    const [addForm, setAddForm] = useState({ title: '', url: '', difficulty: 'Easy', tags: '', notes: '' });

    const navigate = useNavigate();

    const loadData = async () => {
        try {
            setError(null);
            const patternsData = await patternAPI.getAllPatterns();
            setPatterns(patternsData.patterns || []);

            try {
                const solvedData = await problemAPI.getSolvedProblems();
                setSolvedIds(new Set(solvedData.solvedProblemIds || []));
            } catch (err) {
                console.warn('Failed to load solved problems:', err);
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
        setExpandedPattern(expandedPattern === patternId ? null : patternId);
    };

    const handleEditClick = (problem, e) => {
        e.stopPropagation();
        setEditingProblem(problem);
    };

    const handleToggleSolved = async (problem, e) => {
        e.stopPropagation();
        const isSolved = solvedIds.has(problem._id);

        try {
            if (isSolved) {
                // Unsolve (delete schedule)
                await problemAPI.deleteProblemSchedule(problem._id);
                const newSolved = new Set(solvedIds);
                newSolved.delete(problem._id);
                setSolvedIds(newSolved);
            } else {
                // Solve
                await problemAPI.markNewProblemSolved(problem._id, problem.difficulty);
                const newSolved = new Set(solvedIds);
                newSolved.add(problem._id);
                setSolvedIds(newSolved);
            }
        } catch (error) {
            console.error('Failed to toggle solved status:', error);
            alert('Failed to update status');
        }
    };

    const handleAddProblem = async (e) => {
        e.preventDefault();
        try {
            // 1. Create problem
            const problemRes = await problemAPI.addProblemManually({
                title: addForm.title,
                url: addForm.url,
                difficulty: addForm.difficulty,
                tags: addForm.tags.split(',').map(t => t.trim()).filter(t => t),
                notes: addForm.notes
            });

            if (problemRes.success && problemRes.problem) {
                // 2. Add to pattern
                await patternAPI.bulkAddProblems(addingToPattern, [{
                    problemId: problemRes.problem._id,
                    difficulty: addForm.difficulty,
                    notes: addForm.notes
                }]);

                setAddingToPattern(null);
                setAddForm({ title: '', url: '', difficulty: 'Easy', tags: '', notes: '' });
                loadData();
                alert('Problem added to pattern!');
            }
        } catch (error) {
            console.error('Failed to add problem:', error);
            alert('Failed to add problem');
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
                    <button onClick={loadData} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
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
                        <div className="text-center py-12 text-gray-500">No patterns found.</div>
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
                                                <span className="text-gray-400">({solvedCount} / {totalProblems})</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 w-full sm:w-1/3">
                                            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setAddingToPattern(pattern._id);
                                                }}
                                                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                                                title="Add Problem to Pattern"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </button>
                                            <svg className={`w-6 h-6 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                                    <button
                                                                        onClick={(e) => handleToggleSolved(problem, e)}
                                                                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${solvedIds.has(problem._id)
                                                                                ? 'bg-green-500 border-green-500 text-white'
                                                                                : 'border-gray-600 hover:border-gray-400'
                                                                            }`}
                                                                    >
                                                                        {solvedIds.has(problem._id) && (
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        )}
                                                                    </button>
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
            <EditProblemModal
                isOpen={!!editingProblem}
                onClose={() => setEditingProblem(null)}
                problem={editingProblem}
                onUpdate={loadData}
            />

            {/* Add Problem Modal */}
            {addingToPattern && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-white">Add Problem to Pattern</h3>
                            <button onClick={() => setAddingToPattern(null)} className="text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddProblem} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={addForm.title}
                                    onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Link (URL)</label>
                                <input
                                    type="url"
                                    value={addForm.url}
                                    onChange={(e) => setAddForm({ ...addForm, url: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Difficulty</label>
                                    <select
                                        value={addForm.difficulty}
                                        onChange={(e) => setAddForm({ ...addForm, difficulty: e.target.value })}
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
                                        value={addForm.tags}
                                        onChange={(e) => setAddForm({ ...addForm, tags: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                                <textarea
                                    value={addForm.notes}
                                    onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                                    rows="3"
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                ></textarea>
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setAddingToPattern(null)} className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Add Problem</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatternExplorer;
