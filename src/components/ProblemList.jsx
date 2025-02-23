import ProblemItem from "./ProblemItem";

const ProblemList = ({ problems, section ,solvedProblemIds}) => {
  return (
    <>
      {problems.length > 0 ? (
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2">Sno</th>
              <th>Name</th>

              <th>Topic</th>
              {section != 3 && (
                <th className="cursor-pointer flex items-center">Done?</th>
              )}
            </tr>
          </thead>
          <tbody>
            {problems?.map((problem, idx) => (
              <ProblemItem
                key={problem.id}
                problem={problem}
                idx={idx}
                section={section}
                solved={solvedProblemIds?.includes?.(problem?.id+"")}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <div>No Problems found</div>
      )}
    </>
  );
};

export default ProblemList;
