// src/components/BillManager.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import { Table, Button, Modal, Form, Spinner, Alert, Container } from 'react-bootstrap';

function BillManager() {
    const [bills, setBills] = useState([]); // <-- CHANGE
    const [showModal, setShowModal] = useState(false);
    const [currentBill, setCurrentBill] = useState(null); // <-- CHANGE
    // <-- CHANGE Initial State - Added fields
    const [formData, setFormData] = useState({
        name: '',
        default_amount_due: '',
        url: '',
        archived: false,
        default_draft_account: null // Store ForeignKey ID, null allowed
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add state for related data (Bank Accounts for dropdown) - REQUIRED FOR REAL APP
    // const [bankAccounts, setBankAccounts] = useState([]);

    const apiEndpoint = `${API_BASE_URL}/api/bills/`; // <-- CHANGE

    // Fetch Bill Data
    const fetchBills = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(apiEndpoint);
            setBills(response.data); // <-- CHANGE
        } catch (err) {
            console.error("Error fetching bills:", err); // <-- CHANGE
            setError("Failed to load bill definitions."); // <-- CHANGE
        } finally {
            setIsLoading(false);
        }
    }, [apiEndpoint]);

     // Fetch Related Data (Bank Accounts) - REQUIRED FOR REAL APP
    // const fetchBankAccounts = useCallback(async () => {
    //     try {
    //         const response = await axios.get(`${API_BASE_URL}/api/bank-accounts/`);
    //         setBankAccounts(response.data.filter(acc => !acc.archived)); // Only show active accounts
    //     } catch (err) {
    //          console.error("Error fetching bank accounts for dropdown:", err);
    //          setError(prev => `${prev ? prev + ' ' : ''}Failed to load bank accounts for dropdown.`);
    //     }
    // }, []);

    useEffect(() => {
        fetchBills();
        // fetchBankAccounts(); // REQUIRED FOR REAL APP
    }, [fetchBills /*, fetchBankAccounts*/]);

    const handleShowModal = (bill = null) => { // <-- CHANGE
        setCurrentBill(bill); // <-- CHANGE
         // <-- CHANGE Form Data Setup
        setFormData(bill ?
            {
                name: bill.name,
                default_amount_due: bill.default_amount_due,
                url: bill.url || '',
                archived: bill.archived,
                default_draft_account: bill.default_draft_account // Assumes API returns the ID
            } : {
                name: '',
                default_amount_due: '',
                url: '',
                archived: false,
                default_draft_account: null // Or set a default ID if desired ''
            });
        setShowModal(true);
        setError(null);
    };

    const handleCloseModal = () => { /* ... */
        setShowModal(false);
        setCurrentBill(null); // <-- CHANGE
        // <-- CHANGE Reset Form Data
        setFormData({ name: '', default_amount_due: '', url: '', archived: false, default_draft_account: null });
    };

    const handleInputChange = (event) => { /* ... */
        const { name, value, type, checked } = event.target;
        let processedValue = value;
         // Allow null/empty string for default_draft_account ID
        if (name === 'default_draft_account' && value === '') {
            processedValue = null;
        } else if (name === 'default_amount_due') {
            // Basic validation or formatting for decimal could go here
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
        const method = currentBill ? 'put' : 'post'; // <-- CHANGE
        const url = currentBill ? `${apiEndpoint}${currentBill.id}/` : apiEndpoint; // <-- CHANGE

        const submitData = { ...formData };
         // Ensure amount is a number if entered, handle potential formatting issues
         if (submitData.default_amount_due === '') submitData.default_amount_due = null; // Or 0 depending on model
         // Ensure foreign key is null if empty, or integer if present
         if (submitData.default_draft_account === null || submitData.default_draft_account === '') {
             submitData.default_draft_account = null;
         } else {
             submitData.default_draft_account = parseInt(submitData.default_draft_account, 10);
             if (isNaN(submitData.default_draft_account)) {
                 setError("Invalid Bank Account ID.");
                 setIsSubmitting(false);
                 return; // Prevent submission
             }
         }

        try {
            if (method === 'put') {
                await axios.put(url, submitData);
            } else {
                await axios.post(url, submitData);
            }
            handleCloseModal();
            fetchBills(); // Refresh list
        } catch (err) {
            console.error(`Error ${method === 'put' ? 'updating' : 'creating'} bill:`, err.response?.data || err.message); // <-- CHANGE
            setError(`Failed to ${method === 'put' ? 'update' : 'create'} bill. ${JSON.stringify(err.response?.data)}`); // <-- CHANGE
        } finally {
            setIsSubmitting(false);
        }
     };

    const handleDelete = async (id) => { /* ... */
         if (window.confirm("Are you sure you want to delete this bill definition? This will also delete ALL associated due bill instances!")) { // <-- CHANGE Cascade Warning
            setIsLoading(true);
            try {
                await axios.delete(`${apiEndpoint}${id}/`);
                fetchBills(); // Refresh list
            } catch (err) {
                console.error("Error deleting bill:", err); // <-- CHANGE
                setError("Failed to delete bill definition."); // <-- CHANGE
                setIsLoading(false);
            }
        }
    };

    // Helper to display account name - needs bankAccounts state filled
    // const getAccountName = (accountId) => {
    //     if (!accountId) return 'N/A';
    //     const account = bankAccounts.find(acc => acc.id === accountId);
    //     return account ? account.name : `ID: ${accountId}`;
    // };


    return (
        <Container>
            <h2 data-cy="bills-heading">Bill Definitions</h2> {/* <-- CHANGE */}
            {error && <Alert variant="danger">{error}</Alert>}
            <Button variant="primary" onClick={() => handleShowModal()} className="mb-3">
                Add Bill {/* <-- CHANGE */}
            </Button>

            {isLoading && !showModal ? (
                 <div className="text-center"><Spinner animation="border" /></div>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Default Amount</th> {/* <-- CHANGE */}
                            <th>URL</th> {/* <-- CHANGE */}
                            <th>Default Account</th> {/* <-- CHANGE */}
                            <th>Archived</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bills.map(b => ( // <-- CHANGE
                            <tr key={b.id}>
                                <td>{b.id}</td>
                                <td>{b.name}</td>
                                <td>${parseFloat(b.default_amount_due || 0).toFixed(2)}</td> {/* <-- CHANGE */}
                                <td><a href={b.url} target="_blank" rel="noopener noreferrer">{b.url}</a></td> {/* <-- CHANGE */}
                                {/* <td>{getAccountName(b.default_draft_account)}</td> Use helper when dropdown data is loaded */}
                                <td>{b.default_draft_account ?? 'None'}</td> {/* Simplified display */}
                                <td>{b.archived ? 'Yes' : 'No'}</td>
                                <td>
                                    <Button variant="info" size="sm" onClick={() => handleShowModal(b)} className="me-2">Edit</Button> {/* <-- CHANGE */}
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(b.id)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

             {/* Add/Edit Modal */}
             <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentBill ? 'Edit' : 'Add'} Bill</Modal.Title> {/* <-- CHANGE */}
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {/* Form Fields - Adapt for Bill Model */}
                        <Form.Group className="mb-3" controlId="billName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} required maxLength={100} />
                        </Form.Group>
                         <Form.Group className="mb-3" controlId="billDefaultAmount">
                            <Form.Label>Default Amount Due</Form.Label>
                            <Form.Control type="number" step="0.01" name="default_amount_due" value={formData.default_amount_due} onChange={handleInputChange} required />
                        </Form.Group>
                         <Form.Group className="mb-3" controlId="billUrl">
                            <Form.Label>URL</Form.Label>
                            <Form.Control type="url" name="url" value={formData.url} onChange={handleInputChange} maxLength={100} placeholder="https://example.com"/>
                        </Form.Group>

                         <Form.Group className="mb-3" controlId="billDefaultDraftAccount">
                            <Form.Label>Default Draft Account ID</Form.Label>
                            {/* --- Real App: Replace with Select Dropdown --- */}
                             <Form.Control
                                type="number" // Simple input for ID
                                name="default_draft_account"
                                value={formData.default_draft_account ?? ''} // Handle null
                                onChange={handleInputChange}
                                placeholder="Enter Bank Account ID (optional)"
                            />
                            {/* --- Dropdown Example (Requires bankAccounts state) ---
                             <Form.Select
                                name="default_draft_account"
                                value={formData.default_draft_account ?? ''}
                                onChange={handleInputChange}
                            >
                                <option value="">-- Select Account (Optional) --</option>
                                {bankAccounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}
                            </Form.Select> */}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="billArchived">
                            <Form.Check type="checkbox" name="archived" label="Archived" checked={formData.archived} onChange={handleInputChange}/>
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

export default BillManager;