import React, { useState } from "react";
import { leetcodeProblems } from "../assets/problems";
import ProblemItem from "./ProblemItem";
const ProblemList = (props) => {
  const [dLevel, setDLevel] = useState(0);
  const handleDifficultShow = () => {
    let problemLevels = {
      easy: [],
      medium: [],
      hard: [],
    };

    leetcodeProblems.forEach((problem) => {
      if (problem.difficulty == "Easy") {
        problemLevels.easy.push(problem);
      } else if (problem.difficulty == "Medium") {
        problemLevels.medium.push(problem);
      } else {
        problemLevels.hard.push(problem);
      }
    });
    const sortOrders = [
      [...problemLevels.easy, ...problemLevels.medium, ...problemLevels.hard],
      [...problemLevels.medium, ...problemLevels.hard, ...problemLevels.easy],
      [...problemLevels.hard, ...problemLevels.medium, ...problemLevels.easy],
      leetcodeProblems,
    ];

    props.setCurrProblems(sortOrders[dLevel])
    setDLevel((dLevel+1)%sortOrders.length)
  };
  console.log("34: ", props);
  return (
    <>
      {/* <table className="table w-full opacity-75"> */}

      <table className="table w-full">
        <thead>
          <tr>
            <th>Sno</th>
            <th>Name</th>
            <th
              className="cursor-pointer flex items-center"
              onClick={handleDifficultShow}
            >
              Difficulty
              <svg
                className="h-3 w-3 ml-1 text-gray-500"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {" "}
                <path stroke="none" d="M0 0h24v24H0z" />{" "}
                <path d="M3 9l4-4l4 4m-4 -4v14" />{" "}
                <path d="M21 15l-4 4l-4-4m4 4v-14" />
              </svg>
            </th>
            <th>Topic</th>
            <th className="cursor-pointer flex items-center">
              Status
              <svg
                className="h-3 w-3 ml-1 text-gray-500"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {" "}
                <path stroke="none" d="M0 0h24v24H0z" />{" "}
                <path d="M3 9l4-4l4 4m-4 -4v14" />{" "}
                <path d="M21 15l-4 4l-4-4m4 4v-14" />
              </svg>
            </th>
          </tr>
        </thead>
        <tbody>
          {props?.currProblems?.map((problem,idx) => (
            <ProblemItem key={idx} problem={problem} idx={idx}/>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default ProblemList;
