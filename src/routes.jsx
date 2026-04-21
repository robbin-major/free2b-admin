import React from "react";
import { Navigate, useRoutes } from "react-router-dom";
import AuthLogin from "./app/authentication/login";
import MatxLayout from "./app/component/maxLayout";
import NotFound from "./app/layout/sessions/NotFound";
import Users from "./app/component/users/Events";
import EventDetailsPage from "./app/component/users/EventDetailsPage";
import Events from "./app/component/users/Events";
import Category from "./app/component/category/Category";

function RedirectionWrapper({ to }) {
  const queryString = window.location.search;
  if (queryString) {
    return <Navigate to={`${to}${queryString}`} />;
  }
  return <Navigate to={to} />;
}
const Email = localStorage.getItem("email");

const routes = (isLoggedIn) => [
  {
    path: "/",
    element: isLoggedIn ? <MatxLayout /> : <RedirectionWrapper to="/login" />,
    children: [
      {
        index: true,
        element: <RedirectionWrapper to="/events/" />,
      },
      {
        path: "/events/",
        element: <Events />,
      },
      {
        path: "/category/",
        element: <Category />,
      },
      {
        path: "/events/details/:id",
        element: <EventDetailsPage />,
      },
    ],
  },
  {
    path: "/login",
    element: !isLoggedIn ? <AuthLogin /> : <RedirectionWrapper to="/events/" />,
  },
  { path: "*", element: <NotFound /> },
];

export default function Routes(props) {
  const { isLoggedIn } = props;
  return useRoutes(routes(isLoggedIn));
}
