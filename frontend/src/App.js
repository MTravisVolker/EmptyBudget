import logo from './logo.svg';
import './App.css';
import React from 'react';

import Container from 'react-bootstrap/Container';
/* import BankAccountList from './components/BankAccountList'; // Import your component */

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import RecurrenceManager from './components/RecurrenceManager';
import BillStatusManager from './components/BillStatusManager';
import BankAccountManager from './components/BankAccountManager';
import BillManager from './components/BillManager';
import DueBillManager from './components/DueBillManager';
import BankAccountInstanceManager from './components/BankAccountInstanceManager';

function App() {
  return (
    <Container fluid className="mt-3">
      <h1>Budget App Management</h1>

      <Tabs defaultActiveKey="dueBills" id="crud-tabs" className="mb-3">
        <Tab eventKey="dueBills" title="Due Bills">
          <DueBillManager />
        </Tab>
         <Tab eventKey="bills" title="Bill Definitions">
          <BillManager />
        </Tab>
        <Tab eventKey="accounts" title="Bank Accounts">
          <BankAccountManager />
        </Tab>
         <Tab eventKey="accountInstances" title="Account Instances">
          <BankAccountInstanceManager />
        </Tab>
         <Tab eventKey="statuses" title="Bill Statuses">
           <BillStatusManager />
         </Tab>
        <Tab eventKey="recurrences" title="Recurrences">
          <RecurrenceManager />
        </Tab>
      </Tabs>

    </Container>
  );
}

/* function App() {
  return (
    <div className="App">
      <Container className="mt-4">
        <header className="App-header">
          <h1>Budget App</h1>
        </header>
        <main>
          <BankAccountList />
        </main>
      </Container>
    </div>
  );
}

 function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
} */

export default App;