/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function Editproject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setproject] = useState({
    field: "",
    description: "",  // Fix typo here
    certificate: null,
  });
  const [error, setError] = useState("");
  const accessToken = JSON.parse(localStorage.getItem("userData"))?.access;

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  // Fetch the project data by ID
  useEffect(() => {
    const fetchproject = async () => {
      if (!accessToken) {
        setError("Unauthorized: Access token is missing.");
        return;
      }

      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/project/${id}/`,
          axiosConfig
        );
        if (response.status === 200) {
          setproject(response.data);
        } else {
          setError("Project not found.");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(
          "Failed to fetch project data. Please check your permissions."
        );
      }
    };

    fetchproject();
  }, [id, accessToken]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("field", project.field);
    formData.append("description", project.description);  // Fix typo here
    if (project.certificate) {
      formData.append("certificate", project.certificate);
    }

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/project/update/${id}/`,
        formData,
        axiosConfig
      );
      if (response.status === 200) {
        alert("Project updated successfully!");
        navigate("/admin/projects");
      }
    } catch (err) {
      console.error("Error updating project:", err);
      if (err.response && err.response.status === 401) {
        setError("Unauthorized: Please log in again.");
      } else {
        setError("Failed to update project data.");
      }
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setproject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file input change for the certificate
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setproject((prev) => ({
        ...prev,
        certificate: file,
      }));

      // If a file is uploaded, read its contents
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target.result;
        setproject((prev) => ({
          ...prev,
          description: fileContent,  // Set file content as description
        }));
      };
      reader.readAsText(file);  // Assuming the file is a text-based format
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-center text-black font-bold text-xl mb-4">
        Edit Project
      </h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-4">
          <label className="block text-gray-700">Field</label>
          <input
            type="text"
            name="field"
            value={project.field}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md p-2 text-gray-950"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            value={project.description}  // Fix typo here
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md p-2 text-gray-950"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Upload (WORD)</label>
          <input
            type="file"
            accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="mt-1 block w-full border rounded-md p-2 text-gray-950"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md"
        >
          Update
        </button>
      </form>
    </div>
  );
}

export default Editproject;
