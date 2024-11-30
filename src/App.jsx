import { useContext, useEffect, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import Frequency from "./components/Frequency";
import ProblemList from "./components/ProblemList";
import Information from "./components/Information";
import Filter from "./components/Filter";
import { leetcodeProblems } from "./assets/problems";
import { fetchUser } from "./assets/api";
import { PContext } from "./store/ProblemProvider";
// import { Button, Modal } from "flowbite-react";
import searchingGif from "../public/what-looking.gif";
import jobDone from "../public/job-done.gif";
import notDone from "../public/not-done.gif";
import { Button, Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import axios from "axios";

function App() {
  // const [user, setUser] = useState(null);

  const [currProblems, setCurrProblems] = useState([]);
  const [todaysProblem,setTodaysProblem] = useState([])
  const { user, setUser, lists, setList, loading, setLoading } =
    useContext(PContext);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // const userData = await fetchUser();
        // setUser(userData?.user || null);
        const currUser = localStorage.getItem('myleetuser')
        if(currUser){
          const todaysProblemSet = await axios.get(import.meta.env.VITE_SERVER_URL+"/getTodaysProblem/"+currUser.email)
          console.log("todays problem set : ",todaysProblemSet.data.problemsToSolveToday)
          if(todaysProblemSet.success){

            setTodaysProblem(todaysProblemSet.problemsToSolveToday)
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
    if (localStorage.getItem("mylisttoken")) {
      setList(JSON.parse(localStorage.getItem("mylist")));
      setUser(JSON.parse(localStorage.getItem("myleetuser")));
      setCurrProblems(JSON.parse(localStorage.getItem("mylist")));
    }
  }, []);

  const [loadingWork, setLoadingWork] = useState(0);
  useEffect(() => {
    if (loading.status == "solved") {
      setLoadingWork(1);
    } else if (loading.status == "unsolved") {
      setLoadingWork(2);
    } else {
      setLoadingWork(3);
    }
  }, [loading]);

  return (
    <div className="flex border border-b-1">
      <Information />
      <div className="w-[50%] flex flex-col items-center">
        <Header />
        <Frequency setCurrProblems={setCurrProblems} />
        <ProblemList
          currProblems={currProblems}
          setCurrProblems={setCurrProblems}
        />
      </div>
      <Filter />
      <Modal show={loading} size="md" onClose={() => setLoading(false)} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center ">
            {/* <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" /> */}
            <h3 className="mb-5 text-lg flex flex-col items-center font-normal text-gray-500 dark:text-gray-400">
              {/* Are you sure you want to delete this product? */}
              <img
                className="w-52 pb-10"
                src={loadingWork==3?searchingGif:loadingWork==2?notDone:loadingWork==1?jobDone:''}
                alt={loadingWork=='searching...'?searchingGif:loadingWork=='not solved'?notDone:loadingWork=='solved'?jobDone:''}
              />
              <p>{loadingWork==3?"Checking your leetcode account's last solved problem":loadingWork==2?"You haven't solved the problem":loadingWork==1?"You have successfully solved the problem":''}</p>
            </h3>
            {/* <div className="flex justify-center gap-4">
              <Button color="failure" onClick={() => setOpenModal(false)}>
                {"Yes, I'm sure"}
              </Button>
              <Button color="gray" onClick={() => setOpenModal(false)}>
                No, cancel
              </Button>
            </div> */}
          </div>
        </Modal.Body>
      </Modal>
      {/* <Modal className="" show={loading} onClose={() => setLoading(false)}>
        {loadingWork==3 && <div className=" flex items-center justify-center">
          <img className="w-52 p-10" src={searchingGif} alt="searching....." />
          <p>Checking your leetcode account's last solved problem</p>
        </div>}
        {loadingWork==2 && <div className="flex items-center justify-center">
          <img className="w-52 p-10" src={notDone} alt="not solved....." />
          <p>You haven't solved the problem</p>
        </div>}
        {loadingWork==1 && <div className="flex items-center justify-center">
          <img className="w-52 p-10" src={jobDone} alt="Solved....." />
          <p>You have successfully solved the problem</p>
        </div>}
      </Modal> */}
    </div>
  );
}

export default App;
