// src/components/BankAccountInstanceManager.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import { Table, Button, Modal, Form, Spinner, Alert, Container, Row, Col } from 'react-bootstrap';

function BankAccountInstanceManager() {
    const [instances, setInstances] = useState([]); // <-- CHANGE
    const [showModal, setShowModal] = useState(false);
    const [currentInstance, setCurrentInstance] = useState(null); // <-- CHANGE
    // <-- CHANGE Initial State
    const [formData, setFormData] = useState({
        bank_account: '', // FK ID
        priority: 0,
        due_date: '',
        pay_date: null, // Optional date
        name: '',
        status: '', // FK ID
        archived: false,
        current_balance: null, // Optional decimal (Amount/Balance Snapshot)
        recurrence: null // Optional FK ID
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add state for related data dropdowns - REQUIRED FOR REAL APP
    // const [bankAccounts, setBankAccounts] = useState([]);
    // const [billStatuses, setBillStatuses] = useState([]);
    // const [recurrences, setRecurrences] = useState([]);


    const apiEndpoint = `${API_BASE_URL}/api/bank-account-instances/`; // <-- CHANGE

    // Fetch Instance Data
    const fetchInstances = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(apiEndpoint);
            setInstances(response.data); // <-- CHANGE
        } catch (err) {
            console.error("Error fetching bank account instances:", err); // <-- CHANGE
            setError("Failed to load bank account instances."); // <-- CHANGE
        } finally {
            setIsLoading(false);
        }
    }, [apiEndpoint]);

    // Fetch Related Data (for dropdowns) - REQUIRED FOR REAL APP
    // const fetchRelatedData = useCallback(async () => {
    //     try {
    //         const [accRes, statusRes, recRes] = await Promise.all([
    //             axios.get(`${API_BASE_URL}/api/bank-accounts/`),
    //             axios.get(`${API_BASE_URL}/api/bill-statuses/`),
    //             axios.get(`${API_BASE_URL}/api/recurrences/`)
    //         ]);
    //         setBankAccounts(accRes.data.filter(a => !a.archived));
    //         setBillStatuses(statusRes.data.filter(s => !s.archived));
    //         setRecurrences(recRes.data.filter(r => !r.archived));
    //     } catch (err) {
    //          console.error("Error fetching related data for instance dropdowns:", err);
    //          setError(prev => `${prev ? prev + ' ' : ''}Failed to load dropdown options.`);
    //     }
    // }, []);


    useEffect(() => {
        fetchInstances();
        // fetchRelatedData(); // REQUIRED FOR REAL APP
    }, [fetchInstances /*, fetchRelatedData*/]);


    const handleShowModal = (instance = null) => { // <-- CHANGE
        setCurrentInstance(instance); // <-- CHANGE
         // <-- CHANGE Form Data Setup
        setFormData(instance ?
            {
                bank_account: instance.bank_account, // Expecting IDs
                priority: instance.priority,
                due_date: instance.due_date,
                pay_date: instance.pay_date || null,
                name: instance.name,
                status: instance.status,
                archived: instance.archived,
                current_balance: instance.current_balance || null, // Use field name from model
                recurrence: instance.recurrence || null
            } : { // Defaults for new
                bank_account: '',
                priority: 0,
                due_date: '',
                pay_date: null,
                name: '',
                status: '',
                archived: false,
                current_balance: null,
                recurrence: null
            });
        setShowModal(true);
        setError(null);
    };

    const handleCloseModal = () => { /* ... */
        setShowModal(false);
        setCurrentInstance(null); // <-- CHANGE
        // <-- CHANGE Reset Form Data
        setFormData({ bank_account: '', priority: 0, due_date: '', pay_date: null, name: '', status: '', archived: false, current_balance: null, recurrence: null });
    };

    const handleInputChange = (event) => { /* ... */
        const { name, value, type, checked } = event.target;
        let processedValue = value;
        const optionalNullableFields = ['pay_date', 'current_balance', 'recurrence'];
         if (optionalNullableFields.includes(name) && value === '') {
            processedValue = null;
        }
         setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : processedValue
        }));
    };

    const handleSubmit = async (event) => { /* ... */
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);
        const method = currentInstance ? 'put' : 'post'; // <-- CHANGE
        const url = currentInstance ? `${apiEndpoint}${currentInstance.id}/` : apiEndpoint; // <-- CHANGE

        const submitData = { ...formData };

        // --- Data Type/FK Processing ---
        const fkFields = ['bank_account', 'status', 'recurrence'];
        for (const field of fkFields) {
            if (submitData[field] === null || submitData[field] === '') {
                submitData[field] = null;
            } else {
                const intValue = parseInt(submitData[field], 10);
                 if (isNaN(intValue)) {
                    // bank_account and status are required
                     if (field === 'bank_account' || field === 'status') {
                        setError(`Invalid ID for required field: ${field}.`);
                        setIsSubmitting(false);
                        return;
                    } else { // recurrence is optional
                        submitData[field] = null;
                    }
                } else {
                    submitData[field] = intValue;
                }
            }
        }
         // Ensure required FKs are present
         if (submitData.bank_account === null || submitData.status === null) {
             setError("Bank Account and Status fields are required.");
             setIsSubmitting(false);
             return;
         }
         // Ensure optional number fields are null or valid numbers
          if (submitData.current_balance !== null && isNaN(parseFloat(submitData.current_balance))) {
             submitData.current_balance = null; // Or set error
         }
          // Ensure priority is a number
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
            console.error(`Error ${method === 'put' ? 'updating' : 'creating'} instance:`, err.response?.data || err.message); // <-- CHANGE
            setError(`Failed to ${method === 'put' ? 'update' : 'create'} bank account instance. ${JSON.stringify(err.response?.data)}`); // <-- CHANGE
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => { /* ... */
         if (window.confirm("Are you sure you want to delete this bank account instance?")) { // <-- CHANGE
             setIsLoading(true);
            try {
                await axios.delete(`${apiEndpoint}${id}/`);
                fetchInstances(); // Refresh list
            } catch (err) {
                console.error("Error deleting instance:", err); // <-- CHANGE
                setError("Failed to delete bank account instance."); // <-- CHANGE
                setIsLoading(false);
            }
        }
    };

    // --- Helper functions to display names (require related data state) ---
    // const getAccountName = (accountId) => bankAccounts.find(a => a.id === accountId)?.name || `ID: ${accountId}`;
    // const getStatusName = (statusId) => billStatuses.find(s => s.id === statusId)?.name || `ID: ${statusId}`;
    // const getRecurrenceName = (recId) => !recId ? 'N/A' : recurrences.find(r => r.id === recId)?.name || `ID: ${recId}`;


    return (
        <Container>
            <h2>Bank Account Instances / Transactions</h2> {/* <-- CHANGE */}
            {error && <Alert variant="danger">{error}</Alert>}
            <Button variant="primary" onClick={() => handleShowModal()} className="mb-3">
                Add Instance {/* <-- CHANGE */}
            </Button>

            {isLoading && !showModal ? (
                 <div className="text-center"><Spinner animation="border" /></div>
            ) : (
                <Table striped bordered hover responsive size="sm">
                    <thead>
                        <tr>
                             {/* CHANGE Columns */}
                            <th>ID</th>
                            <th>Account (ID)</th>
                            <th>Name</th>
                            <th>Due Date</th>
                            <th>Status (ID)</th>
                            <th>Amount/Bal</th>
                            <th>Pay Date</th>
                            <th>Archived</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {instances.map(inst => ( // <-- CHANGE
                            <tr key={inst.id}>
                                <td>{inst.id}</td>
                                {/* Use helpers here when data available */}
                                <td>{inst.bank_account /*getAccountName(inst.bank_account)*/}</td>
                                <td>{inst.name}</td>
                                <td>{inst.due_date}</td>
                                <td>{inst.status /*getStatusName(inst.status)*/}</td>
                                <td>${parseFloat(inst.current_balance || 0).toFixed(2)}</td>
                                <td>{inst.pay_date || 'N/A'}</td>
                                <td>{inst.archived ? 'Yes' : 'No'}</td>
                                <td>
                                    <Button variant="info" size="sm" onClick={() => handleShowModal(inst)} className="me-2">Edit</Button> {/* <-- CHANGE */}
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(inst.id)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

             {/* Add/Edit Modal */}
             <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{currentInstance ? 'Edit' : 'Add'} Bank Account Instance</Modal.Title> {/* <-- CHANGE */}
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                         {/* Form Fields */}
                         <Row>
                             <Col md={6}>
                                <Form.Group className="mb-3" controlId="instanceAccount">
                                    <Form.Label>Bank Account*</Form.Label>
                                     {/* --- Real App: Replace with Select Dropdown --- */}
                                    <Form.Control required type="number" name="bank_account" value={formData.bank_account} onChange={handleInputChange} placeholder="Enter Bank Account ID"/>
                                </Form.Group>
                             </Col>
                             <Col md={6}>
                                 <Form.Group className="mb-3" controlId="instanceName">
                                    <Form.Label>Name / Description*</Form.Label>
                                    <Form.Control required type="text" name="name" value={formData.name} onChange={handleInputChange} maxLength={100}/>
                                </Form.Group>
                             </Col>
                         </Row>
                         <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="instanceStatus">
                                    <Form.Label>Status*</Form.Label>
                                    {/* --- Real App: Replace with Select Dropdown --- */}
                                    <Form.Control required type="number" name="status" value={formData.status} onChange={handleInputChange} placeholder="Enter Bill Status ID"/>
                                </Form.Group>
                            </Col>
                             <Col md={6}>
                                <Form.Group className="mb-3" controlId="instanceRecurrence">
                                    <Form.Label>Recurrence</Form.Label>
                                     {/* --- Real App: Replace with Select Dropdown --- */}
                                    <Form.Control type="number" name="recurrence" value={formData.recurrence || ''} onChange={handleInputChange} placeholder="Enter Recurrence ID (optional)"/>
                                </Form.Group>
                            </Col>
                        </Row>
                         <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="instanceDueDate">
                                    <Form.Label>Due Date*</Form.Label>
                                    <Form.Control required type="date" name="due_date" value={formData.due_date} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="instancePayDate">
                                    <Form.Label>Pay Date</Form.Label>
                                    <Form.Control type="date" name="pay_date" value={formData.pay_date || ''} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="instancePriority">
                                    <Form.Label>Priority</Form.Label>
                                    <Form.Control type="number" name="priority" value={formData.priority} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                           <Col md={6}>
                                <Form.Group className="mb-3" controlId="instanceAmount">
                                    <Form.Label>Amount / Balance Snapshot</Form.Label>
                                    <Form.Control type="number" step="0.01" name="current_balance" value={formData.current_balance || ''} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                             <Col md={6}>
                                 <Form.Group className="mb-3" controlId="instanceArchived">
                                     <Form.Label>&nbsp;</Form.Label> {/* Spacer */}
                                    <Form.Check type="checkbox" name="archived" label="Archived" checked={formData.archived} onChange={handleInputChange} className="mt-2"/>
                                </Form.Group>
                             </Col>
                        </Row>

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

export default BankAccountInstanceManager;