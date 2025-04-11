// src/components/BankAccountInstanceManager.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import { Table, Button, Modal, Form, Spinner, Alert, Container, Row, Col } from 'react-bootstrap';

function BankAccountInstanceManager() {
    // State for the main resource (Instances)
    const [instances, setInstances] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Loading state for instances list
    const [error, setError] = useState(null); // General errors (fetching list, deleting)

    // State for the Modal and Form
    const [showModal, setShowModal] = useState(false);
    const [currentInstance, setCurrentInstance] = useState(null); // null for 'Add', object for 'Edit'
    const [formData, setFormData] = useState({
        bank_account: '', priority: 0, due_date: '', pay_date: '', name: '',
        status: '', archived: false, current_balance: '', recurrence: '' // Use empty strings for initial controlled inputs
    });
    const [modalError, setModalError] = useState(null); // Errors specific to modal submission/validation
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for form submission

    // --- NEW: State for Dropdown Data ---
    const [bankAccounts, setBankAccounts] = useState([]);
    const [billStatuses, setBillStatuses] = useState([]);
    const [recurrences, setRecurrences] = useState([]);
    const [isRelatedDataLoading, setIsRelatedDataLoading] = useState(false); // Loading state for dropdown data
    // --- END NEW ---

    const apiEndpoint = `${API_BASE_URL}/api/bank-account-instances/`;

    // Fetch main instance list data
    const fetchInstances = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(apiEndpoint);
            setInstances(response.data);
        } catch (err) {
            console.error("Error fetching bank account instances:", err);
            setError("Failed to load bank account instances.");
        } finally {
            setIsLoading(false);
        }
    }, [apiEndpoint]);

    // --- NEW: Fetch data for dropdowns ---
    const fetchRelatedData = useCallback(async () => {
        setIsRelatedDataLoading(true);
        // Clear previous errors related to dropdown data fetching if retrying
        // setError(prev => prev?.replace(/Failed to load dropdown options.*?(\. |$)/, '')); // More complex error handling might be needed

        try {
            const [accRes, statusRes, recRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/bank-accounts/`),
                axios.get(`${API_BASE_URL}/api/bill-statuses/`),
                axios.get(`${API_BASE_URL}/api/recurrences/`)
            ]);
            // Filter out archived items for selection, sort alphabetically
            setBankAccounts(accRes.data.filter(a => !a.archived).sort((a, b) => a.name.localeCompare(b.name)));
            setBillStatuses(statusRes.data.filter(s => !s.archived).sort((a, b) => a.name.localeCompare(b.name)));
            setRecurrences(recRes.data.filter(r => !r.archived).sort((a, b) => a.name.localeCompare(b.name)));
        } catch (err) {
            console.error("Error fetching related data for instance dropdowns:", err);
            // Append error message, don't overwrite existing list fetch errors
            setError(prev => `${prev ? prev + ' ' : ''}Failed to load dropdown options.`);
        } finally {
            setIsRelatedDataLoading(false);
        }
    }, []);
    // --- END NEW ---

    // Initial data fetch on component mount
    useEffect(() => {
        fetchInstances();
        fetchRelatedData(); // Fetch dropdown data as well
    }, [fetchInstances, fetchRelatedData]); // Include both fetch functions in dependencies

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
            {isLoading && (
                 <div className="text-center" data-cy="instances-loading-spinner">
                    <Spinner animation="border" />
                    <p>Loading instances...</p>
                 </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && instances.length === 0 && (
                <Alert variant="info" data-cy="instances-empty-alert">
                    No bank account instances found.
                </Alert>
            )}

            {/* Data Table */}
            {!isLoading && !error && instances.length > 0 && (
                <Table data-cy="instances-table" striped bordered hover responsive size="sm">
                    <thead>
                        <tr>
                            {/* Updated Headers for clarity */}
                            <th>ID</th><th>Account</th><th>Name</th><th>Due Date</th>
                            <th>Status</th><th>Amount/Bal</th><th>Pay Date</th><th>Archived</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {instances.map(inst => (
                            <tr key={inst.id} data-cy={`instance-row-${inst.id}`}>
                                <td>{inst.id}</td>
                                {/* Use helper functions to display names */}
                                <td data-cy={`instance-row-${inst.id}-account`}>{getAccountName(inst.bank_account)}</td>
                                <td data-cy={`instance-row-${inst.id}-name`}>{inst.name}</td>
                                <td data-cy={`instance-row-${inst.id}-due_date`}>{inst.due_date}</td>
                                <td data-cy={`instance-row-${inst.id}-status`}>{getStatusName(inst.status)}</td>
                                <td data-cy={`instance-row-${inst.id}-balance`}>${parseFloat(inst.current_balance || 0).toFixed(2)}</td>
                                <td data-cy={`instance-row-${inst.id}-pay_date`}>{inst.pay_date || 'N/A'}</td>
                                <td data-cy={`instance-row-${inst.id}-archived`}>{inst.archived ? 'Yes' : 'No'}</td>
                                <td>
                                    <Button data-cy={`edit-instance-button-${inst.id}`} variant="info" size="sm" onClick={() => handleShowModal(inst)} className="me-2">Edit</Button>
                                    <Button data-cy={`delete-instance-button-${inst.id}`} variant="danger" size="sm" onClick={() => handleDelete(inst.id)}>Delete</Button>
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
                        {/* Show loading indicator for dropdown data inside modal */}
                        {isRelatedDataLoading && <div className='text-center'><Spinner animation='border' size='sm'/> <p>Loading options...</p></div> }

                         <Row>
                             <Col md={6}>
                                <Form.Group className="mb-3" controlId="instanceAccount">
                                    <Form.Label>Bank Account*</Form.Label>
                                    {/* --- UPDATED: Dropdown --- */}
                                    <Form.Select
                                        required
                                        name="bank_account"
                                        value={formData.bank_account ?? ''} // Handle null/undefined state
                                        onChange={handleInputChange}
                                        data-cy="instance-bank-account-input"
                                        disabled={isRelatedDataLoading} // Disable while loading options
                                        aria-label="Select Bank Account"
                                    >
                                        <option value="" disabled={formData.bank_account !== ''}>-- Select Bank Account --</option> {/* Placeholder */}
                                        {bankAccounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                                        ))}
                                    </Form.Select>
                                    {/* --- END UPDATED --- */}
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
                                     {/* --- UPDATED: Dropdown --- */}
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
                                    {/* --- END UPDATED --- */}
                                </Form.Group>
                            </Col>
                             <Col md={6}>
                                <Form.Group className="mb-3" controlId="instanceRecurrence">
                                    <Form.Label>Recurrence</Form.Label>
                                     {/* --- UPDATED: Dropdown --- */}
                                     <Form.Select
                                        name="recurrence"
                                        value={formData.recurrence ?? ''}
                                        onChange={handleInputChange}
                                        data-cy="instance-recurrence-input"
                                        disabled={isRelatedDataLoading}
                                        aria-label="Select Recurrence"
                                    >
                                        <option value="">-- Select Recurrence (Optional) --</option> {/* Optional field */}
                                        {recurrences.map(rec => (
                                            <option key={rec.id} value={rec.id}>{rec.name}</option>
                                        ))}
                                    </Form.Select>
                                    {/* --- END UPDATED --- */}
                                </Form.Group>
                            </Col>
                        </Row>
                         {/* Other fields remain the same */}
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

                    </Modal.Body>
                     <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal} data-cy="instance-modal-close-button">Close</Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting || isRelatedDataLoading} data-cy="instance-modal-save-button"> {/* Also disable if options loading */}
                           {isSubmitting ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" data-cy="instance-modal-spinner"/> : 'Save Changes'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}

export default BankAccountInstanceManager;