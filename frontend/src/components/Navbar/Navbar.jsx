import React from "react";
import ProjectButton from "../ProjectButton";
import DetailButton from "../DetailButton";
import AddCollabButton from "../AddColabButton";
const Navbar = ({ type, details }) => {
  return (
    <nav className="w-full p-2 flex justify-between items-center">
      <p className="text-neutral-100">Chat_AI</p>
      {type === "create" && <ProjectButton />}
      {type === "detail" && (
        <section className="flex items-center gap-2">
          <AddCollabButton />
          <DetailButton />
        </section>
      )}
    </nav>
  );
};

export default Navbar;
