import React, { Fragment, useEffect, useState } from "react";
import { MENUITEMS } from "./sideMenu";
import { Link, NavLink } from "react-router-dom";
import { Scrollbars } from "react-custom-scrollbars";
import { useLocation } from "react-router-dom";
let history = [];
const SideBar = () => {
  let location = useLocation();
  const [menuitems, setMenuitems] = useState(MENUITEMS);
  useEffect(() => {
    history.push(location.pathname);
    if (history.length > 2) {
      history.shift();
    }
    if (history[0] !== history[1]) {
      setSidemenu();
    }
    let mainContent = document.querySelector(".main-content");
    mainContent.addEventListener("click", mainContentClickFn);
    return () => {
      mainContent.removeEventListener("click", mainContentClickFn);
    };
  }, [location, mainContentClickFn, setSidemenu]);
  useEffect(() => {
    if (
      document.body.classList.contains("horizontalmenu") &&
      window.innerWidth >= 992
    ) {
      clearMenuActive();
    }
  }, []);
  let menuIcontype;
  if (document.querySelector("body").classList.contains("horizontalmenu")) {
    menuIcontype = "hor-icon";
  } else {
    menuIcontype = "sidemenu-icon";
  }
  //  In Horizontal When we click the body it should we Closed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  function mainContentClickFn() {
    if (
      document.body.classList.contains("horizontalmenu") &&
      window.innerWidth >= 992
    ) {
      clearMenuActive();
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  function setSidemenu() {
    if (menuitems) {
      menuitems.forEach((mainlevel) => {
        if (mainlevel.Items) {
          mainlevel.Items.forEach((items) => {
            items.active = false;
            items.selected = false;
            if (location.pathname.startsWith(items.path)) {
              items.active = true;
              items.selected = true;
            }

          });
        }
      });
      setMenuitems([...menuitems]);
    }
  }

  function clearMenuActive() {
    MENUITEMS.filter((mainlevel) => {
      if (mainlevel.Items) {
        mainlevel.Items.filter((sublevel) => {
          sublevel.active = false;
          if (sublevel.children) {
            sublevel.children.filter((sublevel1) => {
              sublevel1.active = false;
              if (sublevel1.children) {
                sublevel1.children.filter((sublevel2) => {
                  sublevel2.active = false;
                  return sublevel2;
                });
              }
              return sublevel1;
            });
          }
          return sublevel;
        });
      }
      return mainlevel;
    });
    setMenuitems((arr) => [...arr]);
  }

  function Onhover() {
    if (document.querySelector(".main-body")) {
      if (
        document
          .querySelector(".main-body")
          .classList.contains("main-sidebar-hide")
      )
        document.querySelector(".main-body").classList.add("main-sidebar-open");
    }
  }
  function Outhover() {
    if (document.querySelector(".main-body")) {
      document
        .querySelector(".main-body")
        .classList.remove("main-sidebar-open");
    }
  }

  return (
    <Fragment>
      <div className="sticky " style={{ marginBottom: "-64px" }}>
        <div className="main-menu main-sidebar main-sidebar-sticky side-menu">
          <div className="main-container-1 active main-sidebar-header">
            <Scrollbars
              options={{ removeTrackXWhenNotUsed: true }}
              className="hor-scroll"
              style={{ position: "absolute" }}
            >
              <div className="sidemenu-logo d-flex justify-content-center mt-2" style={{ borderBottom: "none" }}>
                <Link
                  className="main-logo"
                  to={`/events/`}
                >
                  <div className="d-flex">
                    <img
                      src={require("../../../assets/img/svgs/Logos.png")}
                      className="header-brand-img desktop-logo" width={"50px"} height={"37px"}
                      alt={"logo1"}
                    />
                    <div style={{ textTransform: "capitalize", fontSize: "24px", fontWeight: "normal" }} className="ms-3 mt-1 header-brand-img desktop-logo tx-white">Free2B</div>
                  </div>

                  <img
                    src={require("../../../assets/img/svgs/Logos.png")}
                    className="header-brand-img icon-logo ms-0" width={"50px"} height={"37px"}
                    alt={"logo-2"}
                  />
                </Link>
              </div>
              <div
                className="main-body-1 main-sidebar-body"
                onMouseOver={() => Onhover()}
                onMouseOut={() => Outhover()}
              >
                <ul
                  className="menu-nav nav"
                  style={{ marginLeft: "0px", display: "block" }}
                >
                  {menuitems.map((Item, itemi) => (
                    <Fragment key={itemi + Math.random() * 100}>
                      <li className="nav-header">
                        <span className="nav-label">{Item.menutitle}</span>
                      </li>
                      {Item.Items.map((menuItem, i) => (
                        <li
                          className={`nav-item ${menuItem.selected ? "active" : ""
                            }`}
                          key={i}
                        >
                          {menuItem.type === "link" ? (
                            <NavLink
                              to={menuItem.path + "/"}
                              className={`nav-link ${menuItem.selected ? "active" : ""
                                }`}
                            >
                              <span className="shape1"></span>
                              <span className="shape2"></span>
                              <i
                                className={`${menuItem.icon} ${menuIcontype} menu-icon`}
                              ></i>
                              <span className="sidemenu-label">
                                {menuItem.title}
                              </span>
                              {menuItem.badge ? (
                                <label className={menuItem.badge}>
                                  {menuItem.badgetxt}
                                </label>
                              ) : (
                                ""
                              )}
                            </NavLink>
                          ) : (
                            ""
                          )}
                        </li>
                      ))}
                    </Fragment>
                  ))}
                </ul>
                <div className="slide-right" id="slide-right">
                  <i className="fe fe-chevron-right"></i>
                </div>
              </div>
            </Scrollbars>
          </div>
        </div>
      </div>
      <div className="jumps-prevent" style={{ paddingTop: "64px" }}></div>
    </Fragment>
  );
};

export default SideBar;
