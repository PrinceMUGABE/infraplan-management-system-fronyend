/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import FundedProjectModal from "./Funded_Project_Details";

function Enginner_Home() {
  const [projectData, setProjectData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(9);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const accessToken = JSON.parse(localStorage.getItem("userData"))?.access;

  const handleFetch = async () => {
    try {
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

  const filteredData = projectData.filter((project) => {
    const field = project?.funded_project?.project?.field || "";
    const email = project?.funded_project?.planned_by?.email || "";
    const location = project?.funded_project?.location || "";
    const status = project?.status || "";

    return (
      (field.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        status.toLowerCase().includes(searchQuery.toLowerCase())) &&
      status === "accepted"
    );
  });

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredData.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredData.length / projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

      if (!response.ok) throw new Error("Failed to fetch project details");

      const selectedProject = await response.json();
      setSelectedProject(selectedProject);
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Error fetching project details:", err);
    }
  };



  
  return (
    <>
      <h1 className="text-2xl font-bold mb-4 text-black text-center">
        Accepted Projects Needing Technicians
      </h1>

      <div className="mb-4 flex justify-between py-4">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by email or location..."
          className="border rounded py-2 px-3 text-gray-700 w-full max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentProjects.map((project) => (
          <div
            key={project.id}
            className="border border-gray-300 rounded-lg p-4 shadow-lg bg-white"
          >
            <h2 className="text-lg font-semibold text-blue-700 mb-2 text-center">
              Project: {project.funded_project?.project?.field}
            </h2>
            <p className="text-black">
              <strong>Duration:</strong> {project.funded_project?.duration} months
            </p>
            <p className="text-black">
              <strong>Cost:</strong> {project.funded_project?.cost} frw
            </p>
            <p className="text-black">
              <strong>Location:</strong> {project.funded_project?.location}
            </p>
            {/* <p className="text-black">
              <strong>Status:</strong>
              <span className="ml-2 px-2 py-1 rounded-full text-sm bg-green-100 text-green-800">
                {project.status || "accepted"}
              </span>
            </p> */}
            {/* <p className="text-black">
              <strong>Monthly Income:</strong> {project.created_by?.monthly_income}
            </p> */}
            <button
              onClick={() => fetchFundedProjectDetails(project.id)}
              className="mt-3 text-blue-600 underline flex items-center"
            >
              <FontAwesomeIcon icon={faEye} className="mr-2" />
              Show Details
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => paginate(index + 1)}
            className={`mx-1 py-2 px-4 rounded ${
              currentPage === index + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {showDetailsModal && (
        <FundedProjectModal
          show={showDetailsModal}
          handleClose={() => setShowDetailsModal(false)}
          projectDetails={selectedProject}
        />
      )}
    </>
  );
}

export default Enginner_Home;
