/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

function Users() {
  const [userData, setUserData] = useState([]); // Initialize as an empty array
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  // Get the access token from localStorage
  const accessToken = JSON.parse(localStorage.getItem("userData"))?.access;

  // Axios config with Authorization header
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const handleFetch = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/users/", axiosConfig);
      console.log("API Response:", res.data); // Log the whole response

      if (res.data && res.data.users) {
        const users = res.data.users || [];
        console.log("Fetched Users:", users); // Log users to the console
        setUserData(users); // Set the fetched users in state
      } else {
        console.log("Error: No users found in response");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    handleFetch();
  }, []);

  const handleDelete = async (id) => {
    const conf = window.confirm("Do you want to delete this user?");
    if (conf) {
      try {
        const res = await axios.delete(
          `http://127.0.0.1:8000/delete/${id}`,
          axiosConfig
        );
        if (res.status === 204) {
          console.log("User deleted successfully");
          setUserData((prevUserData) =>
            prevUserData.filter((user) => user.id !== id)
          );
        } else {
          alert("Failed to delete user");
        }
      } catch (err) {
        console.error("Error deleting user", err);
        alert("An error occurred while deleting the user");
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({ html: "#user-table" });
    doc.save("users.pdf");
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(userData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users.xlsx");
  };

  const filteredData = userData?.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.created_at?.includes(searchQuery) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredData.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredData.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">
        Manage Users
      </h1>
      <div className="flex justify-between mb-4">
        {/* <Link
          to="/admin/createUser"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Create New User
        </Link> */}

        <div>
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
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table
          id="user-table"
          className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
        >
          <thead className="text-xs text-white  uppercase bg-blue-700 ">
            <tr>
              <th scope="col" className="px-6 py-3">
                Firstname
              </th>
              <th scope="col" className="px-6 py-3">
                Lastname
              </th>
              <th scope="col" className="px-6 py-3">
                Phone
              </th>

              <th scope="col" className="px-6 py-3">
                Role
              </th>
              <th scope="col" className="px-6 py-3">
                Created Date
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="odd:bg-white odd:dark:bg-white even:bg-gray-50 even:dark:bg-white border-b dark:border-gray-700"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium whitespace-nowrap"
                  >
                    {user.first_name}{" "}
                    {/* Use 'username' instead of 'first_name' */}
                  </th>
                  <td className="px-6 py-4">{user.last_name}</td>{" "}
                  {/* Corrected this line */}
                  <td className="px-6 py-4">{user.phone}</td>
                  <td className="px-6 py-4">{user.role}</td>
                  <td className="px-6 py-4">
                    {new Date(user.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/admin/edituser/${user.id}`}
                      className="px-4 py-2"
                    >
                      Edit
                    </Link>
                    <Link
                      onClick={() => handleDelete(user.id)}
                      className="px-2 py-2 text-red-500 cursor-pointer"
                    >
                      Delete
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-center mt-4">
          <nav
            className="relative z-0 inline-flex shadow-sm rounded-md -space-x-px"
            aria-label="Pagination"
          >
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === i + 1
                    ? "text-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

export default Users;
