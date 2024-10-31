/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './Home.css'; // Ensure this path is correct

function Enginner_Home() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalInstitutions, setTotalInstitutions] = useState(0);
  const [institutionsData, setInstitutionsData] = useState([]);
  const [commentsData, setCommentsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [rolesDistribution, setRolesDistribution] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch total number of users
        const totalUsersRes = await axios.get('http://127.0.0.1:8000/account/total_users/');
        if (totalUsersRes.data.total_users) {
          setTotalUsers(totalUsersRes.data.total_users);
        }

        // Fetch total number of institutions
        const totalInstitutionRes = await axios.get('http://127.0.0.1:8000/institution/total_institutions/');
        if (totalInstitutionRes.data.total_institutions) {
          setTotalInstitutions(totalInstitutionRes.data.total_institutions);
        }

        // Fetch institutions data
        const institutionsRes = await axios.get('http://127.0.0.1:8000/institution/view_all_institutions/');
        if (institutionsRes.data) {
          setInstitutionsData(institutionsRes.data);
        }

        // Fetch comments data
        const commentsRes = await axios.get('http://127.0.0.1:8000/institution/view_all_comments/');
        if (commentsRes.data) {
          setCommentsData(commentsRes.data);
        }

        // Fetch users data
        const usersRes = await axios.get('http://127.0.0.1:8000/account/users_by_creation_date/');
        if (usersRes.data) {
          setUsersData(usersRes.data);
        }

        // Fetch user roles distribution
        const rolesDistributionRes = await axios.get('http://127.0.0.1:8000/account/user_roles_distribution/');
        if (rolesDistributionRes.data) {
          setRolesDistribution(rolesDistributionRes.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const formatDataForChart = (data, key) => {
    const dates = data.map(item => new Date(item[key]).toLocaleDateString());
    const counts = dates.reduce((acc, date) => {
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(counts),
      datasets: [
        {
          label: `Count of ${key}`,
          data: Object.values(counts),
          fill: false,
          backgroundColor: 'rgba(75,192,192,1)',
          borderColor: 'rgba(75,192,192,1)',
        }
      ]
    };
  };

  const formatDataForPieChart = (data) => {
    const labels = data.map(item => item.role);
    const counts = data.map(item => item.count);

    return {
      labels: labels,
      datasets: [
        {
          data: counts,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
        }
      ]
    };
  };

  const institutionsChartData = formatDataForChart(institutionsData, 'created_at');
  const commentsChartData = formatDataForChart(commentsData, 'created_at');
  const usersChartData = formatDataForChart(usersData, 'created_at');
  const rolesPieChartData = formatDataForPieChart(rolesDistribution);

  return (
    <div className='mt-20'>
      <h2 className='text-lg font-semibold mb-4 text-center text-black'>Reports</h2>

      <div className='flex flex-wrap justify-center'>
        {/* Total Users Card */}
        <div className='bg-white rounded-lg shadow-md p-4 m-4 max-w-sm'>
          <h3 className='text-md font-semibold text-black mb-2'>Total Users</h3>
          <p className='text-xl text-red-700 font-bold'>{totalUsers}</p>
        </div>

        {/* Total Institutions Card */}
        <div className='bg-white rounded-lg shadow-md p-4 m-4 max-w-sm'>
          <h3 className='text-md font-semibold text-black mb-2'>Total Institutions</h3>
          <p className='text-xl text-red-600 font-bold'>{totalInstitutions}</p>
        </div>
      </div>

      <div className='chart-container'>
        <div>
          <h3 className='text-md font-semibold text-black mb-2 text-center'>Institutions Over Time</h3>
          <Line data={institutionsChartData} />
        </div>

        <div>
          <h3 className='text-md font-semibold text-black mb-2 text-center'>Comments Over Time</h3>
          <Line data={commentsChartData} />
        </div>

        <div>
          <h3 className='text-md font-semibold text-black mb-2 text-center'>Users Over Time</h3>
          <Line data={usersChartData} />
        </div>

        <div className='w-1/2 h-min'>
          <h3 className='text-md font-semibold text-black mb-2 text-center'>User Roles Distribution</h3>
          <Pie data={rolesPieChartData} />
        </div>
      </div>
    </div>
  );
}

export default Enginner_Home;
