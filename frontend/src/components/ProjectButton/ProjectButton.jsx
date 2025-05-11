import React, { useState } from "react";
import axios from "../../config/axios";
import { useProjectContext } from "../../context/project.context";
const ProjectButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const { fetchProjects } = useProjectContext();
  const handleProjectCreate = (e) => {
    e.preventDefault();
    console.log(projectName);
    axios
      .post("/project/createProject", { name: projectName })
      .then((res) => {
        console.log(res);
        fetchProjects();
        setIsModalOpen(false);
        setProjectName("");
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-fit p-2 flex gap-2 bg-neutral-100 hover:bg-neutral-200 transition-colors rounded-sm  text-neutral-950 cursor-pointer"
      >
        <i class="ri-add-line"></i>
        <p>Create</p>
      </button>

      {/* Work here for modal animation */}

      {isModalOpen && (
        <div className="fixed bottom-[10%] left-1/2 transform -translate-x-1/2 w-[95vw] max-w-[25rem] bg-white rounded-sm shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Create New Project
            </h3>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
          <form onSubmit={handleProjectCreate}>
            <div className="mb-4">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex gap-2 justify-center bg-purple-700 text-white py-2 rounded-sm hover:bg-purple-800 transition-colors"
            >
              <i className="ri-add-line"></i>
              <p>Create Project</p>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ProjectButton;
