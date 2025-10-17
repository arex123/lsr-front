import { useEffect, useState, useMemo, useCallback } from "react";
import ProblemList from "../components/ProblemList";
import AddProblemModal from "../components/AddProblemModal";
import { Tabs } from "antd";
import Loader from "../components/Loader";
import { useAuth } from "../store/AuthContext";
import { problemAPI } from "../utils/api";

const Dashboard = () => {
  const [todaysProblemIds, setTodaysProblemIds] = useState([]);
  const [todaysProblemsWithOverdue, setTodaysProblemsWithOverdue] = useState([]); // New: store overdue info
  const [solvedProblemIds, setSolvedProblemIds] = useState([]);
  const [allProblems, setAllProblems] = useState([]); // Fetch from backend
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Get saved tab from localStorage or default to "1"
    return localStorage.getItem('dashboardActiveTab') || "1";
  });
  
  // Filters for All Problems tab
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // all, solved, unsolved
  
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const fetchData = useCallback(async () => {
    try {
      if (user?.email) {
        console.log("Fetching data for:", user.email);
        setLoading(true);
        
        // Fetch all problems, today's schedule, and solved list in parallel
        const [
          problemsResponse,
          todaysResponse,
          solvedResponse
        ] = await Promise.all([
          problemAPI.getProblems({ limit: 1000 }), // Get all problems
          problemAPI.getTodaysProblems(),
          problemAPI.getSolvedProblems(),
        ]);

        console.log("All Problems:", problemsResponse);
        console.log("Today's Schedule:", todaysResponse);
        console.log("Solved Problems:", solvedResponse);
        
        setAllProblems(problemsResponse.problems || []);
        setTodaysProblemIds(todaysResponse.problemIds || []);
        setTodaysProblemsWithOverdue(todaysResponse.problems || []); // Store overdue info
        setSolvedProblemIds(solvedResponse.solvedProblemIds || []);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Memoized computations to avoid unnecessary recalculations
  const todaysProblems = useMemo(
    () => {
      // Map overdue info to problems
      const overdueMap = new Map(
        todaysProblemsWithOverdue.map(p => [p.problemId, p.overdueDays])
      );
      
      return allProblems
        .filter((problem) => todaysProblemIds.includes(problem._id))
        .map(problem => ({
          ...problem,
          overdueDays: overdueMap.get(problem._id) || 0
        }));
    },
    [allProblems, todaysProblemIds, todaysProblemsWithOverdue]
  );

  const unsolvedProblems = useMemo(
    () =>
      allProblems.filter(
        (problem) =>
          !solvedProblemIds.includes(problem._id)
      ),
    [allProblems, solvedProblemIds]
  );

  // Filtered problems for All Problems tab
  const filteredAllProblems = useMemo(() => {
    return allProblems.filter((problem) => {
      // Search filter
      if (searchTerm && !problem.title?.toLowerCase().includes(searchTerm.toLowerCase())) {
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
      label: `Today's Problems (${todaysProblems.length})`,
      children: <ProblemList problems={todaysProblems} section={"1"} onProblemSolved={fetchData} />,
    },
    {
      key: "2",
      label: `Unsolved Problems (${unsolvedProblems.length})`,
      children: <ProblemList problems={unsolvedProblems} section={"2"} onProblemSolved={fetchData} />,
    },
    {
      key: "3",
      label: `All Problems (${filteredAllProblems.length})`,
      children: (
        <div>
          {/* Filters for All Problems */}
          <div className="mb-4 flex flex-wrap gap-3 items-center bg-gray-50 p-4 rounded-lg">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="solved">Solved</option>
              <option value="unsolved">Unsolved</option>
            </select>
            
            {/* Clear Filters */}
            {(searchTerm || difficultyFilter || statusFilter) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setDifficultyFilter("");
                  setStatusFilter("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          <ProblemList 
            problems={filteredAllProblems} 
            section={"3"} 
            solvedProblemIds={solvedProblemIds} 
            onProblemSolved={fetchData} 
          />
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
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to LeetCode Spaced Repetition
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl">
            Master coding problems with scientifically proven spaced repetition technique. 
            Sign in to track your progress and optimize your learning journey.
          </p>
          <div className="flex flex-col space-y-4 text-left text-gray-700">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Track problems with optimized review schedules</span>
            </div>
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Get daily problem recommendations</span>
            </div>
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your spaced repetition progress</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Problem</span>
        </button>
      </div>
      <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} />
      
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
