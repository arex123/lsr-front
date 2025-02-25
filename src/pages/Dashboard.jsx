import React, { useEffect, useState, useMemo, useCallback } from "react";
import Header from "../components/Header";
import axios from "axios";
import ProblemList from "../components/ProblemList";
import { Tabs } from "antd";
import { leetcodeProblems } from "../assets/problems";
import Loader from "../components/Loader";

const Dashboard = () => {
  const [todaysProblemIds, setTodaysProblemIds] = useState([]);
  const [solvedProblemIds, setSolvedProblemIds] = useState([]);
  const [loading,setLoading] = useState(false);

  const [isLogged,setIsLogged] = useState(false)
  
  const fetchData = useCallback(async () => {
    try {
      const currUser = JSON.parse(sessionStorage.getItem("lsrUser"));
      console.log(18, currUser);
      console.log("before calling api ")
      if (currUser?.email) {
        console.log("calling api with ",currUser?.email)
        setLoading(true);
        // Fetch both APIs in parallel
        const [todaysResponse, solvedResponse] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_SERVER_URL}/getTodaysProblem/${
              currUser.email
            }`
          ),
          axios.get(
            `${import.meta.env.VITE_SERVER_URL}/api/solvedProblemIds/${
              currUser.email
            }`
          ),
        ]);

        console.log("todaysResponse", todaysResponse,todaysResponse.data.problemIds);
        console.log("Solved Problem", solvedResponse);
        setLoading(false);
        setTodaysProblemIds(todaysResponse.data.problemIds || []);
        setSolvedProblemIds(solvedResponse.data.solvedProblemIds || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  });
  useEffect(() => {
    fetchData();
  }, [isLogged]);

  // Memoized computations to avoid unnecessary recalculations
  const todaysProblems = useMemo(
    () =>
      leetcodeProblems.filter((problem) =>        
        todaysProblemIds.includes(problem.id+"")      
      ),
    [todaysProblemIds]
  );

  const unsolvedProblems = useMemo(
    () =>
      leetcodeProblems.filter(
        (problem) =>
          !solvedProblemIds.includes(problem.id+"")
      ),
    [solvedProblemIds]
  );

  const tabItems = [
    {
      key: "1",
      label: "Today's Problems",
      children: <ProblemList problems={todaysProblems} section={"1"} />,
    },
    {
      key: "2",
      label: "Unsolved Problems",
      children: <ProblemList problems={unsolvedProblems} section={"2"} />,
    },
    {
      key: "3",
      label: "All Problems",
      children: <ProblemList problems={leetcodeProblems} section={"3"} solvedProblemIds={solvedProblemIds}/>,
    },
  ];

  if (loading) return <Loader />;

  return (
    <div className="flex justify-center items-center flex-col ">
      <Header setIsLogged={setIsLogged}/>
      <div className="w-[80%]">
        <Tabs defaultActiveKey="1" items={tabItems} />
      </div>
    </div>
  );
};

export default Dashboard;
