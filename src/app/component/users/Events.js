import React, { useCallback, useEffect, useRef } from "react";
import withLoader from "../../layout/loader/withLoader";
import DataTable from "react-data-table-component";
import { Button, Card } from "react-bootstrap";
import { useState } from "react";
import Loader1 from "../../../assets/img/svgs/loader.svg";
import { Link, useNavigate } from "react-router-dom";
// import moment from "moment/moment";
import moment from "moment-timezone";
import AddEventModal from "./AddEventModal";
import * as Yup from "yup";
import { useFormik } from "formik";
import DeleteModal from "./DeleteModal";
import { Country, State, City } from "country-state-city";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, storage } from "../../../Firebase";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { enqueueSnackbar } from "notistack";
import { getAuth } from "firebase/auth";
import SelectAll from "react-select";

const Users = () => {
  const navigate = useNavigate();
  const [totalRows, setTotalRows] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUsersData] = useState("");
  const [show, setshow] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [eventName, setEventName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [dataPerPage, setDataPerPage] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [inputValue, setInputValue] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [eventId, setEventId] = useState("");
  const [dropDownCategory, setDropDownCategory] = useState([]);
  const [selectedCatOption, setSelectedCatOption] = useState("");
  const [selectedCatOptionValue, setSelectedCatOptionValue] = useState("");
  const [eventStatus, setEventStatus] = useState(null);
  const [showTextError, setShowTextError] = useState({
    name: false,
    date: false,
  });

  const auth = getAuth();
  const user = auth.currentUser;
  const initialValue = {
    title: "",
    description: "",
    type: "",
    category: "",
    // country: "",
    state: "",
    city: "",
    // aptSuiteOther: '',
    address: "",
    date: "",
    time: "",
    image: null,
    zipCode: "",
  };
  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Please enter the title!"),
    description: Yup.string().required("Please enter the description!"),
    type: Yup.string().required("Please select the type!"),
    category: Yup.mixed().required("Please select the category!"),
    // category: Yup.array()
    //   .of(Yup.string())
    //   .min(1, "Please select the category")
    //   .required("Please select the category!"),
    // country: Yup.mixed().required("Please select the country!"),
    state: Yup.mixed().required("Please select the state!"),
    city: Yup.string().required("Please enter the city!"),
    // aptSuiteOther: Yup.string().required('Please enter the apt/suite/other!'),
    address: Yup.string().required("Please enter the address!"),
    date: Yup.string().required("Please select the date!"),
    time: Yup.mixed().required("Please select the time!"),
    image: Yup.mixed().required("Please select an image!"),
    zipCode: Yup.string().required("Please enter the zip code!"),
  });

  const fetchMoreData = async () => {
    const kurzRef = collection(db, `event`);
    const querySnapshot = await getDocs(kurzRef);
    querySnapshot.forEach(async (doc) => {
      const data = doc.data();
      const categoryIds = data.category.map((cat) => cat.categoryId);
    });
  };

  const handleFormSubmit = async (values, action) => {
    setSubmitLoader(true);
    const kurzRef = collection(db, `event`);
    const title = values.title.trim();
    const startDateCheck = moment(values.date).format("DD-MM-YYYY");
    const startTimeCheck = values.time;

    const titleQuery = query(kurzRef, where("title", "==", title));
    const dateQuery = query(
      kurzRef,
      where("startDateCheck", "==", startDateCheck)
    );
    const timeQuery = query(
      kurzRef,
      where("startTimeCheck", "==", startTimeCheck)
    );
    const [titleSnapshot, dateSnapshot, timeSnapshot] = await Promise.all([
      getDocs(titleQuery),
      getDocs(dateQuery),
      getDocs(timeQuery),
    ]);

    const existingTitle = titleSnapshot.docs.find((doc) => doc.id !== eventId);
    const existingDate = dateSnapshot.docs.find((doc) => doc.id !== eventId);
    const existingTime = timeSnapshot.docs.find((doc) => doc.id !== eventId);

    if (existingTitle) {
      setShowTextError({ ...showTextError, name: true });
      enqueueSnackbar("Already event exist with this name", {
        variant: "error",
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
      });
      setSubmitLoader(false);
      return;
    }
    // if (existingDate) {
    //   // if (existingDate && existingTime) {
    //   setShowTextError({ ...showTextError, date: true });
    //   enqueueSnackbar("Already event exist with this date and time", {
    //     variant: "error",
    //     anchorOrigin: { vertical: "bottom", horizontal: "right" },
    //   });
    //   setSubmitLoader(false);
    //   return;
    // }
    let newTime;
    if (typeof values.time === "number") {
      newTime = values.time;
    } else {
      newTime = moment(values.time).valueOf();
    }
    const paragraphs = values.description
      .split("\n")
      .filter((paragraph) => paragraph.trim() !== "");
    const changeDate =
      formik.values.date !== ""
        ? moment(formik.values.date).format("DD-MM-YYYY")
        : "";

    const changeTime = formik.values.time;
    const cleanedData = {
      ...values,
      createdAt: new Date().getTime(),
      startDate: changeDate + " " + changeTime,
      startDateCheck: changeDate,
      startTimeCheck: changeTime,
      title: values.title.trim(),
      description: paragraphs,
      categoryType: values.type.trim(),
      category: values.category.map((cat) => ({
        categoryId: cat.value,
        categoryName: cat.label,
      })),
      city: values.city.trim(),
      // aptSuiteOther: values.aptSuiteOther.trim(),
      address: values.address.trim(),
      uid: user.uid,
      status: isUpdate ? eventStatus : "PENDING",
    };
    let fileDownloadURL = null;
    if (cleanedData.image instanceof File) {
      const fileRef = ref(
        storage,
        `file/${cleanedData.image.name + new Date().getTime()}`
      );
      await uploadBytes(fileRef, cleanedData.image);
      fileDownloadURL = await getDownloadURL(fileRef);
    }
    const valuesWithoutFile = { ...cleanedData };
    delete valuesWithoutFile.image;
    delete valuesWithoutFile.date;
    delete valuesWithoutFile.time;
    delete valuesWithoutFile.type;
    if (fileDownloadURL) {
      valuesWithoutFile.image = fileDownloadURL;
    }
    if (!eventId) {
      try {
        console.log("raaaaaaaaaaaaaaaaaaa", values);
        // setIsLoading(true);
        console.log("valuesWithoutFile", valuesWithoutFile);

        const response = await addDoc(
          collection(db, "event"),
          valuesWithoutFile
        );
        console.log("response.idresponse.id", response.id);
        const getUser = doc(db, "event", response.id);
        updateDoc(getUser, { evntId: response.id });
        // setSubmitLoader(false);
        // AllUsers();
        // setshow(false);
        setTimeout(() => {
          setshow(false);
          setSubmitLoader(false);
          AllUsers();
          enqueueSnackbar("Event Create successfully", {
            variant: "success",
            anchorOrigin: { vertical: "bottom", horizontal: "right" },
          });
          action.resetForm();
        }, 1000);
        // setIsLoading(false);
      } catch (error) {
        console.log("errr", error);
        enqueueSnackbar("Something Went Wrong", {
          variant: "error",
          anchorOrigin: { vertical: "bottom", horizontal: "right" },
        });
        navigate(-1);
        // setIsLoading(false);
        setSubmitLoader(false);
      }
      setSelectedCountry(null);
      setSelectedState(null);
      setSelectedCity(null);
    } else {
      try {
        console.log("raaaaaaaaaaaaaaaaaaa", values);
        let fileDownloadURL = null;
        if (cleanedData.image instanceof File) {
          const fileRef = ref(
            storage,
            `file/${cleanedData.image.name + new Date().getTime()}`
          );
          await uploadBytes(fileRef, cleanedData.image);
          fileDownloadURL = await getDownloadURL(fileRef);
        }

        const cleanData = cleanedData;
        if (values?.image?.name) {
          delete cleanData.image;
        }
        if (fileDownloadURL) {
          cleanData.image = fileDownloadURL;
        }
        delete cleanData.date;
        delete cleanData.time;
        delete cleanData.type;
        console.log("bbbbbbbbbbbb", eventId, cleanData);
        const getUser = doc(db, "event", eventId);
        updateDoc(getUser, { ...cleanData });
        setshow(false);
        setSubmitLoader(false);
        setIsLoading(true);
        enqueueSnackbar("Event Update successfully", {
          variant: "success",
          anchorOrigin: { vertical: "bottom", horizontal: "right" },
        });
        setTimeout(() => {
          AllUsers("loader");
        }, 1500);
        console.log("dfdsfsdfsg", userData);
      } catch (error) {
        setSubmitLoader(false);
        console.log("error", error);
      } finally {
        setSubmitLoader(false);
      }
      // setTimeout(() => {
      //   AllUsers();
      // }, 2000);
      setSelectedCountry(null);
      setSelectedState(null);
      setSelectedCity(null);
    }
    setShowTextError({ name: false, date: false });
  };
  const formik = useFormik({
    initialValues: initialValue,
    validationSchema: validationSchema,
    onSubmit: handleFormSubmit,
  });
  const handleCountry = (item) => {
    const nameCountry = item?.name;
    // formik.setFieldValue("country", nameCountry);
    setSelectedCountry(item);
  };
  const handleState = (item) => {
    const nameState = item?.name;
    formik.setFieldValue("state", nameState);
    setSelectedState(item);
  };
  const handleCity = (item) => {
    const nameCity = item?.name;
    formik.setFieldValue("city", nameCity);
    setSelectedCity(item);
  };
  // const onDateChange = (date, dateString) => {
  //   const convertedDate = new Date(dateString);
  //   const timestamp = convertedDate.getTime();
  //   formik.setFieldValue("date", timestamp);
  // };
  // const onTimeChange = (time, timeString) => {
  //   console.log("timeString", time, timeString);
  //   formik.setFieldValue("time", timeString);
  //   const dateMoment = moment(formik.values.date);
  //   const dateTime = dateMoment.set({
  //     hour: moment(timeString, "hh:mm A").get("hour"),
  //     minute: moment(timeString, "hh:mm A").get("minute"),
  //     second: 0,
  //     millisecond: 0,
  //   });
  //   const timeInMilliseconds = dateTime.valueOf();
  // };
  const handleDatewithTIme = (date, dateString) => {
    console.log("dateee", date.target.value);
    formik.setFieldValue(
      "date",
      moment(date.target.value).format("YYYY-MM-DD")
    );
    setShowTextError({
      ...showTextError,
      date: false,
    });
    if (date.target.value === "") {
      formik.setFieldValue("time", "");
      formik.setFieldValue("date", "");
    }
  };
  const handleImageChange = (e) => {
    const imgFile = e.target.files[0];
    formik.setFieldValue("image", imgFile);
    setPreviewImage(URL.createObjectURL(imgFile));
  };
  const handleZipCode = (event) => {
    let inputValue = event.target.value;
    const numericValue = inputValue.replace(/[^0-9.]/g, "");
    formik.setFieldValue("zipCode", numericValue);
  };
  const handleDescription = (e) => {
    const value = e.target.value;
    const paragraphs = value
      .split("\n")
      .filter((paragraph) => paragraph.trim() !== "");
    setInputValue(paragraphs);
    formik.setFieldValue("description", value);
  };
  const handleDialogClose = () => {
    setshow(false);
    formik.resetForm();
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedCity(null);
  };
  const handleFilterCat = (StatusOption) => {
    setSelectedCatOption(StatusOption);
    setSelectedCatOptionValue(StatusOption ? StatusOption.value : "");
  };
  const handleDialogOpen = (id, row) => {
    console.log("idididididididid", row?.evntId, row);
    console.log("ttttttttttttttttttttt", row?.startDate.split(" ")[0]);
    setshow(true);
    setEventId(id);
    setEventStatus(row?.status);
    if (id) {
      console.log("row?.startDate", row?.startTime, row);
      console.log("idididid", id);
      setIsUpdate(true);
      formik.setFieldValue("title", row?.title);
      // {
      //   row?.description &&
      //     row?.description.map((item, index) => <div key={index}>{item}</div>);
      // }
      // row?.description.map((item) => formik.setFieldValue("description", item));
      console.log("row?.description", row?.description);
      formik.setFieldValue("description", row?.description.join("\n"));
      formik.setFieldValue("type", row?.categoryType);
      const newCate = row?.category.map((item) => ({
        value: item?.categoryId,
        label: item?.categoryName,
      }));
      formik.setFieldValue("category", newCate);

      formik.setFieldValue("address", row?.address);
      console.log("moment", row, moment(row?.date).format("YYYY-MM-DD"));
      // formik.setFieldValue("date", moment(parseInt(row?.startDate)));
      if (
        row?.startDate.split(" ")[0] !== "Invalid" &&
        row?.startDate !== " "
      ) {
        formik.setFieldValue(
          "date",
          moment(row?.startDate, "DD-MM-YYYY").format("YYYY-MM-DD")
        );
        if (row?.startDate.split(" ")[1] !== "") {
          formik.setFieldValue(
            "time",
            row?.startDate.split(" ")[1] + " " + row?.startDate.split(" ")[2]
          );
        }
        if (row?.startDate.split(" ")[0] === "") {
          formik.setFieldValue("time", "");
        }
      }
      console.log(
        "row?.startDate.splithhh",
        row?.startDate.split(" ")[1] + " " + row?.startDate.split(" ")[2]
      );
      // formik.setFieldValue("country", row?.country);
      const allCountries = Country.getAllCountries();
      const selectedCountryOption = allCountries.find(
        (country) => country.name === row?.country
      );
      setSelectedCountry(selectedCountryOption);
      formik.setFieldValue("state", row?.state);
      formik.setFieldValue("city", row?.city);
      const allStates = State.getAllStates();
      const selectedStateOption = allStates.find(
        (state) => state.name === row?.state
      );
      setSelectedState(selectedStateOption);
      const allCities = City.getAllCities();
      const selectedCityOption = allCities.find(
        (city) => city.name === row?.city
      );
      setSelectedCity(selectedCityOption);
      formik.setFieldValue("zipCode", row?.zipCode);
      formik.setFieldValue("image", row?.image);
      setPreviewImage(row?.image);
    } else {
      setPreviewImage(null);
      setIsUpdate(false);
      formik.resetForm();
    }
  };
  console.log("formikkkkkkk", userData);
  const deleteFileFromStorage = async (downloadURL) => {
    const storageRef = ref(storage, downloadURL);
    try {
      if (storageRef) {
        await deleteObject(storageRef);
      }
    } catch (error) {
      console.error("Error deleting file: ", error);
    }
  };
  const handleDelete = async (id, row) => {
    setShowDelete(true);
    setDeleteId(row);
    setEventName(row.title);
  };
  const handleRemoveData = async () => {
    try {
      setDeleteLoader(true);
      const docRef = doc(db, "event", deleteId.evntId);
      await deleteDoc(docRef);
      setDeleteLoader(false);
      deleteFileFromStorage(deleteId.image);
      setShowDelete(false);
      enqueueSnackbar("Event delete successfully", {
        variant: "success",
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
      });
      AllUsers();
    } catch (error) {
      setDeleteLoader(false);
      enqueueSnackbar("Error deleting subcollection:", {
        variant: "error",
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
      });
    }
  };
  const handleDeleteClose = () => {
    setShowDelete(false);
  };
  const getEvents = async () => {
    const collectionRef = collection(db, "event");

    const getData = await getDocs(
      query(collectionRef, orderBy("createdAt", "desc"))
    );

    // const getData = await getDocs(collectionRef);
    return getData;
  };
  const getCategories = async () => {
    const collectionRef = collection(db, "category");
    const getData = await getDocs(collectionRef);
    return getData;
  };
  const updateCategoryIds = async () => {
    const kurzRef = collection(db, `event`);
    const querySnapshot = await getDocs(kurzRef);
    querySnapshot.forEach(async (doc) => {
      const data = doc.data();
      const categoryIds = data.category.map((cat) => cat.categoryId);

      await updateDoc(doc.ref, { categoryIds });
    });
  };
  useEffect(() => {
    updateCategoryIds();
  }, []);

  // const getFilter = async () => {
  //   setIsLoading(true);
  // const kurzRef = collection(db, `event`);
  // let q;

  // if (searchValue && selectedCatOptionValue) {
  //   q = query(
  //     kurzRef,
  //     where("title", "==", searchValue),
  //     where("categoryIds", "array-contains", selectedCatOptionValue)
  //   );
  // } else if (searchValue) {
  //   q = query(kurzRef, where("title", "==", searchValue));
  // } else if (selectedCatOptionValue) {
  //   q = query(
  //     kurzRef,
  //     where("categoryIds", "array-contains", selectedCatOptionValue)
  //   );
  // } else {
  //   q = kurzRef;
  // }

  // const querySnapshot = await getDocs(q);
  // const eventData = [];

  // querySnapshot.forEach((doc) => {
  //   eventData.push(doc.data());
  // });

  //   const paginatedData = eventData.slice(
  //     (pageNumber - 1) * dataPerPage,
  //     pageNumber * dataPerPage
  //   );

  //   setIsLoading(false);
  //   setUsersData(paginatedData);
  //   setTotalRows(eventData.length);
  // };

  const getFilter = async () => {
    setIsLoading(true);
    const kurzRef = collection(db, `event`);
    let q;

    if (selectedCatOptionValue) {
      q = query(
        kurzRef,
        where("categoryIds", "array-contains", selectedCatOptionValue)
      );
    } else {
      q = query(kurzRef, orderBy("createdAt", "desc"));

      // q = kurzRef;
    }

    try {
      const querySnapshot = await getDocs(q);
      const eventData = [];

      querySnapshot.forEach((doc) => {
        eventData.push(doc.data());
      });

      // partial matching
      const filteredData = eventData.filter((event) => {
        const title = event.title.toLowerCase();
        const searchLower = searchValue.toLowerCase();
        return title.includes(searchLower);
      });

      const paginatedData = filteredData.slice(
        (pageNumber - 1) * dataPerPage,
        pageNumber * dataPerPage
      );

      setUsersData(paginatedData);
      setTotalRows(filteredData.length);
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const AllUsers = async (dataLoad) => {
    if (!dataLoad) {
      setIsLoading(true);
    }
    // setEventDataLoader(true);
    const getData = await getEvents();
    const eventData = [];
    getData.forEach((doc) => {
      eventData.push(doc.data());
    });

    eventData.sort((a, b) => b.createdAt - a.createdAt);

    const paginatedData = eventData.slice(
      (pageNumber - 1) * dataPerPage,
      pageNumber * dataPerPage
    );
    console.log("paginationData", paginatedData);
    setUsersData(paginatedData);
    setTotalRows(eventData.length);
    // setEventDataLoader(false);
    setIsLoading(false);
  };
  console.log("userData", userData);

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

  const CategoriesOptions = [
    ...dropDownCategory.map((item) => ({
      value: item.catId,
      label: item.name,
    })),
  ];

  console.log("CategoriesOptionsCategoriesOptions", userData[8]?.startDate);

  useEffect(() => {
    AllUsers();
    // selectedStatus, pageNumber, dataPerPage, searchValue
    getFilter();
  }, [pageNumber, dataPerPage, searchValue, selectedCatOptionValue]);
  useEffect(() => {
    AllCategories();
  }, []);

  const DEBOUNCE_THRESHOLD = 500;
  const timeoutHandler = useRef(null);
  const debounceSearch = (event) => {
    if (timeoutHandler.current) {
      clearTimeout(timeoutHandler.current);
    }
    // setIsLoading(true);
    timeoutHandler.current = setTimeout(() => {
      setSearchValue(event);
      // setIsLoading(false);
    }, DEBOUNCE_THRESHOLD);
  };

  const handlePageChange = async (newPageNumber) => {
    // setIsLoading(true);
    console.log("newPageNumber", newPageNumber);
    setPageNumber(newPageNumber);
    // await AllUsers();
    // setIsLoading(false);
  };
  const handlePerPageChange = async (newPerPage, newPageNumber) => {
    // setIsLoading(true);
    setDataPerPage(newPerPage);
    setPageNumber(newPageNumber);
    console.log("bbbbb", newPageNumber, newPerPage);
    // await AllUsers();
    // setIsLoading(false);
  };

  const handleResetButton = useCallback(() => {
    setSearchValue("");
    setSearchText("");
    setSelectedCatOptionValue("");
    setSelectedCatOption("");
    AllCategories();
  }, []);

  const parseDate = (dateString) => {
    const [datePart, timePart] = dateString.split(" ");
    const [day, month, year] = datePart.split("-").map(Number);
    const [time, period] = timePart.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    return new Date(year, month - 1, day, hours, minutes);
  };

  const columns = [
    {
      name: <b>Events</b>,
      selector: "image",
      cell: (row) => (
        <div className="py-4">
          <div
            style={{
              overflow: "hidden",
              height: "100px",
              width: "80px",
              borderRadius: "5px",
            }}
          >
            <img
              className="w-full h-full object-cover center"
              src={row?.image}
              style={{ height: "100px", width: "80px", objectFit: "cover" }}
            />
          </div>
        </div>
      ),
      sortable: true,
      width: "150px",
    },
    {
      name: <b>Title</b>,
      selector: "title",
      cell: (row) => (row.title ? row.title : "-"),
      sortable: true,
      width: "165px",
    },
    {
      name: <b>Location</b>,
      selector: "address",
      cell: (row) =>
        row
          ? `${row.address}, ${row?.city}, ${row?.state}, United States`
          : "-",
      sortable: true,
      width: "170px",
    },
    {
      name: <b>Date-Time</b>,
      selector: "startDate",
      cell: (row) => (
        // <div>
        //   {(row?.startDate === "null"
        //     ? ""
        //     : moment
        //         .tz(parseInt(row.startDate), "America/Chicago")
        //         .format("DD-MM-YYYY")) +
        //     " " +
        //     (row?.startTime === "null"
        //       ? ""
        //       : moment
        //           .tz(new Date(parseInt(row?.startTime)), "America/Chicago")
        //           .format("hh:mm A"))}
        // </div>
        <div>
          {
            row?.startDate === "null" || row?.startDate === "Invalid date "
              ? "--"
              : row?.startDate === " "
              ? "--"
              : row?.startDate
            //  +
            //   " " +
            //   (row?.startTime === "null"
            //     ? ""
            //     : moment
            //         .tz(new Date(parseInt(row?.startTime)), "America/Chicago")
            //         .format("hh:mm A"))
          }
        </div>
      ),
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = parseDate(a.startDate);
        const dateB = parseDate(b.startDate);
        return dateA - dateB;
      },
      width: "190px",
    },
    {
      name: <b>Status</b>,
      selector: "status",
      cell: (row) => (
        <button
          className={`btn btn-sm action-btn btn-${
            row.status === "APPROVAL"
              ? "success"
              : row.status === "PENDING"
              ? "warning"
              : "danger"
          } text-white`}
          style={{
            width: "125px",
            textAlign: "center",
            cursor: "default",
          }}
        >
          <i
            style={{ paddingRight: "3px" }}
            class={`fa fa-${
              row.status === "APPROVAL"
                ? "check"
                : row.status === "PENDING"
                ? "clock"
                : "close"
            }`}
          ></i>{" "}
          {row.status === "APPROVAL"
            ? "Approved"
            : row.status === "PENDING"
            ? "Pending"
            : "Decline"}
        </button>
      ),
      sortable: true,
      width: "190px",
    },
    {
      name: <b>Action</b>,
      selector: "uid",
      cell: (row) => (
        <div className="d-flex">
          <div
            onClick={() => handleDialogOpen(row.evntId, row)}
            className="btn btn-primary btn-sm me-2"
          >
            <i className="fa fa-pencil"></i>
          </div>
          <div
            onClick={() =>
              navigate(`/events/details/${row.uid}`, { state: row })
            }
            className="btn btn-primary btn-sm me-2"
          >
            <i className="fa fa-eye"></i>
          </div>
          <div
            onClick={() => handleDelete(row.uid, row)}
            className="btn btn-danger btn-sm"
          >
            <i className="fa fa-trash"></i>
          </div>
        </div>
      ),
      // width: "120px"
    },
  ];

  console.log("asddsdf", formik.values.time);
  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="main-content-title tx-24 mg-b-5">Events</h2>
        </div>
        <div className="d-flex align-items-center">
          {show && (
            <AddEventModal
              show={show}
              isUpdate={isUpdate}
              onHide={handleDialogClose}
              formik={formik}
              Country={Country}
              selectedCountry={selectedCountry}
              State={State}
              City={City}
              selectedState={selectedState}
              selectedCity={selectedCity}
              // onDateChange={onDateChange}
              // onTimeChange={onTimeChange}
              handleDatewithTIme={handleDatewithTIme}
              handleState={handleState}
              handleCity={handleCity}
              handleCountry={handleCountry}
              handleZipCode={handleZipCode}
              handleImageChange={handleImageChange}
              previewImage={previewImage}
              submitLoader={submitLoader}
              handleDescription={handleDescription}
              inputValue={inputValue}
              CategoriesOptions={CategoriesOptions}
              showTextError={showTextError}
              setShowTextError={setShowTextError}
            />
          )}
          {showDelete && (
            <DeleteModal
              show={showDelete}
              onHide={handleDeleteClose}
              eventName={eventName}
              handleRemoveData={handleRemoveData}
              deleteLoader={deleteLoader}
              mixData="event"
            />
          )}
        </div>
      </div>
      <div lg={12} className="w-100 d-flex justify-content-center">
        <div className="event-table">
          <Card className="custom-card">
            <Card.Body>
              <div className="responsive">
                <Card className="custom-card">
                  <div>
                    <div className="event-tablebtn mt-2 mb-3">
                      <div className="event-searchdiv">
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchText}
                          onChange={(e) => {
                            setSearchText(e.target.value);
                            debounceSearch(e.target.value);
                          }}
                          className="event-searchbtn res-gap"
                        />
                        <div style={{ width: "200px" }}>
                          <SelectAll
                            value={selectedCatOption}
                            onChange={handleFilterCat}
                            options={CategoriesOptions}
                            placeholder="Category"
                            className="res-gap"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleResetButton()}
                        >
                          Reset
                        </Button>
                      </div>
                      <Button
                        variant="primary"
                        type="button"
                        className="btn-icon-text"
                        onClick={() => handleDialogOpen("")}
                      >
                        <i className="fe fe-plus me-2"></i>Add Event
                      </Button>
                    </div>
                    {/* {eventDataLoader ? (
                      <div className="ht-300 d-flex justify-content-center align-items-center">
                        <CircularProgress />
                      </div>
                    ) : ( */}
                    <DataTable
                      data={userData}
                      columns={columns}
                      noHeader
                      persistTableHead
                      center={true}
                      highlightOnHover
                      striped
                      pagination
                      paginationServer
                      paginationTotalRows={totalRows}
                      paginationPerPage={dataPerPage}
                      onChangeRowsPerPage={(page, totalRows) => {
                        handlePerPageChange(page, 1);
                      }}
                      paginationDefaultPage={pageNumber}
                      onChangePage={handlePageChange}
                      progressPending={isLoading}
                      progressComponent={
                        <img src={Loader1} alt="Loader" height={70} />
                      }
                    />
                    {/* )} */}
                  </div>
                </Card>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </>
  );
};
export default withLoader(Users);
