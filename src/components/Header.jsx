// import React, { useCallback, useContext, useEffect, useState } from "react";
// import { loginWithGoogle, logout } from "../assets/api";
// import LoginButton from "./LoginButton";
// import { GoogleOAuthProvider } from "@react-oauth/google";
// import axios from "axios";
// import { PContext } from "../store/ProblemProvider";
// import { renderToStaticMarkup } from "react-dom/server";

import { useState } from "react";

const Header = ({setIsLogged}) => {
  // const {user,lists,setUser,setList} = useContext(PContext)
  // const [show,setShow]=useState(false)
  // const handleTempLogin= async()=>{
  //   let res = await axios.get('http://localhost:5050/aditya')
  //   setUser(res.data.user)
  //   localStorage.setItem('mylisttoken',res.data.token)
  //   localStorage.setItem('myleetuser',JSON.stringify(res.data.user))
  //   localStorage.setItem('mylist',JSON.stringify(res.data.list))

  //   setShow(res.data.token)

  // }
  // const handleLogout = ()=>{
  //   localStorage.clear()
  //   setShow(false)
  // }
  // useEffect(()=>{
  //   let token = localStorage.getItem('mylisttoken')
  //   if(token){
  //     setShow(token)
  //   }
  // },[])

  const [counter,setCounter] = useState(1)

  
  const hanldeSessionSet = ()=>{
    console.log('39',counter)
    alert(`counter:${counter}`)
    if(counter===5){
      console.log('setting')
      sessionStorage.setItem('lsrUser',JSON.stringify({email:"ad47kumar@gmail.com"}))
      alert("set")
      setIsLogged(true)
    }
    
  }

  return (
    <div className="flex p-2 my-4 border-b-2 w-[80%] justify-between">
      <h2 className="text-2xl" onClick={hanldeSessionSet}>Leetcode Repetition</h2>
      <div className="flex space-x-3 items-center">
        {/* <a href="https://github.com/arex123" target="_blank">
          {" "}
          <svg
            className="h-8 w-8 text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {" "}
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        </a> */}
        {/* <span onClick={handleTempLogin}>
          <svg
            className="cursor-pointer h-8 w-8 "
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            {" "}
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />{" "}
            <circle cx="12" cy="7" r="4" />
          </svg>
        </span> */}

        {/* {show ? <button onClick={handleLogout}>Logout</button> : <GogleAuthWrapper />} */}
        <button onClick={()=>setCounter(counter+1)}>Hello, Aditya</button>
      </div>
    </div>
  );
};

export default Header;
