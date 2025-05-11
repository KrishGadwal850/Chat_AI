import React, { useEffect, useRef } from "react";
import { useUser } from "../context/user.context";
import Navbar from "../components/Navbar";
import { useProjectContext } from "../context/project.context";
import { useNavigate } from "react-router-dom";
import LocomotiveScroll from "locomotive-scroll";

const Home = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { projects, fetchProjects } = useProjectContext();
  const scrollRef = useRef(null);
  useEffect(() => {
    const scroll = new LocomotiveScroll({
      el: scrollRef.current,
      smooth: true,
      lerp: 0.07,
      getDirection: true,
    });

    // Scroll to top on route change
    scroll.scrollTo(0, { duration: 0, disableLerp: true });

    // Fetch projects when the component mounts
    fetchProjects();

    return () => scroll.destroy();
  }, []);
  return (
    <main className="w-full h-[100vh]">
      <Navbar type={"create"} />
      <section className="p-4 text-white">
        {projects.length !== 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => (
              <div
                key={project._id}
                onClick={() => {
                  navigate(`/project`, {
                    state: { project },
                  });
                }}
                className="bg-gradient-to-r from-[#1E1E2F] to-[#2A2A3F] p-6 rounded-lg shadow-lg 
                hover:shadow-xl hover:scale-105 hover:from-[#252539] hover:to-[#323249] 
                transition-all duration-300 ease-in-out min-w-[250px] cursor-pointer"
              >
                <h2 className="text-xl mb-2 capitalize">{project.name}</h2>
                <p className="text-sm text-gray-400 mb-1 hover:text-gray-300">
                  Created by:{" "}
                  {project.users[0].email.split("@")[0] || "Unknown"}
                </p>
                <p className="text-sm text-gray-400 hover:text-gray-300">
                  Members: {project.users?.length || 0}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 h-[80vh] flex items-center justify-center">
            No Projects
          </p>
        )}
      </section>
    </main>
  );
};

export default Home;
