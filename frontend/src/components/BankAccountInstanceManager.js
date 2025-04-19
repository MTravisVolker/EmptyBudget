// src/components/BankAccountInstanceManager.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import { Table, Button, Modal, Form, Spinner, Alert, Container, Row, Col } from 'react-bootstrap';

function BankAccountInstanceManager() {
    // State for the main resource (Instances)
    const [instances, setInstances] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Initialize as true
    const [error, setError] = useState(null);

    // State for the Modal and Form
    const [showModal, setShowModal] = useState(false);
    const [currentInstance, setCurrentInstance] = useState(null);
    const [formData, setFormData] = useState({
        bank_account: '', priority: 0, due_date: '', pay_date: '', name: '',
        status: '', archived: false, current_balance: '', recurrence: ''
    });
    const [modalError, setModalError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for Dropdown Data
    const [bankAccounts, setBankAccounts] = useState([]);
    const [billStatuses, setBillStatuses] = useState([]);
    const [recurrences, setRecurrences] = useState([]);
    const [isRelatedDataLoading, setIsRelatedDataLoading] = useState(true); // Initialize as true

    const apiEndpoint = `${API_BASE_URL}/api/bank-account-instances/`;

    // Fetch main instance list data
    const fetchInstances = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(apiEndpoint);
            setInstances(response.data || []);
        } catch (err) {
            console.error("Error fetching bank account instances:", err);
            setError("Failed to load bank account instances.");
            setInstances([]);
        } finally {
            setIsLoading(false);
        }
    }, [apiEndpoint]);

    // Fetch data for dropdowns
    const fetchRelatedData = useCallback(async () => {
        setIsRelatedDataLoading(true);
        try {
            const [accRes, statusRes, recRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/bank-accounts/`),
                axios.get(`${API_BASE_URL}/api/bill-statuses/`),
                axios.get(`${API_BASE_URL}/api/recurrences/`)
            ]);
            setBankAccounts(accRes.data || []);
            setBillStatuses(statusRes.data || []);
            setRecurrences(recRes.data || []);
        } catch (err) {
            console.error("Error fetching related data for instance dropdowns:", err);
            setError(prev => `${prev ? prev + ' ' : ''}Failed to load dropdown options.`);
            setBankAccounts([]);
            setBillStatuses([]);
            setRecurrences([]);
        } finally {
            setIsRelatedDataLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInstances();
        fetchRelatedData();
    }, [fetchInstances, fetchRelatedData]);

    // Prepare modal for Add or Edit
    const handleShowModal = (instance = null) => {
        setCurrentInstance(instance);
        setFormData(instance ? { // Populate form for editing
            bank_account: instance.bank_account || '', // Use empty string if null/undefined
            priority: instance.priority || 0,
            due_date: instance.due_date || '',
            pay_date: instance.pay_date || '',
            name: instance.name || '',
            status: instance.status || '',
            archived: instance.archived || false,
            current_balance: instance.current_balance || '',
            recurrence: instance.recurrence || ''
        } : { // Defaults for adding
            bank_account: '', priority: 0, due_date: '', pay_date: '', name: '', status: '',
            archived: false, current_balance: '', recurrence: ''
        });
        setShowModal(true);
        setError(null);
        setModalError(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        // Resetting state is handled by handleShowModal next time it opens
    };

    // Handle form input changes (works for text, number, date, checkbox, select)
    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle form submission (Create or Update)
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setModalError(null);
        const method = currentInstance ? 'put' : 'post';
        const url = currentInstance ? `${apiEndpoint}${currentInstance.id}/` : apiEndpoint;

        let submitData = { ...formData };

        // --- Data Type/FK Processing (Handles values from dropdowns) ---
        const fkFields = ['bank_account', 'status', 'recurrence'];
        const numericNullable = ['current_balance'];
        const dateNullable = ['pay_date'];

        // Ensure empty strings from selects become null for optional FKs/numbers/dates
        fkFields.forEach(field => { if (submitData[field] === '') submitData[field] = null; });
        numericNullable.forEach(field => { if (submitData[field] === '') submitData[field] = null; });
        dateNullable.forEach(field => { if (submitData[field] === '') submitData[field] = null; });

        // Validate required FKs are selected
        if (submitData.bank_account === null || submitData.status === null) {
            setModalError("Bank Account and Status are required fields.");
            setIsSubmitting(false);
            return;
        }

        // Convert FKs back to integers if not null
        fkFields.forEach(field => {
             if (submitData[field] !== null) {
                 submitData[field] = parseInt(submitData[field], 10); // Value from select is string ID
                 // Double-check parsing, though selecting from dropdown should be safe
                 if (isNaN(submitData[field])) {
                     setModalError(`Invalid selection for ${field}.`); // Should not happen with dropdowns
                     setIsSubmitting(false);
                     return;
                 }
             }
        });

        // Process Optional Numeric Fields
        for (const field of numericNullable) {
            if (submitData[field] !== null) {
                const floatValue = parseFloat(submitData[field]);
                if (isNaN(floatValue)) {
                    setModalError(`Invalid value for ${field}. Please enter a number.`);
                    setIsSubmitting(false);
                    return;
                }
                submitData[field] = floatValue.toFixed(2);
            }
        }

        // Process Priority
        submitData.priority = parseInt(submitData.priority, 10);
        if (isNaN(submitData.priority)) submitData.priority = 0;

        try {
            if (method === 'put') {
                await axios.put(url, submitData);
            } else {
                await axios.post(url, submitData);
            }
            handleCloseModal();
            fetchInstances(); // Refresh list
        } catch (err) {
            console.error(`Error ${method === 'put' ? 'updating' : 'creating'} instance:`, err.response?.data || err.message);
            const errorData = err.response?.data;
            let errorMessage = `Failed to ${method === 'put' ? 'update' : 'create'} instance.`;
            if (typeof errorData === 'object' && errorData !== null) {
                errorMessage += " " + Object.entries(errorData).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('; ');
            } else if (typeof errorData === 'string') {
                errorMessage += ` ${errorData}`;
            }
            setModalError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle deletion
    const handleDelete = async (id) => {
         if (window.confirm("Are you sure you want to delete this bank account instance?")) {
             setIsLoading(true);
             setError(null);
             try {
                 await axios.delete(`${apiEndpoint}${id}/`);
                 fetchInstances();
             } catch (err) {
                 console.error("Error deleting instance:", err);
                 setError("Failed to delete bank account instance.");
                 setIsLoading(false);
             }
         }
    };

    // --- NEW: Helper functions to display names in the table ---
    const getAccountName = useCallback((accountId) => {
        if (!accountId) return 'N/A';
        const account = bankAccounts.find(a => a.id === parseInt(accountId, 10));
        return account ? account.name : `ID: ${accountId}`;
    }, [bankAccounts]); // Dependency: bankAccounts list

    const getStatusName = useCallback((statusId) => {
        if (!statusId) return 'N/A';
        const status = billStatuses.find(s => s.id === parseInt(statusId, 10));
        return status ? status.name : `ID: ${statusId}`;
    }, [billStatuses]); // Dependency: billStatuses list

    // --- END NEW ---

    return (
        <Container data-cy="bank-account-instance-manager">
            <h2 data-cy="bank-account-instances-heading">Bank Account Instances / Transactions</h2>
            {error && <Alert variant="danger" data-cy="instances-error-alert">{error}</Alert>}

            <Button variant="primary" onClick={() => handleShowModal()} className="mb-3" data-cy="add-instance-button">
                Add Instance
            </Button>

            {/* Loading State for Instance List */}
            {isLoading ? (
                <div className="text-center" data-cy="instances-loading-spinner">
                    <Spinner animation="border" />
                    <p>Loading instances...</p>
                </div>
            ) : instances.length === 0 ? (
                <Alert variant="info" data-cy="instances-empty-alert">
                    No bank account instances found.
                </Alert>
            ) : (
                <Table data-cy="instances-table" striped bordered hover responsive size="sm">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Account</th>
                            <th>Name</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Amount/Bal</th>
                            <th>Pay Date</th>
                            <th>Archived</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {instances.map(instance => (
                            <tr key={instance.id} data-cy={`instance-row-${instance.id}`}>
                                <td>{instance.id}</td>
                                <td>{getAccountName(instance.bank_account)}</td>
                                <td>{instance.name}</td>
                                <td>{instance.due_date}</td>
                                <td>{getStatusName(instance.status)}</td>
                                <td>{instance.current_balance}</td>
                                <td>{instance.pay_date}</td>
                                <td>{instance.archived ? 'Yes' : 'No'}</td>
                                <td>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleShowModal(instance)}
                                        data-cy={`edit-instance-button-${instance.id}`}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(instance.id)}
                                        className="ms-2"
                                        data-cy={`delete-instance-button-${instance.id}`}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg" data-cy="instance-modal">
                <Modal.Header closeButton>
                    <Modal.Title>{currentInstance ? 'Edit' : 'Add'} Bank Account Instance</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit} data-cy="instance-form">
                    <Modal.Body>
                        {modalError && <Alert variant="danger" data-cy="instance-modal-error-alert">{modalError}</Alert>}
                        {isRelatedDataLoading ? (
                            <div className='text-center'><Spinner animation='border' size='sm'/> <p>Loading options...</p></div>
                        ) : (
                            <>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="instanceAccount">
                                            <Form.Label>Bank Account*</Form.Label>
                                            <Form.Select
                                                required
                                                name="bank_account"
                                                value={formData.bank_account ?? ''}
                                                onChange={handleInputChange}
                                                data-cy="instance-bank-account-input"
                                                disabled={isRelatedDataLoading}
                                                aria-label="Select Bank Account"
                                            >
                                                <option value="" disabled={formData.bank_account !== ''}>-- Select Bank Account --</option>
                                                {bankAccounts.map(acc => (
                                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="instanceName">
                                            <Form.Label>Name / Description*</Form.Label>
                                            <Form.Control required type="text" name="name" value={formData.name} onChange={handleInputChange} maxLength={100} data-cy="instance-name-input"/>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="instanceStatus">
                                            <Form.Label>Status*</Form.Label>
                                            <Form.Select
                                                required
                                                name="status"
                                                value={formData.status ?? ''}
                                                onChange={handleInputChange}
                                                data-cy="instance-status-input"
                                                disabled={isRelatedDataLoading}
                                                aria-label="Select Status"
                                            >
                                                <option value="" disabled={formData.status !== ''}>-- Select Status --</option>
                                                {billStatuses.map(stat => (
                                                    <option key={stat.id} value={stat.id}>{stat.name}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="instanceRecurrence">
                                            <Form.Label>Recurrence</Form.Label>
                                            <Form.Select
                                                name="recurrence"
                                                value={formData.recurrence ?? ''}
                                                onChange={handleInputChange}
                                                data-cy="instance-recurrence-input"
                                                disabled={isRelatedDataLoading}
                                                aria-label="Select Recurrence"
                                            >
                                                <option value="">-- Select Recurrence (Optional) --</option>
                                                {recurrences.map(rec => (
                                                    <option key={rec.id} value={rec.id}>{rec.name}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3" controlId="instanceDueDate">
                                            <Form.Label>Due Date*</Form.Label>
                                            <Form.Control required type="date" name="due_date" value={formData.due_date} onChange={handleInputChange} data-cy="instance-due-date-input"/>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3" controlId="instancePayDate">
                                            <Form.Label>Pay Date</Form.Label>
                                            <Form.Control type="date" name="pay_date" value={formData.pay_date || ''} onChange={handleInputChange} data-cy="instance-pay-date-input"/>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3" controlId="instancePriority">
                                            <Form.Label>Priority</Form.Label>
                                            <Form.Control type="number" name="priority" value={formData.priority} onChange={handleInputChange} data-cy="instance-priority-input"/>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="instanceAmount">
                                            <Form.Label>Amount / Balance Snapshot</Form.Label>
                                            <Form.Control type="number" step="0.01" name="current_balance" value={formData.current_balance || ''} onChange={handleInputChange} data-cy="instance-amount-input"/>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="instanceArchived">
                                            <Form.Label>&nbsp;</Form.Label> {/* Spacer */}
                                            <Form.Check type="checkbox" name="archived" label="Archived" checked={formData.archived} onChange={handleInputChange} className="mt-2" data-cy="instance-archived-checkbox"/>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal} data-cy="instance-modal-close-button">Close</Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting || isRelatedDataLoading} data-cy="instance-modal-save-button">
                            {isSubmitting ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" data-cy="instance-modal-spinner"/> : 'Save Changes'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}

export default BankAccountInstanceManager;