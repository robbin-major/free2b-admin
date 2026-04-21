import axios from "axios";
import config from "./config";
import { enqueueSnackbar } from "notistack";

const BASE_URL = config.baseApi;

const customAxios = axios.create({
  baseURL: BASE_URL,
});

const requestHandler = (request) => {
  if (localStorage.getItem("token")) {
    const token = localStorage.getItem("token");
    request.headers.Authorization = `Bearer ${token}`;
  }
  // else if (localStorage.getItem('access-token')) {
  //     const accesstoken = JSON.parse(localStorage.getItem('access-token'));
  //     request.headers.Authorization = `Bearer ${accesstoken}`;
  // }
  return request;
};

const responseHandler = (response) => {
  if (response.status === 401 || response.status === 403) {
    window.location = "/";
    localStorage.removeItem("token");
  }
  return response;
};

const requestErrorHandler = (error) => {
  return Promise.reject(error);
};

const responseErrorHandler = (error) => {
  if (error.response) {
    if (error.response.status === 401 || error.response.status === 403) {
      localStorage.clear();
      enqueueSnackbar("The session has expired", {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });
      window.location = "/";
      return Promise.reject(error);
    }
  }
  return Promise.reject(error);
};

customAxios.interceptors.request.use(
  (request) => requestHandler(request),
  (error) => requestErrorHandler(error)
);

customAxios.interceptors.response.use(
  (response) => responseHandler(response),
  responseErrorHandler
);

export default customAxios;
