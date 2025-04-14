// src/components/BankAccountList.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Import Axios for making API calls
import ListGroup from 'react-bootstrap/ListGroup'; // Import ListGroup component
import Spinner from 'react-bootstrap/Spinner'; // Optional: for loading state
import Alert from 'react-bootstrap/Alert'; // Optional: for error display

// It's good practice to define the API base URL, especially if it might change
// Make sure your Django backend is running and accessible at this URL
const API_BASE_URL = 'http://127.0.0.1:8000'; // Adjust port if necessary

function BankAccountList() {
    // State for storing the list of accounts
    const [accounts, setAccounts] = useState([]);
    // State to handle loading status
    const [loading, setLoading] = useState(true);
    // State to handle potential errors
    const [error, setError] = useState(null);

    // useEffect hook to fetch data when the component mounts
    useEffect(() => {
        // Define the async function to fetch data
        const fetchBankAccounts = async () => {
            setLoading(true); // Set loading true at the start of fetch
            setError(null);   // Clear any previous errors
            try {
                // Make the GET request using Axios
                const response = await axios.get(`${API_BASE_URL}/api/bank-accounts/`);
                // Update the accounts state with data from the response
                setAccounts(response.data);
            } catch (err) {
                // Handle any errors during the fetch
                console.error("Error fetching bank accounts:", err);
                setError("Failed to fetch bank accounts. Please try again later."); // Set user-friendly error message
            } finally {
                // Set loading to false once fetching is complete (success or error)
                setLoading(false);
            }
        };

        // Call the fetch function
        fetchBankAccounts();

    }, []); // The empty dependency array [] means this effect runs only once on mount

    // Conditional rendering based on loading state
    if (loading) {
        return (
            <div className="text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p>Loading Bank Accounts...</p>
            </div>
        );
    }

    // Conditional rendering based on error state
    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    // Render the list of bank accounts
    return (
        <div>
            <h2>Bank Accounts</h2>
            {accounts.length > 0 ? (
                <ListGroup>
                    {accounts.map(account => (
                        // Use account.id as the unique key for each list item
                        <ListGroup.Item key={account.id}>
                            <strong>{account.name}</strong>
                            {/* Display balance - ensure 'current_balance' exists in your API response data */}
                            {/* Add checks if the balance might be null or undefined in some cases */}
                            <span>
                                {typeof account.current_balance === 'number'
                                    ? ` - Balance: $${account.current_balance.toFixed(2)}`
                                    : ' - Balance: N/A'}
                            </span>
                            {/* You could add more details or action buttons here */}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) : (
                <Alert variant="info">No bank accounts found.</Alert> // Message if no accounts are returned
            )}
        </div>
    );
}

export default BankAccountList; // Export the component for use in other parts of the app