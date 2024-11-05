import React, { useState } from "react";
import { leetcodeProblems } from "../assets/problems";
const Frequency = ({ setCurrProblems }) => {
  const [tags, setTags] = useState();
  const [selectedTag, setSelectedTag] = useState("");
  useState(() => {
    let obj = leetcodeProblems.reduce((acc, curr) => {
      if (acc?.[curr.topic] != undefined) {
        acc[curr.topic]++;
      } else {
        acc[curr.topic] = 1;
      }
      return acc;
    }, {});
    setTags(obj);
  }, []);

  const hanldeTagClick = (key) => {
    if (selectedTag == key) {
      setCurrProblems(leetcodeProblems)
      setSelectedTag("")
    } else {
      let newProblems = leetcodeProblems.filter(
        (problem) => problem.topic == key
      );
      setCurrProblems(newProblems);
      setSelectedTag(key);
    }
  };
  return (
    <>
      {tags && (
        <div className="flex flex-wrap border-b-2 p-2 mb-4">
          {Object.keys(tags).map((key,idx) => (
            <span
            key={idx}
              onClick={() => hanldeTagClick(key)}
              className={`bg-red-100 p-1 m-1 rounded-lg cursor-pointer hover:bg-red-300 text-xs text-gray-700 ${
                key == selectedTag ? "bg-red-300" : ""
              }`}
            >
              {key}({tags[key]})
            </span>
          ))}
        </div>
      )}
    </>
  );
};

export default Frequency;
