import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  FormGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import userDefault from "../../../assets/img/svgs/userDefault.svg";
import Select from "react-select";
import EvenImage from "../../../assets/img/demoEventImg.webp";
import { Typography } from "antd";
import moment from "moment";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../Firebase";
import Loader from "../../layout/loader/loader";
import { CircularProgress } from "@mui/material";
import { enqueueSnackbar } from "notistack";

const options = [
  { value: "PENDING", label: "Pending", color: "#F1911D", icon: "fa fa-clock" },
  {
    value: "APPROVAL",
    label: "Approved",
    color: "#15A552",
    icon: "fa fa-check",
  },
  { value: "DECLINE", label: "Decline", color: "#fd6074", icon: "fa fa-close" },
];

const filteredOptions = options?.filter((option) => option.value !== "PENDING");
const filteredOptionsDecline = options?.filter(
  (option) => option.value !== "DECLINE"
);
const filteredOptionsVerify = options?.filter(
  (option) => option.value !== "APPROVAL"
);

const Option = ({ innerProps, label, data }) => (
  <div
    {...innerProps}
    className="text-white d-flex align-items-center justify-content-center m-1"
    style={{ backgroundColor: data.color, borderRadius: "3px", height: 28 }}
  >
    <i className={data.icon} style={{ marginRight: "5px" }}>
      {" "}
    </i>{" "}
    {label}
  </div>
);

const EventDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedOption, setSelectedOption] = useState(null);
  const [userData, setUserData] = useState({});
  const [updateStatus, setUpdateStatus] = useState({});
  const [btnShow, setBtnShow] = useState(false);
  const [statusLoader, setStatusLoader] = useState(false);
  const [dataLoader, setDataLoader] = useState(false);
  const [imgLoader, setImgLoader] = useState(true);
  const [dropDownCategory, setDropDownCategory] = useState([]);

  const detailsEvent = location?.state;
  console.log("detailsEvent:", detailsEvent);
  console.log("userDatauserData", selectedOption);
  const handleStatus = async (selectedOption) => {
    // const getUser = doc(db, 'event', detailsEvent.evntId);
    // await updateDoc(getUser, { status: selectedOption.value });
    setSelectedOption(selectedOption);
    setBtnShow(true);
  };

  const status = detailsEvent?.status;
  const currentOption = options.find((option) => option.value === status);
  console.log("🚀  EventDetailsPage  status:", status);
  const getEventImage = (event) =>
    event?.image || event?.imageLink || event?.image_link?.url || EvenImage;
  const getFilter = async () => {
    setDataLoader(true);
    const kurzRef = collection(db, `event`);
    const q = query(kurzRef, where("evntId", "==", detailsEvent.evntId));
    const querySnapshot = await getDocs(q);
    const eventData = [];
    querySnapshot.forEach((doc) => {
      eventData.push(doc.data());
    });
    // setUpdateStatus(eventData[0]);
    console.log("detailsEvent?.status", detailsEvent?.status);
    // const currentOption = options.find((option) => option.value === status);
    console.log("getFilter", eventData);
    // setSelectedOption(currentOption);
    setTimeout(() => {
      setDataLoader(false);
    }, 700);
  };

  const getUserData = async () => {
    setDataLoader(true);
    const docRef = doc(db, "users", detailsEvent.uid);
    const docSnap = await getDoc(docRef);
    const userData = docSnap.data();
    setUserData(userData);
    console.log("userData", userData);
    setDataLoader(false);
  };
  const handleFormSubmit = async () => {
    setStatusLoader(true);
    const getUser = doc(db, "event", detailsEvent.evntId);
    await updateDoc(getUser, { status: selectedOption.value });
    enqueueSnackbar("Status change successfully", {
      variant: "success",
      anchorOrigin: { vertical: "bottom", horizontal: "right" },
    });
    setStatusLoader(false);
  };

  const getCategories = async () => {
    const collectionRef = collection(db, "category");
    const getData = await getDocs(collectionRef);
    return getData;
  };
  const AllCategories = async () => {
    try {
      const getData = await getCategories();
      const categoryData = [];
      getData.forEach((doc) => {
        categoryData.push(doc.data());
      });
      setDropDownCategory(categoryData);
      console.log("categoryData", categoryData);
    } catch (e) {
      console.log("e", e);
    }
  };
  useEffect(() => {
    getFilter();
    getUserData();
    AllCategories();
    setSelectedOption(currentOption);
  }, []);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setImgLoader(false);
    }, 900);

    return () => {
      clearTimeout(timeout);
    };
  }, []);
  return (
    <>
      <div className="page-header">
        <div className="d-flex align-items-center justify-content-start">
          <Button
            style={{ borderRadius: "50%", marginRight: "8px" }}
            onClick={() => navigate("/events")}
          >
            <i className="d-block fe fe-arrow-left"></i>
          </Button>
          <h2 className="main-content-title tx-24 mg-b-0">
            {`Event-${detailsEvent?.title}`}
          </h2>
        </div>
      </div>
      <div>
        <Row className="row-sm d-flex justify-content-center">
          <Col xs={12} sm={12} md={10} lg={7}>
            <Card className="custom-card mt-3">
              <Card.Body>
                {dataLoader ? (
                  <div className="ht-300 d-flex justify-content-center align-items-center">
                    <CircularProgress />
                  </div>
                ) : (
                  <Row>
                    <div>
                      <div className="border-bottom mb-3">
                        <FormGroup className="form-group">
                          <Row className="row-sm">
                            <div className="eventdetail-userdetail">
                              <div
                                className="me-auto d-flex justify-content-start"
                                style={{
                                  fontWeight: 600,
                                  fontSize: "20px",
                                  color: "#291f3d",
                                }}
                              >
                                USER DETAIL
                              </div>
                              <div>
                                <Select
                                  value={selectedOption}
                                  isSearchable={false}
                                  onChange={handleStatus}
                                  options={
                                    selectedOption?.value === "PENDING"
                                      ? filteredOptions
                                      : selectedOption?.value === "DECLINE"
                                      ? filteredOptionsDecline
                                      : filteredOptionsVerify
                                  }
                                  components={{ Option }}
                                  styles={{
                                    container: (provided) => ({
                                      ...provided,
                                      width: 130,
                                      borderRadius: 5,
                                      padding: 0,
                                    }),
                                    control: (provided) => ({
                                      ...provided,
                                      backgroundColor: selectedOption?.color,
                                      borderRadius: 5,
                                      color: "white",
                                      height: "35px",
                                      minHeight: "0px",
                                      cursor: "pointer",
                                    }),
                                    singleValue: (provided) => ({
                                      ...provided,
                                      color: "white",
                                      overflow: "visible",
                                      marginLeft: "0px",
                                      paddingBottom: "2px",
                                    }),
                                    indicatorSeparator: (provided) => ({
                                      ...provided,
                                      display: "none",
                                    }),
                                    menuList: (provided) => ({
                                      ...provided,
                                      padding: 0,
                                      gap: 2,
                                      cursor: "pointer",
                                    }),
                                    menu: (provided) => ({
                                      ...provided,
                                      marginTop: "4px",
                                    }),
                                  }}
                                  formatOptionLabel={(option) => (
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <i
                                        className={option.icon}
                                        style={{ marginRight: "6px" }}
                                      ></i>
                                      {option.label}
                                    </div>
                                  )}
                                />
                              </div>
                            </div>
                          </Row>
                        </FormGroup>
                      </div>
                      <div className="text-center user-detail gap-4">
                        {/* {imgLoader ? <CircularProgress /> : */}
                        {userData?.profilePhoto ? (
                          <img
                            src={userData?.profilePhoto}
                            alt="profile"
                            style={{
                              width: "100px",
                              height: "100px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <img
                            src={userDefault}
                            alt="profile"
                            style={{
                              width: "100px",
                              height: "100px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        )}
                        {/* } */}
                        <div className="row">
                          <FormGroup className="form-group">
                            <Row className=" row-sm support-page">
                              <Col md={2} className="d-flex align-items-center">
                                <Form.Label className="text-dark mt-0">
                                  {"First name"} :
                                </Form.Label>
                              </Col>
                              <Col md={4}>
                                <Form.Control
                                  value={userData?.firstName}
                                  disabled
                                />
                              </Col>
                              <Col md={2} className="d-flex align-items-center">
                                <Form.Label className="text-dark support-text">
                                  {"Last name"} :
                                </Form.Label>
                              </Col>
                              <Col md={4}>
                                <Form.Control
                                  value={userData?.lastName}
                                  disabled
                                />{" "}
                              </Col>
                            </Row>
                          </FormGroup>
                          <FormGroup className="form-group">
                            <Row className=" row-sm support-page">
                              <Col md={2} className="d-flex align-items-center">
                                <Form.Label className="text-dark mt-0">
                                  {"Email"} :
                                </Form.Label>
                              </Col>
                              <Col md={4}>
                                <Form.Control
                                  value={userData?.email}
                                  disabled
                                />
                              </Col>
                              {/* <Col md={2} className="d-flex align-items-center">
                                                                <Form.Label className="text-dark support-text">
                                                                    {"Bookmark"} :
                                                                </Form.Label>
                                                            </Col>
                                                            <Col md={4}>
                                                                <div style={{ overflowY: "scroll", padding: '10px', height: "60px", borderRadius: '4px', backgroundColor: '#f6f6ff', border: '1px solid #e8e8f7', textAlign: "start" }} >
                                                                    <ul> {userData?.bookmark && userData?.bookmark?.map((item, index) => {
                                                                        return (
                                                                            <li>
                                                                                <p className='m-0 mb-1' key={index}>{item}</p>
                                                                            </li>
                                                                        )
                                                                    })}
                                                                    </ul>
                                                                </div>
                                                            </Col> */}
                            </Row>
                          </FormGroup>
                        </div>
                      </div>
                      <div className="border-bottom mb-3">
                        <FormGroup className="form-group">
                          <Row className="row-sm">
                            <div
                              className="me-auto d-flex justify-content-start"
                              style={{
                                fontWeight: 600,
                                fontSize: "20px",
                                color: "#291f3d",
                              }}
                            >
                              EVENT DETAIL
                            </div>
                          </Row>
                        </FormGroup>
                      </div>
                      <Row className="row-sm">
                        <Col xs={12} sm={12} lg={6}>
                          <img
                            src={getEventImage(detailsEvent)}
                            alt="image"
                            onError={(event) => {
                              event.currentTarget.src = EvenImage;
                            }}
                            style={{
                              width: "-webkit-fill-available",
                              height: "280px",
                              objectFit: "cover",
                              borderRadius: "5px",
                            }}
                          />
                        </Col>
                        <Col xs={12} sm={12} lg={6}>
                          <div style={{ width: "100%" }}>
                            <div className="align-items-center">
                              <label className="tx-18 fw-bold mt-2 mb-0">
                                {detailsEvent?.title}
                              </label>
                              <Typography className="text-muted gap-2 d-flex">
                                {detailsEvent.address}
                              </Typography>
                              <Typography className="text-muted gap-2 d-flex">
                                {/* {detailsEvent.city}, {detailsEvent?.state}, */}
                                {`${detailsEvent.city}, ${detailsEvent?.state}, United States`}
                              </Typography>
                              <Row className="d-flex align-items-center tx-16 fw-bold">
                                <Col md={3} xs={12}>
                                  <label className="mt-2 mb-0 gap-2">
                                    Type
                                  </label>
                                </Col>
                                <Col md={9} xs={12}>
                                  <Typography className="text-muted gap-2 d-flex">
                                    {detailsEvent.categoryType}
                                  </Typography>
                                </Col>
                              </Row>
                              <Row className="d-flex tx-16 fw-bold align-items-baseline">
                                <Col md={3} xs={12}>
                                  <label className="mt-2 mb-0 gap-2">
                                    Category
                                  </label>
                                </Col>
                                <Col md={9} xs={12}>
                                  <Typography className="text-muted gap-2 d-flex">
                                    {typeof detailsEvent?.category === "object"
                                      ? detailsEvent?.category
                                          .map((idofcat) => {
                                            const category =
                                              dropDownCategory.find(
                                                (item) =>
                                                  item.catId ===
                                                  idofcat.categoryId
                                              );
                                            return category
                                              ? category?.name
                                              : "Unknown Category";
                                          })
                                          .join(", ")
                                      : detailsEvent?.category}
                                  </Typography>
                                </Col>
                              </Row>
                              <Row className="d-flex align-items-center tx-16 fw-bold">
                                <Col md={3} xs={12}>
                                  <label className="mt-2 mb-0 gap-2">
                                    Zip code
                                  </label>
                                </Col>
                                <Col md={9} xs={12}>
                                  <Typography className="text-muted gap-2 d-flex">
                                    {detailsEvent.zipCode}
                                  </Typography>
                                </Col>
                              </Row>

                              <div className="eventdetail-datetime mb-2">
                                <label className="tx-16 fw-bold mt-2 mb-0 d-flex align-items-center">
                                  Date
                                  <Typography className="text-muted gap-2 d-flex mx-2">
                                    {/* {detailsEvent?.startDate === "null"
                                      ? ""
                                      : moment(
                                          parseInt(detailsEvent?.startDate)
                                        ).format("DD-MM-YYYY")} */}
                                    {detailsEvent?.startDate === "null" ||
                                    detailsEvent?.startDate === "Invalid date "
                                      ? "--" : detailsEvent?.startDate === " "? "--"
                                      : detailsEvent?.startDate.split(" ")[0]}
                                  </Typography>
                                </label>
                                <label className="tx-16 fw-bold mt-2 mb-0 d-flex align-items-center">
                                  Time
                                  <Typography className="text-muted gap-2 d-flex mx-2">
                                    {
                                      detailsEvent?.startDate === "null" ||
                                      detailsEvent?.startDate ===
                                        "Invalid date "
                                        ? "--"
                                        : detailsEvent?.startDate === " "
                                        ? "--"
                                        : detailsEvent?.startDate.split(
                                            " "
                                          )[1] +
                                          " " +
                                          (detailsEvent?.startDate.split(
                                            " "
                                          )[2] !== undefined
                                            ? detailsEvent?.startDate.split(
                                                " "
                                              )[2]
                                            : "")
                                      //  moment
                                      //     .tz(
                                      //       new Date(
                                      //         parseInt(detailsEvent?.startTime)
                                      //       ),
                                      //       "America/Chicago"
                                      //     )
                                      //     .format("hh:mm A")
                                    }
                                  </Typography>
                                </label>
                              </div>

                              <div
                                style={{
                                  overflowY: "scroll",
                                  padding: "10px",
                                  height: "150px",
                                  borderRadius: "4px",
                                  border: "1px solid #e8e8f7",
                                  textAlign: "start",
                                }}
                              >
                                <ul>
                                  {" "}
                                  {detailsEvent?.description &&
                                    detailsEvent?.description?.map(
                                      (item, index) => {
                                        return (
                                          <li>
                                            <p className="m-0 mb-1" key={index}>
                                              {item}
                                            </p>
                                          </li>
                                        );
                                      }
                                    )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </Col>
                      </Row>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {btnShow && (
                          <Button
                            type="button"
                            onClick={handleFormSubmit}
                            style={{
                              display: "flex",
                              marginLeft: "auto",
                              marginRight: "15px",
                              marginTop: "20px",
                              textAlign: "center",
                            }}
                          >
                            {statusLoader ? (
                              <CircularProgress
                                size={20}
                                style={{ color: "white" }}
                              />
                            ) : (
                              "Submit"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default EventDetailsPage;
