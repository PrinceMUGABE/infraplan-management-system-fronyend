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

  const handleAcceptProject = async (projectId) => {
    const token = localStorage.getItem('token');  // Retrieve token from local storage
    if (!token) {
        console.error('No token found');
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/planned/accept/${projectId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,  // Add JWT token
            },
            credentials: 'include',  // Include credentials to allow cookies/auth headers
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Project accepted successfully:', data);

    } catch (error) {
        console.error('Error accepting project plan:', error);
    }
};



const handleRejectProject = async (projectId) => {
  const token = localStorage.getItem('token');
  if (!token) {
      console.error('No token found');
      return;
  }

  try {
      const response = await fetch(`http://127.0.0.1:8000/planned/reject/${projectId}/`, {  // Corrected port
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',  // Include credentials if needed
      });

      if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();  // Capture response data
      console.log('Project rejected successfully:', data);
  } catch (error) {
      console.error('Error rejecting project plan:', error);
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

  const handleCreateOrUpdateProjectPlan = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Use FormData to handle the file upload
    const formData = new FormData();
    formData.append("project", newProjectPlan.project);
    formData.append("planner", newProjectPlan.planner);
    formData.append("duration", newProjectPlan.duration);
    formData.append("cost", newProjectPlan.cost);
    formData.append("location", newProjectPlan.location);
    formData.append("file", newProjectPlan.file);

    try {
      const url = editingProject
        ? `http://127.0.0.1:8000/planned/update/${editingProject}/`
        : "http://127.0.0.1:8000/planned/create/";

      const method = editingProject ? "PUT" : "POST"; // Use PUT for update

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData, // Sends the file as binary data automatically
      });

      if (response.ok) {
        const newProject = await response.json();
        setProjectData((prevData) =>
          editingProject
            ? prevData.map((project) =>
                project.id === newProject.id ? newProject : project
              )
            : [...prevData, newProject]
        );
        setShowCreateForm(false);
        setEditingProject(null); // Reset editing project
      } else {
        const errorData = await response.json();
        setErrorMessage(
          errorData.error ||
            "An error occurred while creating/updating the project."
        );
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      console.error("Error creating/updating project plan:", error);
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
      console.log("Fetched Plan Details:", data);
      setPlanDetails(data);
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Error fetching plan details:", err);
    }
  };

  const handleEditClick = (project) => {
    setNewProjectPlan({
      project: project.project.id,
      planner: project.planned_by.id, // Get the planner ID for the select dropdown
      duration: project.duration,
      cost: project.cost,
      location: project.location,
      file: null, // Reset file on edit
    });
    setShowCreateForm(true);
    setEditingProject(project.id); // Set the current project id to edit
  };

  const filteredData = projectData.filter((project) => {
    const field = project?.project?.field || ""; // Fallback to empty string if undefined
    const email = project?.planned_by?.created_by?.phone || ""; // Correct the access to planned_by
    const location = project?.location || ""; // Fallback to empty string if undefined
    const status = project?.status || "";

    return (
      field.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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

  return (
    <>
      <h1 className="text-2xl font-bold mb-4 text-black text-center">
        Manage Project Plans
      </h1>
      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        className="bg-blue-500 text-white py-2 px-4 rounded"
      >
        {showCreateForm ? "Cancel" : "Create New Project Plan"}
      </button>

      {showCreateForm && (
        <form
          onSubmit={handleCreateOrUpdateProjectPlan}
          className="mb-4 border p-4 rounded-lg bg-gray-100 mx-auto" // Centering and making the form narrow
          style={{ maxWidth: "400px" }} // Limit form width
        >
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <label className="block mb-2 text-black">
            Project:
            <select
              name="project"
              value={newProjectPlan.project}
              onChange={handleInputChange}
              required
              className="block w-full border rounded py-2 px-3 text-gray-700"
            >
              <option value="">Select a project</option>
              {unplannedProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.field}
                </option>
              ))}
            </select>
          </label>
          <label className="block mb-2 text-black">
            Planner:
            <select
              name="planner"
              value={newProjectPlan.planner}
              onChange={handleInputChange}
              required
              className="block w-full border rounded py-2 px-3 text-gray-700"
            >
              <option value="">Select a planner</option>
              {planners.map((planner) => (
                <option key={planner.id} value={planner.id}>
                  {planner.email}
                </option>
              ))}
            </select>
          </label>
          <label className="block mb-2 text-black">
            Duration:
            <input
              type="text"
              name="duration"
              value={newProjectPlan.duration}
              onChange={handleInputChange}
              required
              className="block w-full border rounded py-2 px-3 text-gray-700"
            />
          </label>
          <label className="block mb-2 text-black">
            Cost:
            <input
              type="text"
              name="cost"
              value={newProjectPlan.cost}
              onChange={handleInputChange}
              required
              className="block w-full border rounded py-2 px-3 text-gray-700"
            />
          </label>
          <label className="block mb-2 text-black">
            Location:
            <input
              type="text"
              name="location"
              value={newProjectPlan.location}
              onChange={handleInputChange}
              required
              className="block w-full border rounded py-2 px-3 text-gray-700"
            />
          </label>
          <label className="block mb-2 text-black">
            File:
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full border rounded py-2 px-3 text-gray-700"
            />
          </label>
          <button
            type="submit"
            className="mt-4 bg-green-500 text-white py-2 px-4 rounded"
          >
            {editingProject ? "Update Project Plan" : "Save Project Plan"}
          </button>
        </form>
      )}

      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search by project, planner, or location..."
        className="mb-4 border rounded py-2 px-3 text-gray-700 ml-96"
      />

      <table className="min-w-full border border-gray-300">
        <thead className="bg-blue-700">
          <tr>
            <th className="p-2">Project</th>
            <th className="p-2">Planner</th>
            <th className="p-2">Duration</th>
            <th className="p-2">Cost</th>
            <th className="p-2">Location</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentProjects.map((project) => (
            <tr key={project.id}>
              <td className="p-2 text-gray-700">{project.project.field}</td>
              <td className="p-2 text-gray-700">{project.planned_by?.created_by?.phone}</td>
              <td className="p-2 text-gray-700">{project.duration}</td>
              <td className="p-2 text-gray-700">{project.cost}</td>
              <td className="p-2 text-gray-700">{project.location}</td>
              <td className="p-2 text-gray-700">{project.status}</td>
              <td className="p-2">
                <button
                  onClick={() => fetchPlanDetails(project.id)}
                  className="bg-yellow-500 text-white py-1 px-2 rounded mr-2"
                >
                  View
                </button>
                <button
                  onClick={() => handleEditClick(project)}
                  className="bg-blue-500 text-white py-1 px-2 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="bg-red-500 text-white py-1 px-2 rounded"
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

      {/* Modal for Plan Details */}
      {planDetails ? (
        <div className="flex flex-col">
          <div className="flex flex-row">
            {planDetails.image && (
              <div className="flex flex-col">
                <strong className="text-black mb-2">Image:</strong>
                <img
                  className="h-1/2 w-1/2 rounded"
                  src={`data:image/jpeg;base64,${planDetails.image}`} // Corrected line
                  alt="Project Plan"
                />
              </div>
            )}

            <div className="flex flex-col mr-4">
              <h2 className="text-blue-700 text-center">Planner</h2>
              <p className="text-black">
                <strong>Firstname:</strong>{" "}
                {planDetails.planned_by?.created_by?.first_name || "N/A"}
              </p>
              <p className="text-black">
                <strong>Lastname:</strong>{" "}
                {planDetails.planned_by?.created_by?.last_name || "N/A"}
              </p>
              <p className="text-black">
                <strong>Phone:</strong>{" "}
                {planDetails.planned_by?.created_by?.phone || "N/A"}
              </p>
              <p className="text-black">
                <strong>Email:</strong> {planDetails.planned_by?.email || "N/A"}
              </p>
              <p className="text-black">
                <strong>Role:</strong>{" "}
                {planDetails.planned_by?.created_by?.role || "N/A"}
              </p>
              <p className="text-black">
                <strong>Location:</strong>{" "}
                {planDetails.planned_by?.address || "N/A"}
              </p>
              <p className="text-black">
                <strong>Experience:</strong>{" "}
                {planDetails.planned_by?.no_experience || "N/A"} years
              </p>
              <p className="text-black">
                <strong>Joined Date:</strong>{" "}
                <span className="text-red-700 font-semibold">
                  {new Date(
                    planDetails.planned_by?.created_by?.created_at
                  ).toLocaleDateString("en-GB")}
                </span>
              </p>
            </div>

            <div className="flex flex-col mr-4">
              <h2 className="text-center text-blue-700">Project</h2>
              <p className="text-black">
                <strong>Sector:</strong> {planDetails.project?.field || "N/A"}
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
                <strong>Planned date:</strong>{" "}
                <span className="text-red-700 font-semibold">
                  {new Date(planDetails.created_at).toLocaleDateString("en-GB")}
                </span>
              </p>
            </div>
          </div>

          <p className="text-black">
            <h2 className="text-blue-700 text-center font-bold">
              Project details:
            </h2>{" "}
            <br />
            <span className="text-gray-700 font-semibold">
              {planDetails?.project?.description}
            </span>
          </p>
          <br />
          <br />
          <h2 className="text-center text-blue-700 font-bold mb-5">
            Project idea owner
          </h2>

          <p className="text-black">
            <strong>Firstname:</strong>{" "}
            {planDetails.project?.created_by?.first_name || "N/A"}
          </p>
          <p className="text-black">
            <strong>Firstname:</strong>{" "}
            {planDetails.project?.created_by?.last_name || "N/A"}
          </p>
          <p className="text-black">
            <strong>Firstname:</strong>{" "}
            {planDetails.project?.created_by?.phone || "N/A"}
          </p>
          <p className="text-black">
            <strong>Planned date:</strong>{" "}
            <span className="text-red-700 font-semibold">
              {new Date(planDetails?.project?.created_at).toLocaleDateString(
                "en-GB"
              )}
            </span>
          </p>

          <div className="flex flex-col space-y-4"> {/* Use space-y-4 to add vertical space between buttons */}
  <div className="flex flex-row">
    <button
      className="flex-grow px-4 py-2 bg-green-700 mt-4 self-center w-full text-white"
      onClick={() => handleAcceptProject(planDetails.id)}
    >
      Accept
    </button>
  </div>

  <div className="flex flex-row">
    <button
      className="flex-grow px-4 py-2 bg-orange-700 mt-4 self-center w-full text-white"
      onClick={() => handleRejectProject(planDetails.id)}
    >
      Reject
    </button>
  </div>

  <div className="flex flex-row">
    <button
      className="flex-grow px-4 py-2 bg-red-700 mt-4 self-center w-full text-white"
      onClick={closeModal}
    >
      Close
    </button>
  </div>
</div>

        </div>
      ) : (
        <p>Loading details...</p>
      )}
    </>
  );
}

export default ManageProjectsInPlan;
