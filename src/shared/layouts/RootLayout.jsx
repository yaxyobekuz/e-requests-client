// Router
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="pb-16">
      <Outlet />
    </div>
  );
};

export default RootLayout;
