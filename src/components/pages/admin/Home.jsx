/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./Home.css"; // Ensure this path is correct

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

        const engineerRes = await axios.get("http://127.0.0.1:8000/engineer/engineers/");
        setEngineerData(engineerRes.data);

        const plannerRes = await axios.get("http://127.0.0.1:8000/planner/planners/", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setPlannerData(plannerRes.data);

        const usersRes = await axios.get("http://127.0.0.1:8000/users/");
        setUsersData(usersRes.data.users);
        setTotalUsers(usersRes.data.users.length);

        const projectRes = await axios.get("http://127.0.0.1:8000/project/projects/", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
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

  const formatDataForLineChart = (data, dateField = "created_at", categoryField = "role", fill = false) => {
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
      const category = item[categoryField] || "Undefined";

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

    const datasets = Object.keys(categoryCounts).map((category) => ({
      label: category,
      data: dates.map((date) => parseInt(categoryCounts[category][date] || 0, 10)),
      borderColor: getRandomColor(),
      backgroundColor: fill ? getRandomColor() + "33" : "transparent", // 33 adds transparency for filled area
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
    const counts = labels.map((label) => data.filter((item) => item.status === label).length);

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
      <h2 className="text-lg font-semibold mb-4 text-center text-black">Reports</h2>

      <div className="chart-container">
        <div>
          <h3 className="text-md font-semibold text-black mb-2 text-center">
            Users Over Time by Role (Area Chart)
          </h3>
          <Line
            data={formatDataForLineChart(usersData, "created_at", "role", true)} // Fill set to true for area chart
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    callback: (value) => (Number.isInteger(value) ? value : null),
                  },
                },
              },
            }}
          />
        </div>

        {/* <div className="w-1/2 h-min">
          <h3 className="text-md font-semibold text-black mb-2 text-center">
            Planners Over Time by Status
          </h3>
          <Line
            data={formatDataForLineChart(plannerData, "created_at", "status")}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    callback: (value) => (Number.isInteger(value) ? value : null),
                  },
                },
              },
            }}
          />
        </div>

        <div className="w-1/2 h-min">
          <h3 className="text-md font-semibold text-black mb-2 text-center">
            Engineers Over Time by Status
          </h3>
          <Line
            data={formatDataForLineChart(enginnerData, "created_at", "status")}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    callback: (value) => (Number.isInteger(value) ? value : null),
                  },
                },
              },
            }}
          />
        </div> */}

        <div className="w-1/2 h-min">
          <h3 className="text-md font-semibold text-black mb-2 text-center">
            Project Status Over Time
          </h3>
          <Bar data={formatDataForHistogram(projectData)} />
        </div>

        <div className="w-1/2 h-min">
          <h3 className="text-md font-semibold text-black mb-2 text-center">
            Projects Over Time by Status
          </h3>
          <Line
            data={formatDataForLineChart(projectData, "created_at", "status")}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    callback: (value) => (Number.isInteger(value) ? value : null),
                  },
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
