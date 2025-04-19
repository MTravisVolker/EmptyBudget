const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
     // Set the base URL of your React application
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  // Enable source maps
  devtool: 'source-map',
  // Configure webpack to handle source maps
  webpack: {
    devtool: 'source-map'
  }
});
