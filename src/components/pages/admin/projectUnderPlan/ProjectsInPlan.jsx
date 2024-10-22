/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";

function ManageProjectsInPlan() {
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

  const handleFetch = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/planned/projects/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setProjectData(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchUnplannedProjects = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/project/projects/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      const unplannedProjects = data.filter(
        (project) => project.status === "un_planned"
      );
      setUnplannedProjects(unplannedProjects);
    } catch (err) {
      console.error("Error fetching unplanned projects:", err);
    }
  };

  const fetchPlanners = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/planner/planners/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      setPlanners(data);
    } catch (err) {
      console.error("Error fetching planners:", err);
    }
  };

  useEffect(() => {
    handleFetch();
    fetchUnplannedProjects();
    fetchPlanners();
  }, []);

  const handleDelete = async (id) => {
    const conf = window.confirm("Do you want to delete this project?");
    if (conf) {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/planned/delete/${id}/`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (response.status === 204) {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProjectPlan({ ...newProjectPlan, [name]: value });
  };

  const handleFileChange = (e) => {
    setNewProjectPlan({ ...newProjectPlan, file: e.target.files[0] });
  };

  const handleCreateProjectPlan = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const formData = new FormData();
    formData.append("project", newProjectPlan.project);
    formData.append("planner", newProjectPlan.planner);
    formData.append("duration", newProjectPlan.duration);
    formData.append("cost", newProjectPlan.cost);
    formData.append("location", newProjectPlan.location);
    formData.append("file", newProjectPlan.file);

    try {
      const response = await fetch("http://127.0.0.1:8000/planned/create/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        const newProject = await response.json();
        setProjectData((prevData) => [...prevData, newProject]);
        setShowCreateForm(false);
      } else {
        const errorData = await response.json();
        setErrorMessage(
          errorData.error || "An error occurred while creating the project."
        );
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      console.error("Error creating project plan:", error);
    }
  };

  const fetchPlanDetails = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/planned/${id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch plan details");
      const data = await response.json();
      setPlanDetails(data);
      setShowDetailsModal(true); // Show modal after fetching details
    } catch (err) {
      console.error("Error fetching plan details:", err);
    }
  };

  const handleEditClick = (project) => {
    setNewProjectPlan({
      project: project.project.id,
      planner: project.planned_by.id,
      duration: project.duration,
      cost: project.cost,
      location: project.location,
      file: null, // Reset file on edit
    });
    setShowCreateForm(true);
    setEditingProject(project.id); // Set the current project id to edit
  };

  const filteredData = projectData.filter((project) =>
    project.project.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredData.slice(
    indexOfFirstProject,
    indexOfLastProject
  );
  const totalPages = Math.ceil(filteredData.length / projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">
        Manage Applied Project Plans
      </h1>
      <div className="flex flex-col sm:flex-row justify-between mb-4">
        <div className="flex flex-col sm:flex-row">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Create New Project Plan
          </button>
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="border rounded py-2 px-4 mt-2 sm:mt-0 sm:w-1/4 text-neutral-900"
        />
      </div>

      {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}

      {showCreateForm && (
        <form onSubmit={handleCreateProjectPlan} className="mb-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-2 text-neutral-900">Project</label>
              <select
                name="project"
                value={newProjectPlan.project}
                onChange={handleInputChange}
                className="border rounded w-full p-2 text-neutral-900"
                required
              >
                <option className="text-neutral-900" value="">
                  Select Project
                </option>
                {unplannedProjects.map((project) => (
                  <option
                    className="text-neutral-900"
                    key={project.id}
                    value={project.id}
                  >
                    {project.field}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-neutral-900">Planner</label>
              <select
                name="planner"
                value={newProjectPlan.planner}
                onChange={handleInputChange}
                className="border rounded w-full p-2 text-neutral-900"
                required
              >
                <option className="text-neutral-900" value="">
                  Select Planner
                </option>
                {planners.map((planner) => (
                  <option
                    className="text-neutral-900"
                    key={planner.id}
                    value={planner.id}
                  >
                    {planner.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-neutral-900">
                Duration (in days)
              </label>
              <input
                type="number"
                name="duration"
                value={newProjectPlan.duration}
                onChange={handleInputChange}
                className="border rounded w-full p-2 text-neutral-900"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-neutral-900">
                Cost (in USD)
              </label>
              <input
                type="number"
                name="cost"
                value={newProjectPlan.cost}
                onChange={handleInputChange}
                className="border rounded w-full p-2 text-neutral-900"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-neutral-900">Location</label>
              <input
                type="text"
                name="location"
                value={newProjectPlan.location}
                onChange={handleInputChange}
                className="border rounded w-full p-2 text-neutral-900"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-neutral-900">Upload File</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="border rounded w-full p-2 text-neutral-900"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-green-500 text-white py-2 px-4 rounded"
          >
            Create Project Plan
          </button>
        </form>
      )}

      {currentProjects.length === 0 ? (
        <p className="text-center">No projects found.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Project</th>
              <th className="border px-4 py-2">Planner</th>
              <th className="border px-4 py-2">Duration</th>
              <th className="border px-4 py-2">Cost</th>
              <th className="border px-4 py-2">Location</th>
              {/* <th className="border px-4 py-2">File</th> */}
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            S
            {currentProjects.map((project) => (
              <tr key={project.id} className="text-center">
                <td className="border px-4 py-2">
                  {project.project?.field || "N/A"}
                </td>
                <td className="border px-4 py-2">
                  {project.planned_by?.email || "N/A"}
                </td>
                <td className="border px-4 py-2">{project.duration}</td>
                <td className="border px-4 py-2">{project.cost}</td>
                <td className="border px-4 py-2">{project.location}</td>
                {/* <td className="border px-4 py-2">
                  {project.file ? (
                    <a
                      href={project.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View File
                    </a>
                  ) : 'No File'}
                </td> */}
                <td className="border px-4 py-2">
                  <button
                    onClick={() => fetchPlanDetails(project.id)}
                    className="text-blue-600 hover:underline"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleEditClick(project)}
                    className="text-green-600 hover:underline ml-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-red-600 hover:underline ml-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`mx-1 border rounded px-2 py-1 ${
              currentPage === index + 1
                ? "bg-blue-500 text-white"
                : "text-blue-500"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Modal for Plan Details */}
      {showDetailsModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-18/20 md:w-1/2 max-h-80 overflow-auto">
            <h2 className="text-xl font-bold mb-4 text-blue-700 text-center">
              Project Plan Details
            </h2>
            {planDetails ? (
              <div className="flex flex-row">
                {planDetails.image && ( // Image on the right
                  <div className="flex flex-col ">
                    <strong className="text-black mb-2">Image:</strong>
                    <img
                      className="h-full w-full rounded" // Ensuring the image scales correctly
                      src={`data:image/jpeg;base64,${planDetails.image}`}
                      alt="Project Plan"
                    />
                  </div>
                )}

                <div className="flex flex-col mr-4">
                  {" "}
                  {/* Main details on the left */}
                  <p className="text-black">
                    <h2 className="text-blue-700 text-center">Planner</h2>{" "}
                  </p>
                  <p className="text-black">
                    <strong>Firstname:</strong>{" "}
                    {planDetails.planned_by?.created_by?.first_name || "N/A"}
                  </p>
                  <p className="text-black">
                    <strong>Lastname:</strong>{" "}
                    {planDetails.planned_by?.created_by || "N/A"}
                  </p>
                  <p className="text-black">
                    <strong>Phone:</strong>{" "}
                    {planDetails.planned_by?.created_by || "N/A"}
                  </p>
                  <p className="text-black">
                    <strong>Email:</strong>{" "}
                    {planDetails.planned_by?.email || "N/A"}
                  </p>
                  <p className="text-black">
                    <strong>Role:</strong> {planDetails.planned_by?.created_by || "N/A"}
                  </p>

                  <p className="text-black">
                    <strong>Location:</strong> {planDetails.planned_by?.address || "N/A"}
                  </p>

                  <p className="text-black">
                    <strong>Experience:</strong>{" "}
                    {planDetails.planned_by?.no_experience || "N/A"} years
                  </p>

                  <p className="text-black">
                    <strong>Joined Date:</strong>{" "}
                    <span className="text-red-700 font-semibold">
                      {new Date(planDetails.planned_by?.created_at).toLocaleDateString(
                        "en-GB"
                      )}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col  mr-4">
                  {" "}
                  {/* Main details on the left */}
                  <h2 className="text-center text-blue-700">Project</h2>
                  <p className="text-black">
                    <strong>Sector:</strong>{" "}
                    {planDetails.project?.field || "N/A"}
                  </p>
          
                  <p className="text-black">
                    <strong>Place of implementation:</strong>{" "}
                    {planDetails.location || "N/A"}
                  </p>
    
                  <p className="text-black">
                    <strong>Duration:</strong> {planDetails.duration} days
                  </p>
                  <p className="text-black">
                    <strong>Cost:</strong> {planDetails.cost} FRW
                  </p>
                  <p className="text-black">
                    <strong>Status:</strong> {planDetails.status}
                  </p>
                  <p className="text-black">
                    <strong>Panned date:</strong>{" "}
                    <span className="text-red-700 font-semibold">
                      {new Date(planDetails.created_at).toLocaleDateString(
                        "en-GB"
                      )}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <p>Loading details...</p>
            )}
            <button
              onClick={() => setShowDetailsModal(false)}
              className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ManageProjectsInPlan;
