// src/components/BillStatusManager.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import { Table, Button, Modal, Form, Spinner, Alert, Container } from 'react-bootstrap';

function BillStatusManager() {
    const [statuses, setStatuses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(null); // For editing
    const [formData, setFormData] = useState({ name: '', highlight_color_hex: '#FFFFFF', archived: false });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const apiEndpoint = `${API_BASE_URL}/api/bill-statuses/`; // <-- CHANGE Endpoint

    // Fetch Data
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(apiEndpoint);
            setStatuses(response.data); // <-- CHANGE State Variable
        } catch (err) {
            console.error("Error fetching bill statuses:", err); // <-- CHANGE Log Message
            setError("Failed to load bill statuses."); // <-- CHANGE Error Message
        } finally {
            setIsLoading(false);
        }
    }, [apiEndpoint]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Modal Handling
    const handleShowModal = (status = null) => {
        setCurrentStatus(status); // <-- CHANGE State Variable
        setFormData(status ? { ...status } : { name: '', highlight_color_hex: '#FFFFFF', archived: false }); // <-- CHANGE Initial Form Data
        setShowModal(true);
        setError(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentStatus(null); // <-- CHANGE State Variable
        setFormData({ name: '', highlight_color_hex: '#FFFFFF', archived: false }); // <-- CHANGE Reset Form Data
    };

    // Form Handling
    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // CRUD Operations
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);
        const method = currentStatus ? 'put' : 'post'; // <-- CHANGE State Variable
        const url = currentStatus ? `${apiEndpoint}${currentStatus.id}/` : apiEndpoint; // <-- CHANGE State Variable

        try {
            if (method === 'put') {
                await axios.put(url, formData);
            } else {
                await axios.post(url, formData);
            }
            handleCloseModal();
            fetchData(); // Refresh list
        } catch (err) {
            console.error(`Error ${method === 'put' ? 'updating' : 'creating'} bill status:`, err.response?.data || err.message); // <-- CHANGE Log/Error Message
            setError(`Failed to ${method === 'put' ? 'update' : 'create'} bill status. ${JSON.stringify(err.response?.data)}`); // <-- CHANGE Error Message
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this bill status? WARNING: This might fail if it's in use!")) { // <-- CHANGE Confirmation Message
            setIsLoading(true);
            try {
                await axios.delete(`${apiEndpoint}${id}/`);
                fetchData(); // Refresh list
            } catch (err) {
                console.error("Error deleting bill status:", err.response?.data || err.message); // <-- CHANGE Log/Error Message
                 // Check for protected error
                 if (err.response && err.response.status === 400 && err.response.data && /protected/.test(JSON.stringify(err.response.data).toLowerCase())) {
                    setError("Cannot delete status: It is currently linked to one or more bills/instances.");
                 } else {
                    setError("Failed to delete bill status."); // <-- CHANGE Error Message
                 }
                setIsLoading(false);
            }
        }
    };

    return (
        <Container>
            <h2 data-cy="bill-status-manager-heading">Bill Statuses</h2> {/* <-- CHANGE Title */}
            {error && <Alert variant="danger">{error}</Alert>}
            <Button variant="primary" onClick={() => handleShowModal()} className="mb-3">
                Add Bill Status {/* <-- CHANGE Button Text */}
            </Button>

            {isLoading && !showModal ? (
                <div className="text-center"><Spinner animation="border" /></div>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Highlight Color</th> {/* <-- CHANGE Column Header */}
                            <th>Archived</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {statuses.map(status => ( // <-- CHANGE State Variable
                            <tr style={{ backgroundColor: status.highlight_color_hex }} key={status.id}>
                                <td style={{ backgroundColor: status.highlight_color_hex }}>{status.id}</td>
                                <td style={{ backgroundColor: status.highlight_color_hex }}>{status.name}</td>
                                <td style={{ backgroundColor: status.highlight_color_hex }}>{status.highlight_color_hex}</td> {/* <-- CHANGE Column Data */}
                                <td style={{ backgroundColor: status.highlight_color_hex }}>{status.archived ? 'Yes' : 'No'}</td>
                                <td style={{ backgroundColor: status.highlight_color_hex }}>
                                    <Button variant="info" size="sm" onClick={() => handleShowModal(status)} className="me-2">Edit</Button> {/* <-- CHANGE State Variable */}
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(status.id)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentStatus ? 'Edit' : 'Add'} Bill Status</Modal.Title> {/* <-- CHANGE Title */}
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form.Group className="mb-3" controlId="statusName"> {/* <-- CHANGE Control ID */}
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                maxLength={100}
                            />
                        </Form.Group>
                        {/* CHANGE Form Fields */}
                        <Form.Group className="mb-3" controlId="statusHighlightColor">
                            <Form.Label>Highlight Color (Hex)</Form.Label>
                            <Form.Control
                                type="color" // Use color picker input
                                name="highlight_color_hex"
                                value={formData.highlight_color_hex || '#FFFFFF'} // Default value for color picker
                                onChange={handleInputChange}
                                style={{width: '50px', height: '38px', padding: '0.1rem 0.2rem'}} // Basic styling for color input next to text
                            />
                             <Form.Control // Add a text input alongside for manual entry/viewing
                                type="text"
                                name="highlight_color_hex"
                                value={formData.highlight_color_hex}
                                onChange={handleInputChange}
                                maxLength={7}
                                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" // Optional: Basic pattern validation
                                placeholder="#FFFFFF"
                                style={{display: 'inline-block', width: 'calc(100% - 60px)', marginLeft: '10px'}}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="statusArchived"> {/* <-- CHANGE Control ID */}
                            <Form.Check
                                type="checkbox"
                                name="archived"
                                label="Archived"
                                checked={formData.archived}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Save Changes'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}

export default BillStatusManager;