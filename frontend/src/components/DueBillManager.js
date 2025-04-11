// src/components/DueBillManager.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import { Table, Button, Modal, Form, Spinner, Alert, Container, Row, Col } from 'react-bootstrap';

function DueBillManager() {
    const [dueBills, setDueBills] = useState([]); // <-- CHANGE
    const [showModal, setShowModal] = useState(false);
    const [currentDueBill, setCurrentDueBill] = useState(null); // <-- CHANGE
    // <-- CHANGE Initial State - Many fields!
    const [formData, setFormData] = useState({
        bill: '', // FK ID
        priority: 0,
        due_date: '',
        pay_date: null, // Optional date
        min_amount_due: null, // Optional decimal
        total_amount_due: null, // Optional decimal (as per previous change)
        status: '', // FK ID
        archived: false,
        confirmation: '',
        notes: '',
        draft_account: null, // Optional FK ID
        recurrence: null // Optional FK ID
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add state for related data dropdowns - REQUIRED FOR REAL APP
    // const [bills, setBills] = useState([]);
    // const [billStatuses, setBillStatuses] = useState([]);
    // const [bankAccounts, setBankAccounts] = useState([]);
    // const [recurrences, setRecurrences] = useState([]);


    const apiEndpoint = `${API_BASE_URL}/api/due-bills/`; // <-- CHANGE

    // Fetch DueBill Data
    const fetchDueBills = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(apiEndpoint);
            setDueBills(response.data); // <-- CHANGE
        } catch (err) {
            console.error("Error fetching due bills:", err); // <-- CHANGE
            setError("Failed to load due bills."); // <-- CHANGE
        } finally {
            setIsLoading(false);
        }
    }, [apiEndpoint]);

    // Fetch Related Data (for dropdowns) - REQUIRED FOR REAL APP
    // const fetchRelatedData = useCallback(async () => {
    //     try {
    //         const [billsRes, statusRes, accRes, recRes] = await Promise.all([
    //             axios.get(`${API_BASE_URL}/api/bills/`),
    //             axios.get(`${API_BASE_URL}/api/bill-statuses/`),
    //             axios.get(`${API_BASE_URL}/api/bank-accounts/`),
    //             axios.get(`${API_BASE_URL}/api/recurrences/`)
    //         ]);
    //         setBills(billsRes.data.filter(b => !b.archived));
    //         setBillStatuses(statusRes.data.filter(s => !s.archived));
    //         setBankAccounts(accRes.data.filter(a => !a.archived));
    //         setRecurrences(recRes.data.filter(r => !r.archived));
    //     } catch (err) {
    //         console.error("Error fetching related data for dropdowns:", err);
    //         setError(prev => `${prev ? prev + ' ' : ''}Failed to load dropdown options.`);
    //     }
    // }, []);


    useEffect(() => {
        fetchDueBills();
        // fetchRelatedData(); // REQUIRED FOR REAL APP
    }, [fetchDueBills /*, fetchRelatedData*/]);

    const handleShowModal = (dueBill = null) => { // <-- CHANGE
        setCurrentDueBill(dueBill); // <-- CHANGE
         // <-- CHANGE Form Data Setup
        setFormData(dueBill ?
            {
                bill: dueBill.bill, // Expecting IDs from API
                priority: dueBill.priority,
                due_date: dueBill.due_date,
                pay_date: dueBill.pay_date || null,
                min_amount_due: dueBill.min_amount_due || null,
                total_amount_due: dueBill.total_amount_due || null,
                status: dueBill.status,
                archived: dueBill.archived,
                confirmation: dueBill.confirmation || '',
                notes: dueBill.notes || '',
                draft_account: dueBill.draft_account || null,
                recurrence: dueBill.recurrence || null
            } : { // Default values for new entry
                bill: '',
                priority: 0,
                due_date: '',
                pay_date: null,
                min_amount_due: null,
                total_amount_due: null,
                status: '',
                archived: false,
                confirmation: '',
                notes: '',
                draft_account: null,
                recurrence: null
            });
        setShowModal(true);
        setError(null);
    };

    const handleCloseModal = () => { /* ... */
        setShowModal(false);
        setCurrentDueBill(null); // <-- CHANGE
        // <-- CHANGE Reset Form Data
        setFormData({ bill: '', priority: 0, due_date: '', pay_date: null, min_amount_due: null, total_amount_due: null, status: '', archived: false, confirmation: '', notes: '', draft_account: null, recurrence: null });
     };

    const handleInputChange = (event) => { /* ... */
        const { name, value, type, checked } = event.target;
        let processedValue = value;

        // Allow null/empty string for optional FKs or dates/numbers
        const optionalNullableFields = ['pay_date', 'min_amount_due', 'total_amount_due', 'draft_account', 'recurrence', 'confirmation', 'notes'];
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
        const method = currentDueBill ? 'put' : 'post'; // <-- CHANGE
        const url = currentDueBill ? `${apiEndpoint}${currentDueBill.id}/` : apiEndpoint; // <-- CHANGE

        const submitData = { ...formData };

        // --- Data Type/FK Processing ---
        const fkFields = ['bill', 'status', 'draft_account', 'recurrence'];
        for (const field of fkFields) {
            if (submitData[field] === null || submitData[field] === '') {
                submitData[field] = null; // Ensure empty selection becomes null
            } else {
                const intValue = parseInt(submitData[field], 10);
                if (isNaN(intValue)) {
                     // Allow null for optional fields, error for required
                     if (field === 'bill' || field === 'status') {
                        setError(`Invalid ID for required field: ${field}.`);
                        setIsSubmitting(false);
                        return;
                     } else {
                         submitData[field] = null; // Treat invalid optional FK as null
                     }
                } else {
                    submitData[field] = intValue;
                }
            }
        }
         // Ensure required FKs are present
         if (submitData.bill === null || submitData.status === null) {
             setError("Bill and Status fields are required.");
             setIsSubmitting(false);
             return;
         }
         // Ensure optional number fields are null or valid numbers
         const numericNullable = ['min_amount_due', 'total_amount_due'];
         for (const field of numericNullable) {
             if (submitData[field] !== null && isNaN(parseFloat(submitData[field]))) {
                 submitData[field] = null; // Or set error
             }
         }
          // Ensure priority is a number
         submitData.priority = parseInt(submitData.priority, 10);
         if (isNaN(submitData.priority)) submitData.priority = 0; // Default if invalid


        try {
            if (method === 'put') {
                await axios.put(url, submitData);
            } else {
                await axios.post(url, submitData);
            }
            handleCloseModal();
            fetchDueBills(); // Refresh list
        } catch (err) {
            console.error(`Error ${method === 'put' ? 'updating' : 'creating'} due bill:`, err.response?.data || err.message); // <-- CHANGE
            setError(`Failed to ${method === 'put' ? 'update' : 'create'} due bill. ${JSON.stringify(err.response?.data)}`); // <-- CHANGE
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => { /* ... */
         if (window.confirm("Are you sure you want to delete this due bill instance?")) { // <-- CHANGE
            setIsLoading(true);
            try {
                await axios.delete(`${apiEndpoint}${id}/`);
                fetchDueBills(); // Refresh list
            } catch (err) {
                console.error("Error deleting due bill:", err); // <-- CHANGE
                setError("Failed to delete due bill instance."); // <-- CHANGE
                setIsLoading(false);
            }
        }
    };

    // --- Helper functions to display names (require related data state) ---
    // const getBillName = (billId) => bills.find(b => b.id === billId)?.name || `ID: ${billId}`;
    // const getStatusName = (statusId) => billStatuses.find(s => s.id === statusId)?.name || `ID: ${statusId}`;
    // const getAccountName = (accountId) => !accountId ? 'N/A' : bankAccounts.find(a => a.id === accountId)?.name || `ID: ${accountId}`;
    // const getRecurrenceName = (recId) => !recId ? 'N/A' : recurrences.find(r => r.id === recId)?.name || `ID: ${recId}`;


    return (
        <Container>
            <h2 data-cy="due-bills-heading">Due Bills / Bill Instances</h2> {/* <-- CHANGE */}
            {error && <Alert variant="danger" data-cy="due-bills-error-alert">{error}</Alert>}
            <Button variant="primary" onClick={() => handleShowModal()} className="mb-3">
                Add Due Bill {/* <-- CHANGE */}
            </Button>

            {isLoading && !showModal ? (
                 <div className="text-center"><Spinner animation="border" /></div>
            ) : (
                <Table data-cy="due-bills-table" striped bordered hover responsive size="sm"> {/* Added size="sm" */}
                    <thead>
                        <tr>
                            {/* CHANGE Columns */}
                            <th>ID</th>
                            <th>Bill (ID)</th>
                            <th>Due Date</th>
                            <th>Total Due</th>
                            <th>Status (ID)</th>
                            <th>Pay Date</th>
                            <th>Draft Acc (ID)</th>
                            <th>Priority</th>
                            <th>Archived</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dueBills.map(db => ( // <-- CHANGE
                            <tr key={db.id} data-cy={`due-bill-row-${db.id}`}>
                                <td>{db.id}</td>
                                {/* Use helpers here when data available */}
                                <td>{db.bill /*getBillName(db.bill)*/}</td>
                                <td>{db.due_date}</td>
                                <td>${parseFloat(db.total_amount_due || 0).toFixed(2)}</td>
                                <td>{db.status /*getStatusName(db.status)*/}</td>
                                <td>{db.pay_date || 'N/A'}</td>
                                <td>{db.draft_account ?? 'N/A' /*getAccountName(db.draft_account)*/}</td>
                                <td>{db.priority}</td>
                                <td>{db.archived ? 'Yes' : 'No'}</td>
                                <td>
                                    <Button data-cy={`edit-button-${db.id}`} variant="info" size="sm" onClick={() => handleShowModal(db)} className="me-2">Edit</Button> {/* <-- CHANGE */}
                                    <Button data-cy={`delete-button-${db.id}`} variant="danger" size="sm" onClick={() => handleDelete(db.id)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

             {/* Add/Edit Modal - This will be long! */}
             <Modal show={showModal} onHide={handleCloseModal} size="lg"> {/* Use large modal */}
                <Modal.Header closeButton>
                    <Modal.Title>{currentDueBill ? 'Edit' : 'Add'} Due Bill</Modal.Title> {/* <-- CHANGE */}
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {/* Form Fields - Arrange using Row/Col for better layout */}
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="dueBillBill">
                                    <Form.Label>Bill*</Form.Label>
                                     {/* --- Real App: Replace with Select Dropdown --- */}
                                    <Form.Control required type="number" name="bill" value={formData.bill} onChange={handleInputChange} placeholder="Enter Bill Definition ID"/>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="dueBillStatus">
                                    <Form.Label>Status*</Form.Label>
                                     {/* --- Real App: Replace with Select Dropdown --- */}
                                     <Form.Control required type="number" name="status" value={formData.status} onChange={handleInputChange} placeholder="Enter Bill Status ID"/>
                                </Form.Group>
                            </Col>
                        </Row>
                         <Row>
                             <Col md={4}>
                                <Form.Group className="mb-3" controlId="dueBillDueDate">
                                    <Form.Label>Due Date*</Form.Label>
                                    <Form.Control required type="date" name="due_date" value={formData.due_date} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                             <Col md={4}>
                                 <Form.Group className="mb-3" controlId="dueBillPayDate">
                                    <Form.Label>Pay Date</Form.Label>
                                    <Form.Control type="date" name="pay_date" value={formData.pay_date || ''} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                             <Col md={4}>
                                 <Form.Group className="mb-3" controlId="dueBillPriority">
                                    <Form.Label>Priority</Form.Label>
                                    <Form.Control type="number" name="priority" value={formData.priority} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="dueBillMinAmount">
                                    <Form.Label>Min Amount Due</Form.Label>
                                    <Form.Control type="number" step="0.01" name="min_amount_due" value={formData.min_amount_due || ''} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                 <Form.Group className="mb-3" controlId="dueBillTotalAmount">
                                    <Form.Label>Total Amount Due</Form.Label>
                                    <Form.Control type="number" step="0.01" name="total_amount_due" value={formData.total_amount_due || ''} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                        </Row>
                         <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="dueBillDraftAccount">
                                    <Form.Label>Draft Account</Form.Label>
                                     {/* --- Real App: Replace with Select Dropdown --- */}
                                     <Form.Control type="number" name="draft_account" value={formData.draft_account || ''} onChange={handleInputChange} placeholder="Enter Bank Account ID (optional)"/>
                                </Form.Group>
                             </Col>
                              <Col md={6}>
                                <Form.Group className="mb-3" controlId="dueBillRecurrence">
                                    <Form.Label>Recurrence</Form.Label>
                                     {/* --- Real App: Replace with Select Dropdown --- */}
                                     <Form.Control type="number" name="recurrence" value={formData.recurrence || ''} onChange={handleInputChange} placeholder="Enter Recurrence ID (optional)"/>
                                </Form.Group>
                             </Col>
                        </Row>
                         <Form.Group className="mb-3" controlId="dueBillConfirmation">
                            <Form.Label>Confirmation Code</Form.Label>
                            <Form.Control type="text" name="confirmation" value={formData.confirmation} onChange={handleInputChange} maxLength={100}/>
                        </Form.Group>
                         <Form.Group className="mb-3" controlId="dueBillNotes">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control as="textarea" rows={3} name="notes" value={formData.notes} onChange={handleInputChange}/>
                        </Form.Group>
                         <Form.Group className="mb-3" controlId="dueBillArchived">
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

export default DueBillManager;