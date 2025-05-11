import React, { createContext, useState, useContext } from "react";
import axiosInstance from "../config/axios";

// For Single Project
export const CurrentProjectContext = createContext();
export const useProject = () => useContext(CurrentProjectContext);

// For All Projects
const ProjectContext = createContext();
export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get("/project/getProjects");
      console.log(response.data);
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  return (
    <ProjectContext.Provider value={{ projects, setProjects, fetchProjects }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => useContext(ProjectContext);
