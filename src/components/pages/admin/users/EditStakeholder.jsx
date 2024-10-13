/* eslint-disable no-unused-vars */
// EditPlanner.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function EditStakeholder() {
  const { id } = useParams(); // Get the planner ID from the URL
  const navigate = useNavigate(); // For navigation after submission
  const [planner, setPlanner] = useState({
    email: "",
    address: "",
    monthly_income: "",
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
        const response = await axios.get(
          `http://127.0.0.1:8000/stakeholder/${id}/`,
          axiosConfig
        );
        setPlanner(response.data);
      } catch (err) {
        console.error("Error fetching planner:", err);
        setError(
          "Failed to fetch stakeholder data. Please check your permissions."
        );
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
    formData.append("monthly_income", planner.monthly_income);
  
    try {
      const response = await axios.put(`http://127.0.0.1:8000/stakeholder/update/${id}/`, formData, axiosConfig);
      if (response.status === 200) {
        alert("Stakeholder updated successfully!");
        navigate("/admin/stakeholders");
      }
    } catch (err) {
      console.error("Error updating planner:", err);
  
      // If there is a response from the server, display the validation errors
      if (err.response && err.response.data) {
        const errorMsg = Object.values(err.response.data).join(" ");
        setError(errorMsg); // Set error message to display
      } else if (err.response && err.response.status === 401) {
        setError("Unauthorized: Please log in again.");
      } else {
        setError("Failed to update stakeholder data.");
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
      <h1 className="text-center text-black font-bold text-xl mb-4">
        Edit Planner
      </h1>
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
          <label className="block text-gray-700">Monthly Income</label>
          <input
            type="number"
            name="monthly_income" // Changed from "no_experience"
            value={planner.monthly_income}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md p-2 text-gray-950"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md"
        >
          Update Stakeholder
        </button>
      </form>
    </div>
  );
}

export default EditStakeholder;
