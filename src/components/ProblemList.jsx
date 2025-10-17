import ProblemItem from "./ProblemItem";

const ProblemList = ({ problems, section, solvedProblemIds, onProblemSolved }) => {
  return (
    <>
      {problems.length > 0 ? (
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2">Sno</th>
              <th>Name</th>
              <th>Difficulty</th>
              <th>Topic</th>
              {section != 3 && (
                <th className="cursor-pointer flex items-center">Done?</th>
              )}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems?.map((problem, idx) => (
              <ProblemItem
                key={problem._id || problem.id}
                problem={problem}
                idx={idx}
                section={section}
                solved={solvedProblemIds?.includes?.(problem?._id || problem?.id + "")}
                onProblemSolved={onProblemSolved}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No Problems found
        </div>
      )}
    </>
  );
};

export default ProblemList;
