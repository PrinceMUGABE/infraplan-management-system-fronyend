/* eslint-disable no-unused-vars */
// PlannedProjects.js
import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";

function PlannedProjects() {
  const [plannedProjects, setPlannedProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const projectsPerPage = 9;
  const [successMessage, setSuccessMessage] = useState("");

  const accessToken = JSON.parse(localStorage.getItem("userData"))?.access;

  // Fetch planned projects
  useEffect(() => {
    const fetchPlannedProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/planned/projects/",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch planned projects");

        const data = await response.json();
        const acceptedProjects = data.filter(
          (project) => project.status === "accepted"
        );
        setPlannedProjects(acceptedProjects);
        setFilteredProjects(acceptedProjects);
      } catch (error) {
        console.error("Error fetching planned projects:", error);
        setErrorMessage(
          "Failed to load planned projects. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlannedProjects();
  }, [accessToken]);

  // Filter projects based on search query within the accepted status
  useEffect(() => {
    const filtered = plannedProjects.filter(
      (project) =>
        project.project?.field
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        project.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.cost?.toString().includes(searchQuery) ||
        project.duration?.toString().includes(searchQuery)
    );
    setFilteredProjects(filtered);
    setCurrentPage(1);
  }, [searchQuery, plannedProjects]);

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // Fetch specific project plan details
  const handleExploreClick = async (projectId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/planned/${projectId}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch project details");

      const data = await response.json();
      setSelectedProject(data);
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching project details:", error);
      setErrorMessage(
        "Failed to load project details. Please try again later."
      );
    }
  };

  // Handle funding application
  const applyForFunding = async () => {
    if (!selectedProject) return;
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const body = {
        project_id: selectedProject.project.id,
        user_token: accessToken,
      };

      const response = await fetch("http://127.0.0.1:8000/funded_project/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to apply for funding");
      }

      const responseData = await response.json();
      setSuccessMessage("Application successful!");
      setModalVisible(false); // Close modal after successful application
    } catch (error) {
      console.error("Error applying for funding:", error);
      setErrorMessage(error.message || "Failed to apply for funding. Please try again.");
    }
  };

  // Generate and download the PDF
  const downloadProjectPlanPDF = () => {
    const doc = new jsPDF();
  
    // Start adding project details to the PDF
    let yPosition = 20; // Starting Y position for text
    let xPosition = 200;
  
    // Add project details text
    doc.text(`Field: ${selectedProject.project.field}`, 20, yPosition);
    yPosition += 10; // Increase Y position for next line
    doc.text(`Status: ${selectedProject.status}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Duration: ${selectedProject.duration} months`, 20, yPosition);
    yPosition += 10;
    doc.text(`Cost: ${selectedProject.cost} FRW`, 20, yPosition);
    yPosition += 10;
    doc.text(`Location: ${selectedProject.location}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Planner: ${selectedProject.planned_by.created_by.phone}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Created at: ${selectedProject.created_at}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Description: ${selectedProject.project.description}`, 20, yPosition);
    yPosition += 20; // Add some space before adding the image
    xPosition += 200;
  
    // If there is an image, add it to the PDF
    if (selectedProject.image) {
      const image = new Image();
      image.src = `data:image/png;base64,${selectedProject.image}`;
      image.onload = () => {
        // Add image below text (Y position is already updated)
        const imageWidth = 100; // Set image width
        const imageHeight = 100; // Set image height
  
        // Make sure the image doesn't overflow the page
        if (yPosition + imageHeight < 280) {
          doc.addImage(image, 'PNG', 20, yPosition, imageWidth, imageHeight);
          yPosition += imageHeight + 10; // Update Y position after adding image
        } else {
          // If there's not enough space left, move image to the next page
          doc.addPage();
          doc.addImage(image, 'PNG', 20, 20, imageWidth, imageHeight);
          yPosition = imageHeight + 20; // Update Y position after adding image on new page
        }
        doc.save(`${selectedProject.project.field}_plan.pdf`);
      };
    } else {
      doc.save(`${selectedProject.project.field}_plan.pdf`);
    }
  };
  

  if (isLoading) return <p>Loading planned projects...</p>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-center font-bold text-xl mb-4 text-black">
        These projects have been planned and need stakeholders to fund them in
        implementation
      </h1>

      <input
        type="text"
        placeholder="Search by field, status, location, cost, or duration..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border rounded p-2 mb-4 w-full text-gray-700"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
        {currentProjects.map((project) => (
          <div
            key={project.id}
            className="border rounded-lg px-16 shadow-lg transition-transform transform hover:scale-105 ml-4"
          >
            {project.image && (
              <img
                src={`data:image/png;base64,${project.image}`}
                alt="Project"
                className="w-48 h-48 object-cover mt-2 rounded"
              />
            )}
            <h3 className="font-bold text-black">
              Field: {project.project?.field}
            </h3>
            <p className="text-black">
              <strong>Status:</strong>{" "}
              <span className="text-red-700">{project.status}</span>
            </p>
            <p className="text-black">
              <strong>Duration:</strong>{" "}
              <span className="text-gray-700">{project.duration} months</span>
            </p>
            <p className="text-black">
              <strong>Cost:</strong>{" "}
              <span className="text-gray-700">{project.cost} FRW</span>
            </p>
            <p className="text-black">
              <strong>Location:</strong>{" "}
              <span className="text-gray-700">{project.location}</span>
            </p>
            <button
              onClick={() => handleExploreClick(project.id)}
              className="text-blue-500 font-bold hover:text-red-700 mt-2 block"
            >
              Explore
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          Next
        </button>
      </div>

      <Modal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        className="w-98 h-98"
      >
        {selectedProject ? (
          <div className="w-98 h-98">
            <h2 className="font-bold text-xl mb-2 text-black text-center">
              Project Details
            </h2>
            <p className="text-black">
              <strong>Status:</strong>{" "}
              <span className="text-red-700">{selectedProject.status}</span>
            </p>
            <p className="text-black">
              <strong>Duration:</strong>{" "}
              <span className="text-gray-700">
                {selectedProject.duration} months
              </span>
            </p>
            <p className="text-black">
              <strong>Cost:</strong>{" "}
              <span className="text-gray-700">{selectedProject.cost} FRW</span>
            </p>
            <p className="text-black">
              <strong>Location:</strong>{" "}
              <span className="text-gray-700">{selectedProject.location}</span>
            </p>
            <p className="text-black">
              <strong>Planner:</strong>{" "}
              <span className="text-gray-700">
                {selectedProject.planned_by.created_by.phone}
              </span>
            </p>
            <p className="text-black">
              <strong>Created date:</strong>{" "}
              <span className="text-gray-700">
                {selectedProject.created_at}
              </span>
            </p>
            <div>
              <strong className="text-black">Project Description:</strong>
              <div className="mt-2 max-h-40 overflow-y-auto bg-white p-2 rounded">
                <p className="text-zinc-900">
                  {selectedProject.project.description}
                </p>
              </div>
            </div> <br /><br />

            <button
              onClick={applyForFunding}
              className="bg-blue-500 text-white font-bold py-2 px-4 mt-4 rounded"
            >
              Apply for Funding
            </button>

            {/* Download PDF Button */}
            <button
              onClick={downloadProjectPlanPDF}
              className="bg-yellow-500 text-white font-bold py-2 px-4 mt-4 rounded ml-4"
            >
              Download as PDF
            </button>
          </div>
        ) : (
          <p>Loading project details...</p>
        )}
      </Modal>
    </div>
  );
}

export default PlannedProjects;
