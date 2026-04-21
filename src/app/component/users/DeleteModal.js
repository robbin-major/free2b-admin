import { CircularProgress } from "@mui/material";
import React from "react";
import { Button, Modal, Spinner } from "react-bootstrap";

const DeleteModal = (props) => {
  const {
    eventName,
    onHide,
    handleRemoveData,
    deleteLoader,
    mixData,
    catName,
    handleRemoveCatdata,
  } = props;
  return (
    <Modal
      {...props}
      size="large"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {mixData === "event" ? "Delete Event" : "Delete Category"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <i className="icon ion-ios-checkmark-circle-outline tx-100 tx-danger  mg-t-20 "></i>

        <h4 className="tx-danger tx-semibold mg-b-20">Delete?</h4>
        <p className="mg-b-20 mg-x-20 ">
          Are you sure want to delete{" "}
          <b>{mixData === "event" ? eventName : catName}</b>?
        </p>
        <Button type="button" onClick={onHide} variant="primary">
          Cancel
          {/* {(deleteFaq || deleteProperty) ? <Spinner /> : 'Delete'} */}
        </Button>
        <Button
          className="mx-2"
          type="button"
          onClick={mixData === "event" ? handleRemoveData : handleRemoveCatdata}
          variant="danger"
        >
          {deleteLoader ? (
            <CircularProgress size={20} style={{ color: "white" }} />
          ) : (
            "Delete"
          )}
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteModal;
