import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
const UserAuthentication = ({ children }) => {
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) {
      navigate("/login");
    } else {
      setLoading(false);
    }
  }, [navigate]);
  return (
    <>
      {loading ? (
        <div className="w-full h-screen text-amber-50 flex items-center justify-center">
          Loading...
        </div>
      ) : (
        children
      )}
    </>
  );
};

export default UserAuthentication;
