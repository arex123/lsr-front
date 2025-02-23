import React, { useEffect, useState, useMemo } from "react";
import Header from "../components/Header";
import axios from "axios";
import ProblemList from "../components/ProblemList";
import { Tabs } from "antd";
import { leetcodeProblems } from "../assets/problems";

const Dashboard = () => {
  const [todaysProblemIds, setTodaysProblemIds] = useState([]);
  const [solvedProblemIds, setSolvedProblemIds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currUser = JSON.parse(sessionStorage.getItem("lsrUser"));
        console.log(18, currUser);
        if (currUser?.email) {
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

          console.log("todaysResponse", todaysResponse);
          console.log("Solved Problem", solvedResponse);
          setTodaysProblemIds(todaysResponse.data.problems || []);
          setSolvedProblemIds(solvedResponse.data.solvedProblemIds || []);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, []);

  // Memoized computations to avoid unnecessary recalculations
  const todaysProblems = useMemo(
    () =>
      leetcodeProblems.filter((problem) =>        
        todaysProblemIds.includes(problem.id)      
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

  return (
    <div className="flex justify-center items-center flex-col ">
      <Header />
      <div className="w-[80%]">
        <Tabs defaultActiveKey="1" items={tabItems} />
      </div>
    </div>
  );
};

export default Dashboard;
