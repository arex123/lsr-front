import { useState, useEffect } from 'react';

/**
 * ActiveProblemBanner Component
 * Displays the currently active problem with live timer
 */
const ActiveProblemBanner = ({ activeSession, onStop }) => {
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        if (activeSession?.startTime) {
            const startTime = new Date(activeSession.startTime).getTime();

            // Update immediately
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000));

            // Then update every second
            const interval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                setElapsedTime(elapsed);
            }, 1000);

            return () => clearInterval(interval);
        } else {
            setElapsedTime(0);
        }
    }, [activeSession]);

    if (!activeSession) return null;

    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    const hours = Math.floor(minutes / 60);
    const displayMinutes = minutes % 60;

    const timeDisplay = hours > 0
        ? `${hours}:${String(displayMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        : `${minutes}:${String(seconds).padStart(2, '0')}`;

    return (
        <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <span className="flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                            Currently Solving
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href={activeSession.problemUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            {activeSession.problemTitle || `Problem ${activeSession.problemId}`}
                        </a>

                        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border-2 border-red-300 dark:border-red-700 shadow-sm">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-2xl font-mono font-bold text-red-600 dark:text-red-400">
                                    {timeDisplay}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onStop}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                    Stop Session
                </button>
            </div>
        </div>
    );
};

export default ActiveProblemBanner;
