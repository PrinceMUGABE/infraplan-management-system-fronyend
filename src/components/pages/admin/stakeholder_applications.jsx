/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { jsPDF } from "jspdf"; // Importing jsPDF
import html2canvas from "html2canvas";
import FundedProjectModal from "./Funded_Project_Details";
import {faTrash } from "@fortawesome/free-solid-svg-icons";

function AdminManageStakeholder_Application() {
  const [projectData, setProjectData] = useState([]);
  const [unplannedProjects, setUnplannedProjects] = useState([]);
  const [planners, setPlanners] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectPlan, setNewProjectPlan] = useState({
    project: "",
    planner: "",
    duration: "",
    cost: "",
    location: "",
    file: null,
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [planDetails, setPlanDetails] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  const accessToken = JSON.parse(localStorage.getItem("userData"))?.access;
  const user = JSON.parse(localStorage.getItem("userData"));
  const userId = user ? user.id : null;

  const handleFetch = async () => {
    try {
      console.log("=== Fetching Project Data ===");
      console.log("Access Token:", accessToken);
      console.log("User ID:", userId);

      const response = await fetch(
        `http://127.0.0.1:8000/funded_project/projects/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();

      // Log the fetched data
      console.log("\n=== Received Project Data ===");
      console.log(`Total Projects: ${data.length}`);
      data.forEach((project, index) => {
        console.group(`Project ${index + 1}:`);
        console.log("ID:", project.id);
        console.log("Status:", project.status);
        console.log("Created At:", project.created_at);
        console.group("Stakeholder Details:");
        console.log("Email:", project.created_by.email);
        console.log("Address:", project.created_by.address);
        console.log("Monthly Income:", project.created_by.monthly_income);
        console.groupEnd();
        console.group("Project Details:");
        console.log("Duration:", project.funded_project.duration);
        console.log("Cost:", project.funded_project.cost);
        console.log("Location:", project.funded_project.location);
        console.groupEnd();
        console.groupEnd();
      });

      setProjectData(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  useEffect(() => {
    handleFetch();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProjectPlan({ ...newProjectPlan, [name]: value });
  };

  // Restrict file type to image formats and validate file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPEG, PNG, etc.)");
      setNewProjectPlan({ ...newProjectPlan, file: null });
      e.target.value = null; // Reset the file input
    } else {
      setNewProjectPlan({ ...newProjectPlan, file });
    }
  };

  // Transform data for Recharts
  const prepareChartData = () => {
    const statusCountByDate = {};

    projectData.forEach((project) => {
      const createdDate = new Date(project.created_at).toLocaleDateString();
      if (!statusCountByDate[createdDate]) {
        statusCountByDate[createdDate] = {
          date: createdDate,
          accepted: 0,
          rejected: 0,
          pending: 0,
        };
      }

      if (project.status === "accepted") {
        statusCountByDate[createdDate].accepted += 1;
      } else if (project.status === "rejected") {
        statusCountByDate[createdDate].rejected += 1;
      } else if (project.status === "pending") {
        statusCountByDate[createdDate].pending += 1;
      }
    });

    return Object.values(statusCountByDate);
  };

  const chartData = prepareChartData();
  // Custom Y-axis tick formatter to ensure whole numbers
  const formatYAxis = (value) => {
    return Math.floor(value);
  };

  const COLORS = ["#36A2EB", "#FF6384", "#63ffc1"];

  const filteredData = projectData.filter((project) => {
    const field = project?.funded_project?.project?.field || ""; // Fallback to empty string if undefined
    const phone = project?.created_by?.created_by?.phone || ""; // Correct the access to planned_by
    const location = project?.funded_project?.location || ""; // Fallback to empty string if undefined
    const status = project?.status || "";

    return (
      field.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredData.slice(
    indexOfFirstProject,
    indexOfLastProject
  );
  const totalPages = Math.ceil(filteredData.length / projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const closeModal = () => {
    setShowDetailsModal(false);
    setPlanDetails(null);
  };

  // Function to download table data as CSV
  const downloadCSV = () => {
    const csvRows = [];
    const headers = ["ID", "Project", "Status"];
    csvRows.push(headers.join(","));

    currentProjects.forEach((project) => {
      const row = [
        project.id,
        project.funded_project?.project?.title,
        project.status,
      ];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "my_funded_projects.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to download table data as PDF
  const downloadPDF = async () => {
    const input = document.getElementById("table-to-pdf");
    const canvas = await html2canvas(input);
    const data = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgWidth = 190; // PDF width
    const pageHeight = pdf.internal.pageSize.height;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(data, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(data, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("my_funded_projects.pdf");
  };

  const fetchFundedProjectDetails = async (id) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/funded_project/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch plan details");

      const selectedProject = await response.json();
      console.log("Fetched Plan Details:", selectedProject);
      setPlanDetails(selectedProject);
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Error fetching plan details:", err);
    }
  };


  const handleDeleteApplication = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this application?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/funded_project/delete/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      setProjectData(projectData.filter((project) => project.id !== id));
      alert("Project deleted successfully!");
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Failed to delete project");
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-4 text-black text-center">
        Manage Stakeholders Applications
      </h1>
      {/* <Link
        className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
        to={"/stakeholder"}
      >
        {showCreateForm ? "Cancel" : "Create New Project Plan"}
      </Link> */}

      <br />

      <div className="mb-4 flex justify-between py-4">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by email or location..."
          className="border rounded py-2 px-3 text-gray-700 w-full max-w-md"
        />
        <button
          onClick={downloadCSV}
          className="bg-green-500 text-white py-2 px-4 rounded"
        >
          Download CSV
        </button>
        <button
          onClick={downloadPDF}
          className="bg-blue-500 text-white py-2 px-4 rounded mr-4"
        >
          Download PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-blue-700 text-white">
            <tr>
              <th className="p-2">Stakeholder</th>
              <th className="py-2">Duration</th>
              <th className="y-2">Cost</th>
              <th className="py-2">Location</th>
              <th className="py-2">Status</th>
              <th className="py-2">Monthly Income</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentProjects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="p-2 text-gray-700">
                  {project.created_by?.created_by?.phone}
                </td>
                <td className="p-2 text-gray-700">
                  {project.funded_project?.duration} months
                </td>
                <td className="p-2 text-gray-700">
                  {project.funded_project?.cost} frw
                </td>
                <td className="p-2 text-gray-700">
                  {project.funded_project?.location}
                </td>
                <td className="p-2 text-gray-700">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      project.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : project.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {project.status || "pending"}
                  </span>
                </td>
                <td className="p-2 text-gray-700">
                  {project.created_by?.monthly_income}
                </td>
                <td>
                  <button
                    onClick={() => fetchFundedProjectDetails(project.id)}
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                    }}
                  >
                    <FontAwesomeIcon className="text-blue-500" icon={faEye} />
                  </button>

                  <button
                    onClick={() => handleDeleteApplication(project.id)}
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                    }}
                  >
                    <FontAwesomeIcon className="text-red-500 ml-6" icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => paginate(index + 1)}
            className={`mx-1 border border-gray-300 py-1 px-2 rounded ${
              currentPage === index + 1
                ? "bg-blue-500 text-white"
                : "text-black"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Charts Section */}
      <div className="flex flex-col md:flex-row justify-center mt-10 space-y-8 md:space-y-0">
        {/* Status Distribution Area Chart */}
        <div className="w-full md:w-1/2 p-4">
          <h2 className="text-center font-semibold text-lg mb-2 text-blue-700">
            Status Distribution Over Time
          </h2>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  tickFormatter={formatYAxis}
                  allowDecimals={false}
                  domain={[0, "auto"]}
                />
                <Tooltip formatter={(value) => Math.floor(value)} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="accepted"
                  stackId="1"
                  stroke="#36A2EB"
                  fill="#36A2EB"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="rejected"
                  stackId="1"
                  stroke="#FF6384"
                  fill="#FF6384"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  stackId="1"
                  stroke="#63ffc1"
                  fill="#63ffc1"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Line Chart */}
        <div className="w-full md:w-1/2 p-4">
          <h2 className="text-center font-semibold text-lg mb-2 text-blue-700">
            Project Status Trends
          </h2>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  tickFormatter={formatYAxis}
                  allowDecimals={false}
                  domain={[0, "auto"]}
                />
                <Tooltip formatter={(value) => Math.floor(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="accepted"
                  stroke="#36A2EB"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="rejected"
                  stroke="#FF6384"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="#63ffc1"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {showDetailsModal && (
        <FundedProjectModal
          show={showDetailsModal}
          handleClose={() => setShowDetailsModal(false)}
          projectDetails={planDetails}
        />
      )}
    </>
  );
}

export default AdminManageStakeholder_Application;
