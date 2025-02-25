// src/components/Loader.js
import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const antIcon = (
  <LoadingOutlined
    style={{ fontSize: 48 }}
    className="text-blue-500"
    spin
  />
);

const Loader = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-transparent z-50">
      <Spin indicator={antIcon} tip="Loading..." size="large" />
    </div>
  );
};

export default Loader;