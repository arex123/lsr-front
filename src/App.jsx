import { useEffect, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import Frequency from "./components/Frequency";
import ProblemList from "./components/ProblemList";
import Information from "./components/Information";
import Filter from "./components/Filter";
import { leetcodeProblems } from "./assets/problems";
import { fetchUser } from "./assets/api";

function App() {
  const [user, setUser] = useState(null);
  const [currProblems, setCurrProblems] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await fetchUser(); 
        console.log("userData", userData);
        setUser(userData?.user || null);  
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  
    fetchData();
    setCurrProblems(leetcodeProblems);
  }, []);
  console.log("25 user ", user);

  return (
    <div className="flex border border-b-1">
      <Information />
      <div className="w-[50%] flex flex-col items-center">
        <Header user={user} />
        <Frequency setCurrProblems={setCurrProblems} />
        <ProblemList
          currProblems={currProblems}
          setCurrProblems={setCurrProblems}
        />
      </div>
      <Filter />
    </div>
  );
}

export default App;
