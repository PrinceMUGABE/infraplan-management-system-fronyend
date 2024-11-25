/* eslint-disable no-unused-vars */
import React, {useState ,useEffect} from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import axios from "axios";


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



const fetchWithAuth = async (url) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Data from", url, ":", response.data);
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error.response ? error.response.data : error.message);
  }
};

const getPlanners = () => {
  fetchWithAuth("http://127.0.0.1:8000/planner/planners/");
};

const getEngineers = () => {
  fetchWithAuth("http://127.0.0.1:8000/engineer/engineers/");
};

const getStakeholders = () => {
  fetchWithAuth("http://127.0.0.1:8000/stakeholder/stakeholders/");
};

// useEffect(() => {
//   if (localStorage.getItem('token')) {
//     getPlanners();
//     getEngineers();
//     getStakeholders();
//   }
// }, []);


export default PrivateRoute;