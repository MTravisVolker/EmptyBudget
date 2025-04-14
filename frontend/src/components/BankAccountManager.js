// src/components/BankAccountManager.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import { Table, Button, Modal, Form, Spinner, Alert, Container } from 'react-bootstrap';

function BankAccountManager() {
    const [accounts, setAccounts] = useState([]); // <-- CHANGE
    const [showModal, setShowModal] = useState(false);
    const [currentAccount, setCurrentAccount] = useState(null); // <-- CHANGE
    const [formData, setFormData] = useState({ name: '', font_color_hex: '#000000', archived: false }); // <-- CHANGE
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const apiEndpoint = `${API_BASE_URL}/api/bank-accounts/`; // <-- CHANGE

    const fetchData = useCallback(async () => { /* ... */
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(apiEndpoint);
            setAccounts(response.data); // <-- CHANGE
        } catch (err) {
            console.error("Error fetching bank accounts:", err); // <-- CHANGE
            setError("Failed to load bank accounts."); // <-- CHANGE
        } finally {
            setIsLoading(false);
        }
    }, [apiEndpoint]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleShowModal = (account = null) => { // <-- CHANGE
        setCurrentAccount(account); // <-- CHANGE
        setFormData(account ? { name: account.name, font_color_hex: account.font_color_hex, archived: account.archived } : { name: '', font_color_hex: '#000000', archived: false }); // <-- CHANGE (Exclude balance)
        setShowModal(true);
        setError(null);
    };

    const handleCloseModal = () => { // <-- CHANGE
        setShowModal(false);
        setCurrentAccount(null); // <-- CHANGE
        setFormData({ name: '', font_color_hex: '#000000', archived: false }); // <-- CHANGE
    };

    const handleInputChange = (event) => { /* ... no change ... */
        const { name, value, type, checked } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
     };

    const handleSubmit = async (event) => { /* ... */
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);
        const method = currentAccount ? 'put' : 'post'; // <-- CHANGE
        const url = currentAccount ? `${apiEndpoint}${currentAccount.id}/` : apiEndpoint; // <-- CHANGE

        // Exclude fields not meant to be directly submitted if necessary
        const submitData = { ...formData };
        // delete submitData.current_balance; // Example if balance was in form state

        try {
            if (method === 'put') {
                await axios.put(url, submitData);
            } else {
                await axios.post(url, submitData);
            }
            handleCloseModal();
            fetchData(); // Refresh list
        } catch (err) {
            console.error(`Error ${method === 'put' ? 'updating' : 'creating'} bank account:`, err.response?.data || err.message); // <-- CHANGE
            setError(`Failed to ${method === 'put' ? 'update' : 'create'} bank account. ${JSON.stringify(err.response?.data)}`); // <-- CHANGE
        } finally {
            setIsSubmitting(false);
        }
     };

    const handleDelete = async (id) => { /* ... */
        if (window.confirm("Are you sure you want to delete this bank account?")) { // <-- CHANGE
            setIsLoading(true);
            try {
                await axios.delete(`${apiEndpoint}${id}/`);
                fetchData(); // Refresh list
            } catch (err) {
                console.error("Error deleting bank account:", err); // <-- CHANGE
                setError("Failed to delete bank account."); // <-- CHANGE
                setIsLoading(false);
            }
        }
     };

    return (
        <Container>
            <h2 data-cy="bank-account-manager-heading">Bank Accounts</h2> {/* <-- CHANGE */}
            {error && <Alert variant="danger">{error}</Alert>}
            <Button variant="primary" onClick={() => handleShowModal()} className="mb-3">
                Add Bank Account {/* <-- CHANGE */}
            </Button>

            {isLoading && !showModal ? (
                <div className="text-center"><Spinner animation="border" /></div>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Font Color</th> {/* <-- CHANGE */}
                            {/*<th>Balance</th>  Optional: Display if available */}
                            <th>Archived</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map(acc => ( // <-- CHANGE
                            <tr style={{color: acc.font_color_hex}} key={acc.id}>
                                <td style={{color: acc.font_color_hex}}>{acc.id}</td>
                                <td style={{color: acc.font_color_hex}}>{acc.name}</td> {/* <-- CHANGE */}
                                <td style={{color: acc.font_color_hex}}>{acc.font_color_hex}</td> {/* <-- CHANGE */}
                                {/* <td>{acc.current_balance ?? 'N/A'}</td> */}
                                <td style={{color: acc.font_color_hex}}>{acc.archived ? 'Yes' : 'No'}</td>
                                <td>
                                    <Button variant="info" size="sm" onClick={() => handleShowModal(acc)} className="me-2">Edit</Button> {/* <-- CHANGE */}
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(acc.id)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentAccount ? 'Edit' : 'Add'} Bank Account</Modal.Title> {/* <-- CHANGE */}
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form.Group className="mb-3" controlId="accountName"> {/* <-- CHANGE */}
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text" name="name" value={formData.name} onChange={handleInputChange} required maxLength={100}
                            />
                        </Form.Group>
                         {/* CHANGE Form Fields */}
                         <Form.Group className="mb-3" controlId="accountFontColor">
                            <Form.Label>Font Color (Hex)</Form.Label>
                             <Form.Control
                                type="color" name="font_color_hex" value={formData.font_color_hex || '#000000'} onChange={handleInputChange}
                                style={{width: '50px', height: '38px', padding: '0.1rem 0.2rem'}}
                             />
                              <Form.Control
                                type="text" name="font_color_hex" value={formData.font_color_hex} onChange={handleInputChange} maxLength={7}
                                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" placeholder="#000000"
                                style={{display: 'inline-block', width: 'calc(100% - 60px)', marginLeft: '10px'}}
                             />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="accountArchived"> {/* <-- CHANGE */}
                            <Form.Check
                                type="checkbox" name="archived" label="Archived" checked={formData.archived} onChange={handleInputChange}
                            />
                        </Form.Group>
                        {/* Note: current_balance is usually not edited directly here */}
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

export default BankAccountManager;