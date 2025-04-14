// cypress/e2e/bank_account_instances.cy.js

describe('Bank Account Instance Management with Dropdowns', function() {  

  // --- Setup Intercepts and Navigation ---
  beforeEach(function() {
    // Load fixtures and assign aliases BEFORE intercepts that use them
    cy.fixture('bankAccountInstances.json').as('instancesData');
    cy.fixture('bankAccounts.json').as('accountsData');
    cy.fixture('billStatuses.json').as('statusesData');
    cy.fixture('recurrences.json').as('recurrencesData');
    // Intercept API calls (Keep as before)

    //cy.intercept('GET', '/api/bank-account-instances/', { statusCode: 200, body: this.instancesData }).as('getInstances');
    cy.intercept('GET', '/api/bank-account-instances/', { statusCode: 200, body: this.instancesData }).as('getInstances');
    cy.intercept('GET', '/api/bank-accounts/', { statusCode: 200, body: this.accountsData }).as('getBankAccounts');
    cy.intercept('GET', '/api/bill-statuses/', { statusCode: 200, body: this.statusesData }).as('getBillStatuses');
    cy.intercept('GET', '/api/recurrences/', { statusCode: 200, body: this.recurrencesData }).as('getRecurrences');

    // --- FIX: Navigate to the correct tab ---
    cy.visit('/'); // Visit the root page where App.js renders the tabs

    // Click the 'Account Instances' tab to make its content visible
    cy.get('[role="tab"]').contains('Account Instances').click();

    // Optional but recommended: Wait for the necessary API calls for *this specific tab*
    // In this case, it's the instances list and the dropdown data.
    cy.wait(['@getInstances', '@getBankAccounts', '@getBillStatuses', '@getRecurrences']);
    // --- End FIX ---
  });
  // --- End Setup --- 

  // --- Test Table Display (Should now work) ---
  it('should display the instances table with names instead of IDs', function() {
    // The beforeEach already navigated and waited

    cy.get('[data-cy="bank-account-instances-heading"]').should('be.visible'); // Heading for THIS component
    cy.get('[data-cy="instances-table"]').should('be.visible');
    cy.get('[data-cy="instances-table"] tbody tr').should('have.length', this.instancesData.length);

    // Verify content of the FIRST row using NAMES
    cy.get('[data-cy="instance-row-1"]').within(() => {
      cy.get('td').eq(1).should('contain.text', 'Main Checking');
      cy.get('td').eq(4).should('contain.text', 'Expected');
    });

    // Verify content of the SECOND row using NAMES
    cy.get('[data-cy="instance-row-2"]').within(() => {
      cy.get('td').eq(1).should('contain.text', 'Emergency Savings');
      cy.get('td').eq(4).should('contain.text', 'Completed');
    });
  });
  // --- End Table Display Test ---


  // --- Test Modal Functionality ---
  describe('Add/Edit Instance Modal (within Account Instances Tab)', function() { // Added context to describe

    // No changes needed inside this inner describe block,
    // as the beforeEach from the *outer* describe block handles the navigation.

    it('should open the Add modal with populated dropdowns', function() {
      cy.get('[data-cy="add-instance-button"]').click();
      // ... rest of the test assertions for dropdowns ...
      cy.get('[data-cy="instance-bank-account-input"]').find('option[value="101"]').should('contain.text', 'Main Checking');
      cy.get('[data-cy="instance-status-input"]').find('option[value="3"]').should('contain.text', 'Expected');
      cy.get('[data-cy="instance-recurrence-input"]').find('option[value="5"]').should('contain.text', 'Monthly');
    });

    it('should fail validation if required dropdowns are not selected on Add', function() {
        cy.get('[data-cy="add-instance-button"]').click();
        // ... fill non-dropdown fields ...
        cy.get('[data-cy="instance-name-input"]').type('Test Instance Name');
        cy.get('[data-cy="instance-due-date-input"]').type('2024-01-10');
        cy.get('[data-cy="instance-modal-save-button"]').click();
        // ... assert error message ...
        cy.get('[data-cy="instance-modal-error-alert"]')
          .should('be.visible')
          .and('contain.text', 'Bank Account and Status are required fields.');
    });


    it('should successfully add a new instance using dropdowns', function() {
      // Intercept the POST request (re-intercept needed if not in beforeEach)
      //cy.intercept('POST', '/api/bank-account-instances/', { statusCode: 201, body: { id: 3, ...mockInstances[0] } }).as('postInstance');
      // Intercept the GET refresh (re-intercept needed if not in beforeEach)
      //cy.intercept('GET', '/api/bank-account-instances/', { statusCode: 200, body: [...mockInstances, { id: 3, ...mockInstances[0] }] }).as('getInstancesAfterAdd');

      // Open Add modal
      cy.get('[data-cy="add-instance-button"]').click();

      // Fill form including selecting from dropdowns
      cy.get('[data-cy="instance-bank-account-input"]').select('102');
      cy.get('[data-cy="instance-name-input"]').type('Test Monthly Transfer');
      cy.get('[data-cy="instance-status-input"]').select('Expected');
      // ... other fields ...
      cy.get('[data-cy="instance-modal-save-button"]').click();

      // Wait and assert POST payload
      cy.wait('@postInstance').its('request.body').should('deep.include', { bank_account: 102, status: 3 });

      // Wait for refresh and assert table update
      cy.wait('@getInstancesAfterAdd');
      cy.get('[data-cy="instance-row-3"]').should('be.visible');
    });


    it('should open the Edit modal with correct values pre-selected in dropdowns', function() {
      // Click Edit on the first row
      cy.get('[data-cy="edit-instance-button-1"]').click();
      // ... rest of assertions for pre-filled values ...
      cy.get('[data-cy="instance-bank-account-input"]').should('have.value', '101');
      cy.get('[data-cy="instance-status-input"]').should('have.value', '3');
      cy.get('[data-cy="instance-recurrence-input"]').should('have.value', '5');
    });

    it('should successfully edit an existing instance using dropdowns', function() {
        const instanceIdToEdit = 1;
        const updatedInstanceData = { /* ... as before ... */ status: 4, recurrence: null, name: "Updated Salary Deposit", bank_account: 101, due_date: '2023-12-15', current_balance: "2500.00" }; // Ensure you include enough fields for the check
        const updatedList = mockInstances.map(inst => inst.id === instanceIdToEdit ? updatedInstanceData : inst);


        // Re-intercept PUT/GET needed if not in beforeEach
        cy.intercept('PUT', `/api/bank-account-instances/${instanceIdToEdit}/`, { statusCode: 200, body: updatedInstanceData }).as('putInstance');
        cy.intercept('GET', '/api/bank-account-instances/', { statusCode: 200, body: updatedList }).as('getInstancesAfterEdit');

        // Open Edit modal
        cy.get(`[data-cy="edit-instance-button-${instanceIdToEdit}"]`).click();

        // Change values
        cy.get('[data-cy="instance-name-input"]').clear().type('Updated Salary Deposit');
        cy.get('[data-cy="instance-status-input"]').select('4'); // Select 'Completed'
        cy.get('[data-cy="instance-recurrence-input"]').select(''); // Set to null

        // Save
        cy.get('[data-cy="instance-modal-save-button"]').click();

        // Assert PUT payload
        cy.wait('@putInstance').its('request.body').should('deep.include', { name: "Updated Salary Deposit", status: 4, recurrence: null, bank_account: 101 });

        // Assert table update
        cy.wait('@getInstancesAfterEdit');
        cy.get(`[data-cy="instance-row-${instanceIdToEdit}"]`).within(() => {
            cy.get('td').eq(2).should('contain.text', 'Updated Salary Deposit');
            cy.get('td').eq(4).should('contain.text', 'Completed'); // Updated Status Name
        });
    });
  });
  // --- End Modal Tests ---

});