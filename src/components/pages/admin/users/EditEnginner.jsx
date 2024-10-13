/* eslint-disable no-unused-vars */
// Editengineer.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function EditEngineer() {
  const { id } = useParams(); // Get the engineer ID from the URL
  const navigate = useNavigate(); // For navigation after submission
  const [engineer, setengineer] = useState({
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

  // Fetch the engineer data by ID
  useEffect(() => {
    const fetchengineer = async () => {
      if (!accessToken) {
        setError("Unauthorized: Access token is missing.");
        return;
      }

      try {
        const response = await axios.get(`http://127.0.0.1:8000/engineer/${id}/`, axiosConfig);
        setengineer(response.data);
      } catch (err) {
        console.error("Error fetching engineer:", err);
        setError("Failed to fetch engineer data. Please check your permissions.");
      }
    };

    fetchengineer();
  }, [id, accessToken]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", engineer.email);
    formData.append("address", engineer.address);
    formData.append("no_experience", engineer.no_experience);
    if (engineer.certificate) {
      formData.append("certificate", engineer.certificate);
    }

    try {
      const response = await axios.put(`http://127.0.0.1:8000/engineer/update/${id}/`, formData, axiosConfig);
      if (response.status === 200) {
        alert("engineer updated successfully!");
        navigate("/admin/engineers"); // Redirect to the engineers list
      }
    } catch (err) {
      console.error("Error updating engineer:", err);
      if (err.response && err.response.status === 401) {
        setError("Unauthorized: Please log in again.");
      } else {
        setError("Failed to update engineer data.");
      }
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setengineer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file input change for the certificate
  const handleFileChange = (e) => {
    setengineer((prev) => ({
      ...prev,
      certificate: e.target.files[0],
    }));
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-center text-black font-bold text-xl mb-4">Edit engineer</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={engineer.email}
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
            value={engineer.address}
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
            value={engineer.no_experience}
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
          Update
        </button>
      </form>
    </div>
  );
}

export default EditEngineer;
