import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Store the last path whenever location changes
    if (!location.pathname.startsWith("/auth")) {
      window.sessionStorage.setItem("lastPath", location.pathname);
    }
  }, [location]);

  return null;
};

export default RouteTracker;
