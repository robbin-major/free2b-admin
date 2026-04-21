import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import store from "./app/store";
import { SnackbarProvider } from "notistack";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <SnackbarProvider maxSnack={1} preventDuplicate autoHideDuration={1500}>
      <Provider store={store}>
        <App />
      </Provider>
    </SnackbarProvider>
  </>
);
reportWebVitals();
