import { Box, Button, styled } from "@mui/material";
import { useNavigate } from "react-router-dom";
import notFound from "../../../assets/img/notFound/not_found.png";

const FlexBox = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
}));

const JustifyBox = styled(FlexBox)(() => ({
  maxWidth: 320,
  flexDirection: "column",
  justifyContent: "center",
}));

const IMG = styled("img")(() => ({
  width: "200%",
  marginBottom: "32px",
}));

const Root = styled(FlexBox)(() => ({
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  height: "70vh !important",
}));

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Root>
      <JustifyBox>
        <IMG src={notFound} alt="" />

        <Button
          color="primary"
          variant="contained"
          sx={{ textTransform: "capitalize" }}
          onClick={() => navigate("/")}
        >
          Go Back
        </Button>
      </JustifyBox>
    </Root>
  );
};

export default NotFound;
