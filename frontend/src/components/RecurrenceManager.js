// src/components/RecurrenceManager.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import { Table, Button, Modal, Form, Spinner, Alert, Container } from 'react-bootstrap';

function RecurrenceManager() {
    const [recurrences, setRecurrences] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentRecurrence, setCurrentRecurrence] = useState(null); // For editing
    const [formData, setFormData] = useState({ name: '', calculation: '', archived: false });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const apiEndpoint = `${API_BASE_URL}/api/recurrences/`;

    // Fetch Data
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(apiEndpoint);
            setRecurrences(response.data);
        } catch (err) {
            console.error("Error fetching recurrences:", err);
            setError("Failed to load recurrences.");
        } finally {
            setIsLoading(false);
        }
    }, [apiEndpoint]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Modal Handling
    const handleShowModal = (recurrence = null) => {
        setCurrentRecurrence(recurrence);
        setFormData(recurrence ? { ...recurrence } : { name: '', calculation: '', archived: false });
        setShowModal(true);
        setError(null); // Clear previous form errors
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentRecurrence(null);
        setFormData({ name: '', calculation: '', archived: false });
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
        const method = currentRecurrence ? 'put' : 'post';
        const url = currentRecurrence ? `${apiEndpoint}${currentRecurrence.id}/` : apiEndpoint;

        try {
            if (method === 'put') {
                await axios.put(url, formData);
            } else {
                await axios.post(url, formData);
            }
            handleCloseModal();
            fetchData(); // Refresh list
        } catch (err) {
            console.error(`Error ${method === 'put' ? 'updating' : 'creating'} recurrence:`, err.response?.data || err.message);
            setError(`Failed to ${method === 'put' ? 'update' : 'create'} recurrence. ${JSON.stringify(err.response?.data)}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this recurrence?")) {
            setIsLoading(true); // Indicate activity
            try {
                await axios.delete(`${apiEndpoint}${id}/`);
                fetchData(); // Refresh list
            } catch (err) {
                console.error("Error deleting recurrence:", err);
                setError("Failed to delete recurrence.");
                setIsLoading(false); // Reset loading on error
            }
            // No finally setIsLoading(false) here, it's handled by fetchData starting
        }
    };

    return (
        <Container>
            <h2>Recurrence Patterns</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Button variant="primary" onClick={() => handleShowModal()} className="mb-3">
                Add Recurrence
            </Button>

            {isLoading && !showModal ? ( // Show spinner only for list loading
                <div className="text-center"><Spinner animation="border" /></div>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Calculation</th>
                            <th>Archived</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recurrences.map(rec => (
                            <tr key={rec.id}>
                                <td>{rec.id}</td>
                                <td>{rec.name}</td>
                                <td>{rec.calculation}</td>
                                <td>{rec.archived ? 'Yes' : 'No'}</td>
                                <td>
                                    <Button variant="info" size="sm" onClick={() => handleShowModal(rec)} className="me-2">Edit</Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(rec.id)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentRecurrence ? 'Edit' : 'Add'} Recurrence</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form.Group className="mb-3" controlId="recurrenceName">
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
                        <Form.Group className="mb-3" controlId="recurrenceCalculation">
                            <Form.Label>Calculation</Form.Label>
                            <Form.Control
                                type="text"
                                name="calculation"
                                value={formData.calculation}
                                onChange={handleInputChange}
                                maxLength={100}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="recurrenceArchived">
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

export default RecurrenceManager;