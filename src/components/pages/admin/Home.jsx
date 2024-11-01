/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import './Home.css'; // Ensure this path is correct

function Home() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [institutionsData, setInstitutionsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [projectData, setProjectData] = useState([]);

  const accessToken = JSON.parse(localStorage.getItem("userData"))?.access;

  // Function to get the token from local storage
  const getToken = () => {
    return localStorage.getItem('token'); // Replace 'token' with your actual token key
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        const institutionsRes = await axios.get('http://127.0.0.1:8000/engineer/engineers/');
        setInstitutionsData(institutionsRes.data);

        const usersRes = await axios.get('http://127.0.0.1:8000/users/');
        setUsersData(usersRes.data.users);
        setTotalUsers(usersRes.data.users.length);

        const projectRes = await axios.get('http://127.0.0.1:8000/project/projects/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setProjectData(projectRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const formatDataForLineChart = (data) => {
    if (!Array.isArray(data)) {
      console.error('Expected data to be an array', data);
      return {
        labels: [],
        datasets: [],
      };
    }

    const roleCounts = {};
    const dates = [];

    // Count users by role and date
    data.forEach(item => {
      const date = new Date(item.created_at).toLocaleDateString(); // Get the formatted date
      const role = item.role;

      if (!roleCounts[role]) {
        roleCounts[role] = {};
      }

      // Initialize the count for the specific date
      if (!roleCounts[role][date]) {
        roleCounts[role][date] = 0;
      }

      // Increment count for this role on this date
      roleCounts[role][date] += 1;

      // Ensure the date is recorded for chart labels
      if (!dates.includes(date)) {
        dates.push(date);
      }
    });

    // Prepare the datasets for the chart
    const datasets = Object.keys(roleCounts).map(role => ({
      label: role,
      data: dates.map(date => Math.floor(roleCounts[role][date] || 0)), // Ensure positive integers without decimals
      borderColor: getRandomColor(),
      fill: false,
    }));

    return {
      labels: dates,
      datasets,
    };
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Function to format data for histogram chart
  const formatDataForHistogram = (data) => {
    const labels = [...new Set(data.map(item => item.status))]; // Unique project statuses
    const counts = labels.map(label => data.filter(item => item.status === label).length);

    return {
      labels,
      datasets: [{
        label: 'Project Status',
        data: counts,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      }],
    };
  };

  // Function to format data for planned projects chart
  const formatDataForPlannedProjects = (data) => {
    const plannedCounts = {};
    
    data.forEach(item => {
      const date = new Date(item.created_at).toLocaleDateString(); // Assuming planned_date exists
      if (!plannedCounts[date]) {
        plannedCounts[date] = 0;
      }
      plannedCounts[date] += 1;
    });

    const labels = Object.keys(plannedCounts);
    const counts = Object.values(plannedCounts).map(count => Math.floor(count)); // Ensure positive integers

    return {
      labels,
      datasets: [{
        label: 'Planned Projects Over Time',
        data: counts,
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
      }],
    };
  };

  // Example data for Population Pyramid
  const labels = ['Applications', 'Projects'];
  const applicationsCount = usersData.length; // or whatever data source you have
  const projectsCount = projectData.length; // Assuming projectData contains your projects
  
  const populationPyramidData = {
    labels,
    datasets: [
      {
        label: 'Applications',
        data: [applicationsCount, projectsCount],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  return (
    <div className='mt-20'>
      <h2 className='text-lg font-semibold mb-4 text-center text-black'>Reports</h2>

      <div className='chart-container'>
        <div>
          <h3 className='text-md font-semibold text-black mb-2 text-center'>Users Over Time by Role</h3>
          <Line data={formatDataForLineChart(usersData)} />
        </div>

        <div className='w-1/2 h-min'>
          <h3 className='text-md font-semibold text-black mb-2 text-center'>Planners Over Time</h3>
          <Line data={formatDataForLineChart(institutionsData)} />
        </div>

        <div className='w-1/2 h-min'>
          <h3 className='text-md font-semibold text-black mb-2 text-center'>Engineers Over Time</h3>
          <Line data={formatDataForLineChart(institutionsData)} />
        </div>

        <div className='w-1/2 h-min'>
          <h3 className='text-md font-semibold text-black mb-2 text-center'>Project Status Over Time</h3>
          <Bar data={formatDataForHistogram(projectData)} />
        </div>

        <div className='w-1/2 h-min'>
          <h3 className='text-md font-semibold text-black mb-2 text-center'>Planned Projects Over Time by Status</h3>
          <Line data={formatDataForPlannedProjects(projectData)} />
        </div>

        <div className='w-1/2 h-min'>
          <h3 className='text-md font-semibold text-black mb-2 text-center'>Projects vs. Engineer Applications</h3>
          <Bar data={populationPyramidData} options={{ indexAxis: 'y' }} />
        </div>
      </div>
    </div>
  );
}

export default Home;
