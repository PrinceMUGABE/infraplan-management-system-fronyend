/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem('userData'));
  const token = localStorage.getItem('token');

  // List of valid routes
  const validRoutes = {
    admin: ['/admin'],
    planner: ['/planner'],
    stakeholder: ['/stakeholder'],
    engineer: ['/engineer'],
    project_owner: ['/project_owner']
  };

  // If no authentication, redirect to login while preserving attempted path
  if (!userData || !token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const role = userData.role.trim().toLowerCase();
  const path = location.pathname;

  // Check if the current path starts with any valid route for the user's role
  const isValidRouteForRole = validRoutes[role]?.some(route => 
    path.startsWith(route)
  );



  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;