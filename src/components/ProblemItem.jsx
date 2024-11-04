import React from "react";

const ProblemItem = ({ problem ,idx}) => {

  return (
    <tr className={` ${idx%2==0?'bg-gray-200':''}`}>
      <td>{idx+1}</td>
      <td className="text-blue-500 hover:text-blue-600"><a href={problem.link} target="_blank"> {problem.problemNumber}. {problem.problem}</a></td>
      <td>{problem.difficulty}</td>
      <td className="">{problem.topic}</td>   
      <th>
        <label>
          <input type="checkbox" checked={problem.status} className="checkbox" />
        </label>
      </th>
    </tr>
  );
};

export default ProblemItem;
