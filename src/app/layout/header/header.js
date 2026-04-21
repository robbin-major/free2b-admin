import { enqueueSnackbar } from "notistack";
import React, { Fragment, useEffect, useState } from "react";
import { Dropdown, Container, Navbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const name = localStorage.getItem("email");
  useEffect(() => {
    document.addEventListener("click", handlePageClick);

    return () => {
      document.removeEventListener("click", handlePageClick);
    };
  }, []);

  const handlePageClick = (event) => {
    const target = event.target;
    const sidebarToggle = document.getElementById("mainSidebarToggle");

    if (
      target !== sidebarToggle &&
      target.closest(".main-header-left") === null
    ) {
      closeSidebar();
    }
  };

  const closeSidebar = () => {
    const body = document.querySelector("body");
    const innerWidth = window.innerWidth;

    if (body !== null) {
      if (innerWidth >= 992) {
        body.classList.remove("main-sidebar-show");
      } else if (body.classList.contains("horizontalmenu")) {
        body.classList.remove("main-navbar-show");
      } else {
        body.classList.remove("main-sidebar-show");
      }
    }
  };

  const handleLogin = () => {
    localStorage.clear();
    enqueueSnackbar("Logout Success", {
      variant: "success",
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "right",
      },
    });
    navigate("/");
    window.location.reload();
    closeSidebar();
  };

  const headerToggleButton = () => {
    const body = document.querySelector("body");
    const innerWidth = window.innerWidth;
    if (body !== null) {
      if (innerWidth >= 992) {
        body.classList.toggle("main-sidebar-hide");
        body.classList.remove("main-sidebar-show");
      } else if (body.classList.contains("horizontalmenu")) {
        body.classList.toggle("main-navbar-show");
        body.classList.remove("main-sidebar-show");
        body.classList.remove("main-sidebar-hide");
      } else {
        body.classList.toggle("main-sidebar-show");
        body.classList.remove("main-sidebar-hide");
      }
    }
  };

  return (
    <Fragment>
      <Navbar expand="lg" className="main-header side-header sticky">
        <Container fluid className="main-container container-fluid">
          <div className="main-header-left">
            <Link
              to="#"
              className="main-header-menu-icon"
              id="mainSidebarToggle"
              onClick={headerToggleButton}
            >
              <span></span>
            </Link>
          </div>

          <div className="main-header-right">
            <Navbar.Toggle
              aria-controls="navbarSupportedContent-4"
              className="navresponsive-toggler"
            >
              <i className="fe fe-more-vertical header-icons navbar-toggler-icon"></i>
            </Navbar.Toggle>
            <div className="navbar navbar-expand-lg nav nav-item navbar-nav-right responsive-navbar navbar-dark">
              <Navbar.Collapse
                className="collapse navbar-collapse"
                id="navbarSupportedContent-4"
              >
                <div className="d-flex order-lg-2 align-items-center ms-auto">
                  {name}
                  <Dropdown className="main-profile-menu">
                    <Dropdown.Toggle className="d-flex p-0" variant="default">
                      <span className="main-img-user mx-1">
                        <img
                          alt="avatar"
                          src={require("../../../assets/img/male.png")}
                        />
                      </span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu style={{ margin: "0px", width: "auto" }}>
                      <Dropdown.Item onClick={handleLogin}>
                        <i className="fe fe-power"></i> Sign Out
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </Navbar.Collapse>
            </div>
          </div>
        </Container>
      </Navbar>
    </Fragment>
  );
}

export default Header;
