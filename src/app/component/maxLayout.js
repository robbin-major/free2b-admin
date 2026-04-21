import React, { Fragment } from "react";
import { Outlet } from "react-router-dom";
import Header from "../layout/header/header";
import Sidebar from "../layout/sidebar/sidebar";
import Footer from "../layout/footer/footer";
const MatxLayout = () => {
  return (
    <Fragment>
      <div className="page">
        <Header />
        <Sidebar />
        <div className="main-content side-content">
          <div className="main-container container-fluid">
            <div className="inner-body">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Fragment>
  );
};
export default MatxLayout;
