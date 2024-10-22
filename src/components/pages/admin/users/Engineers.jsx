/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

function ManageEngineers() {
  const [engineerData, setengineerData] = useState([]); // Initialize as an empty array
  const [currentPage, setCurrentPage] = useState(1);
  const [engineersPerPage] = useState(5); // Number of engineers per page
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false); // State to control form visibility
  const [users, setUsers] = useState([]); // State to store users
  const [newengineer, setNewengineer] = useState({
    userId: "", // For selected user
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

  // Fetch engineers from the API
  const handleFetch = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/engineer/engineers/", axiosConfig);
      console.log("API Response:", res.data); // Log the whole response

      if (Array.isArray(res.data) && res.data.length > 0) {
        setengineerData(res.data); // Set the fetched engineers in state
        console.log("Fetched engineers:", res.data); // Log engineers to the console
      } else {
        console.log("Error: No engineers found in response");
      }
    } catch (err) {
      console.error("Error fetching engineers:", err);
    }
  };

  // Fetch users for the dropdown
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/users/", axiosConfig); // Adjust this endpoint to your user API
      console.log("Fetched Users:", res.data); // Log fetched users for debugging

      // Access the users array properly
      if (Array.isArray(res.data.users)) { // Check for the users array
        setUsers(res.data.users); // Set users to the array
      } else {
        console.log("Expected an array of users but got:", res.data);
        setUsers([]); // Reset users if the response is not valid
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    handleFetch();
    fetchUsers(); // Fetch users on component mount
  }, []);

  const handleDelete = async (id) => {
    const conf = window.confirm("Do you want to delete this engineer?");
    if (conf) {
      try {
        const res = await axios.delete(
          `http://127.0.0.1:8000/engineer/delete/${id}/`,
          axiosConfig
        );
        if (res.status === 204) {
          console.log("engineer deleted successfully");
          setengineerData((prevengineerData) =>
            prevengineerData.filter((engineer) => engineer.id !== id)
          );
        } else {
          alert("Failed to delete engineer");
        }
      } catch (err) {
        console.error("Error deleting engineer", err);
        alert("An error occurred while deleting the engineer");
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({ html: "#engineer-table" });
    doc.save("engineers.pdf");
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(engineerData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "engineers");
    XLSX.writeFile(workbook, "engineers.xlsx");
  };

  const filteredData = engineerData.filter(
    (engineer) =>
      engineer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      engineer.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      engineer.created_at?.includes(searchQuery)
  );

  // Pagination logic
  const indexOfLastengineer = currentPage * engineersPerPage;
  const indexOfFirstengineer = indexOfLastengineer - engineersPerPage;
  const currentengineers = filteredData.slice(indexOfFirstengineer, indexOfLastengineer);
  const totalPages = Math.ceil(filteredData.length / engineersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle new engineer form submission
  // State to store error messages
const [errorMessage, setErrorMessage] = useState("");

const handleCreateengineer = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append("userId", newengineer.userId);
  formData.append("email", newengineer.email);
  formData.append("address", newengineer.address);
  formData.append("no_experience", newengineer.no_experience);
  if (newengineer.certificate) {
    formData.append("certificate", newengineer.certificate);
  }

  try {
    const res = await axios.post("http://127.0.0.1:8000/engineer/create/", formData, axiosConfig);
    if (res.status === 201) {
      alert("Engineer created successfully!");
      setShowCreateForm(false); // Hide form after successful creation
      setNewengineer({ userId: "", email: "", address: "", no_experience: "", certificate: null }); // Reset form
      handleFetch(); // Refresh the engineer list
      setErrorMessage(""); // Clear error message on successful creation
    }
  } catch (err) {
    console.error("Error creating engineer:", err);
    // Check if error response exists and set the error message to state
    if (err.response && err.response.data && err.response.data.detail) {
      setErrorMessage(err.response.data.detail);
    } else {
      setErrorMessage("Failed to create engineer.");
    }
  }
};


  return (
    <>
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">
        Manage Project Engineers
      </h1>
      <div className="flex justify-between mb-4">
        <div>
        <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded ml-2 mr-2"
          >
            {showCreateForm ? "Cancel" : "Create New engineer"}
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-green-500 text-white rounded mr-2"
          >
            Download PDF
          </button>
          <button
            onClick={handleDownloadExcel}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            Download Excel
          </button>
          {/* New engineer Button */}
          
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="px-4 py-2 bg-white text-black border rounded-full"
        />
      </div>

      {showCreateForm && (
  <form onSubmit={handleCreateengineer} className="mb-4 p-4 border rounded bg-white shadow-md max-w-md mx-auto">
    <h2 className="text-black font-bold mb-2">Create New Engineer</h2>
    
    {/* Display error message */}
    {errorMessage && (
      <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">
        {errorMessage}
      </div>
    )}
    
    <div className="mb-4">
      <label className="block text-gray-700">Select User</label>
      <select
        value={newengineer.userId}
        onChange={(e) => setNewengineer({ ...newengineer, userId: e.target.value })}
        required
        className="mt-1 block w-full border rounded-md p-2 text-gray-950"
      >
        <option value="">Select a user</option>
        {Array.isArray(users) && users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.phone}
          </option>
        ))}
      </select>
    </div>
    
    <div className="mb-4">
      <label className="block text-gray-700">Email</label>
      <input
        type="email"
        value={newengineer.email}
        onChange={(e) => setNewengineer({ ...newengineer, email: e.target.value })}
        className="mt-1 block w-full border rounded-md p-2 text-gray-950"
        required
      />
    </div>
    
    <div className="mb-4">
      <label className="block text-gray-700">Address</label>
      <input
        type="text"
        value={newengineer.address}
        onChange={(e) => setNewengineer({ ...newengineer, address: e.target.value })}
        className="mt-1 block w-full border rounded-md p-2 text-gray-950"
        required
      />
    </div>
    
    <div className="mb-4">
      <label className="block text-gray-700">No of Experiences</label>
      <input
        type="number"
        value={newengineer.no_experience}
        onChange={(e) => setNewengineer({ ...newengineer, no_experience: e.target.value })}
        className="mt-1 block w-full border rounded-md p-2 text-gray-950"
        required
      />
    </div>
    
    <div className="mb-4">
      <label className="block text-gray-700">Certificate</label>
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setNewengineer({ ...newengineer, certificate: e.target.files[0] })}
        className="mt-1 block w-full border rounded-md p-2 text-gray-950"
      />
    </div>
    
    <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
      Create Engineer
    </button>
  </form>
)}


      <div className="overflow-x-auto"> {/* Make the table scrollable on small screens */}
      <table
          id="engineer-table"
          className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
        >
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-4 py-2 text-gray-950">Phone</th> {/* Added Phone column */}
              <th className="px-4 py-2 text-gray-950">Email</th>
              <th className="px-4 py-2 text-gray-950">Address</th>
              <th className="px-4 py-2 text-gray-950">Experience</th>
              <th className="px-4 py-2 text-gray-950">Certificate</th>
              <th className="px-4 py-2 text-gray-950">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentengineers.map((engineer) => (
              <tr key={engineer.id} className="hover:bg-gray-100">
                <td className="px-4 py-2 text-black">{engineer.created_by.phone}</td> {/* Displaying phone number */}
                <td className="px-4 py-2 text-black">{engineer.email}</td>
                <td className="px-4 py-2 text-black">{engineer.address}</td>
                <td className="px-4 py-2 text-black">{engineer.no_experience}</td>
                <td className="px-4 py-2">
                  {engineer.certificate && (
                    <a href={engineer.certificate} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                      View Certificate
                    </a>
                  )}
                </td>
                <td className="px-4 py-2 flex space-x-2">
                  <a
                    href={`/admin/editengineer/${engineer.id}`} // Edit link
                    className=" text-blue-600 px-2 py-1 rounded"
                  >
                    Edit
                  </a>
                  <a
                    onClick={() => handleDelete(engineer.id)} // Delete link
                    className=" text-red-700 px-2 py-1 rounded cursor-pointer"
                  >
                    Delete
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-4"> {/* Center the pagination */}
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => paginate(index + 1)}
            className={`px-4 py-2 rounded ${currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </>
  );
}

export default ManageEngineers;
