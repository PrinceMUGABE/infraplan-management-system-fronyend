/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // Import the spinner icon
import loginImage from "../../../assets/pictures/engineer_Picture.jpeg";

const EngineerRegistrationPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // State for errors
  const [newPlanner, setNewPlanner] = useState({
    email: "",
    address: "",
    no_experience: "",
    certificate: null,
  });

  // Get the access token from localStorage
  const accessToken = JSON.parse(localStorage.getItem("userData"))?.access;

  // Axios config with Authorization header
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  // Handle new planner form submission
  const handleCreatePlanner = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({}); // Reset errors at the beginning of each submission

    const formData = new FormData();
    formData.append("email", newPlanner.email);
    formData.append("address", newPlanner.address);
    formData.append("no_experience", newPlanner.no_experience);
    if (newPlanner.certificate) {
      formData.append("certificate", newPlanner.certificate);
    }

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/engineer/create/",
        formData,
        axiosConfig
      );
      if (res.status === 201) {
        alert("Engineer created successfully!");
        setNewPlanner({
          email: "",
          address: "",
          no_experience: "",
          certificate: null,
        });
        navigate("/engineer");
      }
    } catch (err) {
      // Capture and set errors returned by the backend
      if (err.response && err.response.data) {
        setErrors(err.response.data); // Set errors from the backend
      } else {
        alert("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex w-full max-w-4xl mx-auto shadow-lg rounded-lg overflow-hidden">
        {/* Image container */}
        <div className="hidden md:block w-1/2">
          <img
            src={loginImage}
            alt="login"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Form container */}
        <div className="w-full md:w-1/2 bg-white p-8">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center text-black">
              Engineer Registration Page
            </h2>
            {message && (
              <p className="text-green-500 text-center mb-4">{message}</p>
            )}

            <form
              onSubmit={handleCreatePlanner}
              className="mb-4 p-4 border rounded bg-white shadow-md max-w-md mx-auto"
            >
              <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  value={newPlanner.email}
                  onChange={(e) =>
                    setNewPlanner({ ...newPlanner, email: e.target.value })
                  }
                  className="mt-1 block w-full border rounded-md p-2 text-gray-950"
                  required
                />
                {errors.email && (
                  <p className="text-red-500">{errors.email[0]}</p>
                )}
                {errors.detail && (
                  <p className="text-red-500">{errors.detail}</p>
                )}{" "}
                {/* General error message */}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Address</label>
                <input
                  type="text"
                  value={newPlanner.address}
                  onChange={(e) =>
                    setNewPlanner({ ...newPlanner, address: e.target.value })
                  }
                  className="mt-1 block w-full border rounded-md p-2 text-gray-950"
                  required
                />
                {errors.address && (
                  <p className="text-red-500">{errors.address[0]}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">No of Experiences</label>
                <input
                  type="number"
                  value={newPlanner.no_experience}
                  onChange={(e) =>
                    setNewPlanner({
                      ...newPlanner,
                      no_experience: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border rounded-md p-2 text-gray-950"
                  required
                />
                {errors.no_experience && (
                  <p className="text-red-500">{errors.no_experience[0]}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Resume</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setNewPlanner({
                      ...newPlanner,
                      certificate: e.target.files[0],
                    })
                  }
                  className="mt-1 block w-full border rounded-md p-2 text-gray-950"
                />
                {errors.certificate && (
                  <p className="text-red-500">{errors.certificate[0]}</p>
                )}
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                    Creating...
                  </span>
                ) : (
                  "Create Engineer"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerRegistrationPage;
