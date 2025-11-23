import { useState, useCallback, useEffect, useRef } from "react";
import { CheckCircleOutlined, CheckOutlined, ClockCircleOutlined, MoreOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, ReloadOutlined } from "@ant-design/icons";
import { problemAPI, timerAPI } from "../utils/api";
import NotesModal from "./NotesModal";
import EditProblemModal from "./EditProblemModal";

/**
 * ProblemItem Component
 * Displays individual problem with mark as done functionality
 */
const ProblemItem = ({ problem, idx, section, solved, onProblemSolved, activeSession, onSessionChange }) => {
  const [status, setStatus] = useState(solved);
  const [isMark, setIsMark] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [scheduleDetails, setScheduleDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [notesCount, setNotesCount] = useState(0);

  // Timer state
  const [startTime, setStartTime] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);

  const menuRef = useRef(null);

  // Support both old and new problem format
  const problemId = problem._id || problem.id + "";
  const problemName = problem.title || problem.Name;
  const problemCategory = problem.tags?.[0] || problem.Category;
  const problemLink = problem.url || problem.Link;
  const problemDifficulty = problem.difficulty || "Medium";
  const overdueDays = problem.overdueDays || 0;
  const nextReviewDate = problem.nextReviewDate;
  const repetitionCount = problem.repetitionCount || 0;

  // Check if this problem is the active session
  const isSessionActive = activeSession && activeSession.problemId === problemId;

  // Live timer state
  const [elapsedTime, setElapsedTime] = useState(0);

  // Sync with active session
  useEffect(() => {
    if (isSessionActive && activeSession.startTime) {
      setStartTime(new Date(activeSession.startTime).getTime());
      setTimerActive(true);
    } else if (!isSessionActive) {
      setStartTime(null);
      setTimerActive(false);
    }
  }, [activeSession, isSessionActive]);

  // Update elapsed time every second for active session
  useEffect(() => {
    if (isSessionActive && startTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setElapsedTime(0);
    }
  }, [isSessionActive, startTime]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getOverdueBadge = () => {
    if (overdueDays === 0) {
      return { text: "Due Today", color: "bg-blue-500", icon: "📅" };
    } else if (overdueDays === 1) {
      return { text: "1 day overdue", color: "bg-yellow-500", icon: "⚠️" };
    } else if (overdueDays <= 3) {
      return { text: `${overdueDays} days overdue`, color: "bg-orange-500", icon: "⚠️" };
    } else {
      return { text: `${overdueDays} days overdue`, color: "bg-red-500", icon: "🔥" };
    }
  };

  const fetchNotesCount = useCallback(async () => {
    try {
      const response = await problemAPI.getNotes(problemId);
      setNotesCount(response.notes?.length || 0);
    } catch (err) {
      console.log("Could not fetch notes count:", err);
    }
  }, [problemId]);

  const handleNotesModalOpen = () => {
    setShowNotesModal(true);
    setShowMenu(false);
    fetchNotesCount();
  };

  const handleNotesModalClose = () => {
    setShowNotesModal(false);
    fetchNotesCount();
  };

  // Handle initial link click - Show confirmation modal
  const handleLinkClick = (e) => {
    e.preventDefault(); // Prevent opening link immediately

    // Strict validation: No link = no start
    if (!problemLink) {
      alert("⚠️ Cannot start timer: This problem doesn't have a link.\n\nPlease click 'Edit' to add a problem link first.");
      return;
    }

    // If already active, just open link
    if (isSessionActive) {
      window.open(problemLink, '_blank');
      return;
    }

    // Check if another problem has an active session
    if (activeSession && activeSession.problemId !== problemId) {
      const confirmed = window.confirm(
        `⚠️ You already have an active session!\n\n` +
        `Current: ${activeSession.problemTitle || 'Problem ' + activeSession.problemId}\n\n` +
        `Starting a new session will STOP the current one. Continue?`
      );
      if (!confirmed) return;
    }

    setShowStartModal(true);
  };

  // Actually start the problem (Timer + Open Link)
  const handleStartSolving = async () => {
    setShowStartModal(false);

    // Open link in new tab
    window.open(problemLink, '_blank');

    try {
      // Start session on backend
      await timerAPI.startSession(problemId);
      if (onSessionChange) onSessionChange(); // Refresh global state

      // Notification
      const notification = document.createElement('div');
      notification.textContent = `⏱️ Timer started for "${problemName}"! Good luck!`;
      notification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce';
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.remove();
      }, 3000);
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  };

  // Stop/Give Up
  const handleStopSolving = async () => {
    if (window.confirm("Are you sure you want to stop? This attempt will be recorded.")) {
      try {
        await timerAPI.stopSession(problemId);
        if (onSessionChange) onSessionChange();
        setTimerActive(false);
        setStartTime(null);
      } catch (err) {
        console.error("Failed to stop session:", err);
      }
    }
  };

  const handleProblem = async () => {
    // Validation: Check if link exists
    if (!problemLink) {
      alert("Please add a link to this problem before solving it. Click the 'Edit' button to add a link.");
      return;
    }

    try {
      setIsMark(true);

      // Calculate time spent (in seconds)
      let timeSpent = 0;
      if (startTime) {
        timeSpent = Math.floor((Date.now() - startTime) / 1000);
        setTimerActive(false);
      }

      // Check if penalty will be applied
      const willPenalize = overdueDays > 4;

      if (section == 1) {
        const response = await problemAPI.markRevisionProblemSolved(problemId, timeSpent);

        // Show penalty notification if it was applied
        if (response.penaltyApplied || willPenalize) {
          alert(
            `⚠️ LATE PENALTY APPLIED!\n\n` +
            `You were ${overdueDays} days late.\n` +
            `Your progress has been RESET for this problem.\n\n` +
            `You'll need to review it again from the beginning.`
          );
        }
      } else {
        await problemAPI.markNewProblemSolved(problemId, problemDifficulty, timeSpent);
      }

      setIsMark(false);
      setStatus(true);

      if (timeSpent > 0) {
        const mins = Math.floor(timeSpent / 60);
        const secs = timeSpent % 60;
        const timeMsg = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
        alert(`Problem solved in ${timeMsg}! Great job! 🎉`);
      }

      if (onProblemSolved) onProblemSolved();
    } catch (err) {
      console.error("Error marking problem:", err);
      setIsMark(false);
      alert("Error while marking problem");
    }
  };

  const handleDelete = async () => {
    try {
      await problemAPI.deleteProblemSchedule(problemId);
      setShowDeleteConfirm(false);
      if (onProblemSolved) onProblemSolved();
    } catch (err) {
      console.error("Error deleting problem:", err);
      alert("Error deleting problem");
      setShowDeleteConfirm(false);
    }
  };

  const handleReset = async () => {
    try {
      await problemAPI.resetProblemSchedule(problemId);
      setShowResetConfirm(false);
      setStatus(false);
      setScheduleDetails(null);
      if (onProblemSolved) onProblemSolved();
    } catch (err) {
      console.error("Error resetting problem:", err);
      alert("Error resetting problem");
      setShowResetConfirm(false);
    }
  };

  const fetchScheduleDetails = async () => {
    if (!isDone || loadingDetails || scheduleDetails) return;
    try {
      setLoadingDetails(true);
      const response = await problemAPI.getProblemScheduleDetails(problemId);
      setScheduleDetails(response.schedule);
    } catch (err) {
      console.error("Error fetching schedule details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const isDone = section != 3 ? status : solved;

  const difficultyColors = {
    Easy: "text-green-600",
    Medium: "text-yellow-600",
    Hard: "text-red-600",
  };

  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-800 relative transition-colors">
      <td className="p-2 text-center text-gray-800 dark:text-gray-200">{idx + 1}</td>
      <td className="p-2">
        <div className="flex items-center gap-2">
          <a
            href={problemLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            className={`text-blue-600 dark:text-blue-400 hover:underline ${!problemLink ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={!problemLink ? "No link available" : isSessionActive ? "Click to open link (Timer Running)" : "Click to solve (starts timer)"}
          >
            {problemName}
          </a>

          {/* Info Icon - Shows next review date for solved problems */}
          {isDone && (
            <div className="relative group">
              <svg
                className="w-4 h-4 text-blue-500 dark:text-blue-400 cursor-help"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>

              {/* Tooltip */}
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 text-sm">
                <div className="space-y-1.5 text-gray-700 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span className="font-semibold">Next Review:</span>
                    <span className="text-blue-600 dark:text-blue-400">{nextReviewDate ? formatDate(nextReviewDate) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Solved:</span>
                    <span>{repetitionCount || 0} time{repetitionCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Timer Indicator */}
          {isSessionActive && (
            <div className="flex items-center gap-2">
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full border border-red-200 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                <span className="font-mono">
                  {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
                </span>
              </span>
              <button
                onClick={(e) => { e.preventDefault(); handleStopSolving(); }}
                className="text-gray-500 hover:text-red-600 text-xs underline"
                title="Stop timer and record as abandoned"
              >
                Stop
              </button>
            </div>
          )}
          {section === 1 && overdueDays >= 0 && (
            <span className={`text-xs px-2 py-1 rounded-full text-white font-semibold ${getOverdueBadge().color} whitespace-nowrap`}>
              {getOverdueBadge().icon} {getOverdueBadge().text}
            </span>
          )}
          {/* Penalty Warning for >4 days overdue */}
          {section === 1 && overdueDays > 4 && (
            <span className="text-xs px-2 py-1 rounded-full bg-purple-600 text-white font-bold whitespace-nowrap animate-pulse border-2 border-purple-400">
              ⚡ Progress will reset!
            </span>
          )}
        </div>
      </td>
      <td className={`p-2 text-center font-semibold ${difficultyColors[problemDifficulty] || difficultyColors.Medium}`}>
        {problemDifficulty}
      </td>
      <td className="p-2 text-gray-800 dark:text-gray-200">{problemCategory}</td>

      {section != 3 && (
        <td className="p-2 text-center">
          <button
            onClick={handleProblem}
            onMouseEnter={() => { if (isDone) { setShowTooltip(true); fetchScheduleDetails(); } }}
            onMouseLeave={() => setShowTooltip(false)}
            disabled={isMark}
            className={`
              relative group w-10 h-10 rounded-lg flex items-center justify-center
              transition-all duration-200 transform hover:scale-110
              ${isDone
                ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-gray-300 dark:border-gray-600'
              }
              ${isMark ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {isMark ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg
                className={`h-6 w-6 transition-all ${isDone ? 'text-white scale-100' : 'text-gray-400 dark:text-gray-500 scale-0 group-hover:scale-100'}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}

            {showTooltip && isDone && scheduleDetails && (
              <div className="absolute z-50 bottom-full right-0 mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 text-left">
                <div className="text-sm space-y-2 text-gray-700 dark:text-300">
                  <div><span className="font-semibold">Next Review:</span> {formatDate(scheduleDetails.nextReviewDate)}</div>
                  <div><span className="font-semibold">Solved:</span> {scheduleDetails.repetitionCount} times</div>
                </div>
              </div>
            )}
          </button>
        </td>
      )}

      <td className="p-2 text-center relative">
        <div ref={menuRef} className="relative inline-block text-left">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1">
                <button
                  onClick={() => { setShowEditModal(true); setShowMenu(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Problem
                </button>

                {isDone && (
                  <>
                    <button
                      onClick={handleNotesModalOpen}
                      className="flex items-center w-full px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Notes {notesCount > 0 && `(${notesCount})`}
                    </button>
                    <button
                      onClick={() => { setShowResetConfirm(true); setShowMenu(false); }}
                      className="flex items-center w-full px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset Progress
                    </button>
                  </>
                )}

                {!isDone && (
                  <button
                    onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Problem
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Start Confirmation Modal */}
        {showStartModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowStartModal(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-700 transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white text-center">
                <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">Ready to Solve?</h3>
                <p className="text-blue-100 mt-2">The timer will start immediately.</p>
              </div>

              <div className="p-6">
                <div className="text-center mb-6">
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    You are about to open:
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white text-xl mt-1 truncate px-4">
                    {problemName}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowStartModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartSolving}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
                  >
                    Start Solving 🚀
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {showEditModal && (
          <EditProblemModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            problem={problem}
            onUpdate={onProblemSolved}
          />
        )}

        {showNotesModal && (
          <NotesModal
            isOpen={showNotesModal}
            onClose={handleNotesModalClose}
            problemId={problemId}
            problemName={problemName}
          />
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={() => setShowDeleteConfirm(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Problem?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">This will permanently delete <strong>{problemName}</strong>.</p>
              <div className="flex space-x-3 justify-end">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}

        {showResetConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={() => setShowResetConfirm(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Reset Problem?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">This will mark <strong>{problemName}</strong> as unsolved and remove it from your schedule.</p>
              <div className="flex space-x-3 justify-end">
                <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button onClick={handleReset} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Reset</button>
              </div>
            </div>
          </div>
        )}
      </td>
    </tr >
  );
};

export default ProblemItem;
