import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { get } from "lodash";
import AuthenticationService from "../../services/auth.service";

export const login = createAsyncThunk(
  "/Auth/Login-Admin",
  async (requestObj, thunkAPI) => {
    try {
      const response = await AuthenticationService.signUp(requestObj);

      // console.log("toekne", token);
      return response.accessToken;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        get(error, "response.data.message", error)
      );
    }
  }
);

export const logout = createAsyncThunk("auth/logout", () => {
  AuthenticationService.logout();
});

const initialState = {
  loading: false,
  token: null,
  error: false,
  user: null,
  isLoggedIn: !!JSON.parse(localStorage.getItem("isLoggedIn")),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
  },
});

const { reducer, actions } = authSlice;

export const { setToken, setUser, setLoggedIn } = actions;
export default reducer;
