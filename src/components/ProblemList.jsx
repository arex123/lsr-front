import ProblemItem from "./ProblemItem";

const ProblemList = ({ problems, section, solvedProblemIds, onProblemSolved }) => {
  return (
    <>
      {problems.length > 0 ? (
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-2 text-gray-800 dark:text-gray-200">Sno</th>
              <th className="text-gray-800 dark:text-gray-200">Name</th>
              <th className="text-gray-800 dark:text-gray-200">Difficulty</th>
              <th className="text-gray-800 dark:text-gray-200">Topic</th>
              {section != 3 && (
                <th className="cursor-pointer flex items-center text-gray-800 dark:text-gray-200">Done?</th>
              )}
              <th className="text-gray-800 dark:text-gray-200">Actions</th>
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
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No Problems found
        </div>
      )}
    </>
  );
};

export default ProblemList;
