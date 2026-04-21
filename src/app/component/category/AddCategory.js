import { CircularProgress } from "@mui/material";
import React from "react";
import { Button, Form, Modal } from "react-bootstrap";

const AddCategory = (props) => {
  const { formik, submitLoader } = props;
  return (
    <>
      <Modal
        {...props}
        size="large"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Category</Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="text-center"
          style={{ paddingBottom: "initial" }}
        >
          <div className="col-122">
            <div className="card custom-card">
              <form onSubmit={formik.handleSubmit}>
                <div
                  className="col-12"
                  style={{
                    overflow: "auto",
                    paddingTop: "15px",
                    marginBottom: "15px",
                    maxHeight: "650px",
                    padding: "10px 10px 0px 10px",
                  }}
                >
                  <Form.Group
                    controlId="validationFormik101"
                    className="position-relative"
                  >
                    <Form.Label
                      style={{
                        textAlign: "start",
                        color: "#000",
                        marginTop: "15px",
                      }}
                    >
                      Name<span className="tx-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter name here..."
                      value={formik.values.name}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.name && formik.touched.name ? (
                      <p className="text-start error">{formik.errors.name}</p>
                    ) : null}
                  </Form.Group>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Button
                    type="submit"
                    style={{
                      display: "flex",
                      marginLeft: "auto",
                      marginRight: "15px",
                      textAlign: "center",
                    }}
                  >
                    {submitLoader ? (
                      <CircularProgress size={20} style={{ color: "white" }} />
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddCategory;
