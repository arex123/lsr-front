import { useEffect, useState, useMemo, useCallback } from "react";
import ProblemList from "../components/ProblemList";
import AddProblemModal from "../components/AddProblemModal";
import ActiveProblemBanner from "../components/ActiveProblemBanner";
import { Tabs } from "antd";
import Loader from "../components/Loader";
import { useAuth } from "../store/AuthContext";
import { problemAPI, timerAPI } from "../utils/api";

const Dashboard = () => {
  const [todaysProblemIds, setTodaysProblemIds] = useState([]);
  const [todaysProblemsWithOverdue, setTodaysProblemsWithOverdue] = useState([]); // New: store overdue info
  const [solvedProblemIds, setSolvedProblemIds] = useState([]);
  const [allProblems, setAllProblems] = useState([]); // Fetch from backend
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeSession, setActiveSession] = useState(null); // Track active timer session
  const [activeTab, setActiveTab] = useState(() => {
    // Get saved tab from localStorage or default to "1"
    return localStorage.getItem('dashboardActiveTab') || "1";
  });

  // Filters for All Problems tab
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // all, solved, unsolved

  // Pagination for All Problems tab
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalProblems, setTotalProblems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Pagination for Unsolved Problems tab
  const [unsolvedPage, setUnsolvedPage] = useState(1);
  const [unsolvedPageSize, setUnsolvedPageSize] = useState(20);
  const [unsolvedProblems, setUnsolvedProblems] = useState([]);
  const [totalUnsolved, setTotalUnsolved] = useState(0);
  const [totalUnsolvedPages, setTotalUnsolvedPages] = useState(0);

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      if (user?.email) {
        console.log("Fetching data for:", user.email);
        setLoading(true);

        // Fetch all problems, today's schedule, solved list, unsolved problems, and current session in parallel
        const [
          problemsResponse,
          unsolvedResponse,
          todaysResponse,
          solvedResponse,
          sessionResponse
        ] = await Promise.all([
          problemAPI.getProblems({
            page: currentPage,
            limit: pageSize,
            search: searchTerm,
            difficulty: difficultyFilter,
            status: statusFilter
          }),
          problemAPI.getProblems({
            page: unsolvedPage,
            limit: unsolvedPageSize,
            status: 'unsolved'
          }),
          problemAPI.getTodaysProblems(),
          problemAPI.getSolvedProblems(),
          timerAPI.getCurrentSession(),
        ]);

        console.log("All Problems:", problemsResponse);
        console.log("Unsolved Problems:", unsolvedResponse);
        console.log("Today's Schedule:", todaysResponse);
        console.log("Solved Problems:", solvedResponse);
        console.log("Current Session:", sessionResponse);

        setAllProblems(problemsResponse.problems || []);
        setTotalProblems(problemsResponse.pagination?.total || 0);
        setTotalPages(problemsResponse.pagination?.pages || 0);

        setUnsolvedProblems(unsolvedResponse.problems || []);
        setTotalUnsolved(unsolvedResponse.pagination?.total || 0);
        setTotalUnsolvedPages(unsolvedResponse.pagination?.pages || 0);

        setTodaysProblemIds(todaysResponse.problemIds || []);
        setTodaysProblemsWithOverdue(todaysResponse.problems || []); // Store overdue info
        setSolvedProblemIds(solvedResponse.solvedProblemIds || []);

        // Enrich session with problem details
        if (sessionResponse.session) {
          const problem = problemsResponse.problems?.find(p => p._id === sessionResponse.session.problemId);
          setActiveSession({
            ...sessionResponse.session,
            problemTitle: problem?.title,
            problemUrl: problem?.url
          });
        } else {
          setActiveSession(null);
        }

        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  }, [user, currentPage, pageSize, searchTerm, difficultyFilter, statusFilter, unsolvedPage, unsolvedPageSize]);

  // Callback when session starts/stops
  const refreshSession = useCallback(async () => {
    try {
      const res = await timerAPI.getCurrentSession();
      if (res.session) {
        const problem = allProblems.find(p => p._id === res.session.problemId);
        setActiveSession({
          ...res.session,
          problemTitle: problem?.title,
          problemUrl: problem?.url
        });
      } else {
        setActiveSession(null);
      }
    } catch (err) {
      console.error("Error refreshing session:", err);
    }
  }, [allProblems]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, difficultyFilter, statusFilter]);

  // Handle stopping the active session
  const handleStopSession = async () => {
    if (window.confirm("Are you sure you want to stop this session? This will be recorded as abandoned.")) {
      try {
        await timerAPI.stopSession(activeSession?.problemId);
        await refreshSession();
      } catch (err) {
        console.error("Failed to stop session:", err);
      }
    }
  };

  // Memoized computations to avoid unnecessary recalculations
  const todaysProblems = useMemo(
    () => {
      // Map overdue info to problems
      const overdueMap = new Map(
        todaysProblemsWithOverdue.map(p => [p.problemId, p.overdueDays])
      );

      return allProblems
        .filter((problem) => todaysProblemIds.includes(problem._id))
        .map((problem) => ({
          ...problem,
          overdueDays: overdueMap.get(problem._id) || 0,
        }))
        .filter(problem => problem.overdueDays >= 0) // Only show today's and overdue problems, not future ones
        .sort((a, b) => (b.overdueDays || 0) - (a.overdueDays || 0)); // Sort by most overdue first
    },
    [allProblems, todaysProblemIds, todaysProblemsWithOverdue]
  );

  // Filtered problems for All Problems tab
  const filteredAllProblems = useMemo(() => {
    return allProblems.filter((problem) => {
      // Search filter
      if (
        searchTerm &&
        !problem.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !problem.tags?.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
      ) {
        return false;
      }

      // Difficulty filter
      if (difficultyFilter && problem.difficulty !== difficultyFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === "solved" && !solvedProblemIds.includes(problem._id)) {
        return false;
      }
      if (statusFilter === "unsolved" && solvedProblemIds.includes(problem._id)) {
        return false;
      }

      return true;
    });
  }, [allProblems, searchTerm, difficultyFilter, statusFilter, solvedProblemIds]);

  // Handle tab change and persist to localStorage
  const handleTabChange = (key) => {
    setActiveTab(key);
    localStorage.setItem('dashboardActiveTab', key);
  };

  const tabItems = [
    {
      key: "1",
      label: `Today's Review (${todaysProblems.length})`,
      children: (
        <ProblemList
          problems={todaysProblems}
          section={"1"}
          solvedProblemIds={solvedProblemIds}
          onProblemSolved={fetchData}
          activeSession={activeSession}
          onSessionChange={refreshSession}
        />
      ),
    },
    {
      key: "2",
      label: `Unsolved Problems (${totalUnsolved})`,
      children: (
        <div>
          {/* Pagination Info */}
          <div className="flex items-center justify-between mb-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              Showing {unsolvedProblems.length > 0 ? ((unsolvedPage - 1) * unsolvedPageSize + 1) : 0} - {Math.min(unsolvedPage * unsolvedPageSize, totalUnsolved)} of {totalUnsolved} problems
            </div>
            <div className="flex items-center gap-2">
              <select
                value={unsolvedPageSize}
                onChange={(e) => {
                  setUnsolvedPageSize(Number(e.target.value));
                  setUnsolvedPage(1);
                }}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>

          <ProblemList
            problems={unsolvedProblems}
            section={"2"}
            solvedProblemIds={solvedProblemIds}
            onProblemSolved={fetchData}
            activeSession={activeSession}
            onSessionChange={refreshSession}
          />

          {/* Pagination Controls */}
          {totalUnsolvedPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setUnsolvedPage(prev => Math.max(1, prev - 1))}
                disabled={unsolvedPage === 1}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>

              <div className="flex items-center gap-1">
                {unsolvedPage > 3 && (
                  <>
                    <button
                      onClick={() => setUnsolvedPage(1)}
                      className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      1
                    </button>
                    {unsolvedPage > 4 && <span className="px-2 text-gray-500">...</span>}
                  </>
                )}

                {Array.from({ length: totalUnsolvedPages }, (_, i) => i + 1)
                  .filter(page => page >= unsolvedPage - 2 && page <= unsolvedPage + 2)
                  .map(page => (
                    <button
                      key={page}
                      onClick={() => setUnsolvedPage(page)}
                      className={`px-3 py-2 rounded-lg border transition-colors ${page === unsolvedPage
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                {unsolvedPage < totalUnsolvedPages - 2 && (
                  <>
                    {unsolvedPage < totalUnsolvedPages - 3 && <span className="px-2 text-gray-500">...</span>}
                    <button
                      onClick={() => setUnsolvedPage(totalUnsolvedPages)}
                      className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {totalUnsolvedPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setUnsolvedPage(prev => Math.min(totalUnsolvedPages, prev + 1))}
                disabled={unsolvedPage === totalUnsolvedPages}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "3",
      label: `All Problems (${filteredAllProblems.length})`,
      children: (
        <div>
          {/* Search and Filter Controls */}
          <div className="mb-6 flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="solved">Solved</option>
              <option value="unsolved">Unsolved</option>
            </select>
          </div>

          {/* Pagination Info */}
          <div className="flex items-center justify-between mb-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              Showing {allProblems.length > 0 ? ((currentPage - 1) * pageSize + 1) : 0} - {Math.min(currentPage * pageSize, totalProblems)} of {totalProblems} problems
            </div>
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>

          <ProblemList
            problems={filteredAllProblems}
            section={"3"}
            solvedProblemIds={solvedProblemIds}
            onProblemSolved={fetchData}
            activeSession={activeSession}
            onSessionChange={refreshSession}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>

              <div className="flex items-center gap-1">
                {/* First page */}
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      1
                    </button>
                    {currentPage > 4 && <span className="px-2 text-gray-500">...</span>}
                  </>
                )}

                {/* Pages around current */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => page >= currentPage - 2 && page <= currentPage + 2)
                  .map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg border transition-colors ${page === currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                {/* Last page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  // Show loader while checking authentication or fetching data
  if (authLoading || loading) return <Loader />;

  // Show welcome message when not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center flex-col min-h-screen">
        <div className="flex flex-col items-center justify-center mt-20 text-center px-4">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Welcome to LeetCode Spaced Repetition
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
            Master coding problems with scientifically proven spaced repetition technique.
            Sign in to track your progress and optimize your learning journey.
          </p>
          <div className="space-y-4 text-left text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Track your problem-solving progress</span>
            </div>
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Get daily problem recommendations</span>
            </div>
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Monitor your solving progress</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Active Problem Banner */}
      <ActiveProblemBanner activeSession={activeSession} onStop={handleStopSession} />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your spaced repetition progress</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Problem</span>
        </button>
      </div>
      <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} className="dark-tabs" />

      {/* Add Problem Modal */}
      <AddProblemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchData();
        }}
      />
    </div>
  );
};

export default Dashboard;
