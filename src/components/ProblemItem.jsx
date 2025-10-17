import { useState, useEffect, useCallback } from "react";
import { problemAPI } from "../utils/api";
import NotesModal from "./NotesModal";

/**
 * ProblemItem Component
 * Displays individual problem with mark as done functionality
 * Works with both old (id, Name, Category) and new (_id, title, tags) format
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
  const [notesCount, setNotesCount] = useState(0);

  // Support both old and new problem format
  const problemId = problem._id || problem.id + "";
  const problemName = problem.title || problem.Name;
  const problemCategory = problem.tags?.[0] || problem.Category;
  const problemLink = problem.url || problem.Link;
  const problemDifficulty = problem.difficulty || "Medium";
  const overdueDays = problem.overdueDays || 0; // Get overdue days from problem

  // Helper function to get overdue badge style
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
      // Silent fail - notes count is not critical
      console.log("Could not fetch notes count:", err);
    }
  }, [problemId]);

  // Fetch notes count for solved problems
  useEffect(() => {
    if (status) {
      fetchNotesCount();
    }
  }, [status, fetchNotesCount]);

  const handleNotesModalClose = () => {
    setShowNotesModal(false);
    // Refresh notes count when modal closes
    if (status) {
      fetchNotesCount();
    }
  };

  const handleProblem = async () => {
    try {
      console.log("✅ Marking problem:", problemId);
      
      setIsMark(true);

      if (section == 1) {
        // Revision problem (from today's schedule)
        const res = await problemAPI.markRevisionProblemSolved(problemId);
        console.log("Revision marked:", res);
      } else {
        // New problem
        const res = await problemAPI.markNewProblemSolved(problemId, problemDifficulty);
        console.log("New problem marked:", res);
      }
      
      setIsMark(false);
      setStatus(true);
      
      // Refresh the problem lists to update counts and status
      if (onProblemSolved) {
        onProblemSolved();
      }
    } catch (err) {
      console.error("Error marking problem:", err);
      setIsMark(false);
      alert("Error while marking problem");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await problemAPI.deleteProblemSchedule(problemId);
      console.log("✅ Problem deleted:", response);
      setShowDeleteConfirm(false);
      if (onProblemSolved) {
        onProblemSolved(); // Refresh the problem lists
      }
    } catch (err) {
      console.error("❌ Error deleting problem:", err);
      const errorMsg = err.response?.data?.message || "Error deleting problem. Please try again.";
      alert(errorMsg);
      setShowDeleteConfirm(false);
    }
  };

  const handleReset = async () => {
    try {
      const response = await problemAPI.resetProblemSchedule(problemId);
      console.log("✅ Problem reset:", response);
      setShowResetConfirm(false);
      setStatus(false);
      setScheduleDetails(null); // Clear cached schedule details
      if (onProblemSolved) {
        onProblemSolved(); // Refresh the problem lists
      }
    } catch (err) {
      console.error("❌ Error resetting problem:", err);
      const errorMsg = err.response?.data?.message || "Error resetting problem. Please try again.";
      alert(errorMsg);
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
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isDone = section != 3 ? status : solved;

  // Difficulty badge colors
  const difficultyColors = {
    Easy: "text-green-600",
    Medium: "text-yellow-600",
    Hard: "text-red-600",
  };

  return (
    <tr className="border-b hover:bg-slate-100 relative" key={problemId}>
      <td className="p-2 text-center">{idx + 1}</td>
      <td className="p-2">
        <div className="flex items-center gap-2">
          <a href={problemLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {problemName}
          </a>
          
          {/* Overdue Badge - Only show in "Today's Problems" section */}
          {section === 1 && overdueDays >= 0 && (
            <span 
              className={`text-xs px-2 py-1 rounded-full text-white font-semibold ${getOverdueBadge().color} whitespace-nowrap`}
              title={`Scheduled for ${overdueDays === 0 ? 'today' : overdueDays + ' days ago'}`}
            >
              {getOverdueBadge().icon} {getOverdueBadge().text}
            </span>
          )}
        </div>
      </td>
      <td className={`p-2 text-center font-semibold ${difficultyColors[problemDifficulty] || difficultyColors.Medium}`}>
        {problemDifficulty}
      </td>
      <td className="p-2">{problemCategory}</td>
      
      {/* Done? Column - Only show in sections 1 and 2 */}
      {section != 3 && (
        <td
          className={`cursor-pointer p-2 text-center relative ${
            isDone ? "bg-green-500" : ""
          }`}
          onClick={handleProblem}
          onMouseEnter={() => {
            if (isDone) {
              setShowTooltip(true);
              fetchScheduleDetails();
            }
          }}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {isMark ? (
            <span className="text-sm">marking...</span>
          ) : (
            <svg
              className={`h-8 w-8 mx-auto ${isDone ? "text-white" : "text-gray-500"}`}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" />
              <path d="M9 11l3 3l8 -8" />
              <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9" />
            </svg>
          )}
          
          {/* Tooltip */}
          {showTooltip && isDone && (
            <div className="absolute z-50 bottom-full right-0 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-left">
              {loadingDetails ? (
                <div className="text-sm text-gray-500">Loading details...</div>
              ) : scheduleDetails ? (
                <div className="text-sm space-y-2">
                  <div className="font-bold text-gray-800 border-b pb-2">Problem Schedule</div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Status:</span>{" "}
                    <span className={scheduleDetails.status === 'completed' ? 'text-green-600' : 'text-blue-600'}>
                      {scheduleDetails.status === 'completed' ? '✅ Completed' : '🔄 Active'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Times Solved:</span>{" "}
                    <span className="text-blue-600">{scheduleDetails.repetitionCount}</span>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Next Review:</span>{" "}
                    <span className="text-purple-600">{formatDate(scheduleDetails.nextReviewDate)}</span>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">First Added:</span>{" "}
                    <span className="text-gray-600">{formatDate(scheduleDetails.createdAt)}</span>
                  </div>
                  
                  {/* Upcoming Review Dates */}
                  {scheduleDetails.reviewQueue && scheduleDetails.reviewQueue.length > 0 && (
                    <div>
                      <div className="font-semibold text-gray-700 mb-1">📅 Upcoming Reviews:</div>
                      <div className="space-y-1 text-xs bg-blue-50 p-2 rounded">
                        {scheduleDetails.reviewQueue.map((date, idx) => (
                          <div key={idx} className="text-blue-700">
                            {idx + 1}. {formatDate(date)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {scheduleDetails.reviewHistory && scheduleDetails.reviewHistory.length > 0 && (
                    <div>
                      <div className="font-semibold text-gray-700 mb-1">📝 Review History:</div>
                      <div className="max-h-32 overflow-y-auto space-y-1 text-xs bg-gray-50 p-2 rounded">
                        {scheduleDetails.reviewHistory.map((review, idx) => (
                          <div key={idx} className="text-gray-600">
                            {idx + 1}. {formatDate(review.solvedAt)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </td>
      )}
      
      {/* Actions Column */}
      <td className="p-2 text-center">
        <div className="flex items-center justify-center space-x-2">
          {/* Info Icon - Show for all problems in section 3 */}
          {section == 3 && (
            <div className="relative">
              <button
                onMouseEnter={() => {
                  setShowTooltip(true);
                  if (isDone) {
                    fetchScheduleDetails();
                  }
                }}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded transition-colors cursor-pointer"
                title={isDone ? "View schedule details" : "View problem details"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              {/* Tooltip for Section 3 */}
              {showTooltip && (
                <div className="absolute z-50 bottom-full right-0 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-left">
                  {isDone ? (
                    // Solved problem - show full schedule
                    loadingDetails ? (
                      <div className="text-sm text-gray-500">Loading details...</div>
                    ) : scheduleDetails ? (
                      <div className="text-sm space-y-2">
                        <div className="font-bold text-gray-800 border-b pb-2">Problem Schedule</div>
                        
                        <div>
                          <span className="font-semibold text-gray-700">Status:</span>{" "}
                          <span className={scheduleDetails.status === 'completed' ? 'text-green-600' : 'text-blue-600'}>
                            {scheduleDetails.status === 'completed' ? '✅ Completed' : '🔄 Active'}
                          </span>
                        </div>
                        
                        <div>
                          <span className="font-semibold text-gray-700">Times Solved:</span>{" "}
                          <span className="text-blue-600">{scheduleDetails.repetitionCount}</span>
                        </div>
                        
                        <div>
                          <span className="font-semibold text-gray-700">Next Review:</span>{" "}
                          <span className="text-purple-600">{formatDate(scheduleDetails.nextReviewDate)}</span>
                        </div>
                        
                        <div>
                          <span className="font-semibold text-gray-700">First Added:</span>{" "}
                          <span className="text-gray-600">{formatDate(scheduleDetails.createdAt)}</span>
                        </div>
                        
                        {/* Upcoming Review Dates */}
                        {scheduleDetails.reviewQueue && scheduleDetails.reviewQueue.length > 0 && (
                          <div>
                            <div className="font-semibold text-gray-700 mb-1">📅 Upcoming Reviews:</div>
                            <div className="space-y-1 text-xs bg-blue-50 p-2 rounded">
                              {scheduleDetails.reviewQueue.map((date, idx) => (
                                <div key={idx} className="text-blue-700">
                                  {idx + 1}. {formatDate(date)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {scheduleDetails.reviewHistory && scheduleDetails.reviewHistory.length > 0 && (
                          <div>
                            <div className="font-semibold text-gray-700 mb-1">📝 Review History:</div>
                            <div className="max-h-32 overflow-y-auto space-y-1 text-xs bg-gray-50 p-2 rounded">
                              {scheduleDetails.reviewHistory.map((review, idx) => (
                                <div key={idx} className="text-gray-600">
                                  {idx + 1}. {formatDate(review.solvedAt)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null
                  ) : (
                    // Unsolved problem - show when it was added
                    <div className="text-sm space-y-2">
                      <div className="font-bold text-gray-800 border-b pb-2">Problem Info</div>
                      
                      <div>
                        <span className="font-semibold text-gray-700">Status:</span>{" "}
                        <span className="text-gray-600">❌ Not Solved</span>
                      </div>
                      
                      <div>
                        <span className="font-semibold text-gray-700">Added to System:</span>{" "}
                        <span className="text-gray-600">
                          {problem.createdAt ? formatDate(problem.createdAt) : 'Unknown'}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        💡 Mark this problem as done to start tracking your progress and schedule reviews.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Notes Button - Only for solved problems */}
          {isDone && (
            <div className="relative">
              <button
                onClick={() => setShowNotesModal(true)}
                className="text-purple-500 hover:text-purple-700 hover:bg-purple-50 p-2 rounded transition-colors"
                title="View/Add Notes"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              {/* Notes count badge */}
              {notesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {notesCount}
                </span>
              )}
            </div>
          )}
          
          {/* Reset Button - Only for solved problems */}
          {isDone ? (
            <>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="text-orange-500 hover:text-orange-700 hover:bg-orange-50 p-2 rounded transition-colors"
                title="Reset problem (make unsolved)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
              {/* Reset Confirmation Modal */}
              {showResetConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={() => setShowResetConfirm(false)}>
                  <div className="bg-white rounded-lg p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Reset Problem?</h3>
                    <p className="text-gray-600 mb-4">
                      This will mark <strong>{problemName}</strong> as unsolved and remove it from your schedule. All progress and review history will be deleted.
                    </p>
                    <div className="flex space-x-3 justify-end">
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Delete Button - Only for unsolved problems */
            <>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                title="Delete problem"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              
              {/* Delete Confirmation Modal */}
              {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={() => setShowDeleteConfirm(false)}>
                  <div className="bg-white rounded-lg p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Problem?</h3>
                    <p className="text-gray-600 mb-4">
                      This will permanently delete <strong>{problemName}</strong>. This action cannot be undone.
                    </p>
                    <div className="flex space-x-3 justify-end">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </td>
      
      {/* Notes Modal */}
      {showNotesModal && (
        <NotesModal
          isOpen={showNotesModal}
          onClose={handleNotesModalClose}
          problemId={problemId}
          problemName={problemName}
        />
      )}
    </tr>
  );
};

export default ProblemItem;
