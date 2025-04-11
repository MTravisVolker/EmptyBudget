// cypress/e2e/bank_accounts.cy.js

describe('Due Bill Management Table', () => {
  // Define mock data matching the expected API response structure
  const mockDueBills = [
    {
      id: 1,
      bill: 10, // Assuming Bill definition ID 10
      priority: 1,
      due_date: '2023-11-15',
      pay_date: null,
      min_amount_due: '50.00',
      total_amount_due: '120.50',
      status: 1, // Assuming Bill Status ID 1 (e.g., 'Pending')
      archived: false,
      confirmation: null,
      notes: 'Monthly Rent',
      draft_account: 101, // Assuming Bank Account ID 101
      recurrence: 5, // Assuming Recurrence ID 5
    },
    {
      id: 2,
      bill: 12,
      priority: 0,
      due_date: '2023-11-20',
      pay_date: '2023-11-19',
      min_amount_due: null,
      total_amount_due: '55.00',
      status: 2, // Assuming Bill Status ID 2 (e.g., 'Paid')
      archived: false,
      confirmation: 'CONF-ABC',
      notes: '',
      draft_account: 102,
      recurrence: null, // One-off bill
    },
  ];

  beforeEach(() => {
    // Visit the page before each test in this block
    cy.visit('/');
  });

    it('should display the Due Bills heading', () => {
      // Find the heading specific to the Due Bills list
      cy.contains('h2', 'Due Bills / Bill Instances').should('be.visible');
    });

    it('should display a list of Due Bills (if any exist)', () => {
      // Wait for the API call implicitly (Cypress often does this well)
      // Or add an explicit wait if needed (cy.wait('@alias')) - requires cy.intercept

      // Find the list group element (based on react-bootstrap structure)
      // This selector might need adjustment based on your final HTML structure

      //cy.get('[data-cy="due-bills-table"]').
      //cy.get('[data-cy="due-bills-table"] > tbody > :nth-child(1) > :nth-child(1)') 

      // cypress/e2e/due_bills.cy.js
    });

    // --- Test Case 1: Successful Data Load ---
    it('should load and display the due bills table with data', () => {
      // Intercept the GET request and return mock data
      cy.intercept('GET', '/api/due-bills/', {
        statusCode: 200,
        body: mockDueBills,
      }).as('getDueBills'); // Assign an alias

      // Visit the page where DueBillManager component is rendered
      cy.visit('/');

      // Wait for the API call to complete
      cy.wait('@getDueBills');

      // 1. Check heading is visible
      cy.get('[data-cy="due-bills-heading"]').should('be.visible');

      // 2. Check that the table is visible
      cy.get('[data-cy="due-bills-table"]').should('be.visible');

      // 3. Check table headers (optional but good)
      cy.get('[data-cy="due-bills-table"] thead th').should('have.length', 10); // Ensure all 10 headers are present
      cy.get('[data-cy="due-bills-table"] thead th').eq(2).should('contain.text', 'Due Date'); // Check specific header text

      // 4. Check the number of data rows matches mock data
      cy.get('[data-cy="due-bills-table"] tbody tr').should('have.length', mockDueBills.length);

      // 5. Verify content of the FIRST row based on mock data
      cy.get('[data-cy="due-bill-row-1"]').within(() => { // Scope checks within the first row (using its data-cy)
        // Check specific cells by their index (0-based)
        cy.get('td').eq(0).should('contain.text', '1'); // ID
        cy.get('td').eq(1).should('contain.text', '10'); // Bill ID
        cy.get('td').eq(2).should('contain.text', '2023-11-15'); // Due Date
        cy.get('td').eq(3).should('contain.text', '$120.50'); // Total Due (formatted)
        cy.get('td').eq(4).should('contain.text', '1'); // Status ID
        cy.get('td').eq(5).should('contain.text', 'N/A'); // Pay Date (Null)
        cy.get('td').eq(6).should('contain.text', '101'); // Draft Account ID
        cy.get('td').eq(7).should('contain.text', '1'); // Priority
        cy.get('td').eq(8).should('contain.text', 'No'); // Archived
        // Check buttons exist within the row
        cy.get('[data-cy="edit-button-1"]').should('be.visible');
        cy.get('[data-cy="delete-button-1"]').should('be.visible');
      });

      // 6. (Optional) Verify content of the SECOND row
      cy.get('[data-cy="due-bill-row-2"]').within(() => {
        cy.get('td').eq(0).should('contain.text', '2'); // ID
        cy.get('td').eq(3).should('contain.text', '$55.00'); // Total Due
        cy.get('td').eq(5).should('contain.text', '2023-11-19'); // Pay Date
        cy.get('td').eq(6).should('contain.text', '102'); // Draft Account ID
      });
    });

    // --- Test Case 2: Empty State ---
    it('should display an empty message when no due bills are returned', () => {
      // Intercept and return an empty array
      cy.intercept('GET', '/api/due-bills/', {
        statusCode: 200,
        body: [], // Empty list
      }).as('getEmptyDueBills');

      cy.visit('/');
      cy.wait('@getEmptyDueBills');

      // Check heading is still there
      cy.get('[data-cy="due-bills-heading"]').should('be.visible');

      // Check that the table DOES NOT exist
      cy.get('[data-cy="due-bills-table"]').should('not.exist');
    });

    // --- Test Case 3: Error State ---
    it('should display an error message if the API call fails', () => {
      // Intercept and force a server error
      cy.intercept('GET', '/api/due-bills/', {
        statusCode: 500,
        body: { message: 'Internal Server Error simulation' }, // Optional body
      }).as('getDueBillsError');

      cy.visit('/');
      cy.wait('@getDueBillsError');

      // Check heading is still there
      cy.get('[data-cy="due-bills-heading"]').should('be.visible');

      // Check that the error message IS visible
      cy.get('[data-cy="due-bills-error-alert"]')
        .should('be.visible')
        .and('contain.text', 'Failed to load due bills.'); // Check specific text
    });

    // --- (Optional Test Case 4: Loading State - Harder to test reliably) ---
    // it('should display a loading indicator while fetching', () => {
    //   cy.intercept('/api/due-bills/', { delay: 1000, body: mockDueBills }).as('getDueBillsSlow');
    //   cy.visit('/');
    //   cy.get('.spinner-border').should('be.visible'); // Check for Bootstrap spinner
    //   cy.wait('@getDueBillsSlow');
    //   cy.get('.spinner-border').should('not.exist');
    // });

    // Example: Check the content of the first item
    // cy.get('.list-group-item')
    //   .first() // Get the first one
    //   .should('contain', 'Checking') // Check for expected text
    //   .and('contain', '$'); // Check it also contains a dollar sign (for balance)
  });

  // Add more tests: test loading state, error state, empty state
  it('should display a loading indicator initially (optional test)', () => {
    // This test is tricky because the loading state might be very brief.
    // You might need to intercept and delay the network request to reliably test this.
    // cy.contains('Loading Due Billss...').should('be.visible');
  });

  it('should display an error message if fetching fails', () => {
    // --- Requires Network Interception ---
    // Intercept the API call and force it to fail
    cy.intercept('GET', '/api/due-bills/', {
      statusCode: 500,
      body: { message: 'Internal Server Error' }
    }).as('getAccountsFail'); // Give the interception an alias

    cy.visit('/'); // Re-visit after setting up intercept

    // cy.wait('@getAccountsFail'); // Wait for the intercepted call to happen

    // Check for the error message shown by your component
    cy.contains('Failed to load due bills.').should('be.visible');
  });

  /*    it('should display "No Due Bills found" if API returns empty list', () => {
       // --- Requires Network Interception ---
       cy.intercept('GET', '/api/due-bills/', {
           statusCode: 200,
           body: [] // Return an empty array
       }).as('getEmptyAccounts');
  
       cy.visit('/');
  
       // cy.wait('@getEmptyAccounts');
  
       cy.contains('No Due Bills found').should('be.visible');
    }); */