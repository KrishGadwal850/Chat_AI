import React from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Login from "../screen/Login";
import Register from "../screen/Register";
import Home from "../screen/Home";
import Project from "../screen/Project";
import UserAuthentication from "../authentication/user.auth";
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <UserAuthentication>
              <Home />
            </UserAuthentication>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/project"
          element={
            <UserAuthentication>
              <Project />
            </UserAuthentication>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
