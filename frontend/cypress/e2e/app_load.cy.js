// cypress/e2e/app_load.cy.js

describe('Application Loading', () => {
    it('should load the home page successfully', () => {
      // Visit the base URL (http://localhost:3000 configured in cypress.config.js)
      cy.visit('/');
  
      // Check if an element containing the text "Budget App" exists and is visible
      // Adjust "Budget App" to match the actual title or header in your App.js
      cy.contains('h1', 'Budget App').should('be.visible');
  
      // You could add more checks here, e.g., checking if the main navigation exists
      // cy.get('nav').should('exist');
    });
  });