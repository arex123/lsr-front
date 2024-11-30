import React, { useContext } from "react";
import { PContext } from "../store/ProblemProvider";
import { checkIsSolved, uncheckProblem } from "../assets/api";
import axios from "axios";
const ProblemItem = ({ problem, idx, setCurrProblems }) => {
  const { user, loading, lists, setList, setLoading } = useContext(PContext);
  const handleCheckboxChange = async () => {
    setLoading({status:'checking'});
    // setTimeout(()=>{
    //   setLoading({status:'solved'});
    // },5000)
    if (problem.status) {
      let result = await uncheckProblem(user.email, problem.sNo);
      if (result) {
        let updatedList = [...lists];
        updatedList[problem.sNo - 1].status = false;
        setList(updatedList);
        localStorage.setItem("mylist", JSON.stringify(updatedList));

        setCurrProblems(updatedList)

        
      }
    } else {
      try {
        let solved = await checkIsSolved(
          user.leetcode,
          user.email,
          problem.problem,
          problem.sNo
        );
        if (solved.data.success) {
          alert("congrats");
          let updatedList = [...lists];
          updatedList[problem.sNo - 1].status = true;
          setList(updatedList);
          localStorage.setItem("mylist", JSON.stringify(updatedList));
        } else {
          alert("not solved");
        }
      } catch (err) {
        alert("not solved");
      }
    }
    // setLoading(false);
  };
  return (
    <tr className={` ${idx % 2 == 0 ? "bg-gray-200" : ""}`}>
      <td>{idx + 1}</td>
      <td className="text-blue-500 hover:text-blue-600">
        <a href={problem.link} target="_blank">
          {" "}
          {problem.problemNumber}. {problem.problem}
        </a>
      </td>
      <td>{problem.difficulty}</td>
      <td className="">{problem.topic}</td>
      <th>
        {/* <label> */}
        {/* <input
            type="checkbox"
            onChange={handleCheckboxChange}
            checked={problem.status}
            className="cursor-pointer"
          /> */}
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            onChange={handleCheckboxChange}
            checked={problem.status}
            className="checkbox peer hidden"
          />
          <div className="cursor-pointer w-6 h-6 border-2 border-gray-300 rounded-md peer-checked:bg-blue-500 peer-checked:border-blue-500"></div>
        </label>
        {/* </label> */}
      </th>
    </tr>
  );
};

export default ProblemItem;
