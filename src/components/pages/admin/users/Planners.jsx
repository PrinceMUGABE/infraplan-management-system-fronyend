/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

function ManagePlanners() {
  const [plannerData, setPlannerData] = useState([]); // Initialize as an empty array
  const [currentPage, setCurrentPage] = useState(1);
  const [plannersPerPage] = useState(5); // Number of planners per page
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false); // State to control form visibility
  const [users, setUsers] = useState([]); // State to store users
  const [newPlanner, setNewPlanner] = useState({
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

  // Fetch planners from the API
  const handleFetch = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/planner/planners/", axiosConfig);
      console.log("API Response:", res.data); // Log the whole response

      if (Array.isArray(res.data) && res.data.length > 0) {
        setPlannerData(res.data); // Set the fetched planners in state
        console.log("Fetched Planners:", res.data); // Log planners to the console
      } else {
        console.log("Error: No planners found in response");
      }
    } catch (err) {
      console.error("Error fetching planners:", err);
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
    const conf = window.confirm("Do you want to delete this planner?");
    if (conf) {
      try {
        const res = await axios.delete(
          `http://127.0.0.1:8000/planner/delete/${id}/`,
          axiosConfig
        );
        if (res.status === 204) {
          console.log("Planner deleted successfully");
          setPlannerData((prevPlannerData) =>
            prevPlannerData.filter((planner) => planner.id !== id)
          );
        } else {
          alert("Failed to delete planner");
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

  // Handle new planner form submission
  const handleCreatePlanner = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("userId", newPlanner.userId);
    formData.append("email", newPlanner.email);
    formData.append("address", newPlanner.address);
    formData.append("no_experience", newPlanner.no_experience);
    if (newPlanner.certificate) {
      formData.append("certificate", newPlanner.certificate);
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/planner/create/", formData, axiosConfig);
      if (res.status === 201) {
        alert("Planner created successfully!");
        setShowCreateForm(false); // Hide form after successful creation
        setNewPlanner({ userId: "", email: "", address: "", no_experience: "", certificate: null }); // Reset form
        handleFetch(); // Refresh the planner list
      }
    } catch (err) {
      console.error("Error creating planner:", err);
      alert("Failed to create planner.");
    }
  };

  return (
    <>
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">
        Manage Project Planners
      </h1>
      <div className="flex justify-between mb-4">
        <div>
        <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded ml-2 mr-2"
          >
            {showCreateForm ? "Cancel" : "Create New Planner"}
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
          {/* New Planner Button */}
          
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
        <form onSubmit={handleCreatePlanner} className="mb-4 p-4 border rounded bg-white shadow-md max-w-md mx-auto" >
          <h2 className="text-black font-bold mb-2">Create New Planner</h2>
          <div className="mb-4">
            <label className="block text-gray-700">Select User</label>
            <select
              value={newPlanner.userId}
              onChange={(e) => setNewPlanner({ ...newPlanner, userId: e.target.value })}
              required
              className="mt-1 block w-full border rounded-md p-2 text-gray-950"
            >
              <option value="">Select a user</option>
              {Array.isArray(users) && users.map((user) => ( // Ensure users is an array
                <option key={user.id} value={user.id}>
                  {user.phone} {/* Displaying the user's phone number */}
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
            <label className="block text-gray-700">No of Experiences</label>
            <input
              type="number"
              value={newPlanner.no_experience}
              onChange={(e) => setNewPlanner({ ...newPlanner, no_experience: e.target.value })}
              className="mt-1 block w-full border rounded-md p-2 text-gray-950"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Certificate</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setNewPlanner({ ...newPlanner, certificate: e.target.files[0] })}
              className="mt-1 block w-full border rounded-md p-2 text-gray-950"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
            Create Planner
          </button>
        </form>
      )}

      <div className="overflow-x-auto"> {/* Make the table scrollable on small screens */}
      <table
          id="planner-table"
          className="w-full text-sm text-left rtl:text-right"
        >
          <thead className="text-xs text-white uppercase bg-blue-700">
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
            {currentPlanners.map((planner) => (
              <tr key={planner.id} className="hover:bg-gray-100">
                <td className="px-4 py-2 text-black">{planner.created_by.phone}</td> {/* Displaying phone number */}
                <td className="px-4 py-2 text-black">{planner.email}</td>
                <td className="px-4 py-2 text-black">{planner.address}</td>
                <td className="px-4 py-2 text-black">{planner.no_experience}</td>
                <td className="px-4 py-2">
                  {planner.certificate && (
                    <a href={planner.certificate} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                      View Certificate
                    </a>
                  )}
                </td>
                <td className="px-4 py-2 flex space-x-2">
                  <a
                    href={`/admin/editplanner/${planner.id}`} // Edit link
                    className=" text-blue-600 px-2 py-1 rounded"
                  >
                    Edit
                  </a>
                  <a
                    onClick={() => handleDelete(planner.id)} // Delete link
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

export default ManagePlanners;
