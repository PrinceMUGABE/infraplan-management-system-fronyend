/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Project_Owner_Home() {
  const [projectData, setProjectData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(9);
  const [searchQuery, setSearchQuery] = useState("");
  const [setNewProject] = useState({
    field: "",
    description: "",
    file: null,
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    duration: "",
    cost: "",
    location: "",
    image: null,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const accessToken = JSON.parse(localStorage.getItem("userData"))?.access;
  const navigate = useNavigate();

  // Fetch projects
  const handleFetch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/project/projects/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      setProjectData(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setErrorMessage("Failed to load projects. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter unplanned projects and search
  const filteredData = projectData.filter(
    (project) =>
      project.status === "un_planned" &&
      (project.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination logic
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredData.slice(
    indexOfFirstProject,
    indexOfLastProject
  );
  const totalPages = Math.ceil(filteredData.length / projectsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Fetch project details
  const handleViewDetails = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/project/${id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch project details");
      const data = await response.json();
      setSelectedProject(data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error fetching project details:", error);
      setErrorMessage("Failed to load project details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Open modal for planning the project
  const handleTakeProject = (project) => {
    setSelectedProject(project);
    setShowPlanModal(true);
    setFormData({
      duration: "",
      cost: "",
      location: "",
      image: null,
    });
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Convert image to base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          // Remove data URL prefix and get only the base64 string
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // File size validation (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("File size should be less than 5MB");
        e.target.value = null;
        return;
      }
      
      // File type validation
      if (!file.type.startsWith('image/')) {
        setErrorMessage("Please upload an image file");
        e.target.value = null;
        return;
      }
      
      setFormData({ ...formData, image: file });
      setErrorMessage("");
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validation for numeric fields
    if (name === "duration") {
      if (value === "" || (parseFloat(value) > 0 && parseFloat(value) <= 60)) {
        setFormData({ ...formData, [name]: value });
      }
    } else if (name === "cost") {
      if (value === "" || (parseFloat(value) > 0 && parseFloat(value) <= 1000000000)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission
  const handleSubmitPlan = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    // Validation
    if (!formData.duration || !formData.cost || !formData.location) {
      setErrorMessage("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    // Create FormData object
    const form = new FormData();
    form.append("project", selectedProject.id);
    form.append("duration", parseInt(formData.duration) * 30); // Convert months to days
    form.append("cost", parseFloat(formData.cost));
    form.append("location", formData.location);

    if (formData.image) {
      try {
        const base64Image = await convertImageToBase64(formData.image);
        form.append("image", base64Image);
      } catch (error) {
        setErrorMessage("Error processing image. Please try again.");
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/planned/create/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      });

      const data = await response.json();

      if (response.status === 201) {
        setSuccessMessage("Project plan created successfully!");
        setTimeout(() => {
          setShowPlanModal(false);
          navigate("/planner/projects");
        }, 2000);
      } else {
        // Handle specific error cases
        if (data.error === "Planner profile not found for this user.") {
          setErrorMessage("You must have a planner profile to submit plans.");
        } else if (data.error === "A planner can plan a project only once.") {
          setErrorMessage("You have already submitted a plan for this project.");
        } else {
          setErrorMessage(data.error || "Failed to create project plan.");
        }
      }
    } catch (error) {
      console.error("Error creating project plan:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  useEffect(() => {
    handleFetch();
  }, []);

  

  return (
    <>
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">
        These projects need planners
      </h1>
      <div className="flex flex-col sm:flex-row justify-between mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="border rounded py-2 px-4 mt-2 sm:mt-0 sm:w-1/4 text-gray-700"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto max-w-7xl px-32 mr-10">
        {currentProjects.map((project) => (
          <div
            key={project.id}
            className="border rounded p-4 shadow hover:shadow-lg transition"
          >
            <h3 className="font-bold text-blue-900">Field: {project.field}</h3>
            <p className="text-gray-600">Status: {project.status}</p>

            <button
              onClick={() => handleViewDetails(project.id)}
              className="text-white  bg-blue-700 hover:bg-red-700 cursor-pointer rounded py-1 px-2 ml-20 mt-2"
            >
              View
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Modal for Project Details */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded shadow-lg w-11/12 sm:w-3/4 md:w-1/2 max-h-[90vh] flex flex-col">
            <h2 className="text-lg font-bold text-red-700 text-center">
              Project Details
            </h2>
            {selectedProject && selectedProject.created_by ? (
              <div className="flex flex-col md:flex-row mt-4 overflow-y-auto flex-grow">
                {/* User Details Section */}
                <div className=" p-4 rounded md:w-1/2 md:mr-2">
                  <h3 className="font-bold text-blue-900">Project Owner</h3>
                  <p className="text-black">
                    <strong>First Name:</strong>{" "}
                    <span className="text-gray-700">
                      {selectedProject.created_by.first_name}
                    </span>
                  </p>
                  <p className="text-black">
                    <strong>Last Name:</strong>{" "}
                    <span className="text-gray-700">
                      {selectedProject.created_by.last_name}
                    </span>
                  </p>
                  <p className="text-black">
                    <strong>Phone:</strong>{" "}
                    <span className="text-gray-700">
                      {selectedProject.created_by.phone}
                    </span>
                  </p>
                  <p className="text-black">
                    <strong>Joined date:</strong>{" "}
                    <span className="text-red-600">
                      {new Date(
                        selectedProject.created_by.created_at
                      ).toLocaleDateString("en-GB")}
                    </span>
                  </p>
                </div>

                {/* Project Details Section */}
                <div className=" p-4 rounded md:w-1/2 md:ml-2">
                  <h3 className="font-bold text-blue-900">Project Details</h3>
                  <p className="text-black">
                    <strong>Field:</strong>{" "}
                    <span className="text-gray-700">
                      {selectedProject.field}
                    </span>
                  </p>
                  <p className="text-black">
                    <strong>Description:</strong>{" "}
                    <span className="text-gray-700">
                      {selectedProject.description}
                    </span>
                  </p>
                  <button
                    className="mt-4 bg-green-500 text-white py-2 px-4 rounded self-center"
                    onClick={() => handleTakeProject(selectedProject)}
                  >
                    Take It
                  </button>
                </div>
              </div>
            ) : (
              <p>Loading project owner details...</p>
            )}

            <button
              onClick={() => setShowDetailsModal(false)}
              className="mt-4 bg-red-500 text-white py-2 px-4 rounded self-center"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Plan Project Modal */}
      {showPlanModal && selectedProject && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded shadow-lg w-11/12 sm:w-3/4 md:w-1/2">
            <h2 className="text-lg font-bold mb-4 text-center text-red-700">
              Plan This Project
            </h2>
            <form className="flex flex-col">
              <label className="font-bold text-black">How long will the project take (in months)?</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="mb-4 p-2 border rounded text-gray-700"
              />

              <label className="font-bold text-black">How much will the project take? (FRW)</label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleInputChange}
                className="mb-4 p-2 border rounded text-gray-700"
              />

              <label className="font-bold text-black">Where will the project be implemented?</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="mb-4 p-2 border rounded text-gray-700"
              />

              <label className="font-bold text-black">Image (optional):</label>
              <input
                type="file"
                name="image"
                onChange={handleFileChange}
                className="mb-4 p-2 border rounded text-gray-700"
              />

              <button
                type="button"
                onClick={handleSubmitPlan}
                className="bg-green-500 text-white py-2 px-4 rounded"
              >
                Submit Plan
              </button>
            </form>

            <button
              onClick={() => setShowPlanModal(false)}
              className="mt-4 bg-red-500 text-white py-2 px-4 rounded self-center"
            >
              Close
            </button>

            {errorMessage && (
              <p className="mt-2 text-red-500 font-semibold">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="mt-2 text-green-500 font-semibold">
                {successMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Project_Owner_Home;
