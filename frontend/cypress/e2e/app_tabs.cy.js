// cypress/e2e/app_tabs.cy.js

describe('App Component Tabs Functionality', () => {
  // Define aliases for all API endpoints used by child components
  const intercepts = {
    dueBills: { method: 'GET', path: '/api/due-bills/', alias: 'getDueBills' },
    bills: { method: 'GET', path: '/api/bills/', alias: 'getBills' },
    bankAccounts: { method: 'GET', path: '/api/bank-accounts/', alias: 'getBankAccounts' },
    accountInstances: { method: 'GET', path: '/api/bank-account-instances/', alias: 'getAccInstances' },
    billStatuses: { method: 'GET', path: '/api/bill-statuses/', alias: 'getBillStatuses' },
    recurrences: { method: 'GET', path: '/api/recurrences/', alias: 'getRecurrences' },
  };

  beforeEach(() => {
    // Intercept ALL potential API calls from child components before visiting
    // Return empty arrays to allow components to render without data/errors
    cy.intercept(intercepts.dueBills.method, intercepts.dueBills.path, { statusCode: 200, body: [] }).as(intercepts.dueBills.alias);
    cy.intercept(intercepts.bills.method, intercepts.bills.path, { statusCode: 200, body: [] }).as(intercepts.bills.alias);
    cy.intercept(intercepts.bankAccounts.method, intercepts.bankAccounts.path, { statusCode: 200, body: [] }).as(intercepts.bankAccounts.alias);
    cy.intercept(intercepts.accountInstances.method, intercepts.accountInstances.path, { statusCode: 200, body: [] }).as(intercepts.accountInstances.alias);
    cy.intercept(intercepts.billStatuses.method, intercepts.billStatuses.path, { statusCode: 200, body: [] }).as(intercepts.billStatuses.alias);
    cy.intercept(intercepts.recurrences.method, intercepts.recurrences.path, { statusCode: 200, body: [] }).as(intercepts.recurrences.alias);

    // Visit the root page
    cy.visit('/');
  });

  it('should render the main heading and tab structure', () => {
    // Check main heading
    cy.contains('h1', 'Budget App Management').should('be.visible');

    // Check that the tab list exists (react-bootstrap renders a nav structure)
    cy.get('ul[role="tablist"].nav-tabs').should('be.visible');

    // Check that all tab links are rendered
    cy.get('[role="tab"]').contains('Due Bills').should('be.visible');
    cy.get('[role="tab"]').contains('Bill Definitions').should('be.visible');
    cy.get('[role="tab"]').contains('Bank Accounts').should('be.visible');
    cy.get('[role="tab"]').contains('Account Instances').should('be.visible');
    cy.get('[role="tab"]').contains('Bill Statuses').should('be.visible');
    cy.get('[role="tab"]').contains('Recurrences').should('be.visible');
  });

  it('should have "Due Bills" tab active by default and render its content', () => {
    // Check "Due Bills" tab link is active (react-bootstrap uses 'active' class and aria-selected)
    cy.get('[role="tab"]')
      .contains('Due Bills')
      .should('have.class', 'active')
      .and('have.attr', 'aria-selected', 'true');

    // Check other tabs are not active
    cy.get('[role="tab"]')
      .contains('Bill Definitions')
      .should('not.have.class', 'active')
      .and('have.attr', 'aria-selected', 'false');

    // Check that the DueBillManager's heading is visible
    cy.get('[data-cy="due-bills-heading"]').should('be.visible');

    // Check that another manager's heading is NOT visible (or doesn't exist)
    //cy.get('[data-cy="bills-heading"]').should('not.exist'); // Assumes inactive tabs are unmounted
    cy.get('[data-cy="bills-heading"]').should('not.be.visible'); // Assumes inactive tabs are unmounted
    // If inactive tabs are hidden but still in DOM: .should('not.be.visible');
  });

  it('should switch to "Bill Definitions" tab and render its content when clicked', () => {
    // Click the "Bill Definitions" tab link
    cy.get('[role="tab"]').contains('Bill Definitions').click();

    // Check "Bill Definitions" is now active
    cy.get('[role="tab"]')
      .contains('Bill Definitions')
      .should('have.class', 'active')
      .and('have.attr', 'aria-selected', 'true');

    // Check "Due Bills" is no longer active
    cy.get('[role="tab"]')
      .contains('Due Bills')
      .should('not.have.class', 'active')
      .and('have.attr', 'aria-selected', 'false');

    // Check BillManager content is visible
    cy.get('[data-cy="bills-heading"]').should('be.visible'); // Assuming BillManager has this data-cy

    // Check DueBillManager content is not visible/doesn't exist
    //cy.get('[data-cy="due-bills-heading"]').should('not.exist');
    cy.get('[data-cy="due-bills-heading"]').should('not.be.visible');
  });

  it('should switch to "Bank Accounts" tab and render its content when clicked', () => {
    cy.get('[role="tab"]').contains('Bank Accounts').click();
    cy.get('[role="tab"]').contains('Bank Accounts').should('have.class', 'active');
    cy.get('[role="tab"]').contains('Due Bills').should('not.have.class', 'active');
    cy.get('[data-cy="bank-account-manager-heading"]').should('be.visible'); // Assuming BankAccountManager has this
    //cy.get('[data-cy="due-bills-heading"]').should('not.exist');
    cy.get('[data-cy="due-bills-heading"]').should('not.be.visible');
  });

  it('should switch to "Account Instances" tab and render its content when clicked', () => {
    cy.get('[role="tab"]').contains('Account Instances').click();
    cy.get('[role="tab"]').contains('Account Instances').should('have.class', 'active');
    cy.get('[role="tab"]').contains('Due Bills').should('not.have.class', 'active');
    cy.get('[data-cy="bank-account-instances-heading"]').should('be.visible'); // Assuming BankAccountInstanceManager has this
    //cy.get('[data-cy="due-bills-heading"]').should('not.exist');
    cy.get('[data-cy="due-bills-heading"]').should('not.be.visible');
  });

  it('should switch to "Bill Statuses" tab and render its content when clicked', () => {
    cy.get('[role="tab"]').contains('Bill Statuses').click();
    cy.get('[role="tab"]').contains('Bill Statuses').should('have.class', 'active');
    cy.get('[role="tab"]').contains('Due Bills').should('not.have.class', 'active');
    cy.get('[data-cy="bill-status-manager-heading"]').should('be.visible'); // Assuming BillStatusManager has this
    //cy.get('[data-cy="due-bills-heading"]').should('not.exist');
    cy.get('[data-cy="due-bills-heading"]').should('not.be.visible');
  });

  it('should switch to "Recurrences" tab and render its content when clicked', () => {
    cy.get('[role="tab"]').contains('Recurrences').click();
    cy.get('[role="tab"]').contains('Recurrences').should('have.class', 'active');
    cy.get('[role="tab"]').contains('Due Bills').should('not.have.class', 'active');
    cy.get('[data-cy="recurrences-heading"]').should('be.visible'); // Assuming RecurrenceManager has this
    //cy.get('[data-cy="due-bills-heading"]').should('not.exist');
    cy.get('[data-cy="due-bills-heading"]').should('not.be.visible');
  });
});