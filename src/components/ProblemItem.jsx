import { useState, useCallback, useEffect, useRef } from "react";
import { problemAPI } from "../utils/api";
import NotesModal from "./NotesModal";
import EditProblemModal from "./EditProblemModal";

/**
 * ProblemItem Component
 * Displays individual problem with mark as done functionality
 */
const ProblemItem = ({ problem, idx, section, solved, onProblemSolved }) => {
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

  const menuRef = useRef(null);

  // Support both old and new problem format
  const problemId = problem._id || problem.id + "";
  const problemName = problem.title || problem.Name;
  const problemCategory = problem.tags?.[0] || problem.Category;
  const problemLink = problem.url || problem.Link;
  const problemDifficulty = problem.difficulty || "Medium";
  const overdueDays = problem.overdueDays || 0;

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

  const handleProblem = async () => {
    try {
      setIsMark(true);
      if (section == 1) {
        await problemAPI.markRevisionProblemSolved(problemId);
      } else {
        await problemAPI.markNewProblemSolved(problemId, problemDifficulty);
      }
      setIsMark(false);
      setStatus(true);
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
    if (!solved || loadingDetails || scheduleDetails) return;
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
          <a href={problemLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
            {problemName}
          </a>
          {section === 1 && overdueDays >= 0 && (
            <span className={`text-xs px-2 py-1 rounded-full text-white font-semibold ${getOverdueBadge().color} whitespace-nowrap`}>
              {getOverdueBadge().icon} {getOverdueBadge().text}
            </span>
          )}
        </div>
      </td>
      <td className={`p-2 text-center font-semibold ${difficultyColors[problemDifficulty] || difficultyColors.Medium}`}>
        {problemDifficulty}
      </td>
      <td className="p-2 text-gray-800 dark:text-gray-200">{problemCategory}</td>

      {section != 3 && (
        <td
          className={`cursor-pointer p-2 text-center relative ${isDone ? "bg-green-500" : ""}`}
          onClick={handleProblem}
          onMouseEnter={() => { if (isDone) { setShowTooltip(true); fetchScheduleDetails(); } }}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {isMark ? (
            <span className="text-sm">...</span>
          ) : (
            <svg className={`h-8 w-8 mx-auto ${isDone ? "text-white" : "text-gray-500"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}

          {showTooltip && isDone && scheduleDetails && (
            <div className="absolute z-50 bottom-full right-0 mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 text-left">
              <div className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                <div><span className="font-semibold">Next Review:</span> {formatDate(scheduleDetails.nextReviewDate)}</div>
                <div><span className="font-semibold">Solved:</span> {scheduleDetails.repetitionCount} times</div>
              </div>
            </div>
          )}
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
    </tr>
  );
};

export default ProblemItem;
