import axios from "axios";

export const loginWithGoogle = async () => {
  window.open(
    `${import.meta.env.VITE_SERVER_URL}/auth/google/callback`,
    "_self"
  );

  // let res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/google/callback`)
  // let data = await res.json()
};

export const logout = async () => {
  window.open(`${import.meta.env.VITE_SERVER_URL}/auth/logout`, "_self");
};

export const fetchUser = async () => {
  try {
    // const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/user`, {
    //   credentials: "include",
    // });
    // const data = await res.json();

    const res = await axios.get(
      `${import.meta.env.VITE_SERVER_URL}/auth/user`,
      { withCredentials: true }
    );
    return res;
  } catch (error) {
    return null;
  }
};

/******** */
const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
});

// export const googleAuth = (code)=>api.get(`/google?code${code}`)
export const googleAuth = (code) => api.get(`/auth/google?code=${code}`);

// export const checkIsSolved = (user,problem)=>api.get(`/check?user${user}&problem${problem}`)
export const checkIsSolved = async (user, email, problem, sNo) => {
  let result = await api.get(
    `/check?user=${user}&email=${email}&problem=${problem}&position=${sNo}`
  );
  return result;
};

export const uncheckProblem = async (email, number) => {
  try {
    let result = await api.post("/uncheck", { email, number });
    return  result?.data?.success ?? false
  } catch (err) {
  }
};
