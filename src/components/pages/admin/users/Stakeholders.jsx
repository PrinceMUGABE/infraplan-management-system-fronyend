/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

function ManageStakeholders() {
  const [plannerData, setPlannerData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [plannersPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [newPlanner, setNewPlanner] = useState({
    userId: "",
    email: "",
    address: "",
    monthly_income: "",
  });
  const [errorMessage, setErrorMessage] = useState(""); // State to manage error messages

  const accessToken = JSON.parse(localStorage.getItem("userData"))?.access;

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const handleFetch = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/stakeholder/stakeholders/", axiosConfig);
      console.log("API Response:", res.data);

      if (Array.isArray(res.data) && res.data.length > 0) {
        setPlannerData(res.data);
        console.log("Fetched Planners:", res.data);
      } else {
        console.log("Error: No planners found in response");
      }
    } catch (err) {
      console.error("Error fetching planners:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/users/", axiosConfig);
      console.log("Fetched Users:", res.data);

      if (Array.isArray(res.data.users)) {
        setUsers(res.data.users);
      } else {
        console.log("Expected an array of users but got:", res.data);
        setUsers([]);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    handleFetch();
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    const conf = window.confirm("Do you want to delete this planner?");
    if (conf) {
      try {
        const res = await axios.delete(
          `http://127.0.0.1:8000/stakeholder/delete/${id}/`,
          axiosConfig
        );
        if (res.status === 204) {
          console.log("Stakeholder deleted successfully");
          setPlannerData((prevPlannerData) =>
            prevPlannerData.filter((planner) => planner.id !== id)
          );
        } else {
          alert("Failed to delete stakeholder");
        }
      } catch (err) {
        console.error("Error deleting planner", err);
        alert("An error occurred while deleting the planner");
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({ html: "#planner-table" });
    doc.save("planners.pdf");
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(plannerData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Planners");
    XLSX.writeFile(workbook, "planners.xlsx");
  };

  const filteredData = plannerData.filter(
    (planner) =>
      planner.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      planner.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      planner.created_at?.includes(searchQuery)
  );

  // Pagination logic
  const indexOfLastPlanner = currentPage * plannersPerPage;
  const indexOfFirstPlanner = indexOfLastPlanner - plannersPerPage;
  const currentPlanners = filteredData.slice(indexOfFirstPlanner, indexOfLastPlanner);
  const totalPages = Math.ceil(filteredData.length / plannersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle new stakeholder form submission
  // Handle new stakeholder form submission with JSON payload
  const handleCreateStakeholder = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous error message
  
    const payload = {
      userId: newPlanner.userId,
      email: newPlanner.email,
      address: newPlanner.address,
      monthly_income: newPlanner.monthly_income,
    };
  
    try {
      const res = await axios.post("http://127.0.0.1:8000/stakeholder/create/", payload, axiosConfig);
      if (res.status === 201) {
        alert("Stakeholder created successfully!");
        setShowCreateForm(false);
        setNewPlanner({ userId: "", email: "", address: "", monthly_income: "" });
        handleFetch();  // Refresh the planner list
      }
    } catch (err) {
      console.error("Error creating planner:", err);
  
      // Handle error responses and categorize them
      if (err.response) {
        if (err.response.status === 400) {
          // Handle user-specific errors (e.g., already has a stakeholder account)
          setErrorMessage(err.response.data.detail || "You have already created a stakeholder account.");
        } else {
          // General fallback error message
          setErrorMessage("An unexpected error occurred while creating the stakeholder.");
        }
      } else {
        setErrorMessage("Failed to connect to the server. Please try again later.");
      }
    }
  };
  

  return (
    <>
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">
        Manage Project Stakeholders
      </h1>
      <div className="flex justify-between mb-4">
        <div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded ml-2 mr-2"
          >
            {showCreateForm ? "Cancel" : "Create New Stakeholder"}
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
  <form onSubmit={handleCreateStakeholder} className="mb-4 p-4 border rounded bg-white shadow-md max-w-md mx-auto">
    <h2 className="text-black font-bold mb-2">Create New Stakeholder</h2>
    
    {/* Display error message */}
    {errorMessage && <div className="text-red-600 mb-2">{errorMessage}</div>}
    
    <div className="mb-4">
      <label className="block text-gray-700">Select User</label>
      <select
        value={newPlanner.userId}
        onChange={(e) => setNewPlanner({ ...newPlanner, userId: e.target.value })}
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
        value={newPlanner.email}
        onChange={(e) => setNewPlanner({ ...newPlanner, email: e.target.value })}
        className="mt-1 block w-full border rounded-md p-2 text-gray-950"
        required
      />
    </div>
    
    <div className="mb-4">
      <label className="block text-gray-700">Address</label>
      <input
        type="text"
        value={newPlanner.address}
        onChange={(e) => setNewPlanner({ ...newPlanner, address: e.target.value })}
        className="mt-1 block w-full border rounded-md p-2 text-gray-950"
        required
      />
    </div>
    
    <div className="mb-4">
      <label className="block text-gray-700">Monthly Income</label>
      <input
        type="number"
        value={newPlanner.monthly_income}
        onChange={(e) => setNewPlanner({ ...newPlanner, monthly_income: e.target.value })}
        className="mt-1 block w-full border rounded-md p-2 text-gray-950"
        required
      />
    </div>

    <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
      Create Stakeholder
    </button>
  </form>
)}

      <div className="overflow-x-auto">
        <table
          id="planner-table"
          className="w-full text-sm text-left rtl:text-right text-white dark:text-gray-400"
        >
          <thead className="text-xs text-white uppercase bg-blue-700 ">
            <tr>
              <th className="px-4 py-2 text-gray-950">Phone</th>
              <th className="px-4 py-2 text-gray-950">Email</th>
              <th className="px-4 py-2 text-gray-950">Address</th>
              <th className="px-4 py-2 text-gray-950">Income</th>
              <th className="px-4 py-2 text-gray-950">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPlanners.map((planner) => (
              <tr key={planner.id} className="hover:bg-gray-100">
                <td className="px-4 py-2 text-black">{planner.created_by.phone}</td>
                <td className="px-4 py-2 text-black">{planner.email}</td>
                <td className="px-4 py-2 text-black">{planner.address}</td>
                <td className="px-4 py-2 text-black">{planner.monthly_income}</td>
                <td className="px-4 py-2 flex space-x-2">
                  <a
                    href={`/admin/editStakeholder/${planner.id}`} 
                    className=" text-blue-600 px-2 py-1 rounded"
                  >
                    Edit
                  </a>
                  <a
                    onClick={() => handleDelete(planner.id)} 
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

      <div className="flex justify-center mt-4">
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

export default ManageStakeholders;
