
import React from 'react'
const PContext = React.createContext({

})


const ProblemProvider = (props) => {
    const pctx = {

    }
  return (
    <PContext.Provider value={pctx}>{props.children}</PContext.Provider>
  )
}

export default ProblemProvider