# Budgeting App PRD

## Product Overview

The Budgeting App is a web-based SaaS application designed to help users manage their finances by tracking bank accounts, credit card accounts, and bills. It provides a clear view of current account balances, upcoming and paid bills, and projected balances after bill payments. The app supports user-configurable categories and a user-selected date range for viewing financial data. It focuses on manual data entry and does not include income tracking, notifications, or multi-currency support.

## Target Audience

- Individuals managing personal finances who need a simple, clear view of their bills and account balances.
- Users who prefer manual control over their financial data without relying on bank integrations or automated updates.

## Key Features

1. **Point-in-Time Balances**:
   - Users manually enter current balances for bank and credit card accounts.

2. **User-Selected Time Horizon**:
   - Users choose a date range to view upcoming and past bills.

3. **Bill Management**:
   - Support for creating, editing, and deleting bills with recurrence options.
   - Bills are marked as "Upcoming" or "Paid."

4. **Category Management**:
   - Users can create, edit, and delete custom categories for bills.

5. **Bill History**:
   - Display both upcoming and paid bills within the selected date range.

6. **Projected Balances**:
   - Show the impact of upcoming bills on bank account balances.

7. **Credit Card Tracking**:
   - Track outstanding balance and available credit for credit cards.
   - Credit card payments are entered as bills paid from bank accounts.

8. **Manual Data Entry**:
   - No automated bank integrations; users update balances and mark bills as paid.

9. **Single Currency**:
   - All financial data is handled in a single, unspecified currency.

## User Interface

### Primary List View

- **Spreadsheet Looking Modern Html Table**: The list will be a simple tableview.
- **Row and Column Hightlights**: The table will have alternating row colors. And the row will and column will darken when the mouse hovers over it.
- **Date Range Selector**: Users set a start and end date to filter bills. A React.js date range selector tool will be used.
- **Default Value for Date Range Selector**: 
- **Grouped by Bank Account**: Each section displays the account name and current balance.
- **Bills Ordered by Due Date**: Lists all bills (paid and upcoming) within the date range.
- **Projected Balances**: For upcoming bills, show the balance after each bill.
- **Bill Status**: Indicate whether each bill is "Paid" or "Upcoming."
- **CRUD Controls**: Inline options to add, edit, or delete bills and accounts.

**Example Layout:**

```
Date Range: Oct 1, 2023 - Dec 31, 2023

Bank Account: Checking Account
Current Balance: $1,000

- Nov 1, 2023: Paid - Electricity Bill - $100 (Category: Utilities)
- Nov 5, 2023: Paid - Water Bill - $50 (Category: Utilities)
- Nov 15, 2023: Upcoming - Rent - $500 (Category: Housing)
  Projected Balance: $500
- Nov 20, 2023: Upcoming - Internet - $60 (Category: Utilities)
  Projected Balance: $440

Bank Account: Savings Account
Current Balance: $500

- Nov 18, 2023: Upcoming - Car Insurance - $200 (Category: Insurance)
  Projected Balance: $300
```

- **Add Buttons**: Include “+ Add Bill” and “+ Add Account” options.
- **Edit/Delete**: Icons or buttons next to each item for modifications.

### Additional Pages

- **Account Management**: View and update bank and credit card account details.
- **Category Management**: Interface for users to manage categories.

## Functional Requirements

1. **Time Horizon**:
   - Users select a date range to view bills with due dates within that range.
   - Recurring bills generate instances only within the selected range.

2. **Projected Balances**:
   - Calculated by subtracting upcoming bill amounts from the current bank account balance in due date order.
   - Paid bills are displayed but do not affect projections.

3. **Bill Status**:
   - Bills default to "Upcoming" and can be marked as "Paid" by the user.

4. **Category Management**:
   - Users can add, edit, or delete categories via a dedicated interface.
   - Categories are selected when adding or editing bills.

5. **Recurring Bills**:
   - Support for none, monthly, and yearly recurrence.
   - Future instances are generated based on the recurrence pattern within the date range.

6. **Credit Card Handling**:
   - Credit card payments are entered as bills with user-specified amounts.
   - Outstanding balance and available credit are manually updated.

7. **CRUD Operations**:
   - **Create**: Add bills, accounts, or categories via forms.
   - **Read**: Display details in the list or management sections.
   - **Update**: Edit entries inline or through modals.
   - **Delete**: Remove items with confirmation.

## Technical Considerations

- **Manual Data Entry**: No bank integrations; users are responsible for updating balances and bill statuses.
- **Single Currency**: All amounts are treated as being in one currency.
- **Data Security**: Financial data is stored securely with encryption.
- **User Authentication**: Secure login and registration to protect user data.

## Non-Functional Requirements

- **Usability**: The app should be intuitive for users with basic financial knowledge.
- **Performance**: The app should load quickly, even with a large number of bills and accounts.
- **Scalability**: The app should support multiple users with their own data sets.

## Assumptions and Constraints

- **Assumptions**:
  - Users will manually enter and update their financial data.
  - The app does not need to handle multiple currencies.
  - Notifications are not required.

- **Constraints**:
  - No automated data fetching from banks or financial institutions.
  - The app must be web-based and accessible via modern browsers.

## Success Metrics

- **User Satisfaction**: High user satisfaction with the clarity and usability of the financial overview.
- **Adoption**: A growing number of users actively managing their bills and accounts.
- **Retention**: Users continue to use the app over time to manage their finances.

## Future Considerations

- **Mobile App**: Potential development of a mobile version for on-the-go access.
- **Reporting**: Optional features for generating financial reports or summaries.
- **Automation**: Future integration with bank APIs for automated balance updates (if desired).