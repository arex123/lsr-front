import axios from "axios";

export const loginWithGoogle =async () => {
  window.open(
    `${import.meta.env.VITE_SERVER_URL}/auth/google/callback`,
    "_self"
  );

  // let res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/google/callback`)
  // let data = await res.json()
  // console.log("99: Data= ",data)
};

export const logout = async () => {
  window.open(`${import.meta.env.VITE_SERVER_URL}/auth/logout`, "_self");
};

export const fetchUser = async () => {
  try{

    console.log("21 :",`${import.meta.env.VITE_SERVER_URL}/auth/user`);
    // const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/user`, {
    //   credentials: "include",
    // });
    // const data = await res.json();


    const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/auth/user`,{withCredentials:true})    
    console.log("23 : ", res);
    return res;
  }catch(error){
    console.log("24 error ",error)
    return null
  }
};
