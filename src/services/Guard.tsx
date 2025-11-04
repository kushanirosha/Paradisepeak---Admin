import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import ApiService from "./ApiService";

type PublicRouteProps = {
  element: React.ReactElement;
};

export const PublicRoute = ({ element }: PublicRouteProps) => {
  return ApiService.isAuthenticated() ? (
    <Navigate to="/home" replace />
  ) : (
    element
  );
};

type ProtectedRouteProps = {
  element: React.ReactElement;
};

export const ProtectedRoute = ({ element }: ProtectedRouteProps) => {
  const location = useLocation();
  return ApiService.isAuthenticated() ? (
    element
  ) : (
    <Navigate to="/" replace state={{ from: location }} />
  );
};

type AdminRouteProps = {
  element: React.ReactElement;
};

export const AdminRoute = ({ element }: AdminRouteProps) => {
    const location = useLocation();
  
    if (!ApiService.isAuthenticated()) {
      return <Navigate to="/" replace state={{ from: location }} />;
    }
  
    if (!ApiService.isAdmin()) {
      return <Navigate to="/" replace />;
    }
    return element;
  };
