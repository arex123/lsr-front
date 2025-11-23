import { useState } from 'react';
import { problemAPI, patternAPI } from '../utils/api';

const BulkProblemEntry = () => {
    const [problems, setProblems] = useState([
        { title: '', link: '', difficulty: 'Easy', tags: '', pattern: '', notes: '' }
    ]);
    const [patterns, setPatterns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPattern, setSelectedPattern] = useState('');

    // Load patterns on mount
    useState(() => {
        const loadPatterns = async () => {
            try {
                const data = await patternAPI.getAllPatterns();
                setPatterns(data.patterns || []);
            } catch (error) {
                console.error('Failed to load patterns:', error);
            }
        };
        loadPatterns();
    }, []);

    const addRow = () => {
        setProblems([...problems, { title: '', link: '', difficulty: 'Easy', tags: '', pattern: selectedPattern, notes: '' }]);
    };

    const removeRow = (index) => {
        if (problems.length > 1) {
            setProblems(problems.filter((_, i) => i !== index));
        }
    };

    const updateProblem = (index, field, value) => {
        const updated = [...problems];
        updated[index][field] = value;
        setProblems(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Filter out empty problems
            const validProblems = problems.filter(p => p.title && p.difficulty);

            if (validProblems.length === 0) {
                alert('Please add at least one problem with a title and difficulty');
                return;
            }

            // Format problems for API
            const formattedProblems = validProblems.map(p => ({
                title: p.title,
                url: p.link,
                difficulty: p.difficulty,
                tags: p.tags ? p.tags.split(',').map(t => t.trim()) : [],
                notes: p.notes,
            }));

            // Create problems
            const result = await problemAPI.bulkCreate(formattedProblems);

            // If a pattern is selected, add problems to it
            if (selectedPattern && result.problems) {
                const patternProblems = result.problems.map((p, index) => ({
                    problemId: p._id,
                    difficulty: p.difficulty,
                    order: index,
                    notes: validProblems[index].notes || ''
                }));

                await patternAPI.bulkAddProblems(selectedPattern, patternProblems);
            }

            alert(`Successfully created ${result.problems.length} problems!`);

            // Reset form
            setProblems([{ title: '', link: '', difficulty: 'Easy', tags: '', pattern: '', notes: '' }]);
        } catch (error) {
            console.error('Error creating problems:', error);
            alert('Failed to create problems. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Problem Entry</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Add multiple problems at once</p>
                        </div>
                        <button
                            onClick={addRow}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Row</span>
                        </button>
                    </div>

                    {/* Pattern Selector */}
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Optional: Assign all problems to a pattern
                        </label>
                        <select
                            value={selectedPattern}
                            onChange={(e) => setSelectedPattern(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">No Pattern</option>
                            {patterns.map((pattern) => (
                                <option key={pattern._id} value={pattern._id}>
                                    {pattern.name} ({pattern.category})
                                </option>
                            ))}
                        </select>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Title*</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Link</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Difficulty*</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tags</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Notes</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {problems.map((problem, index) => (
                                        <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{index + 1}</td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={problem.title}
                                                    onChange={(e) => updateProblem(index, 'title', e.target.value)}
                                                    placeholder="Two Sum"
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="url"
                                                    value={problem.link}
                                                    onChange={(e) => updateProblem(index, 'link', e.target.value)}
                                                    placeholder="https://leetcode.com/..."
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={problem.difficulty}
                                                    onChange={(e) => updateProblem(index, 'difficulty', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="Easy">Easy</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="Hard">Hard</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={problem.tags}
                                                    onChange={(e) => updateProblem(index, 'tags', e.target.value)}
                                                    placeholder="array, hash-table"
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={problem.notes}
                                                    onChange={(e) => updateProblem(index, 'notes', e.target.value)}
                                                    placeholder="Quick notes..."
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeRow(index)}
                                                    disabled={problems.length === 1}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-between items-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {problems.filter(p => p.title).length} problem(s) ready to submit
                            </p>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Create All Problems</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BulkProblemEntry;
