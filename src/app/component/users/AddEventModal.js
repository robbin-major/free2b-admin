import { CircularProgress } from "@mui/material";
import { DatePicker, TimePicker } from "antd";
import dayjs from "dayjs";
import moment from "moment-timezone";
import React, { useEffect } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import Select from "react-select";

const AddEventModal = (props) => {
  const {
    formik,
    Country,
    selectedCountry,
    State,
    City,
    selectedState,
    selectedCity,
    handleState,
    handleCity,
    handleCountry,
    onDateChange,
    onTimeChange,
    handleDatewithTIme,
    handleImageChange,
    handleZipCode,
    submitLoader,
    handleDescription,
    inputValue,
    isUpdate,
    previewImage,
    CategoriesOptions,
    showTextError,
    setShowTextError,
  } = props;
  const getSortedCountryOptions = (options) => {
    const usaOption = options.find((option) => option.name === "United States"); // Find the US option
    return [usaOption, ...options.filter((option) => option !== usaOption)]; // Put US first, then others
  };
  console.log(
    "formik.values.timeformik.values.timeformik.values.timeformik.values.time",
    showTextError
  );
  // useEffect(() => {
  //   getSortedCountryOptions()
  // }, [])

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: "#e8e8f7",
      "&:hover": {
        borderColor: "#e8e8f7",
      },
      boxShadow: state.isFocused ? "0 0 0 1px #e8e8f7" : null,
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#A8AFC7",
    }),
  };
  console.log("selectedCountry", formik.values.country, formik.values.state);
  // const CategoriesOptions = [
  //   { value: "Dance", label: "Dance" },
  //   { value: "Theater", label: "Theater" },
  //   { value: "Live music", label: "Live music" },
  //   { value: "Street fest", label: "Street fest" },
  //   { value: "LGBTQ friendly", label: "LGBTQ friendly" },
  //   { value: "Kid friendly", label: "Kid friendly" },
  // ];
  console.log(
    "123456timeeeeee",
    !formik.values.date ? true : false,
    formik.values.date === "Invalid date"
  );

  const typeOptions = [
    { value: "Citywide Event", label: "Citywide Event" },
    { value: "Community Event", label: "Community Event" },
    { value: "Private Event", label: "Private Event" },
  ];
  const disabledDate = (current) => {
    return current & (current < moment().startOf("day"));
  };

  console.log(
    "stateeee",
    selectedCountry?.isoCode,
    State?.getStatesOfCountry("US")
  );
  return (
    <Modal
      {...props}
      size="large"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>{isUpdate ? "Update Event" : "Add Event"}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center" style={{ paddingBottom: "initial" }}>
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
                    Title<span className="tx-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    placeholder="Enter event title here..."
                    value={formik.values.title}
                    onChange={(e) => {
                      formik.setFieldValue("title", e.target.value);
                      setShowTextError({
                        ...showTextError,
                        name: false,
                      });
                    }}
                    className={`${
                      showTextError.name ? "border border-danger" : ""
                    } `}
                  />
                  {formik.errors.title && formik.touched.title ? (
                    <p className="text-start error">{formik.errors.title}</p>
                  ) : null}
                </Form.Group>
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
                    Description<span className="tx-danger">*</span>
                  </Form.Label>
                  {/* <Form.Control
                    type="text"
                    name="description"
                    placeholder="Enter event description here..."
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    style={{ height: "100px", overflow: 'scroll' }}
                  // onChange={(e) => handleDescription()}
                  /> */}
                  <textarea
                    style={{
                      overflowY: "scroll",
                      padding: "10px",
                      height: "120px",
                      borderRadius: "4px",
                      border: "1px solid #e8e8f7",
                      textAlign: "start",
                      width: "100%",
                    }}
                    name="description"
                    value={formik.values.description}
                    placeholder="Enter event description here..."
                    onChange={(e) => handleDescription(e)}
                  />
                  {formik.errors.description && formik.touched.description ? (
                    <p className="text-start error">
                      {formik.errors.description}
                    </p>
                  ) : null}
                </Form.Group>
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
                    Type<span className="tx-danger">*</span>
                  </Form.Label>
                  <Select
                    style={{ width: "100%" }}
                    value={typeOptions.find(
                      (res) => res.value === formik.values.type
                    )}
                    placeholder="Select type"
                    name="type"
                    options={typeOptions}
                    onChange={(selected) => {
                      formik.setFieldValue("type", selected.value);
                    }}
                    styles={customStyles}
                  />
                  {formik.errors.type && formik.touched.type ? (
                    <p className="text-start error">{formik.errors.type}</p>
                  ) : null}
                </Form.Group>
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
                    Category<span className="tx-danger">*</span>
                  </Form.Label>
                  <Select
                    style={{ width: "100%" }}
                    // value={CategoriesOptions?.filter(
                    //   (catid) =>
                    //     formik.values.category.length !== 0 &&
                    //     formik?.values?.category?.some(
                    //       (item) => item.categoryId === catid.value
                    //     )
                    // )}
                    value={formik.values.category}
                    placeholder="Select category"
                    name="category"
                    options={CategoriesOptions}
                    // onChange={(selected) => {
                    //   const selectedValues = selected
                    //     ? selected.map((option) => option.value)
                    //     : [];
                    //   formik.setFieldValue("category", selectedValues);
                    // }}
                    onChange={(selected) => {
                      const selectedValues = selected
                        ? selected.map((option) => ({
                            value: option.value,
                            label: option.label,
                          }))
                        : [];
                      console.log("selectedValues", selectedValues);
                      formik.setFieldValue("category", selectedValues);
                    }}
                    isMulti
                    styles={customStyles}
                  />
                  {formik.errors.category && formik.touched.category ? (
                    <p className="text-start error">{formik.errors.category}</p>
                  ) : null}
                </Form.Group>
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
                    Address<span className="tx-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    placeholder="Enter address here..."
                    value={formik.values.address}
                    onChange={formik.handleChange}
                  />
                  {formik.errors.address && formik.touched.address ? (
                    <p className="text-start error">{formik.errors.address}</p>
                  ) : null}
                </Form.Group>
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
                    Date<span className="tx-danger">*</span>
                  </Form.Label>
                  {/* <DatePicker
                    getPopupContainer={(trigger) => trigger.parentNode}
                    onChange={onDateChange}
                    value="2024-07-17"
                    // format={"YYYY-MM-DD"}
                    disabledDate={disabledDate}
                    name="date"
                    className="d-flex"
                    placeholder="Enter date here..."
                    style={{
                      border: "1px solid #e8e8f7",
                      borderRadius: "4px",
                      height: "38px",
                    }}
                  /> */}
                  <Form.Control
                    type="date"
                    name="date"
                    min={new Date().toISOString().split("T")[0]}
                    placeholder="Enter date here..."
                    value={formik.values.date}
                    onChange={handleDatewithTIme}
                    className={`${
                      showTextError.date ? "border border-danger" : ""
                    } `}
                    // onChange={formik.handleChange}
                    // value={moment
                    //   .tz(formik.values.date, "America/Chicago")
                    //   .format("YYYY-MM-DD")}
                    // onChange={(e) => {
                    //   const dateString = e.target.value;
                    //   formik.setFieldValue(
                    //     "date",
                    //     moment.tz(dateString, "America/Chicago").valueOf()
                    //   );
                    // }}
                  />
                  {formik.errors.date && formik.touched.date ? (
                    <p className="text-start error">{formik.errors.date}</p>
                  ) : null}
                </Form.Group>
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
                    Time<span className="tx-danger">*</span>
                  </Form.Label>
                  <TimePicker
                    disabled={
                      !formik.values.date ||
                      formik.values.date === "Invalid date" ||
                      formik.values.date === ""
                        ? true
                        : false
                    }
                    getPopupContainer={(trigger) => trigger.parentNode}
                    // onChange={onTimeChange}
                    onChange={(time, timeString) => {
                      console.log("timeString", timeString);
                      formik.setFieldValue("time", timeString);
                    }}
                    value={
                      !formik.values.date
                        ? ""
                        : formik.values.time === ""
                        ? ""
                        : formik.values.time !== "undefined" &&
                          formik.values.time !== "Invalid date"
                        ? dayjs(`${moment(formik.values.time, "hh:mm A")}`)
                        : ""
                    }
                    // value={
                    //   formik.values.time
                    //   // moment(formik.values.time, "hh:mm A")
                    //   // formik.values.time
                    //   //   ? moment(formik.values.time, "hh:mm A")
                    //   //   : null
                    // }
                    // value={
                    //   formik.values.time
                    //     ? dayjs(
                    //         moment
                    //           .tz(formik.values.time, "America/Chicago")
                    //           .format("hh:mm A"),
                    //         "hh:mm A"
                    //       )
                    //     : null
                    // }
                    // defaultValue={dayjs(
                    //   `${moment(formik.values.time).format("hh:mm A")}`,
                    //   "hh:mm A"
                    // )}
                    name="time"
                    format="hh:mm A"
                    className="d-flex"
                    placeholder="Enter time here..."
                    style={{
                      border: "1px solid #e8e8f7",
                      borderRadius: "4px",
                      height: "38px",
                    }}
                  />
                  {formik.errors.time && formik.touched.time ? (
                    <p className="text-start error">{formik.errors.time}</p>
                  ) : null}
                </Form.Group>
                {/* <Form.Group
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
                    Country<span className="tx-danger">*</span>
                  </Form.Label>
                  <Select
                    options={getSortedCountryOptions(Country.getAllCountries())}
                    getOptionLabel={(options) => {
                      return options["name"];
                    }}
                    getOptionValue={(options) => {
                      return options["name"];
                    }}
                    value={selectedCountry}
                    onChange={(item) => handleCountry(item)}
                    name="country"
                    placeholder="Select country"
                    styles={customStyles}
                  />
                  {formik.errors.country && formik.touched.country ? (
                    <p className="text-start error">{formik.errors.country}</p>
                  ) : null}
                </Form.Group> */}
                <Form.Group className="form-group">
                  <Form.Label
                    style={{
                      textAlign: "start",
                      color: "#000",
                      marginTop: "15px",
                    }}
                  >
                    Country
                  </Form.Label>
                  <Form.Control value="United States" disabled />
                </Form.Group>
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
                    State<span className="tx-danger">*</span>
                  </Form.Label>
                  <Select
                    options={State?.getStatesOfCountry("US")}
                    getOptionLabel={(options) => {
                      return options["name"];
                    }}
                    getOptionValue={(options) => {
                      return options["name"];
                    }}
                    value={selectedState}
                    onChange={(item) => handleState(item)}
                    placeholder="Select state"
                    name="state"
                    styles={customStyles}
                  />
                  {formik.errors.state && formik.touched.state ? (
                    <p className="text-start error">{formik.errors.state}</p>
                  ) : null}
                </Form.Group>
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
                    City<span className="tx-danger">*</span>
                  </Form.Label>
                  <Select
                    options={City.getCitiesOfState(
                      selectedState?.countryCode,
                      selectedState?.isoCode
                    )}
                    getOptionLabel={(options) => {
                      return options["name"];
                    }}
                    getOptionValue={(options) => {
                      return options["name"];
                    }}
                    value={selectedCity}
                    onChange={(item) => handleCity(item)}
                    placeholder="Select city"
                    name="city"
                    styles={customStyles}
                  />
                  {formik.errors.city && formik.touched.city ? (
                    <p className="text-start error">{formik.errors.city}</p>
                  ) : null}
                </Form.Group>
                {/* <Form.Group
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
                    City<span className="tx-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    placeholder="Enter city here..."
                    value={formik.values.city}
                    onChange={formik.handleChange}
                  />
                  {formik.errors.city && formik.touched.city ? (
                    <p className="text-start error">{formik.errors.city}</p>
                  ) : null}
                </Form.Group> */}
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
                    Zip Code<span className="tx-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="zipCode"
                    placeholder="Enter the zipcode"
                    value={formik.values.zipCode}
                    onChange={handleZipCode}
                  />
                  {formik.errors.zipCode && formik.touched.zipCode ? (
                    <p className="text-start error">{formik.errors.zipCode}</p>
                  ) : null}
                </Form.Group>
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
                    Image<span className="tx-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="file"
                    name="images"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e)}
                  />
                  {formik.errors.image && formik.touched.image ? (
                    <p className="text-start error">{formik.errors.image}</p>
                  ) : null}
                </Form.Group>
                {previewImage && (
                  <div>
                    <img
                      src={previewImage}
                      alt="previw"
                      height={150}
                      className="d-flex mt-2 rounded-3"
                    />
                  </div>
                )}
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
                  ) : isUpdate ? (
                    "Update"
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
  );
};

export default AddEventModal;
