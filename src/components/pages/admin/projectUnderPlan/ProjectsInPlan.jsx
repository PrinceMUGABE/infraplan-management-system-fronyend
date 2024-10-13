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

  const accessToken = JSON.parse(localStorage.getItem("userData"))?.access;

  // Fetch all planned projects
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

  // Fetch unplanned projects for the dropdown
  // Fetch unplanned projects for the dropdown
const fetchUnplannedProjects = async () => {
  try {
    const response = await fetch("http://127.0.0.1:8000/project/projects/", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();

    // Assuming the status field is 'status' and 'unplanned' projects have a specific status value like 'unplanned'
    const unplannedProjects = data.filter((project) => project.status === "un_planned");
    
    setUnplannedProjects(unplannedProjects);
  } catch (err) {
    console.error("Error fetching unplanned projects:", err);
  }
};


  // Fetch available planners for the dropdown
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

  // Handle delete project
  const handleDelete = async (id) => {
    const conf = window.confirm("Do you want to delete this project?");
    if (conf) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/planned/delete/${id}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (response.status === 204) {
          setProjectData((prevProjectData) => prevProjectData.filter((project) => project.id !== id));
        } else {
          alert("Failed to delete project");
        }
      } catch (err) {
        console.error("Error deleting project", err);
        alert("An error occurred while deleting the project");
      }
    }
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle project plan form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProjectPlan({ ...newProjectPlan, [name]: value });
  };

  // Handle file input for image upload
  const handleFileChange = (e) => {
    setNewProjectPlan({ ...newProjectPlan, file: e.target.files[0] });
  };

  // Handle creating a new project plan
  const handleCreateProjectPlan = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("project", newProjectPlan.project);
    formData.append("planner", newProjectPlan.planner);
    formData.append("duration", newProjectPlan.duration);
    formData.append("cost", newProjectPlan.cost);
    formData.append("location", newProjectPlan.location);
    formData.append("file", newProjectPlan.file); // Image file

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
        console.error("Failed to create project plan");
      }
    } catch (error) {
      console.error("Error creating project plan:", error);
    }
  };

  // Filter project data based on search query
  const filteredData = projectData.filter(
    (project) =>
      project.project.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredData.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredData.length / projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">
        Manage Applied Project Plans
      </h1>
      <div className="flex flex-col sm:flex-row justify-between mb-4">
        <div className="flex flex-col sm:flex-row">
          {/* Button to toggle project creation form */}
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

      {/* Create Project Plan Form */}
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
                <option className="text-neutral-900" value="">Select Project</option>
                {unplannedProjects.map((project) => (
                  <option className="text-neutral-900" key={project.id} value={project.id}>
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
                <option className="text-neutral-900" value="">Select Planner</option>
                {planners.map((planner) => (
                  <option className="text-neutral-900" key={planner.id} value={planner.id}>
                    {planner.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-neutral-900">Duration (in days)</label>
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
              <label className="block mb-2 text-neutral-900">Cost</label>
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
              <label className="block mb-2 text-neutral-900">Image</label>
              <input
                type="file"
                name="file"
                onChange={handleFileChange}
                className="border rounded w-full p-2 text-neutral-900"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white py-2 px-4 mt-4 rounded"
          >
            Submit
          </button>
        </form>
      )}

      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 border-collapse">
        <thead className="px-5 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th className="py-2 px-5">Planner</th>
            <th className="py-2 px-5">Project</th>
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
              <td className="py-2 px-5">{project.planned_by.email}</td>
              <td className="py-2 px-5">{project.project.field}</td>
              <td className="py-2 px-5">{project.status}</td>
              <td className="py-2 flex space-x-4">
                <button
                  // onClick={() => handleViewDetails(project.id)}
                  className="text-blue-500 hover:underline cursor-pointer"
                >
                  View Details
                </button>
                <a
                  href={`/admin/editProject/${project.id}`}
                  className="text-blue-600 px-2 py-1 rounded"
                >
                  Edit
                </a>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="text-red-500 hover:underline cursor-pointer"
                >
                  Delete
                </button>
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

      {/* Modal for Project Details */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded shadow-lg w-11/12 sm:w-3/4 md:w-1/2 max-h-[90vh] flex flex-col">
            <h2 className="text-lg font-bold text-red-700 text-center">
              Project Details
            </h2>
            {selectedProject && (
              <div className="flex flex-col md:flex-row mt-4 overflow-y-auto flex-grow">
                {/* User Details */}
                <div className="flex-1 mr-0 md:mr-2">
                  <h3 className="text-lg font-bold">Project:</h3>
                  <p>{selectedProject.field}</p>
                  <h3 className="text-lg font-bold">Description:</h3>
                  <p>{selectedProject.description}</p>
                  {/* Add more project details as necessary */}
                </div>
              </div>
            )}
            <button
              className="mt-4 bg-blue-500 text-white py-2 rounded"
              onClick={() => setShowDetailsModal(false)}
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
