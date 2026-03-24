// Router
import { Outlet } from "react-router-dom";

// Components
import BugReport from "../components/layout/BugReport";

const RootLayout = () => {
  return (
    <div className="bg-gray-100">
      <Outlet />
      <BugReport />
    </div>
  );
};

export default RootLayout;
