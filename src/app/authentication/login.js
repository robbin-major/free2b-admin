import React, { Fragment, useState } from "react";
import { Button, Col, Form, Row, Container, Card } from "react-bootstrap";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { object, string } from "yup";
import { login, setLoggedIn } from "../store/slice/auth";
import { useDispatch } from "react-redux";
import { useSnackbar } from "notistack";
import * as Yup from "yup";
import auth, { db } from "../../Firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const SignIn = () => {
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [email, setEmail] = useState("");
  const [password, setPaasword] = useState("");

  const formerr = {
    color: "#ff3300",
    fontSize: "16px",
    fontWeight: "500px",
  };
  const schema = object({
    password: Yup.string().required("Please Enter Password!"),
    email: Yup.string().required("Please Enter Email!"),
  });
  const initialValue = {
    email: "",
    password: "",
  };
  const handleFormSubmit = async (values, action) => {
    const { email, password } = values;
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (user.uid === "rgBipis6paQqZaR0l0ItnQwEy2L2") {
        dispatch(setLoggedIn(true));
        const token = await user.getIdToken();
        localStorage.setItem("isLoggedIn", true);
        localStorage.setItem("email", email);
        localStorage.setItem("password", password);
        localStorage.setItem("token", token);
        navigate("/events/");
        enqueueSnackbar("Login Successfully", {
          variant: "success",
          anchorOrigin: { vertical: "bottom", horizontal: "right" },
        });
        action.resetForm();
      } else {
        action.resetForm();
        navigate("/");
        enqueueSnackbar("User is not admin!!!", {
          variant: "error",
          anchorOrigin: { vertical: "bottom", horizontal: "right" },
        });
      }
    } catch (e) {
      action.resetForm();
      navigate("/");
      enqueueSnackbar(e.message, {
        variant: "error",
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
      });
    }
  };
  const formik = useFormik({
    initialValues: initialValue,
    validationSchema: schema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: handleFormSubmit,
  });

  const handlLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      dispatch(setLoggedIn(true));
      const user = userCredential.user;
      const token = await user.getIdToken();
      localStorage.setItem("isLoggedIn", true);
      localStorage.setItem("email", email);
      localStorage.setItem("password", password);
      localStorage.setItem("token", token);
      navigate("/events/");
      enqueueSnackbar("Login Successfully", {
        variant: "success",
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
      });
    } catch (err) {
      enqueueSnackbar(err.message, {
        variant: "error",
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
      });
    }
  };
  return (
    <>
      <Fragment>
        <div className="page main-signin-wrapper">
          <Row className="signpages text-center">
            <Col md={12}>
              <Card>
                <Row className="row-sm">
                  <Col
                    lg={6}
                    xl={5}
                    className="d-none d-lg-block text-center bg-primary details"
                  >
                    <div className="p-2 pos-absolute">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          marginBottom: "15px",
                        }}
                      >
                        <h3 style={{ color: "#FFFCFD", marginRight: "3px" }}>
                          FREE2B
                        </h3>
                      </div>
                      <div className="clearfix"></div>
                      <img
                        src={require("../../assets/img/svgs/logo.svg").default}
                        className="ht-100 mb-0"
                        alt="user"
                      />
                      <h5 className="mt-4 text-white">Welcome Back!</h5>
                      <span className="tx-white-6 tx-13 mb-5 mt-xl-0">
                        Login to continue!
                      </span>
                    </div>
                  </Col>
                  <Col lg={6} xl={7} xs={12} sm={12} className="login_form ">
                    <Container fluid>
                      <Row className="row-sm">
                        <Card.Body className="mt-2 mb-2 text-center">
                          <form onSubmit={formik.handleSubmit} noValidate>
                            <h5 className="mb-2">Signin to Your Account</h5>
                            <Form.Group
                              className="text-start form-group"
                              controlId="formEmail"
                            >
                              <Form.Label>Email</Form.Label>
                              <Form.Control
                                className="form-control"
                                placeholder="Enter your email"
                                type="email"
                                name="email"
                                onChange={formik.handleChange}
                                value={formik.values.email}
                                // value={email}
                                // onChange={(e) => setEmail(e.target.value)}
                              />
                              {formik.errors.email && formik.touched.email ? (
                                <p style={formerr}>{formik.errors.email}</p>
                              ) : null}
                            </Form.Group>
                            <Form.Group
                              className="text-start form-group"
                              controlId="formpassword"
                            >
                              <Form.Label>Password</Form.Label>
                              <Form.Control
                                className="form-control"
                                placeholder="Enter your password"
                                name="password"
                                type="password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                // value={password}
                                // onChange={(e) => setPaasword(e.target.value)}
                              />
                              {formik.errors.password &&
                              formik.touched.password ? (
                                <p style={formerr}>{formik.errors.password}</p>
                              ) : null}
                            </Form.Group>
                            <Button
                              type="submit"
                              className="btn ripple btn-main-primary btn-block mt-2"
                            >
                              Sign In
                            </Button>
                          </form>
                        </Card.Body>
                      </Row>
                    </Container>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      </Fragment>
    </>
  );
};
SignIn.propTypes = {};
SignIn.defaultProps = {};
export default SignIn;
