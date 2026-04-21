import { get } from "lodash";
import serverCall from "../../serverCall";

const signUp = async (userSignInRequest) => {
  const { email, password } = userSignInRequest;
  const response = await serverCall.post(`/auth/admin/log-in?email=${email}&password=${password}`)
  if (response.data.accessToken) {
    localStorage.setItem('token', response.data.accessToken);
    return response.data;
  } else {
    return response.data
  }
};
const AuthenticationService = {
  signUp
};

export default AuthenticationService;
