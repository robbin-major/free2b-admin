import React, { useState } from "react";
import DataTable from "react-data-table-component";
import Loader1 from "../../../assets/img/svgs/loader.svg";
import { Button, Card } from "react-bootstrap";
import AddCategory from "./AddCategory";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../Firebase";
import { enqueueSnackbar } from "notistack";
import { useEffect } from "react";
import { getAuth } from "firebase/auth";
import DeleteModal from "../users/DeleteModal";

const Category = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRows, setTotalRows] = useState();
  const [dataPerPage, setDataPerPage] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [show, setshow] = useState(false);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [deleteId, setDeleteId] = useState("");

  const [catName, setCatName] = useState("");
  const auth = getAuth();
  const user = auth.currentUser;
  const initialValue = {
    name: "",
  };
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Please enter the name!"),
  });
  const getCategoryies = async () => {
    const collectionRef = collection(db, "category");
    const getData = await getDocs(collectionRef);
    return getData;
  };
  const AllCategory = async () => {
    setIsLoading(true);
    const getData = await getCategoryies();
    const categoryData = [];
    console.log("categoryData", categoryData);

    getData.forEach((doc) => {
      categoryData.push(doc.data());
    });
    const paginatedData = categoryData.slice(
      (pageNumber - 1) * dataPerPage,
      pageNumber * dataPerPage
    );

    setCategoryData(paginatedData);
    setTotalRows(categoryData.length);
    setIsLoading(false);
  };
  const handleFormSubmit = async (values, action) => {
    console.log("dateeee", values);
    try {
      setSubmitLoader(true);
      const catData = {
        name: values.name.trim(),
        // uid: user.uid,
      };
      const response = await addDoc(collection(db, "category"), catData);
      console.log("response", response);
      const getUser = doc(db, "category", response.id);
      updateDoc(getUser, { catId: response.id });
      setSubmitLoader(false);
      AllCategory();
      setshow(false);
      enqueueSnackbar("Event Create successfully", {
        variant: "success",
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
      });
      action.resetForm();
    } catch (error) {
      console.log("errr", error);
      setSubmitLoader(false);
      enqueueSnackbar("Something Went Wrong", {
        variant: "error",
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
      });
    }
  };
  const formik = useFormik({
    initialValues: initialValue,
    validationSchema: validationSchema,
    onSubmit: handleFormSubmit,
  });
  const handlePageChange = async (newPageNumber) => {
    setPageNumber(newPageNumber);
  };
  const handlePerPageChange = async (newPerPage, newPageNumber) => {
    setDataPerPage(newPerPage);
    setPageNumber(newPageNumber);
  };
  const handleDialogOpen = () => {
    setshow(true);
  };
  const handleDialogClose = () => {
    setshow(false);
    formik.resetForm();
  };
  const handleDelete = async (row) => {
    console.log("aaaaaaaaaaa", row);
    setShowDelete(true);
    setDeleteId(row.catId);
    setCatName(row.name);
  };
  const handleDeleteClose = () => {
    setShowDelete(false);
  };
  const handleRemoveCatdata = async () => {
    try {
      setDeleteLoader(true);
      const docRef = doc(db, "category", deleteId);
      await deleteDoc(docRef);
      setDeleteLoader(false);
      setShowDelete(false);
      enqueueSnackbar("Category delete successfully", {
        variant: "success",
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
      });
      AllCategory();
    } catch (error) {
      setDeleteLoader(false);
      enqueueSnackbar("Error deleting subcollection:", {
        variant: "error",
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
      });
    }
  };
  useEffect(() => {
    AllCategory();
  }, [pageNumber, dataPerPage]);
  const columns = [
    {
      name: <b>Name</b>,
      selector: "name",
      cell: (row) => (row.name ? row.name : "-"),
      sortable: true,
      width: "300px",
    },
    {
      name: <b>Action</b>,
      selector: "uid",
      cell: (row) => (
        <div className="d-flex">
          <div
            onClick={() => handleDelete(row)}
            className="btn btn-danger btn-sm"
          >
            <i className="fa fa-trash"></i>
          </div>
        </div>
      ),
      // width: "120px"
    },
  ];
  return (
    <>
      <div className="page-header">
        <h2 className="main-content-title tx-24 mg-b-5">Category</h2>
      </div>
      <div lg={12} className="w-100 d-flex justify-content-center">
        <div className="category-table">
          <Card className="custom-card overflow-hidden">
            <Card.Body>
              <div className="responsive">
                <Card className="custom-card overflow-hidden">
                  <div>
                    <div className="d-flex justify-content-end mt-2 mb-3">
                      <Button
                        variant="primary"
                        type="button"
                        className="btn-icon-text"
                        onClick={() => handleDialogOpen("")}
                      >
                        <i className="fe fe-plus me-2"></i>Add Category
                      </Button>
                      {show && (
                        <AddCategory
                          show={show}
                          onHide={handleDialogClose}
                          submitLoader={submitLoader}
                          formik={formik}
                        />
                      )}
                      {showDelete && (
                        <DeleteModal
                          show={showDelete}
                          onHide={handleDeleteClose}
                          catName={catName}
                          handleRemoveCatdata={handleRemoveCatdata}
                          deleteLoader={deleteLoader}
                          mixData="category"
                        />
                      )}
                    </div>
                    <DataTable
                      data={categoryData}
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

export default Category;
