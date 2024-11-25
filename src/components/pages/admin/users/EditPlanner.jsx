/* eslint-disable no-unused-vars */
// EditPlanner.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function EditPlanner() {
  const { id } = useParams(); // Get the planner ID from the URL
  const navigate = useNavigate(); // For navigation after submission
  const [planner, setPlanner] = useState({
    email: "",
    address: "",
    no_experience: "",
    certificate: null,
  });
  const [error, setError] = useState("");
  const accessToken = JSON.parse(localStorage.getItem("userData"))?.access;

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  // Fetch the planner data by ID
  useEffect(() => {
    const fetchPlanner = async () => {
      if (!accessToken) {
        setError("Unauthorized: Access token is missing.");
        return;
      }

      try {
        const response = await axios.get(`http://127.0.0.1:8000/planner/${id}/`, axiosConfig);
        setPlanner(response.data);
      } catch (err) {
        console.error("Error fetching planner:", err);
        setError("Failed to fetch planner data. Please check your permissions.");
      }
    };

    fetchPlanner();
  }, [id, accessToken]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", planner.email);
    formData.append("address", planner.address);
    formData.append("no_experience", planner.no_experience);
    if (planner.certificate) {
      formData.append("certificate", planner.certificate);
    }

    try {
      const response = await axios.put(`http://127.0.0.1:8000/planner/update/${id}/`, formData, axiosConfig);
      if (response.status === 200) {
        alert("Planner updated successfully!");
        navigate("/admin/planners"); // Redirect to the planners list
      }
    } catch (err) {
      console.error("Error updating planner:", err);
      if (err.response && err.response.status === 401) {
        setError("Unauthorized: Please log in again.");
      } else {
        setError("Failed to update planner data.");
      }
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlanner((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file input change for the certificate
  const handleFileChange = (e) => {
    setPlanner((prev) => ({
      ...prev,
      certificate: e.target.files[0],
    }));
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-center text-black font-bold text-xl mb-4">Edit Planner</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={planner.email}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md p-2 text-gray-950"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={planner.address}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md p-2 text-gray-950"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">No of Experiences</label>
          <input
            type="number"
            name="no_experience"
            value={planner.no_experience}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md p-2 text-gray-950"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Certificate (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="mt-1 block w-full border rounded-md p-2 text-gray-950"
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md">
          Update Planner
        </button>
      </form>
    </div>
  );
}

export default EditPlanner;
