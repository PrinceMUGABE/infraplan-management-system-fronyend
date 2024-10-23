/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";

function ManageProjects() {
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

  const handleFetch = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/project/projects/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) throw new Error('Network response was not ok');
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
        const response = await fetch(`http://127.0.0.1:8000/project/delete/${id}/`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
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
    const formData = new FormData();
    formData.append("field", newProject.field);
    formData.append("description", newProject.description);
    if (newProject.file) {
      formData.append("projectFile", newProject.file);
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/project/create/", {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });
      if (response.status === 201) {
        alert("Project created successfully!");
        setShowCreateForm(false);
        setNewProject({ field: "", description: "", file: null });
        handleFetch();
      } else {
        throw new Error('Failed to create project');
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
      if (!response.ok) throw new Error('Network response was not ok');
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
        setNewProject((prev) => ({
          ...prev,
          description: event.target.result, // Set the description to the file content
          file: file,
        }));
      };
      reader.readAsText(file); // Read the file content as text
    } else {
      setNewProject((prev) => ({
        ...prev,
        file: null,
      }));
    }
  };

  useEffect(() => {
    handleFetch();
  }, []);

  return (
    <>
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">
        Manage Projects
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
          className="border rounded py-2 px-4 mt-2 sm:mt-0 sm:w-1/4"
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

      <table className=" ml-20 w-5/6 text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 border-collapse">
        <thead className="px-5 text-xs text-white uppercase bg-blue-700">
          <tr>
            <th className="py-2 px-5">Owner</th>
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
              <td className="py-2 px-5">{project.created_by.phone}</td>
              <td className="py-2 px-5">{project.field}</td>
              <td className="py-2 px-5">{project.status}</td>
              <td className="py-2 flex space-x-4">
                <a
                  onClick={() => handleViewDetails(project.id)}
             
                  className="text-white bg-amber-700 white  hover:underline cursor-pointer rounded py-1 px-2"
                >
                  View
                </a>
                <a
                  href={`/admin/editProject/${project.id}`}
                  className="bg-blue-600 text-white px-2 py-1 rounded"
                >
                  Edit
                </a>
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

      {/* Modal for Project Details */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded shadow-lg w-11/12 sm:w-3/4 md:w-1/2 max-h-[90vh] flex flex-col">
            <h2 className="text-lg font-bold text-red-700 text-center">
              Project Details
            </h2>
            {selectedProject && (
              <div className="flex flex-col md:flex-row mt-4 overflow-y-auto flex-grow">
                {/* User Details Section */}
                <div className="bg-gray-200 p-4 rounded md:w-1/2 md:mr-2">
                  <h3 className="font-bold text-blue-900">User Information</h3>
                  <p><strong>First Name:</strong> {selectedProject.created_by.first_name}</p>
                  <p><strong>Last Name:</strong> {selectedProject.created_by.last_name}</p>
                  <p><strong>Phone:</strong> {selectedProject.created_by.phone}</p>
                  <p><strong>Role:</strong> {selectedProject.created_by.role}</p>
                  <p>
                    <strong>Joined date:</strong>{" "}
                    <span className="text-red-600">
                      {new Date(selectedProject.created_by.created_at).toLocaleDateString("en-GB")}
                    </span>
                  </p>
                </div>

                {/* Project Details Section */}
                <div className="bg-gray-300 p-4 rounded md:w-1/2 md:ml-2">
                  <h3 className="font-bold text-blue-900">Project Information</h3>
                  <p><strong>Title:</strong> {selectedProject.field}</p>
                  <div>
                    <strong>Description:</strong>
                    <div className="mt-2 max-h-40 overflow-y-auto bg-white p-2 rounded">
                      <p className="text-zinc-900">{selectedProject.description}</p>
                    </div>
                  </div>
                  <p>
                    <strong>Created at:</strong>{" "}
                    <span className="text-red-600">
                      {new Date(selectedProject.created_at).toLocaleDateString("en-GB")}
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

export default ManageProjects;
