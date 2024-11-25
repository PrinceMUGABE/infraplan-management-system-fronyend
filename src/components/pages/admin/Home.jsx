/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./Home.css"; // Ensure this path is correct
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function Home() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [enginnerData, setEngineerData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [engineerApplicationData, setEngineerApplicationData] = useState([]);
  const [plannerData, setPlannerData] = useState([]);

  const accessToken = JSON.parse(localStorage.getItem("userData"))?.access;

  const getToken = () => {
    return localStorage.getItem("token"); // Replace 'token' with your actual token key
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

        const engineerRes = await axios.get(
          "http://127.0.0.1:8000/engineer/engineers/"
        );
        setEngineerData(engineerRes.data);

        const plannerRes = await axios.get(
          "http://127.0.0.1:8000/planner/planners/",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setPlannerData(plannerRes.data);

        const usersRes = await axios.get("http://127.0.0.1:8000/users/");
        setUsersData(usersRes.data.users);
        setTotalUsers(usersRes.data.users.length);

        const projectRes = await axios.get(
          "http://127.0.0.1:8000/project/projects/",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setProjectData(projectRes.data);

        const engineerApplicationRes = await axios.get(
          `http://127.0.0.1:8000/engineer_application/all/`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setEngineerApplicationData(engineerApplicationRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const formatDataForLineChart = (
    data,
    dateField = "created_at",
    categoryField = "status",
    fill = false
  ) => {
    if (!Array.isArray(data)) {
      console.error("Expected data to be an array", data);
      return {
        labels: [],
        datasets: [],
      };
    }

    const categoryCounts = {};
    const dates = [];

    data.forEach((item) => {
      const date = new Date(item[dateField]).toLocaleDateString();
      const category = item[categoryField] || "Unknown"; // Use 'Unknown' for missing statuses

      if (!categoryCounts[category]) {
        categoryCounts[category] = {};
      }

      if (!categoryCounts[category][date]) {
        categoryCounts[category][date] = 0;
      }

      categoryCounts[category][date] += 1;

      if (!dates.includes(date)) {
        dates.push(date);
      }
    });

    // Ensure each category has data for every date
    Object.keys(categoryCounts).forEach((category) => {
      dates.forEach((date) => {
        if (!categoryCounts[category][date]) {
          categoryCounts[category][date] = 0;
        }
      });
    });

    const datasets = Object.keys(categoryCounts).map((category) => ({
      label: category,
      data: dates.map((date) => categoryCounts[category][date]),
   
    }));

    return {
      labels: dates,
      datasets,
    };
  };

  const formatDataForAreaChart = (
    data,
    dateField = "created_at",
    categoryField = "status",
    fill = false
  ) => {
    if (!Array.isArray(data)) {
      console.error("Expected data to be an array", data);
      return {
        labels: [],
        datasets: [],
      };
    }

    const categoryCounts = {};
    const dates = [];

    data.forEach((item) => {
      const date = new Date(item[dateField]).toLocaleDateString();
      const category = item[categoryField] || "Unknown"; // Use 'Unknown' for missing statuses

      if (!categoryCounts[category]) {
        categoryCounts[category] = {};
      }

      if (!categoryCounts[category][date]) {
        categoryCounts[category][date] = 0;
      }

      categoryCounts[category][date] += 1;

      if (!dates.includes(date)) {
        dates.push(date);
      }
    });

    // Ensure each category has data for every date
    Object.keys(categoryCounts).forEach((category) => {
      dates.forEach((date) => {
        if (!categoryCounts[category][date]) {
          categoryCounts[category][date] = 0;
        }
      });
    });

    const datasets = Object.keys(categoryCounts).map((category) => ({
      label: category,
      data: dates.map((date) => categoryCounts[category][date]),
      borderColor: getRandomColor(),
      backgroundColor: fill ? getRandomColor() + "33" : "transparent",
      fill: fill,
    }));

    return {
      labels: dates,
      datasets,
    };
  };

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const formatDataForHistogram = (data) => {
    const labels = [...new Set(data.map((item) => item.status))];
    const counts = labels.map(
      (label) => data.filter((item) => item.status === label).length
    );

    return {
      labels,
      datasets: [
        {
          label: "Project Status",
          data: counts,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    };
  };

  const labels = ["Applications", "Projects"];
  const applicationsCount = engineerApplicationData.length;
  const projectsCount = projectData.length;

  const populationPyramidData = {
    labels,
    datasets: [
      {
        label: "Applications",
        data: [applicationsCount, projectsCount],
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  };

  return (
    <div className="mt-20">
      <h2 className="text-lg font-semibold mb-4 text-center text-black">
        Reports
      </h2>

      <div className="chart-container">
        <div>
          <h3 className="text-md font-semibold text-black mb-2 text-center">
            Users Over Time by Role (Area Chart)
          </h3>
          <Line
            data={formatDataForAreaChart(usersData, "created_at", "role", true)}
            options={{
              scales: {
                x: {
                  stacked: true, // Enable stacking for x-axis if relevant
                },
                y: {
                  beginAtZero: true,
                  stacked: true, // Enable stacking for y-axis
                  ticks: {
                    stepSize: 0,
                    callback: (value) =>
                      Number.isInteger(value) ? value : null,
                  },
                },
              },
              plugins: {
                legend: {
                  display: true,
                  position: "top",
                },
              },
              elements: {
                line: {
                  tension: 0.4, // Smooth out lines
                },
                point: {
                  radius: 3,
                },
              },
            }}
          />
        </div>

        <div className="w-1/2 h-min">
          <h3 className="text-md font-semibold text-black mb-2 text-center">
            Project Status Over Time
          </h3>
          <Bar data={formatDataForHistogram(projectData)} />
        </div>

        <div>
          <h3 className="text-md font-semibold text-black mb-2 text-center">
            Projects Over Time by Status
          </h3>
          <Line
            data={formatDataForLineChart(projectData, "created_at", "status", true)}
            options={{
              scales: {
                
                y: {
                  beginAtZero: true,
                  
                  ticks: {
                    stepSize: 0,
                    callback: (value) =>
                      Number.isInteger(value) ? value : null,
                  },
                },
              },
              plugins: {
                legend: {
                  display: true,
                  position: "top",
                },
              },
              elements: {
                line: {
                  tension: 0.4, // Smooth out lines
                },
                point: {
                  radius: 3,
                },
              },
            }}
          />
        </div>

        <div className="w-1/2 h-min">
          <h3 className="text-md font-semibold text-black mb-2 text-center">
            Projects vs. Engineer Applications
          </h3>
          <Bar data={populationPyramidData} options={{ indexAxis: "y" }} />
        </div>
      </div>
    </div>
  );
}

export default Home;
