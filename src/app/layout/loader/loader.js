import React from "react";
import Loader1 from "../../../assets/img/svgs/loader.svg";
import { styled } from "@mui/styles";
import { Box } from "@mui/material";

const StyledLoading = styled("div")(() => ({
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& img": {
    width: "auto",
    height: "70px",
  },
  "& .circleProgress": {
    position: "absolute",
    zIndex: 5000000,
    left: 0,
    right: "calc(100% - 240px)",
    top: "100%",
  },
}));

const Loader = () => (
  <StyledLoading
    style={{
      marginTop: "25vh",
    }}
  >
    <Box position="relative">
      <img src={Loader1} alt="Loader" />
    </Box>
  </StyledLoading>
);

Loader.propTypes = {};

Loader.defaultProps = {};
export default Loader;
