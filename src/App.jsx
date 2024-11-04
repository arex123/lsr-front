import { useEffect, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import Frequency from "./components/Frequency";
import ProblemList from "./components/ProblemList";
import Information from "./components/Information";
import Filter from "./components/Filter";
import { leetcodeProblems } from "./assets/problems";

function App() {
  const [currProblems,setCurrProblems]=useState([])
  useEffect(()=>{
    
    setCurrProblems(leetcodeProblems)
  },[])
  
  return (
    <div className="flex border border-b-1">
      <Information/>
      <div className="w-[50%] flex flex-col items-center">
        <Header />
        <Frequency setCurrProblems={setCurrProblems}/>
       <ProblemList currProblems={currProblems} setCurrProblems={setCurrProblems}/>
      </div>
      <Filter/>
    </div>
  );
}

export default App;
