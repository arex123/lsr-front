import React, { useState } from "react";
export const PContext = React.createContext({
  user: {},
  lists: [],
  loading:false,
  setUser: () => {},
  setList: () => {},
  setLoading:()=>{}
});

const ProblemProvider = (props) => {
  const [user, setUser] = useState(null);
  const [lists, setList] = useState([]);
  const [loading,setLoading]=useState(false)
  const pctx = {
    user,
    lists,
    loading,
    setUser,
    setList,
    setLoading
  };

  return <PContext.Provider value={pctx}>{props.children}</PContext.Provider>;
};

export default ProblemProvider;
