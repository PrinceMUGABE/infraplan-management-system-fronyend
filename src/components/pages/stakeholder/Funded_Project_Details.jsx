/* eslint-disable react/prop-types */
// FundedProjectModal.js
import React, { useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap'; // Assuming you are using react-bootstrap
import axios from 'axios';

const FundedProjectModal = ({ show, handleClose, projectId }) => {
    const [fundedProject, setFundedProject] = React.useState(null);

    useEffect(() => {
        if (projectId) {
            const fetchFundedProject = async () => {
                try {
                    const response = await axios.get(`http://127.0.0.1/funded_project/${projectId}/`);
                    setFundedProject(response.data);
                } catch (error) {
                    console.error("Error fetching funded project:", error);
                }
            };
            fetchFundedProject();
        }
    }, [projectId]);

    if (!fundedProject) {
        return null; // or a loading indicator
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Funded Project Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h5>Project Information</h5>
                <p><strong>ID:</strong> {fundedProject.id}</p>
                <p><strong>Status:</strong> {fundedProject.status}</p>
                <p><strong>Created By:</strong> {fundedProject.created_by.email}</p>
                <p><strong>Funding Project:</strong> {fundedProject.funded_project.project.description}</p>
                <p><strong>Created At:</strong> {new Date(fundedProject.created_at).toLocaleString()}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default FundedProjectModal;
