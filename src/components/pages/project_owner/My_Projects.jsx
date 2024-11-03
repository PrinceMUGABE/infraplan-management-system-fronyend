/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";

function ProjectOwners_ManageProjects() {
  const [projectData, setProjectData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    field: "",
    description: "",
    file: null,
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const accessToken = JSON.parse(localStorage.getItem("userData"))?.access;
  const user = JSON.parse(localStorage.getItem("userData"));

  const handleFetch = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/project/my-projects/",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setProjectData(data);
        console.log("Fetched projects:", data);
      } else {
        console.log("Error: No projects found in response");
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const handleDelete = async (id) => {
    const conf = window.confirm("Do you want to delete this project?");
    if (conf) {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/project/delete/${id}/`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (response.status === 204) {
          console.log("Project deleted successfully");
          setProjectData((prevProjectData) =>
            prevProjectData.filter((project) => project.id !== id)
          );
        } else {
          alert("Failed to delete project");
        }
      } catch (err) {
        console.error("Error deleting project", err);
        alert("An error occurred while deleting the project");
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredData = projectData.filter(
    (project) =>
      project.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredData.slice(
    indexOfFirstProject,
    indexOfLastProject
  );
  const totalPages = Math.ceil(filteredData.length / projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCreateProject = async (e) => {
    e.preventDefault();

    // Sanitize the input by trimming whitespace and checking for null characters
    const sanitizedDescription = newProject.description
      .replace(/\0/g, "")
      .trim();

    const formData = new FormData();
    formData.append("field", newProject.field);
    formData.append("description", sanitizedDescription); // Use the sanitized description
    if (newProject.file) {
      formData.append("projectFile", newProject.file);
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/project/create/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const responseBody = await response.json();
      if (response.ok) {
        alert("Project created successfully!");
        setShowCreateForm(false);
        setNewProject({ field: "", description: "", file: null });
        handleFetch();
      } else {
        console.error("Error creating project:", responseBody);
        alert(responseBody.error || "Failed to create project.");
      }
    } catch (err) {
      console.error("Error creating project:", err);
      alert("Failed to create project.");
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/project/${id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setSelectedProject(data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

  // New function to read the file content and set it as description
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result.replace(/\0/g, ""); // Remove null characters
        if (content.trim() === "") {
          alert("The file is empty or contains invalid content.");
          setNewProject({ ...newProject, description: "", file: null });
        } else {
          setNewProject((prev) => ({
            ...prev,
            description: content,
            file: file,
          }));
        }
      };
      reader.readAsText(file);
    } else {
      setNewProject((prev) => ({
        ...prev,
        file: null,
      }));
    }
  };

  const processChartData = () => {
    const createdAtCounts = {};
    const statusCounts = {};
  
    projectData.forEach((project) => {
      const date = new Date(project.created_at).toLocaleDateString();
      createdAtCounts[date] = (createdAtCounts[date] || 0) + 1;
  
      const status = project.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
  
    const labels = Object.keys(createdAtCounts);
    const createdData = Object.values(createdAtCounts);
  
    const statusLabels = Object.keys(statusCounts);
    const statusData = Object.values(statusCounts);
  
    return {
      lineChartData: {
        labels: labels,
        datasets: [
          {
            label: "Projects Created Over Time",
            data: createdData,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderWidth: 1,
          },
        ]
      },
      lineChartOptions: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      },
      pieChartData: {
        labels: statusLabels,
        datasets: [
          {
            data: statusData,
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
            ],
            hoverBackgroundColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
            ],
          },
        ],
      },
    };
  };


  const { lineChartData, pieChartData } = processChartData();

  useEffect(() => {
    handleFetch();
  }, []);

  return (
    <>
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">
        Welcome Back, <span className="text-red-500">{user.phone}</span>
      </h1>
      <div className="flex flex-col sm:flex-row justify-between mb-4">
        <div className="flex flex-col sm:flex-row">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded mb-2 sm:mb-0 sm:mr-2"
          >
            {showCreateForm ? "Cancel" : "Create New Project"}
          </button>
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="border rounded py-2 px-4 mt-2 sm:mt-0 sm:w-1/4 text-gray-500"
        />
      </div>

      {showCreateForm && (
        <form
          onSubmit={handleCreateProject}
          className="mb-4 p-4 border rounded bg-white shadow-md mx-auto max-w-md"
        >
          <h1 className="text-center text-black font-bold text-xl capitalize mb-4">
            Create new project
          </h1>
          <div className="flex flex-col items-center">
            <input
              type="text"
              placeholder="Field"
              value={newProject.field}
              onChange={(e) =>
                setNewProject({ ...newProject, field: e.target.value })
              }
              className="border rounded py-2 px-4 mb-2 w-full text-neutral-800"
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
              className="border rounded py-2 px-4 mb-2 w-full text-zinc-800"
              required
            />
            <input
              type="file"
              accept=".txt,.docx" // Allow text and docx files
              onChange={handleFileChange} // Use the new file change handler
              className="border mb-2 w-full"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded w-full"
            >
              Create Project
            </button>
          </div>
        </form>
      )}

      <table className=" ml-5 w-3/4 text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 border-collapse">
        <thead className=" text-xs w-auto text-white uppercase bg-blue-700">
          <tr>
            {/* <th className="py-2 px-5">Owner</th> */}
            <th className="py-2 px-5">Title</th>
            <th className="py-2 px-5">Status</th>
            <th className="py-2 px-5">Actions</th>
          </tr>
        </thead>
        <tbody className="px-5">
          {currentProjects.map((project) => (
            <tr
              key={project.id}
              className="px-5 odd:bg-white odd:dark:bg-white even:bg-gray-50 even:dark:bg-white"
            >
              {/* <td className="py-2 px-5">{project.created_by.phone}</td> */}
              <td className="py-2 px-5">{project.field}</td>
              <td className="py-2 px-5">{project.status}</td>
              <td className="py-2 flex space-x-4">
                <a
                  onClick={() => handleViewDetails(project.id)}
                  className="text-white bg-amber-700 white  hover:underline cursor-pointer rounded py-1 px-2"
                >
                  View
                </a>
                {/* <a
                  href={`/admin/editProject/${project.id}`}
                  className="bg-blue-600 text-white px-2 py-1 rounded"
                >
                  Edit
                </a> */}
                <a
                  onClick={() => handleDelete(project.id)}
                  className="text-white bg-red-700 white  hover:underline cursor-pointer rounded py-1 px-2"
                >
                  Delete
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === index + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-300"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <h2 className="text-center text-black font-bold text-xl capitalize mb-4">
        Project Statistics
      </h2>
      <div className="flex flex-col sm:flex-row justify-around">
      <div className="w-20 sm:w-1/2 p-2">
          <h3 className="text-lg font-bold text-center text-black">
            Projects Created Over Time
          </h3>
          <Line className="w-20 sm:w-60" data={lineChartData} />
        </div>
      <div className="w-10 sm:w-1/4 p-2"> {/* Adjusted width for the pie chart */}
        <h3 className="text-lg font-bold text-center text-black">
          Project Status Distribution
        </h3>
        <Pie className="w-20" data={pieChartData} />{/* Added options for aspect ratio */}
      </div>
    </div>

      {/* Modal for Project Details */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded shadow-lg w-11/12 sm:w-3/4 md:w-1/2 max-h-[90vh] flex flex-col">
            <h2 className="text-lg font-bold text-red-700 text-center">
              Project Details
            </h2>
            {selectedProject && (
              <div className=" mt-4 overflow-y-auto ">
              

                {/* Project Details Section */}
                <div className="bg-gray-300 p-4 rounded md:w-full md:ml-2">
                  <h3 className="font-bold text-blue-900">
                    Project Information
                  </h3>
                  <p>
                    <strong>Title:</strong> {selectedProject.field}
                  </p>
                  <div>
                    <strong>Description:</strong>
                    <div className="mt-2 max-h-40 overflow-y-auto bg-white p-2 rounded">
                      <p className="text-zinc-900">
                        {selectedProject.description}
                      </p>
                    </div>
                  </div>
                  <p>
                    <strong>Created at:</strong>{" "}
                    <span className="text-red-600">
                      {new Date(selectedProject.created_at).toLocaleDateString(
                        "en-GB"
                      )}
                    </span>
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => setShowDetailsModal(false)}
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded self-center"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ProjectOwners_ManageProjects;
