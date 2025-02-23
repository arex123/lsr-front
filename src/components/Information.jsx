// import React, { useContext, useEffect, useState } from "react";
// import { PContext } from "../store/ProblemProvider";
// import { Button } from "antd";

// const Information = () => {
//   const [openModal, setOpenModal] = useState(false);
//   const {user,lists} = useContext(PContext)

//   const [solved,setSolved]=useState(0)
//   const [value,setValue]=useState(0)

//   useEffect(()=>{
//     if(lists){
//       let solv = lists.reduce((acc,curr)=>{
//         if(curr.status){
//           return acc+1
//         }else{
//           return acc
//         }
//       },0)
//       setSolved(solv)
//       // setValue((solv/lists.length)*100)
//       if (lists.length > 0) {
//         setValue(Math.floor(((solv) / lists.length) * 100));
//       } else {
//         setValue(0); // or handle the case when the list is empty
//       }
      
//     }
//   },[lists])

//   return (
//     <div className="w-[25%] flex flex-col items-center space-y-5 ">
//       {/* <div className="mt-10">
//         <div className="card bg-base-100 w-52 shadow-xl">
//           <figure>
//             <div
//               className="radial-progress"
//               style={{
//                 "--value": value,
//                 // "--value": '99',
//                 "--size": "10rem",
//                 "--thickness": "2px",
//               }}
//               role="progressbar"
//             >
//               {solved}/{lists.length}
//             </div>
//           </figure>
//           <div className="card-body">
//           <input type="reset" value="Reset" className="btn" onClick={() => setOpenModal(true)}/>

//             <Button onClick={() => setOpenModal(true)}>Toggle modal</Button>
//           </div>
//         </div>
//       </div> */}
//       {/* <Modal show={openModal} onClose={() => setOpenModal(false)}>
//         <div className="flex flex-col space-y-4 p-10 items-center">
//           <div>
//             {" "}
//             Are you sure you want to reset your progress?
//           </div>

//           <div className="flex space-x-4">
//             <Button onClick={() => setOpenModal(false)}>YES</Button>
//             <Button color="gray" onClick={() => setOpenModal(false)}>
//               NO
//             </Button>
//           </div>
//         </div>
//       </Modal> */}
//     </div>
//   );
// };

// export default Information;
