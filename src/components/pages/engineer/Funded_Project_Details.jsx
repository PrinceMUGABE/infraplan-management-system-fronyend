/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import axios from "axios";
import { jsPDF } from "jspdf";

const FundedProjectModal = ({ show, handleClose, projectDetails }) => {
  if (!show || !projectDetails) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApply = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("User is not authenticated");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/engineer_application/create/",
        { project_id: projectDetails.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      alert("Application submitted successfully!");
      handleClose();
    } catch (error) {
      console.error(
        "Error submitting application:",
        error.response?.data || error.message
      );
      alert(
        `Error: ${
          error.response?.data?.error || "An error occurred while applying"
        }`
      );
    }
  };

  const downloadFundedProjectPDF = () => {
    const doc = new jsPDF();
    let yPosition = 20;

    // Add project details
    doc.text(
      `Project: ${projectDetails?.funded_project?.project?.field}`,
      20,
      yPosition
    );
    yPosition += 10;
    doc.text(`Status: ${projectDetails?.status}`, 20, yPosition);
    yPosition += 10;
    doc.text(
      `Duration: ${projectDetails?.funded_project?.duration} months`,
      20,
      yPosition
    );
    yPosition += 10;
    doc.text(
      `Cost: ${projectDetails?.funded_project?.cost} FRW`,
      20,
      yPosition
    );
    yPosition += 10;
    doc.text(
      `Location: ${projectDetails?.funded_project?.location}`,
      20,
      yPosition
    );
    yPosition += 10;
    doc.text(
      `Planner's Email: ${projectDetails?.funded_project?.planned_by?.email}`,
      20,
      yPosition
    );
    yPosition += 10;
    doc.text(
      `Description: ${projectDetails?.funded_project?.project?.description}`,
      20,
      yPosition
    );
    yPosition += 20;

    // Add image if available
    if (projectDetails?.funded_project?.image) {
      const image = new Image();
      image.src = `data:image/png;base64,${projectDetails.funded_project.image}`;
      image.onload = () => {
        const imageWidth = 100;
        const imageHeight = 100;

        if (yPosition + imageHeight < 280) {
          doc.addImage(image, "PNG", 20, yPosition, imageWidth, imageHeight);
          yPosition += imageHeight + 10;
        } else {
          doc.addPage();
          doc.addImage(image, "PNG", 20, 20, imageWidth, imageHeight);
        }

        doc.save(
          `${projectDetails?.funded_project?.project?.field}_funded_project.pdf`
        );
      };
    } else {
      doc.save(
        `${projectDetails?.funded_project?.project?.field}_funded_project.pdf`
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">
            Funded Project Details
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Project Details */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-blue-600 mb-4">
              Project Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Field:</span>{" "}
                  {projectDetails.funded_project.project.field}
                </p>
                <p>
                  <span className="font-semibold">Description:</span>{" "}
                  {projectDetails.funded_project.project.description}
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-sm ${
                      projectDetails.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : projectDetails.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {projectDetails.status}
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Cost:</span>{" "}
                  {projectDetails.funded_project.cost} FRW
                </p>
                <p>
                  <span className="font-semibold">Duration:</span>{" "}
                  {projectDetails.funded_project.duration} months
                </p>
                <p>
                  <span className="font-semibold">Location:</span>{" "}
                  {projectDetails.funded_project.location}
                </p>
              </div>
            </div>
          </div>

          {/* Planner Details */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-blue-600 mb-4">
              Planner Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  {projectDetails.funded_project.planned_by.created_by.first_name}{" "}
                  {projectDetails.funded_project.planned_by.created_by.last_name}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {projectDetails.funded_project.planned_by.email}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {projectDetails.funded_project.planned_by.created_by.phone}
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Address:</span>{" "}
                  {projectDetails.funded_project.planned_by.address}
                </p>
                <p>
                  <span className="font-semibold">Experience:</span>{" "}
                  {projectDetails.funded_project.planned_by.no_experience} years
                </p>
              </div>
            </div>
          </div>

          {/* Stakeholder Details */}
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-4">
              Stakeholder Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  {projectDetails.created_by.created_by.first_name}{" "}
                  {projectDetails.created_by.created_by.last_name}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {projectDetails.created_by.email}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {projectDetails.created_by.created_by.phone}
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Address:</span>{" "}
                  {projectDetails.created_by.address}
                </p>
                <p>
                  <span className="font-semibold">Monthly Income:</span>{" "}
                  {projectDetails.created_by.monthly_income} FRW
                </p>
                <p>
                  <span className="font-semibold">Created At:</span>{" "}
                  {formatDate(projectDetails.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Apply
          </button>
          <button
            onClick={downloadFundedProjectPDF}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Download PDF
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FundedProjectModal;
