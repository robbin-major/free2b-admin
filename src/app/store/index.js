import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../app/store/slice/auth';

const reducer = {
  auth: authReducer,
};

const store = configureStore({
  reducer,
  devTools: true,
});

export default store;
