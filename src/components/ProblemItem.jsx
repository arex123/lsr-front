import React, { useState } from "react";
import axios from "axios";

const ProblemItem = ({ problem, idx, section, setCurrProblems,solved }) => {
  const [showModalForDifficulty, setShowModalForDifficulty] = useState(false);
  const [difficulty, setDifficulty] = useState("");

  const handleCheckboxChange = async () => {
    try {
      const currUser = JSON.parse(sessionStorage.getItem("lsrUser"));
      if (section === "2") {
        console.log("Check",section)
        // 🌟 Show modal for difficulty input before calling the API
        setShowModalForDifficulty(true);
      } else if (section === "1") {
        // ✅ Mark revision problem as solved and update repetition count
        const payload = {
          email: currUser.email,
          problemId: problem.id,
          difficulty: problem.Difficulty,
        };
        const { data } = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/api/revisionProblemSolved`,
          payload
        );
        console.log("Revision updated:", data);
        setCurrProblems((prev) =>
          prev.map((p) =>
            p.id === problem.id ? { ...p, Status: true } : p
          )
        );

        console.log("Revision noted, move further...")
      }
    } catch (err) {
      console.error("Error checking/unchecking problem:", err);
    }
  };

  const handleDifficultySubmit = async () => {
    try {
      const currUser = JSON.parse(sessionStorage.getItem("lsrUser"));
      const payload = {
        email: currUser.email,
        problemId: problem.id,
        difficulty: difficulty,
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/newProblemSolved`,
        payload
      );
      console.log("New problem scheduled:", data);
      // setCurrProblems((prev) =>
      //   prev.map((p) =>
      //     p.id === problem.id ? { ...p, Status: true } : p
      //   )
      // );
      setShowModalForDifficulty(false); // Close modal after successful submission
    } catch (err) {
      console.error("Error scheduling new problem:", err);
    }
  };

  return (
    <>
      <tr className={`p-4 ${idx % 2 === 0 ? "bg-gray-200" : ""}`}>
        <td className="text-center p-4">{idx + 1}</td>
        <td className="text-blue-500 text-center hover:text-blue-600">
          <a href={problem["Link"]} target="_blank" rel="noopener noreferrer">
            {problem["Name"]}
          </a>
        </td>
        <td className="text-center">{problem["Category"]}</td>
        <th>
          {section !== "3" && (
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                onChange={handleCheckboxChange}
                checked={problem["Status"]}
                className="checkbox peer hidden"
              />
              <div className="cursor-pointer w-6 h-6 border-2 border-gray-300 rounded-md peer-checked:bg-blue-500 peer-checked:border-blue-500"></div>
            </label>
          )}
          {section === "3" && solved && (
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                onChange={handleCheckboxChange}
                checked={problem["Status"] || solved}
                disabled
                className="checkbox peer hidden cursor-not-allowed"
              />
              <div className="cursor-not-allowed w-6 h-6 border-2 border-gray-300 rounded-md peer-checked:bg-blue-500 peer-checked:border-blue-500"></div>
            </label>
          )}
        </th>
      </tr>

      {/* 🚀 Modal for Difficulty Selection */}
      {showModalForDifficulty && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[300px]">
            <h2 className="text-lg font-semibold mb-4 text-center">
              Select Problem Difficulty
            </h2>
            <select
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="">-- Select Difficulty --</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <div className="flex justify-between">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={!difficulty}
                onClick={handleDifficultySubmit}
              >
                Submit
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => setShowModalForDifficulty(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProblemItem;