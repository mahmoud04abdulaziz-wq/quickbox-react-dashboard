# Teamwork Project Prompt — Draft

> Status: Step 5 & 6 — Designing verification and acceptance criteria
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: [none — teamwork routes from the description]

Implement frontend features to match the Jordanian financial and accounting research topics outlined in the Financial Management document, specifically adding all missing pages to the application.

Working directory: c:\Users\User\Desktop\mahmoud personal\Internship\react-dashboard
Integrity mode: benchmark

## Requirements

### R1. New Financial Views
Create new React components in `src/pages/finance/` for the missing topics:
- Budgeting & Forecasting (Topic 1)
- Account Reconciliation (Topic 2)
- Internal Controls & Approvals (Topic 4)
- Tender & Bid Auditing (Topic 5)
- Cash Flow Management (Topic 6)
- Financial Policies (Topic 16)
The UI must strictly follow the premium design system established in `App.css` and use Phosphor Icons.

### R2. Navigation Update
Update `src/components/Sidebar.jsx` to include navigation links for all the newly created views under the "Finance" section.

### R3. Data Integration
Update `FinanceContext.jsx` to include dummy data and state management for the new features (e.g., a list of tenders, a list of pending approvals).

## Acceptance Criteria

### Agent-as-Judge Verification
- [ ] An independent auditor subagent confirms that the 6 new view components exist in `src/pages/finance/`.
- [ ] An independent auditor subagent confirms that `Sidebar.jsx` contains active `NavLink` elements for all 6 new views.
- [ ] An independent auditor subagent confirms that `FinanceContext.jsx` contains state for at least one of the new features (e.g., Tenders or Approvals).

### Programmatic Verification
- [ ] The command `npm run build` exits with code 0 (no build errors).

---
*Next: when approved → delegate via invoke_subagent (see Delegation Protocol)*
