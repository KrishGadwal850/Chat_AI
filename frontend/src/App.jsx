import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { UserContextProvider } from "./context/user.context";
import { ProjectProvider } from "./context/project.context";
// import LocomotiveScroll from "locomotive-scroll";

const App = () => {
  // const locomotiveScroll = new LocomotiveScroll();
  return (
    <UserContextProvider>
      <ProjectProvider>
        <AppRoutes />
      </ProjectProvider>
    </UserContextProvider>
  );
};

export default App;
