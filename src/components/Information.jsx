import React, { useEffect, useState } from "react";
import { Button, Modal } from "flowbite-react";

const Information = () => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="w-[25%] flex flex-col items-center space-y-5 ">
      <div className="mt-10">
        <div className="card bg-base-100 w-52 shadow-xl">
          <figure>
            <div
              className="radial-progress"
              style={{
                "--value": "70",
                "--size": "12rem",
                "--thickness": "2px",
              }}
              role="progressbar"
            >
              1/255
            </div>
          </figure>
          <div className="card-body">
          <input type="reset" value="Reset" className="btn" onClick={() => setOpenModal(true)}/>

            {/* <Button onClick={() => setOpenModal(true)}>Toggle modal</Button> */}
          </div>
        </div>
      </div>
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <div className="flex flex-col space-y-4 p-10 items-center">
          <div>
            {" "}
            Are you sure you want to reset your progress?
          </div>

          <div className="flex space-x-4">
            <Button onClick={() => setOpenModal(false)}>YES</Button>
            <Button color="gray" onClick={() => setOpenModal(false)}>
              NO
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Information;
