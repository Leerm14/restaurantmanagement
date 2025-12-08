import React from "react";
import { Navigate } from "react-router-dom";

type Role = "user" | "staff" | "admin";

interface ProtectRouterProps {
  children: React.ReactElement;
  isAuthenticated: boolean;
  userRole: Role | null;
  allowedRoles?: Role[];
}

const ProtectRouter: React.FC<ProtectRouterProps> = ({
  children,
  isAuthenticated,
  userRole,
  allowedRoles,
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

export default ProtectRouter;