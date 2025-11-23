import { useState, useEffect } from 'react';
import { timerAPI, problemAPI } from '../utils/api';

/**
 * SessionHistory Component
 * Displays user's study session history with filters
 */
const SessionHistory = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, completed, abandoned
    const [problemMap, setProblemMap] = useState({});

    useEffect(() => {
        fetchSessions();
        fetchProblems();
    }, [filter]);

    const fetchProblems = async () => {
        try {
            const response = await problemAPI.getProblems({ limit: 1000 });
            const map = {};
            response.problems?.forEach(p => {
                map[p._id] = p;
            });
            setProblemMap(map);
        } catch (err) {
            console.error('Failed to fetch problems:', err);
        }
    };

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const filters = filter !== 'all' ? { status: filter } : {};
            const response = await timerAPI.getSessionHistory(filters);
            setSessions(response.sessions || []);
        } catch (err) {
            console.error('Failed to fetch sessions:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
        if (minutes > 0) return `${minutes}m ${secs}s`;
        return `${secs}s`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const getStatusBadge = (status) => {
        const badges = {
            completed: { color: 'bg-green-100 text-green-800 border-green-300', icon: '✅', text: 'Completed' },
            abandoned: { color: 'bg-red-100 text-red-800 border-red-300', icon: '🚫', text: 'Abandoned' },
            active: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '⏱️', text: 'Active' }
        };
        return badges[status] || badges.active;
    };

    const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const abandonedSessions = sessions.filter(s => s.status === 'abandoned');

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Session History</h1>
                <p className="text-gray-600 dark:text-gray-400">Track your problem-solving sessions and time spent</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{sessions.length}</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg shadow border border-green-200 dark:border-green-800">
                    <div className="text-sm text-green-700 dark:text-green-400">Completed</div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-300">{completedSessions.length}</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg shadow border border-red-200 dark:border-red-800">
                    <div className="text-sm text-red-700 dark:text-red-400">Abandoned</div>
                    <div className="text-2xl font-bold text-red-900 dark:text-red-300">{abandonedSessions.length}</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg shadow border border-blue-200 dark:border-blue-800">
                    <div className="text-sm text-blue-700 dark:text-blue-400">Total Time</div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-300">{formatDuration(totalTime)}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'completed'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    Completed
                </button>
                <button
                    onClick={() => setFilter('abandoned')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'abandoned'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    Abandoned
                </button>
            </div>

            {/* Sessions List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Loading sessions...</p>
                </div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400">No sessions found</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Problem
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Duration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Started
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {sessions.map((session) => {
                                const problem = problemMap[session.problemId];
                                const badge = getStatusBadge(session.status);

                                return (
                                    <tr key={session._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {problem?.title || `Problem ${session.problemId}`}
                                            </div>
                                            {problem && (
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {problem.difficulty}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${badge.color}`}>
                                                {badge.icon} {badge.text}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                                            {formatDuration(session.duration || 0)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(session.startTime)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SessionHistory;
