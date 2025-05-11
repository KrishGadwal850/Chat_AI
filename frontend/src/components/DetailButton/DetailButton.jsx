import React, { useState } from "react";
import { useProject } from "../../context/project.context";
const DetailButton = () => {
  const { currentProject } = useProject();
  const [open, setOpen] = useState(false);
  // console.log("Project" + currentProject);
  return (
    <>
      <button
        type="button"
        className="w-fit p-2 px-3 flex gap-1 bg-purple-700 hover:bg-purple-800 transition-colors text-white cursor-pointer rounded-sm"
        onClick={() => setOpen(true)}
      >
        <i className="ri-user-3-line"></i>
      </button>

      {/* Side panel with animation */}
      <section
        className={`fixed top-0 right-0 w-full max-w-[30rem] h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          &times;
        </button>

        {/* Users Section */}
        <div className="p-8 pt-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Project Users
          </h2>
          <div className="grid grid-cols-2 gap-5">
            {(currentProject?.users || []).map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 bg-gray-50 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <img
                  src={
                    user.avatar ||
                    `/cdn/api/?name=${encodeURIComponent(user.email)}`
                  }
                  alt={user.email}
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                />
                <div>
                  <div className="text-xs text-gray-500">
                    {user.email.split("@")[0]}
                  </div>
                </div>
              </div>
            ))}
            {(!currentProject.users || currentProject.users.length === 0) && (
              <div className="col-span-2 text-center text-gray-400 py-8">
                No users found for this project.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default DetailButton;
