import { Navigate } from "react-router-dom";

const HomePage = () => {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/get-started" replace />;
};

export default HomePage;
