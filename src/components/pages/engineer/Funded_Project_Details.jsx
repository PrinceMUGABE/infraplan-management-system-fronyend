/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';
import axios from 'axios';

const FundedProjectModal = ({ show, handleClose, projectDetails }) => {
  if (!show || !projectDetails) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to handle the Apply button click
  const handleApply = async () => {
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    if (!token) {
      alert('User is not authenticated');
      return;
    }

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/engineer_application/create/', 
        { project_id: projectDetails.id },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in headers
          },
        }
      );
      console.log(response.data); // Log response data to the console
      alert('Application submitted successfully!');
      handleClose(); // Close the modal on successful application
    } catch (error) {
      console.error('Error submitting application:', error.response?.data || error.message);
      alert(`Error: ${error.response?.data?.error || "An error occurred while applying"}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">Funded Project Details</h2>
          <button 
            onClick={handleClose} 
            className="text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Project Details Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-blue-600 mb-4">Project Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className='text-black'><span className="font-semibold">Field:</span> {projectDetails.funded_project.project.field}</p>
                <p className='text-black'><span className="font-semibold">Description:</span> {projectDetails.funded_project.project.description}</p>
                <p className='text-black'><span className="font-semibold">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                    projectDetails.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    projectDetails.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {projectDetails.status}
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <p className='text-black'><span className="font-semibold">Cost:</span> {projectDetails.funded_project.cost} frw</p>
                <p className='text-black'><span className="font-semibold">Duration:</span> {projectDetails.funded_project.duration} months</p>
                <p className='text-black'><span className="font-semibold">Location:</span> {projectDetails.funded_project.location}</p>
              </div>
            </div>
          </div>

          {/* Planner Details Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-blue-600 mb-4">Planner Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className='text-black'><span className="font-semibold">Name:</span> {projectDetails.funded_project.planned_by.created_by.first_name} {projectDetails.funded_project.planned_by.created_by.last_name}</p>
                <p className='text-black'><span className="font-semibold">Email:</span> {projectDetails.funded_project.planned_by.email}</p>
                <p className='text-black'><span className="font-semibold">Phone:</span> {projectDetails.funded_project.planned_by.created_by.phone}</p>
              </div>
              <div className="space-y-2">
                <p className='text-black'><span className="font-semibold">Address:</span> {projectDetails.funded_project.planned_by.address}</p>
                <p className='text-black'><span className="font-semibold">Experience:</span> {projectDetails.funded_project.planned_by.no_experience} years</p>
              </div>
            </div>
          </div>

          {/* Stakeholder Details Section */}
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-4">Stakeholder Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className='text-black'><span className="font-semibold">Name:</span> {projectDetails.created_by.created_by.first_name} {projectDetails.created_by.created_by.last_name}</p>
                <p className='text-black'><span className="font-semibold">Email:</span> {projectDetails.created_by.email}</p>
                <p className='text-black'><span className="font-semibold">Phone:</span> {projectDetails.created_by.created_by.phone}</p>
              </div>
              <div className="space-y-2">
                <p className='text-black'><span className="font-semibold">Address:</span> {projectDetails.created_by.address}</p>
                <p className='text-black'><span className="font-semibold">Monthly Income:</span> {projectDetails.created_by.monthly_income} frw</p>
                <p className='text-black'><span className="font-semibold">Created At:</span> {formatDate(projectDetails.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleApply} // Attach the apply handler
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Apply
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FundedProjectModal;
