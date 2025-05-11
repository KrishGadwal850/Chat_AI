import axiosInstance from "../../config/axios";
import React, { useState, useEffect } from "react";
import { useProject } from "../../context/project.context";
const AddCollabButton = () => {
  const { currentProject, fetchCurrentProject } = useProject();
  const [showModal, setShowModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const fetchUsers = async () => {
    try {
      await axiosInstance.get("/user/allUsers").then((res) => {
        // Filter out the current user from the list of all users
        const filteredUsers = res.data.filter(
          (user) =>
            !currentProject.users.some((collab) => collab._id === user._id)
        );
        console.log("Filtered Users:");
        setAllUsers(filteredUsers);
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, [currentProject]);

  const toggleUserSelection = (user) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    );
  };

  const handleAddCollaborators = async () => {
    // Implement your logic to add collaborators here
    try {
      const userIds = selectedUsers.map((user) => user._id);
      await axiosInstance
        .put("/project/addUser", {
          projectId: currentProject._id,
          users: userIds,
        })
        .then((res) => {
          // console.log("Response from server:");
          // console.log(res.data);
          fetchCurrentProject(currentProject._id);
          setShowModal(false);
          setSelectedUsers([]);
          console.log("Collaborators added successfully");
        })
        .catch((err) => {
          console.log(err);
        });
      // Optionally, you can show a success message or update the UI
    } catch (error) {
      console.error("Error adding collaborators:", error);
    }
  };

  return (
    <>
      <button
        className="w-fit p-2 flex gap-2 bg-neutral-100 hover:bg-neutral-200 transition-colors rounded-sm text-neutral-950 cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <i class="ri-add-line"></i>
        <span>Add Collaborator</span>
      </button>
      {showModal && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/40 z-50 backdrop-blur-sm"
          onClick={() => {
            setSelectedUsers([]);
            setShowModal(false);
          }}
        >
          <div
            className="flex flex-col bg-white rounded-sm shadow-2xl p-8 w-[95%] max-w-[25rem] relative animate-fade-in"
            style={{
              height: "500px",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors"
              onClick={() => {
                setSelectedUsers([]);
                setShowModal(false);
              }}
              aria-label="Close"
            >
              <i className="ri-close-line"></i>
            </button>
            <h2 className="text-xl font-bold mb-6 text-gray-800 text-center">
              All Users
            </h2>
            <div className="flex-1 overflow-y-auto mb-4">
              {allUsers.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">No users found.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {allUsers?.map((user) => {
                    const isSelected = selectedUsers.some(
                      (u) => u._id === user._id
                    );
                    // Create avatar from email (first letter before @, uppercase)
                    // Generate avatar URL using DiceBear (or similar) based on email
                    const avatarUrl = user.email
                      ? `/cdn/api/?name=${encodeURIComponent(
                          user.email.split("@")[0]
                        )}&background=FE6D38&color=fff&size=128&font-size=0.5&bold=true&rounded=true&length=1&background=random&color=random&size=128&font-size=0.5&bold=true&rounded=true&length=1${encodeURIComponent(
                          user.email
                        )}`
                      : null;
                    return (
                      <li
                        key={user._id}
                        className={`py-3 px-2 mb-1 flex items-center gap-3 hover:bg-gray-50 rounded transition-colors cursor-pointer ${
                          isSelected ? "bg-blue-50" : ""
                        }`}
                        onClick={() => toggleUserSelection(user)}
                      >
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={user.email}
                            className="w-8 h-8 rounded-full object-cover bg-blue-100"
                          />
                        ) : (
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-lg">
                            ?
                          </span>
                        )}
                        <span className="text-gray-700 flex-1">
                          {user.email.split("@")[0] || "Unknown"}
                        </span>
                        {isSelected && (
                          <span className="text-green-600 font-semibold text-sm">
                            <i className="ri-checkbox-circle-line"></i>
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            {selectedUsers.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2 text-sm">
                  Selected Users:
                </h3>
                <div
                  className="flex gap-2 overflow-x-auto max-w-full"
                  style={{
                    paddingBottom: "2px",
                  }}
                >
                  {selectedUsers.map((user) => (
                    <span
                      key={user._id}
                      className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs whitespace-nowrap"
                    >
                      {user.email.split("@")[0] || "Unknown"}
                      <button
                        className="ml-1 text-blue-400 hover:text-blue-700"
                        onClick={() => toggleUserSelection(user)}
                        aria-label={`Remove ${user.email.split("@")[0]}`}
                        type="button"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <button
              className="w-full mt-2 bg-[#FE6D38] hover:bg-[rgb(227,97,50)] text-white py-2 rounded transition-colors font-semibold disabled:opacity-50"
              onClick={handleAddCollaborators}
              disabled={selectedUsers.length === 0}
            >
              Add as Collaborator{selectedUsers.length > 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AddCollabButton;
