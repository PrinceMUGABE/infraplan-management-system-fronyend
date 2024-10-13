/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './Home.css'; // Ensure this path is correct

function Home() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [institutionsData, setInstitutionsData] = useState([]);
  const [usersData, setUsersData] = useState([]);

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

        // Fetch institutions data
        const institutionsRes = await axios.get('http://127.0.0.1:8000/engineer/engineers/');
        console.log('Institutions Data:', institutionsRes.data);
        if (Array.isArray(institutionsRes.data)) {
          setInstitutionsData(institutionsRes.data);
        } else {
          console.error('Expected engineers data to be an array');
        }

        // Fetch users data
        const usersRes = await axios.get('http://127.0.0.1:8000/users/');
        console.log('Users Data:', usersRes.data);
        if (usersRes.data && Array.isArray(usersRes.data.users)) {
          setUsersData(usersRes.data.users);
          setTotalUsers(usersRes.data.users.length);
        } else {
          console.error('Expected users data to be an array');
        }

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

    // Prepare datasets for each role
    const datasets = Object.keys(roleCounts).map(role => {
      const dataPoints = dates.map(date => roleCounts[role][date] || 0); // Use 0 if no users on that date
      return {
        label: role,
        data: dataPoints,
        fill: false,
        borderColor: getRandomColor(), // Random color for each role
      };
    });

    return {
      labels: Array.from(new Set(dates)), // Unique dates
      datasets: datasets,
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

  const usersChartData = formatDataForLineChart(usersData);

  return (
    <div className='mt-20'>
      <h2 className='text-lg font-semibold mb-4 text-center text-black'>Reports</h2>

      <div className='flex flex-wrap justify-center'>
        {/* Total Users Card */}
        <div className='bg-white rounded-lg shadow-md p-4 m-4 max-w-sm'>
          <h3 className='text-md font-semibold text-black mb-2'>Total Users</h3>
          <p className='text-xl text-red-700 font-bold'>{totalUsers}</p>
        </div>
      </div>

      <div className='chart-container'>
        <div>
          <h3 className='text-md font-semibold text-black mb-2 text-center'>Users Over Time by Role</h3>
          <Line data={usersChartData} />
        </div>

        <div className='w-1/2 h-min'>
          <h3 className='text-md font-semibold text-black mb-2 text-center'>Planners Over Time</h3>
          <Line data={formatDataForLineChart(institutionsData)} />
        </div>

        <div className='w-1/2 h-min'>
          <h3 className='text-md font-semibold text-black mb-2 text-center'>Engineers Over Time</h3>
          <Line data={formatDataForLineChart(institutionsData)} />
        </div>
      </div>
    </div>
  );
}

export default Home;
