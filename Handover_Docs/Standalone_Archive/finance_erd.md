# QuickBox Financial System --- Entity Relationship Diagram (ERD) & Entity Dictionary

**Document Version:** 1.0.0\
**Classification:** Enterprise Financial Architecture & Database
Specification\
**Status:** Approved for Handover\
**Target System:** Standalone QuickBox Financial Management Platform\
**Language:** English (100% English Standard)\
**Author:** QuickBox Architecture & Data Engineering Team

------------------------------------------------------------------------

## 1. Executive Summary & Architectural Overview

The **QuickBox Financial Management System** is a standalone,
enterprise-grade, double-entry financial platform designed to deliver
institutional accounting, multi-currency treasury management, accounts
receivable/payable automation, automated gross-to-net payroll
processing, statutory tax/VAT compliance, capital asset lifecycle
tracking, and financial statement generation compliant with **IFRS
(International Financial Reporting Standards)** and **GAAP (Generally
Accepted Accounting Principles)**.

### Core Data Architecture Highlights:

1.  **Double-Entry General Ledger Invariant**: Every accounting event is
    stored as an atomic `JournalEntry` comprising two or more balanced
    `JournalLine` records where
    $\sum\text{Debits} \equiv \sum\text{Credits}$ at all times.
2.  **Strict Standalone Boundary**: The database architecture is **100%
    decoupled from inventory operations**. It contains zero dependencies
    on physical stock items, SKU tracking, warehouse bins, or supply
    logistics.
3.  **High-Precision Monetary Representation**: All monetary values are
    modeled with fixed-point decimal precision (`numeric(18, 4)` /
    `decimal(18, 4)`) to eliminate binary floating-point rounding
    errors.
4.  **Immutable Audit Trails**: Posted accounting records (journals,
    reconciled payments, closed tax returns) are immutable. Adjustments
    are executed strictly through offsetting reversal vouchers with full
    change capture in `AuditLog`.
5.  **Multi-Currency & Dual-FX Ledger**: Transactions record both the
    foreign currency transaction amount and the normalized base
    functional currency equivalent alongside the spot exchange rate.

------------------------------------------------------------------------

## 2. Mermaid Entity Relationship Diagram (ERD)

The following Mermaid ERD defines all core financial entities, primary
keys (`PK`), foreign keys (`FK`), unique keys (`UK`), and relational
cardinalities:

```mermaid
erDiagram
    %% ==========================================
    %% FISCAL PERIOD & COST CENTER HIERARCHY
    %% ==========================================
    FiscalYear ||--o{ FiscalPeriod : "subdivided_into"
    FiscalYear ||--o{ Budget : "budgeted_for"
    FiscalPeriod ||--o{ JournalEntry : "contains_postings"
    FiscalPeriod ||--o{ TaxPeriod : "aligns_with"
    FiscalPeriod ||--o{ PayrollRun : "executes_in"
    FiscalPeriod ||--o{ BudgetItem : "period_allocated"

    CostCenter ||--o{ CostCenter : "parent_cost_center"
    CostCenter ||--o{ JournalLine : "cost_allocated_to"
    CostCenter ||--o{ InvoiceLine : "revenue_assigned_to"
    CostCenter ||--o{ BillLine : "cost_assigned_to"
    CostCenter ||--o{ Employee : "assigned_department"
    CostCenter ||--o{ FixedAsset : "asset_location"
    CostCenter ||--o{ BudgetItem : "budget_department"

    %% ==========================================
    %% CHART OF ACCOUNTS & GENERAL LEDGER
    %% ==========================================
    Account ||--o{ Account : "parent_account"
    Account ||--o{ JournalLine : "debited_or_credited"
    Account ||--o{ InvoiceLine : "revenue_account"
    Account ||--o{ BillLine : "expense_account"
    Account ||--o| BankAccount : "gl_cash_link"
    Account ||--o{ FixedAsset : "asset_cost_account"
    Account ||--o{ FixedAsset : "accum_deprec_account"
    Account ||--o{ FixedAsset : "deprec_expense_account"
    Account ||--o{ BudgetItem : "budget_account"

    JournalEntry ||--|{ JournalLine : "comprises_lines"
    JournalEntry ||--o| JournalEntry : "reversal_of"
    JournalEntry ||--o| Invoice : "originates_from_ar"
    JournalEntry ||--o| Bill : "originates_from_ap"
    JournalEntry ||--o| Payment : "originates_from_cash"
    JournalEntry ||--o| PayrollRun : "originates_from_payroll"
    JournalEntry ||--o| TaxReturn : "originates_from_tax"
    JournalEntry ||--o{ DepreciationEntry : "originates_from_deprec"

    %% ==========================================
    %% ACCOUNTS RECEIVABLE (AR) & INVOICING
    %% ==========================================
    Customer ||--o{ Invoice : "billed_to"
    Customer ||--o{ Payment : "remits_payment"
    Invoice ||--|{ InvoiceLine : "contains_items"
    Invoice ||--o{ PaymentAllocation : "settled_by"

    %% ==========================================
    %% ACCOUNTS PAYABLE (AP) & EXPENSES
    %% ==========================================
    Vendor ||--o{ Bill : "issues_bill"
    Vendor ||--o{ Payment : "receives_payment"
    Vendor }o--|| Account : "default_expense_gl"
    Bill ||--|{ BillLine : "contains_items"
    Bill ||--o{ PaymentAllocation : "settled_by"

    %% ==========================================
    %% PAYMENTS & ALLOCATIONS
    %% ==========================================
    Payment ||--o{ PaymentAllocation : "allocates_funds"
    BankAccount ||--o{ Payment : "disburses_or_deposits"

    %% ==========================================
    %% BANKING, TREASURY & RECONCILIATION
    %% ==========================================
    BankAccount ||--o{ BankTransaction : "feeds_statement_lines"
    BankAccount ||--o{ BankReconciliation : "reconciled_in"
    BankReconciliation ||--o{ ReconciliationMatch : "reconciled_via"
    BankTransaction ||--o| ReconciliationMatch : "matched_bank_line"
    JournalLine ||--o| ReconciliationMatch : "matched_gl_line"
    Payment ||--o| ReconciliationMatch : "matched_payment_record"

    %% ==========================================
    %% PAYROLL & COMPENSATION
    %% ==========================================
    Employee ||--o{ Payslip : "earns_compensation"
    PayrollRun ||--|{ Payslip : "processes_batch"
    Payslip ||--|{ PayslipLine : "itemizes_components"

    %% ==========================================
    %% TAX & VAT COMPLIANCE
    %% ==========================================
    TaxPeriod ||--o| TaxReturn : "filed_under"

    %% ==========================================
    %% FIXED ASSETS & DEPRECIATION
    %% ==========================================
    FixedAsset ||--|{ DepreciationSchedule : "amortization_schedule"
    FixedAsset ||--o{ DepreciationEntry : "posted_depreciation"
    DepreciationSchedule ||--o| DepreciationEntry : "materialized_into"

    %% ==========================================
    %% BUDGETING & VARIANCE ANALYSIS
    %% ==========================================
    Budget ||--|{ BudgetItem : "contains_line_items"

    %% ==========================================
    %% ENTITY DEFINITIONS & ATTRIBUTES
    %% ==========================================

    FiscalYear {
        uuid year_id PK "Unique fiscal year identifier"
        varchar year_code UK "Fiscal year code e.g. FY2026"
        date start_date "Fiscal year start date"
        date end_date "Fiscal year end date"
        boolean is_closed "True if year-end close is finalized"
        timestamp closed_at "Year-end closing timestamp"
        uuid closed_by "User ID who executed closing"
        timestamp created_at "Creation timestamp"
    }

    FiscalPeriod {
        uuid period_id PK "Unique fiscal period identifier"
        uuid fiscal_year_id FK "Reference to parent fiscal year"
        integer period_number "Period number 1 to 12 or 13"
        varchar period_name "Descriptive name e.g. 2026-08 August"
        date start_date "Period start date"
        date end_date "Period end date"
        varchar status "Open, Locked, Closed"
        timestamp locked_at "Timestamp when period was locked"
        timestamp created_at "Creation timestamp"
    }

    CostCenter {
        uuid cost_center_id PK "Unique cost center identifier"
        varchar cost_center_code UK "Cost center code e.g. CC-100"
        varchar cost_center_name "Department or project title"
        uuid parent_id FK "Recursive self-reference hierarchy"
        uuid manager_id "Department head user ID"
        boolean is_active "Operational active flag"
        timestamp created_at "Creation timestamp"
    }

    Account {
        uuid account_id PK "Unique GL account identifier"
        varchar account_code UK "Hierarchical COA code e.g. 1010"
        varchar account_name "Descriptive account name"
        varchar account_type "Asset, Liability, Equity, Revenue, Expense"
        varchar sub_category "CurrentAsset, NonCurrentAsset, Opex, etc."
        varchar normal_balance "DEBIT or CREDIT"
        uuid parent_account_id FK "Parent account for sub-ledgers"
        varchar currency_code "ISO currency code e.g. AED, USD"
        boolean is_reconciled "Flag for bank/reconcilable accounts"
        boolean is_active "Operational active flag"
        numeric current_balance "Real-time running balance"
        timestamp created_at "Account creation timestamp"
    }

    JournalEntry {
        uuid journal_id PK "Unique journal voucher identifier"
        varchar voucher_number UK "Sequential voucher number e.g. JV-2026-00104"
        date posting_date "Effective accounting date"
        uuid fiscal_period_id FK "Associated accounting period"
        varchar voucher_type "General, Adjusting, Closing, Opening, Payroll, Depreciation, TaxSettlement"
        varchar reference_number "External document reference"
        text memo "Business description and rationale"
        varchar currency_code "Transaction currency ISO code"
        numeric exchange_rate "FX conversion rate to base currency"
        numeric total_debit "Sum of all debit lines"
        numeric total_credit "Sum of all credit lines"
        varchar status "Draft, Posted, Reversed, Void"
        uuid created_by "User ID who created draft"
        uuid posted_by "User ID who approved and posted"
        timestamp posted_at "GL posting timestamp"
        uuid reversed_journal_id FK "Offsetting reversal voucher reference"
        timestamp created_at "Creation timestamp"
    }

    JournalLine {
        uuid line_id PK "Unique journal line identifier"
        uuid journal_id FK "Parent journal voucher reference"
        uuid account_id FK "Target Chart of Accounts ledger"
        uuid cost_center_id FK "Cost center or project reference"
        integer line_number "Sequential row index in voucher"
        numeric debit_amount "Debit value in base functional currency"
        numeric credit_amount "Credit value in base functional currency"
        numeric currency_amount "Amount in transaction currency"
        numeric exchange_rate "Applied foreign exchange rate"
        text description "Detailed line-item explanation"
        varchar tax_code "Applicable VAT/Tax code"
        varchar reconciled_status "Unreconciled, Matched, Reconciled"
        timestamp created_at "Creation timestamp"
    }

    Customer {
        uuid customer_id PK "Unique customer identifier"
        varchar customer_code UK "Customer code e.g. CUST-0042"
        varchar customer_name "Trade commercial name"
        varchar legal_name "Registered legal entity name"
        varchar tax_registration_number "TRN or VAT tax ID"
        text billing_address "Official billing address"
        text shipping_address "Physical delivery location"
        varchar email "Primary billing email"
        varchar phone "Primary contact phone"
        varchar payment_terms "Net15, Net30, Net60, DueOnReceipt"
        numeric credit_limit "Maximum allowed credit exposure"
        varchar currency_code "Default billing currency code"
        boolean is_active "Operational active flag"
        timestamp created_at "Creation timestamp"
    }

    Invoice {
        uuid invoice_id PK "Unique sales invoice identifier"
        varchar invoice_number UK "Sequential invoice number e.g. INV-2026-0412"
        uuid customer_id FK "Customer debtor reference"
        uuid journal_entry_id FK "Associated AR General Ledger posting"
        date issue_date "Invoice tax point issue date"
        date due_date "Contractual payment due date"
        uuid fiscal_period_id FK "Associated fiscal accounting period"
        varchar currency_code "Billing currency ISO code"
        numeric exchange_rate "FX conversion rate to base currency"
        numeric subtotal_amount "Sum of net taxable item lines"
        numeric discount_amount "Invoice-level discount amount"
        numeric tax_amount "Total Output VAT amount"
        numeric total_amount "Gross invoice total with tax"
        numeric paid_amount "Cumulative settled amount"
        numeric balance_due "Remaining uncollected balance"
        varchar payment_status "Draft, Sent, PartiallyPaid, Paid, Overdue, Void"
        text notes "Payment instructions and customer notes"
        timestamp created_at "Creation timestamp"
    }

    InvoiceLine {
        uuid item_id PK "Unique invoice line identifier"
        uuid invoice_id FK "Parent sales invoice reference"
        uuid account_id FK "Revenue GL account reference"
        uuid cost_center_id FK "Cost center or project reference"
        integer line_number "Sequential row index"
        text item_description "Description of goods or service"
        numeric quantity "Units delivered or hours billed"
        numeric unit_price "Price per unit before tax and discount"
        numeric discount_percentage "Line item discount percentage"
        numeric discount_amount "Line item discount value"
        numeric tax_rate "VAT percentage rate e.g. 5.00 or 15.00"
        numeric tax_amount "Computed Output VAT amount"
        numeric line_total "Gross line total including tax"
    }

    Vendor {
        uuid vendor_id PK "Unique vendor/supplier identifier"
        varchar vendor_code UK "Vendor code e.g. VEND-0019"
        varchar vendor_name "Trade commercial supplier name"
        varchar legal_name "Registered legal supplier name"
        varchar tax_registration_number "Vendor TRN or VAT tax ID"
        varchar contact_name "Primary representative name"
        varchar email "Accounts receivable vendor email"
        varchar phone "Primary contact phone"
        text address "Physical supplier office address"
        varchar payment_terms "Net15, Net30, Net60, DueOnReceipt"
        text bank_account_details "Vendor IBAN and wire transfer info"
        uuid default_expense_account_id FK "Default expense GL account"
        varchar currency_code "Default billing currency code"
        boolean is_active "Operational active flag"
        timestamp created_at "Creation timestamp"
    }

    Bill {
        uuid bill_id PK "Unique vendor bill identifier"
        varchar bill_number UK "Internal bill ID e.g. BILL-2026-0182"
        uuid vendor_id FK "Vendor creditor reference"
        uuid journal_entry_id FK "Associated AP General Ledger posting"
        date bill_date "Vendor invoice issue date"
        date due_date "Payment settlement due date"
        uuid fiscal_period_id FK "Associated fiscal accounting period"
        varchar currency_code "Bill currency ISO code"
        numeric exchange_rate "FX conversion rate to base currency"
        numeric subtotal_amount "Sum of net expense line items"
        numeric tax_amount "Total Input VAT recoverable"
        numeric total_amount "Gross bill amount payable"
        numeric paid_amount "Cumulative settled amount"
        numeric balance_due "Remaining unpaid balance"
        varchar payment_status "Draft, Approved, PartiallyPaid, Paid, Overdue, Void"
        varchar reference_doc_number "Vendor external invoice number"
        text notes "Internal verification notes"
        timestamp created_at "Creation timestamp"
    }

    BillLine {
        uuid line_id PK "Unique bill line identifier"
        uuid bill_id FK "Parent vendor bill reference"
        uuid account_id FK "Expense GL account reference"
        uuid cost_center_id FK "Cost center or project reference"
        integer line_number "Sequential row index"
        text description "Expense itemization description"
        numeric quantity "Units or service units billed"
        numeric unit_price "Unit price before tax"
        numeric tax_rate "VAT percentage rate e.g. 5.00 or 15.00"
        numeric tax_amount "Computed Input VAT amount"
        numeric line_total "Gross line total including tax"
    }

    Payment {
        uuid payment_id PK "Unique payment voucher identifier"
        varchar payment_number UK "Payment reference e.g. PAY-2026-0091"
        varchar payment_type "CustomerReceipt, VendorDisbursement, GeneralRefund"
        date payment_date "Payment execution date"
        uuid bank_account_id FK "Treasury or bank account used"
        uuid journal_entry_id FK "Associated Cash/Bank GL posting"
        uuid customer_id FK "Customer reference for receipts"
        uuid vendor_id FK "Vendor reference for disbursements"
        varchar payment_method "BankTransfer, Cheque, CreditCard, Cash"
        varchar reference_number "Check number or bank wire transaction ref"
        varchar currency_code "Payment currency ISO code"
        numeric exchange_rate "FX conversion rate to base currency"
        numeric amount "Total payment magnitude"
        numeric unallocated_amount "Remaining unapplied cash balance"
        varchar status "Draft, Cleared, Reconciled, Bounced, Void"
        timestamp created_at "Creation timestamp"
    }

    PaymentAllocation {
        uuid allocation_id PK "Unique allocation link identifier"
        uuid payment_id FK "Originating payment voucher"
        uuid invoice_id FK "Target sales invoice settled"
        uuid bill_id FK "Target vendor bill settled"
        numeric allocated_amount "Principal amount applied to document"
        numeric discount_taken "Early payment settlement discount"
        date allocation_date "Effective date of allocation"
    }

    BankAccount {
        uuid bank_account_id PK "Unique treasury bank identifier"
        uuid account_id FK "Linked General Ledger Cash account"
        varchar bank_name "Commercial banking institution name"
        varchar account_number "Bank account number"
        varchar iban "International Bank Account Number"
        varchar swift_bic "SWIFT / BIC routing code"
        varchar currency_code "Denominated account currency code"
        numeric opening_balance "Initial opening cash balance"
        numeric current_book_balance "GL cash book ending balance"
        date last_reconciled_date "Date of last finalized reconciliation"
        numeric last_reconciled_balance "Statement balance at last reconciliation"
        boolean is_active "Operational active flag"
        timestamp created_at "Creation timestamp"
    }

    BankTransaction {
        uuid bank_txn_id PK "Unique bank feed line identifier"
        uuid bank_account_id FK "Parent treasury bank account"
        date transaction_date "Bank statement posting date"
        date value_date "Value clearance date"
        text description "Raw statement transaction narration"
        varchar reference_number "Bank reference or check number"
        varchar transaction_type "Deposit, Withdrawal, Transfer, Fee, Interest"
        numeric amount "Transaction magnitude signed or absolute"
        numeric running_balance "Statement balance following line"
        boolean is_reconciled "True if matched and reconciled"
        uuid statement_file_id "Imported statement file reference"
        timestamp created_at "Creation timestamp"
    }

    BankReconciliation {
        uuid reconciliation_id PK "Unique reconciliation session identifier"
        uuid bank_account_id FK "Bank account being reconciled"
        date statement_start_date "Statement period opening date"
        date statement_end_date "Statement period closing date"
        numeric statement_ending_balance "Closing bank statement balance"
        numeric gl_ending_balance "Closing General Ledger cash balance"
        numeric unreconciled_difference "Adjusted variance between statement and GL"
        varchar status "InProgress, Completed, Approved"
        uuid reconciled_by "User ID who finalized reconciliation"
        timestamp reconciled_at "Reconciliation completion timestamp"
    }

    ReconciliationMatch {
        uuid match_id PK "Unique reconciliation link identifier"
        uuid reconciliation_id FK "Parent reconciliation session"
        uuid bank_txn_id FK "Cleared bank statement transaction line"
        uuid journal_line_id FK "Cleared General Ledger journal line"
        uuid payment_id FK "Cleared payment record"
        numeric matched_amount "Reconciled dollar volume"
        varchar match_type "ExactOneToOne, OneToMany, ManyToOne, RuleAutoMatched, ManualAdjustment"
        timestamp matched_at "Matching execution timestamp"
    }

    Employee {
        uuid employee_id PK "Unique employee identifier"
        varchar employee_code UK "Staff code e.g. EMP-0104"
        varchar first_name "Employee given name"
        varchar last_name "Employee surname"
        varchar national_id_or_iqama "National ID or civil residency number"
        varchar department "Operational department title"
        varchar job_title "Official employment position"
        uuid cost_center_id FK "Departmental cost center reference"
        varchar bank_name "Designated salary deposit bank"
        varchar iban "Salary IBAN for WPS electronic transfer"
        numeric basic_salary "Base contractual monthly wage"
        numeric housing_allowance "Fixed monthly housing allowance"
        numeric transport_allowance "Fixed monthly transport allowance"
        numeric other_allowances "Recurring utility and phone stipends"
        varchar social_security_number "Statutory pension registry ID"
        boolean is_active "Employment active status"
        date hire_date "Employment start date"
        timestamp created_at "Creation timestamp"
    }

    PayrollRun {
        uuid payroll_run_id PK "Unique payroll batch identifier"
        varchar payroll_code UK "Payroll batch code e.g. PR-2026-08"
        uuid fiscal_period_id FK "Associated fiscal accounting period"
        date pay_period_start "Payroll cycle start date"
        date pay_period_end "Payroll cycle end date"
        date execution_date "Salary disbursement value date"
        numeric total_gross "Aggregated gross salaries"
        numeric total_allowances "Aggregated allowances and bonuses"
        numeric total_deductions "Aggregated employee statutory deductions"
        numeric total_employer_contributions "Aggregated employer pension costs"
        numeric total_net_pay "Total net cash disbursed to workforce"
        uuid journal_entry_id FK "Automated Payroll General Ledger voucher"
        boolean wps_sif_file_generated "Flag indicating SIF bank file export"
        varchar status "Draft, Approved, Processed, Paid, Cancelled"
        uuid approved_by "User ID who approved payroll batch"
        timestamp created_at "Creation timestamp"
    }

    Payslip {
        uuid payslip_id PK "Unique employee payslip identifier"
        uuid payroll_run_id FK "Parent payroll batch reference"
        uuid employee_id FK "Employee recipient reference"
        numeric basic_salary "Contractual basic pay for period"
        numeric total_allowances "Sum of recurring allowances and overtime"
        numeric gross_salary "Basic salary plus allowances"
        numeric employee_social_security "Employee statutory pension deduction"
        numeric income_tax_withheld "Statutory income tax withholding"
        numeric other_deductions "Loan advances, penalties, insurance"
        numeric total_deductions "Sum of all employee deductions"
        numeric net_salary "Net take-home salary payable"
        numeric employer_social_security "Employer statutory pension share"
        numeric employer_end_of_service_accrual "End of service gratuity monthly provision"
        varchar payment_status "Pending, Paid, DirectDepositInitiated"
        varchar payment_reference "Bank transfer transaction reference"
    }

    PayslipLine {
        uuid payslip_line_id PK "Unique payslip line identifier"
        uuid payslip_id FK "Parent payslip reference"
        varchar component_type "Allowance, Deduction, EmployerCost, Overtime, Bonus"
        varchar component_name "Component title e.g. Housing Allowance"
        numeric amount "Component monetary value"
        boolean is_taxable "Taxability and pension subject flag"
    }

    TaxPeriod {
        uuid tax_period_id PK "Unique statutory tax period identifier"
        varchar period_code UK "Tax period code e.g. VAT-2026-Q3"
        date start_date "Tax window start date"
        date end_date "Tax window end date"
        date filing_deadline "Statutory submission due date"
        varchar tax_type "StandardVAT, CorporateIncomeTax"
        varchar status "Open, InPreparation, Filed, Settled"
        timestamp created_at "Creation timestamp"
    }

    TaxReturn {
        uuid tax_return_id PK "Unique tax return submission identifier"
        uuid tax_period_id FK "Parent statutory tax period"
        varchar filing_reference_number UK "Tax authority electronic filing receipt"
        numeric total_taxable_sales "Total standard-rated sales base"
        numeric total_output_vat "Total Output VAT collected on sales"
        numeric total_taxable_purchases "Total standard-rated purchase base"
        numeric total_input_vat "Total Input VAT recoverable on bills"
        numeric net_vat_payable "Output VAT minus Input VAT liability"
        uuid settlement_journal_id FK "Associated tax settlement GL voucher"
        date filing_date "Official submission date"
        date payment_due_date "Tax authority payment due date"
        varchar filing_status "Draft, Submitted, Accepted, Paid, Disputed"
        uuid submitted_by "User ID who filed return"
        timestamp created_at "Creation timestamp"
    }

    FixedAsset {
        uuid asset_id PK "Unique fixed asset identifier"
        varchar asset_code UK "Asset inventory tag e.g. FA-0082"
        varchar asset_name "Descriptive asset title"
        varchar category "ITEquipment, Vehicles, Buildings, Machinery, Furniture"
        uuid cost_center_id FK "Departmental location reference"
        date acquisition_date "Physical asset purchase date"
        date capitalization_date "In-service accounting capitalization date"
        numeric acquisition_cost "Historical gross purchase cost"
        numeric salvage_value "Estimated residual disposal value"
        integer useful_life_months "Total economic useful life in months"
        varchar depreciation_method "StraightLine, DoubleDecliningBalance, SumOfYearsDigits"
        uuid asset_account_id FK "Asset GL account e.g. 1530"
        uuid accum_deprec_account_id FK "Contra-asset GL account e.g. 1539"
        uuid deprec_expense_account_id FK "Expense GL account e.g. 6410"
        numeric accumulated_depreciation "Cumulative amortized depreciation to date"
        numeric current_book_value "Net Book Value historical cost minus accum dep"
        varchar status "Active, UnderMaintenance, FullyDepreciated, Disposed, WrittenOff"
        timestamp created_at "Creation timestamp"
    }

    DepreciationSchedule {
        uuid schedule_id PK "Unique amortization schedule row identifier"
        uuid asset_id FK "Parent fixed asset reference"
        integer period_number "Amortization month index 1 to N"
        uuid fiscal_period_id FK "Associated accounting period"
        date scheduled_date "Scheduled calculation date"
        numeric scheduled_depreciation_amount "Projected depreciation expense for month"
        numeric projected_accum_depreciation "Projected cumulative depreciation"
        numeric projected_book_value "Projected Net Book Value at month end"
        boolean is_posted "True if materialized into DepreciationEntry"
    }

    DepreciationEntry {
        uuid entry_id PK "Unique posted depreciation event identifier"
        uuid asset_id FK "Parent fixed asset reference"
        uuid schedule_id FK "Parent amortization schedule row"
        uuid journal_entry_id FK "Associated Depreciation GL voucher"
        uuid fiscal_period_id FK "Associated fiscal period"
        date depreciation_date "Effective posting date"
        numeric depreciation_amount "Actual recognized depreciation expense"
        numeric accumulated_to_date "Total accumulated depreciation post entry"
        numeric net_book_value_after "Net Book Value post entry"
        timestamp posted_at "GL posting timestamp"
        uuid posted_by "User ID who executed depreciation run"
    }

    Budget {
        uuid budget_id PK "Unique fiscal budget identifier"
        varchar budget_code UK "Budget code e.g. BUD-2026-V1"
        uuid fiscal_year_id FK "Target fiscal year reference"
        varchar budget_name "Descriptive budget plan title"
        text description "Budget objectives and assumptions"
        numeric total_budgeted_revenue "Aggregated planned revenue"
        numeric total_budgeted_expense "Aggregated planned expenditure"
        varchar status "Draft, Approved, Active, Revised, Archived"
        uuid approved_by "User ID who authorized budget"
        timestamp created_at "Creation timestamp"
    }

    BudgetItem {
        uuid budget_item_id PK "Unique budget line identifier"
        uuid budget_id FK "Parent budget reference"
        uuid account_id FK "Target GL account reference"
        uuid cost_center_id FK "Target cost center reference"
        uuid fiscal_period_id FK "Target fiscal period reference"
        numeric budgeted_amount "Allocated budget ceiling"
        numeric actual_spent_amount "Real-time actual spend from GL"
        numeric variance_amount "Actual minus Budgeted dollar variance"
        numeric variance_percentage "Percentage deviation from budget"
    }

    AuditLog {
        uuid audit_id PK "Unique immutable audit trail identifier"
        timestamp timestamp "UTC timestamp of event execution"
        uuid user_id "Executing user identifier"
        varchar user_name "User display name"
        varchar action_type "CREATE, UPDATE, POST, REVERSE, APPROVE, VOID, RECONCILE, DELETE"
        varchar entity_name "JournalEntry, Invoice, Bill, PayrollRun, FixedAsset, BankReconciliation, TaxReturn, Account"
        uuid entity_id "Primary key of target entity"
        jsonb old_values "JSON snapshot of state prior to mutation"
        jsonb new_values "JSON snapshot of state post mutation"
        varchar ip_address "Client IP address"
        text user_agent "Client browser / platform metadata"
        text reason "Mandatory business explanation for adjustment"
    }
```


------------------------------------------------------------------------

## 3. Comprehensive Entity Dictionary

This Entity Dictionary provides exhaustive specifications for each data
model in the QuickBox Financial System, detailing column schemas, data
types, nullability, constraints, foreign key cascades, and business
invariants.

    +---------------------------------------------------------------------------------------------------+
    | TABLE INDEX                                                                                       |
    +------------------------------------+--------------------------------------------------------------+
    | 1. FiscalYear                      | 12. BillLine                                                 |
    | 2. FiscalPeriod                    | 13. Payment                                                  |
    | 3. CostCenter                      | 14. PaymentAllocation                                        |
    | 4. Account (Chart of Accounts)     | 15. BankAccount                                              |
    | 5. JournalEntry (Journal Voucher)  | 16. BankTransaction                                          |
    | 6. JournalLine                     | 17. BankReconciliation & ReconciliationMatch                 |
    | 7. Customer                        | 18. Employee                                                 |
    | 8. Invoice                         | 19. PayrollRun, Payslip & PayslipLine                        |
    | 9. InvoiceLine                     | 20. TaxPeriod & TaxReturn                                    |
    | 10. Vendor                         | 21. FixedAsset, DepreciationSchedule & DepreciationEntry     |
    | 11. Bill (Vendor Invoice)          | 22. Budget, BudgetItem & AuditLog                            |
    +------------------------------------+--------------------------------------------------------------+

------------------------------------------------------------------------

### 3.1 Fiscal Year & Accounting Period Management

#### Entity: `FiscalYear`

- **Domain:** Core Accounting Infrastructure
- **Purpose:** Defines the corporate fiscal year boundary, controlling
  annual closing procedures and opening balance carryovers.
- **Schema Definition:**

  ------------------------------------------------------------------------------------------------------------
  Column Name    Data Type       Nullable   Constraint                  Default               Description
  -------------- --------------- ---------- --------------------------- --------------------- ----------------
  `year_id`      `uuid`          No         PK                          `gen_random_uuid()`   Primary unique
                                                                                              identifier.

  `year_code`    `varchar(10)`   No         UK                          None                  Code designation
                                                                                              (e.g.,
                                                                                              `FY2026`).

  `start_date`   `date`          No         Check                       None                  Beginning date
                                            (`start_date < end_date`)                         of the fiscal
                                                                                              year (e.g.,
                                                                                              `2026-01-01`).

  `end_date`     `date`          No         None                        None                  Ending date of
                                                                                              the fiscal year
                                                                                              (e.g.,
                                                                                              `2026-12-31`).

  `is_closed`    `boolean`       No         None                        `false`               True when annual
                                                                                              closing journal
                                                                                              is finalized.

  `closed_at`    `timestamp`     Yes        None                        `null`                Timestamp when
                                                                                              closing
                                                                                              procedure
                                                                                              completed.

  `closed_by`    `uuid`          Yes        FK $\rightarrow$ Users      `null`                Financial
                                                                                              controller who
                                                                                              performed
                                                                                              closing.

  `created_at`   `timestamp`     No         None                        `CURRENT_TIMESTAMP`   Record creation
                                                                                              timestamp.
  ------------------------------------------------------------------------------------------------------------

- **Business Invariants:**
  1.  Date non-overlap: No two fiscal years for the same legal entity
      can have overlapping date ranges.
  2.  Year-End Closing Invariant: Setting `is_closed = true` requires
      that all temporary revenue (4000) and expense (5000/6000) accounts
      have been cleared to Income Summary (3030) and transferred to
      Retained Earnings (3020).

------------------------------------------------------------------------

#### Entity: `FiscalPeriod`

- **Domain:** Core Accounting Infrastructure
- **Purpose:** Represents monthly accounting windows (Periods 1--12) and
  an optional year-end adjusting period (Period 13).
- **Schema Definition:**

  -----------------------------------------------------------------------------------------------------------------------------
  Column Name        Data Type       Nullable   Constraint                           Default               Description
  ------------------ --------------- ---------- ------------------------------------ --------------------- --------------------
  `period_id`        `uuid`          No         PK                                   `gen_random_uuid()`   Primary unique
                                                                                                           identifier.

  `fiscal_year_id`   `uuid`          No         FK $\rightarrow$                     None                  Parent fiscal year.
                                                `FiscalYear.year_id`                                       

  `period_number`    `integer`       No         Check                                None                  Chronological period
                                                (`period_number BETWEEN 1 AND 13`)                         index.

  `period_name`      `varchar(50)`   No         None                                 None                  Formatted name
                                                                                                           (e.g.,
                                                                                                           `2026-08 August`).

  `start_date`       `date`          No         Check (`start_date <= end_date`)     None                  First calendar day
                                                                                                           of period.

  `end_date`         `date`          No         None                                 None                  Last calendar day of
                                                                                                           period.

  `status`           `varchar(20)`   No         Enum (`Open`, `Locked`, `Closed`)    `'Open'`              Period operational
                                                                                                           posting status.

  `locked_at`        `timestamp`     Yes        None                                 `null`                Lock timestamp to
                                                                                                           freeze retroactive
                                                                                                           edits.

  `created_at`       `timestamp`     No         None                                 `CURRENT_TIMESTAMP`   Record creation
                                                                                                           timestamp.
  -----------------------------------------------------------------------------------------------------------------------------

- **Business Invariants:**
  1.  Period Lock Invariant: When `status = 'Locked'` or `'Closed'`, no
      new `JournalEntry` records can be created or posted within this
      date range.

------------------------------------------------------------------------

### 3.2 Organizational Structure & Cost Allocation

#### Entity: `CostCenter`

- **Domain:** Management Accounting & Cost Control
- **Purpose:** Multi-level hierarchical organizational units for
  departmental and project-based cost allocation.
- **Schema Definition:**

  ---------------------------------------------------------------------------------------------------------------------------
  Column Name          Data Type        Nullable   Constraint                    Default               Description
  -------------------- ---------------- ---------- ----------------------------- --------------------- ----------------------
  `cost_center_id`     `uuid`           No         PK                            `gen_random_uuid()`   Primary unique
                                                                                                       identifier.

  `cost_center_code`   `varchar(20)`    No         UK                            None                  Code (e.g.,
                                                                                                       `CC-100 Operations`,
                                                                                                       `PRJ-ALPHA`).

  `cost_center_name`   `varchar(100)`   No         None                          None                  Human-readable title.

  `parent_id`          `uuid`           Yes        FK $\rightarrow$              `null`                Recursive
                                                   `CostCenter.cost_center_id`                         self-reference for
                                                                                                       hierarchical tree.

  `manager_id`         `uuid`           Yes        FK $\rightarrow$ Users        `null`                Responsible department
                                                                                                       manager.

  `is_active`          `boolean`        No         None                          `true`                Active operational
                                                                                                       status.

  `created_at`         `timestamp`      No         None                          `CURRENT_TIMESTAMP`   Record creation
                                                                                                       timestamp.
  ---------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

### 3.3 Chart of Accounts & General Ledger

#### Entity: `Account`

- **Domain:** General Ledger
- **Purpose:** Master chart of accounts conforming to standard 5-tier
  financial accounting classifications.
- **Schema Definition:**

  -------------------------------------------------------------------------------------------------------------------------------
  Column Name           Data Type         Nullable   Constraint             Default               Description
  --------------------- ----------------- ---------- ---------------------- --------------------- -------------------------------
  `account_id`          `uuid`            No         PK                     `gen_random_uuid()`   Primary unique identifier.

  `account_code`        `varchar(20)`     No         UK                     None                  Standard numeric code (e.g.,
                                                                                                  `1010`, `2010`, `4010`).

  `account_name`        `varchar(150)`    No         None                   None                  Account title (e.g.,
                                                                                                  `Accounts Receivable Trade`).

  `account_type`        `varchar(20)`     No         Enum (`Asset`,         None                  Primary financial statement
                                                     `Liability`, `Equity`,                       classification.
                                                     `Revenue`, `Expense`)                        

  `sub_category`        `varchar(50)`     No         None                   None                  Sub-tier grouping (e.g.,
                                                                                                  `CurrentAsset`, `Opex`).

  `normal_balance`      `varchar(10)`     No         Enum (`DEBIT`,         None                  Fundamental balance convention.
                                                     `CREDIT`)                                    

  `parent_account_id`   `uuid`            Yes        FK $\rightarrow$       `null`                Recursive parent for
                                                     `Account.account_id`                         sub-ledgers.

  `currency_code`       `varchar(3)`      No         None                   `'AED'`               Denominated currency code.

  `is_reconciled`       `boolean`         No         None                   `false`               True for bank/cash accounts
                                                                                                  requiring reconciliation.

  `is_active`           `boolean`         No         None                   `true`                Active status flag.

  `current_balance`     `numeric(18,4)`   No         None                   `0.0000`              Real-time computed running
                                                                                                  balance.

  `created_at`          `timestamp`       No         None                   `CURRENT_TIMESTAMP`   Record creation timestamp.
  -------------------------------------------------------------------------------------------------------------------------------

- **Account Code Classification Rules:**
  - `1000–1999`: Assets (Normal: DEBIT)
  - `2000–2999`: Liabilities (Normal: CREDIT)
  - `3000–3999`: Equity (Normal: CREDIT)
  - `4000–4999`: Revenue (Normal: CREDIT)
  - `5000–5999`: Cost of Goods & Services (Normal: DEBIT)
  - `6000–6999`: Operating Expenses (Normal: DEBIT)

------------------------------------------------------------------------

#### Entity: `JournalEntry`

- **Domain:** General Ledger & Bookkeeping
- **Purpose:** Header record for double-entry financial transactions and
  journal vouchers.
- **Schema Definition:**

  --------------------------------------------------------------------------------------------------------------------------
  Column Name             Data Type         Nullable   Constraint                  Default               Description
  ----------------------- ----------------- ---------- --------------------------- --------------------- -------------------
  `journal_id`            `uuid`            No         PK                          `gen_random_uuid()`   Primary unique
                                                                                                         identifier.

  `voucher_number`        `varchar(30)`     No         UK                          None                  Formatted voucher
                                                                                                         number (e.g.,
                                                                                                         `JV-2026-00104`).

  `posting_date`          `date`            No         None                        None                  Effective
                                                                                                         accounting date.

  `fiscal_period_id`      `uuid`            No         FK $\rightarrow$            None                  Associated open
                                                       `FiscalPeriod.period_id`                          fiscal period.

  `voucher_type`          `varchar(30)`     No         Enum (`General`,            `'General'`           Transaction
                                                       `Adjusting`, `Closing`,                           classification.
                                                       `Opening`, `Payroll`,                             
                                                       `Depreciation`,                                   
                                                       `TaxSettlement`)                                  

  `reference_number`      `varchar(50)`     Yes        None                        `null`                External document
                                                                                                         reference.

  `memo`                  `text`            No         None                        None                  Detailed
                                                                                                         transaction
                                                                                                         description.

  `currency_code`         `varchar(3)`      No         None                        `'AED'`               Transaction ISO
                                                                                                         currency code.

  `exchange_rate`         `numeric(12,6)`   No         Check (`exchange_rate > 0`) `1.000000`            FX multiplier to
                                                                                                         base functional
                                                                                                         currency.

  `total_debit`           `numeric(18,4)`   No         Check (`total_debit >= 0`)  `0.0000`              Sum of all debit
                                                                                                         lines.

  `total_credit`          `numeric(18,4)`   No         Check (`total_credit >= 0`) `0.0000`              Sum of all credit
                                                                                                         lines.

  `status`                `varchar(20)`     No         Enum (`Draft`, `Posted`,    `'Draft'`             Voucher workflow
                                                       `Reversed`, `Void`)                               state.

  `created_by`            `uuid`            No         FK $\rightarrow$ Users      None                  User who created
                                                                                                         voucher.

  `posted_by`             `uuid`            Yes        FK $\rightarrow$ Users      `null`                User who approved
                                                                                                         posting.

  `posted_at`             `timestamp`       Yes        None                        `null`                Exact GL posting
                                                                                                         timestamp.

  `reversed_journal_id`   `uuid`            Yes        FK $\rightarrow$            `null`                Reference to
                                                       `JournalEntry.journal_id`                         offsetting reversal
                                                                                                         voucher.

  `created_at`            `timestamp`       No         None                        `CURRENT_TIMESTAMP`   Creation timestamp.
  --------------------------------------------------------------------------------------------------------------------------

- **Business Invariants:**
  1.  **The Double-Entry Invariant**: When `status = 'Posted'`, the
      database enforces
      $\text{total\_debit} \equiv \text{total\_credit}$ with zero
      tolerance ($\Delta = 0.0000$).
  2.  **Immutability Invariant**: Once `status = 'Posted'`, update and
      delete mutations are prohibited. Corrections are executed by
      posting an offsetting voucher with `reversed_journal_id`.

------------------------------------------------------------------------

#### Entity: `JournalLine`

- **Domain:** General Ledger & Bookkeeping
- **Purpose:** Individual atomic debit or credit line item belonging to
  a journal voucher.
- **Schema Definition:**

  -----------------------------------------------------------------------------------------------------------------------
  Column Name           Data Type         Nullable   Constraint                    Default               Description
  --------------------- ----------------- ---------- ----------------------------- --------------------- ----------------
  `line_id`             `uuid`            No         PK                            `gen_random_uuid()`   Primary unique
                                                                                                         identifier.

  `journal_id`          `uuid`            No         FK $\rightarrow$              None                  Parent journal
                                                     `JournalEntry.journal_id` ON                        voucher.
                                                     DELETE CASCADE                                      

  `account_id`          `uuid`            No         FK $\rightarrow$              None                  Impacted General
                                                     `Account.account_id`                                Ledger account.

  `cost_center_id`      `uuid`            Yes        FK $\rightarrow$              `null`                Departmental or
                                                     `CostCenter.cost_center_id`                         project cost
                                                                                                         tag.

  `line_number`         `integer`         No         Check (`line_number >= 1`)    None                  1-indexed
                                                                                                         sequential
                                                                                                         position.

  `debit_amount`        `numeric(18,4)`   No         Check (`debit_amount >= 0`)   `0.0000`              Debit value in
                                                                                                         functional base
                                                                                                         currency.

  `credit_amount`       `numeric(18,4)`   No         Check (`credit_amount >= 0`)  `0.0000`              Credit value in
                                                                                                         functional base
                                                                                                         currency.

  `currency_amount`     `numeric(18,4)`   Yes        None                          `null`                Value in
                                                                                                         original foreign
                                                                                                         transaction
                                                                                                         currency.

  `exchange_rate`       `numeric(12,6)`   No         None                          `1.000000`            Foreign exchange
                                                                                                         rate applied.

  `description`         `text`            Yes        None                          `null`                Specific
                                                                                                         line-item
                                                                                                         narration.

  `tax_code`            `varchar(20)`     Yes        None                          `null`                Associated
                                                                                                         tax/VAT code.

  `reconciled_status`   `varchar(20)`     No         Enum (`Unreconciled`,         `'Unreconciled'`      Bank
                                                     `Matched`, `Reconciled`)                            reconciliation
                                                                                                         clearing state.

  `created_at`          `timestamp`       No         None                          `CURRENT_TIMESTAMP`   Creation
                                                                                                         timestamp.
  -----------------------------------------------------------------------------------------------------------------------

- **Business Invariants:**
  1.  Mutual Exclusivity: For every line, exactly one side must be
      positive:
      `(debit_amount > 0 AND credit_amount = 0) OR (credit_amount > 0 AND debit_amount = 0)`.

------------------------------------------------------------------------

### 3.4 Accounts Receivable (AR) & Sales Invoicing

#### Entity: `Customer`

- **Domain:** Accounts Receivable
- **Purpose:** Debtor master data containing billing, credit terms, and
  tax identification profiles.
- **Schema Definition:**

  -------------------------------------------------------------------------------------------------------------------------
  Column Name                 Data Type         Nullable   Constraint              Default               Description
  --------------------------- ----------------- ---------- ----------------------- --------------------- ------------------
  `customer_id`               `uuid`            No         PK                      `gen_random_uuid()`   Primary unique
                                                                                                         identifier.

  `customer_code`             `varchar(20)`     No         UK                      None                  Customer code
                                                                                                         (e.g.,
                                                                                                         `CUST-0042`).

  `customer_name`             `varchar(150)`    No         None                    None                  Commercial trading
                                                                                                         name.

  `legal_name`                `varchar(200)`    Yes        None                    `null`                Registered
                                                                                                         corporate name.

  `tax_registration_number`   `varchar(50)`     Yes        None                    `null`                Tax Registration
                                                                                                         Number (TRN / VAT
                                                                                                         ID).

  `billing_address`           `text`            Yes        None                    `null`                Official billing
                                                                                                         address.

  `shipping_address`          `text`            Yes        None                    `null`                Physical
                                                                                                         service/delivery
                                                                                                         address.

  `email`                     `varchar(100)`    No         None                    None                  Primary billing
                                                                                                         and invoice
                                                                                                         dispatch email.

  `phone`                     `varchar(30)`     Yes        None                    `null`                Telephone contact
                                                                                                         number.

  `payment_terms`             `varchar(20)`     No         Enum (`Net15`, `Net30`, `'Net30'`             Default credit
                                                           `Net60`,                                      terms.
                                                           `DueOnReceipt`)                               

  `credit_limit`              `numeric(18,4)`   No         Check                   `0.0000`              Maximum allowable
                                                           (`credit_limit >= 0`)                         credit balance.

  `currency_code`             `varchar(3)`      No         None                    `'AED'`               Default billing
                                                                                                         currency.

  `is_active`                 `boolean`         No         None                    `true`                Operational active
                                                                                                         status.

  `created_at`                `timestamp`       No         None                    `CURRENT_TIMESTAMP`   Record creation
                                                                                                         timestamp.
  -------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

#### Entity: `Invoice`

- **Domain:** Accounts Receivable & Billing
- **Purpose:** Sales tax invoice issued to customers representing legal
  claims to revenue and Output VAT.
- **Schema Definition:**

  --------------------------------------------------------------------------------------------------------------------------------------------------------
  Column Name          Data Type         Nullable   Constraint                   Default               Description
  -------------------- ----------------- ---------- ---------------------------- --------------------- ---------------------------------------------------
  `invoice_id`         `uuid`            No         PK                           `gen_random_uuid()`   Primary unique identifier.

  `invoice_number`     `varchar(30)`     No         UK                           None                  Sequential invoice number (e.g., `INV-2026-0412`).

  `customer_id`        `uuid`            No         FK $\rightarrow$             None                  Debtor customer reference.
                                                    `Customer.customer_id`                             

  `journal_entry_id`   `uuid`            Yes        FK $\rightarrow$             `null`                Posted General Ledger sales voucher.
                                                    `JournalEntry.journal_id`                          

  `issue_date`         `date`            No         None                         None                  Invoice tax point date.

  `due_date`           `date`            No         Check                        None                  Contractual payment due date.
                                                    (`due_date >= issue_date`)                         

  `fiscal_period_id`   `uuid`            No         FK $\rightarrow$             None                  Associated accounting period.
                                                    `FiscalPeriod.period_id`                           

  `currency_code`      `varchar(3)`      No         None                         `'AED'`               Billing currency code.

  `exchange_rate`      `numeric(12,6)`   No         Check (`exchange_rate > 0`)  `1.000000`            FX rate to base functional currency.

  `subtotal_amount`    `numeric(18,4)`   No         Check                        `0.0000`              Sum of net line items.
                                                    (`subtotal_amount >= 0`)                           

  `discount_amount`    `numeric(18,4)`   No         Check                        `0.0000`              Invoice-level discount.
                                                    (`discount_amount >= 0`)                           

  `tax_amount`         `numeric(18,4)`   No         Check (`tax_amount >= 0`)    `0.0000`              Total Output VAT.

  `total_amount`       `numeric(18,4)`   No         Check (`total_amount >= 0`)  `0.0000`              Gross invoice amount:
                                                                                                       $\text{subtotal} - \text{discount} + \text{tax}$.

  `paid_amount`        `numeric(18,4)`   No         Check (`paid_amount >= 0`)   `0.0000`              Cumulative cash payments allocated.

  `balance_due`        `numeric(18,4)`   No         None                         `0.0000`              Remaining uncollected balance:
                                                                                                       $\text{total\_amount} - \text{paid\_amount}$.

  `payment_status`     `varchar(20)`     No         Enum (`Draft`, `Sent`,       `'Draft'`             Current settlement status.
                                                    `PartiallyPaid`, `Paid`,                           
                                                    `Overdue`, `Void`)                                 

  `notes`              `text`            Yes        None                         `null`                Payment terms and instructions.

  `created_at`         `timestamp`       No         None                         `CURRENT_TIMESTAMP`   Record creation timestamp.
  --------------------------------------------------------------------------------------------------------------------------------------------------------

- **Business Invariants:**
  1.  AR Aging Buckets:
      - `Current`: $\text{Today} \leq \text{due\_date}$
      - `1–30 Days Past Due`:
        $1 \leq \text{Today} - \text{due\_date} \leq 30$
      - `31–60 Days Past Due`:
        $31 \leq \text{Today} - \text{due\_date} \leq 60$
      - `61–90 Days Past Due`:
        $61 \leq \text{Today} - \text{due\_date} \leq 90$
      - `90+ Days Past Due`: $\text{Today} - \text{due\_date} > 90$
  2.  Automatic Journal Generation on Issue:
      - **Debit**: `1110 Accounts Receivable` \[Total Amount\]
      - **Credit**: `4010 Operating Sales Revenue` \[Subtotal -
        Discount\]
      - **Credit**: `2210 Output VAT Payable` \[Tax Amount\]

------------------------------------------------------------------------

#### Entity: `InvoiceLine`

- **Domain:** Accounts Receivable & Billing
- **Purpose:** Itemized products, services, consulting hours, or fee
  lines on a sales invoice.
- **Schema Definition:**

  -------------------------------------------------------------------------------------------------------------------------------------------
  Column Name             Data Type         Nullable   Constraint                                  Default               Description
  ----------------------- ----------------- ---------- ------------------------------------------- --------------------- --------------------
  `item_id`               `uuid`            No         PK                                          `gen_random_uuid()`   Primary unique
                                                                                                                         identifier.

  `invoice_id`            `uuid`            No         FK $\rightarrow$ `Invoice.invoice_id` ON    None                  Parent sales
                                                       DELETE CASCADE                                                    invoice.

  `account_id`            `uuid`            No         FK $\rightarrow$ `Account.account_id`       None                  Revenue GL account
                                                                                                                         (4000-series).

  `cost_center_id`        `uuid`            Yes        FK $\rightarrow$                            `null`                Revenue-generating
                                                       `CostCenter.cost_center_id`                                       cost center.

  `line_number`           `integer`         No         Check (`line_number >= 1`)                  None                  1-indexed row
                                                                                                                         position.

  `item_description`      `text`            No         None                                        None                  Service or product
                                                                                                                         description.

  `quantity`              `numeric(12,4)`   No         Check (`quantity > 0`)                      `1.0000`              Billed units or
                                                                                                                         hours.

  `unit_price`            `numeric(18,4)`   No         Check (`unit_price >= 0`)                   `0.0000`              Unit rate before
                                                                                                                         discount.

  `discount_percentage`   `numeric(5,2)`    No         Check                                       `0.00`                Percentage discount.
                                                       (`discount_percentage BETWEEN 0 AND 100`)                         

  `discount_amount`       `numeric(18,4)`   No         Check (`discount_amount >= 0`)              `0.0000`              Calculated discount
                                                                                                                         value.

  `tax_rate`              `numeric(5,2)`    No         Check (`tax_rate >= 0`)                     `5.00`                VAT tax rate
                                                                                                                         percentage.

  `tax_amount`            `numeric(18,4)`   No         Check (`tax_amount >= 0`)                   `0.0000`              Computed Output VAT.

  `line_total`            `numeric(18,4)`   No         Check (`line_total >= 0`)                   `0.0000`              Gross line total
                                                                                                                         including tax.
  -------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

### 3.5 Accounts Payable (AP) & Vendor Expenses

#### Entity: `Vendor`

- **Domain:** Accounts Payable & Procurement
- **Purpose:** Supplier and vendor master directory for purchase
  obligations and expense categorization.
- **Schema Definition:**

  -------------------------------------------------------------------------------------------------------------------------
  Column Name                    Data Type        Nullable   Constraint             Default               Description
  ------------------------------ ---------------- ---------- ---------------------- --------------------- -----------------
  `vendor_id`                    `uuid`           No         PK                     `gen_random_uuid()`   Primary unique
                                                                                                          identifier.

  `vendor_code`                  `varchar(20)`    No         UK                     None                  Supplier code
                                                                                                          (e.g.,
                                                                                                          `VEND-0019`).

  `vendor_name`                  `varchar(150)`   No         None                   None                  Commercial
                                                                                                          trading name.

  `legal_name`                   `varchar(200)`   Yes        None                   `null`                Registered
                                                                                                          corporate name.

  `tax_registration_number`      `varchar(50)`    Yes        None                   `null`                Supplier TRN or
                                                                                                          VAT tax ID.

  `contact_name`                 `varchar(100)`   Yes        None                   `null`                Primary sales /
                                                                                                          account
                                                                                                          representative.

  `email`                        `varchar(100)`   No         None                   None                  Supplier accounts
                                                                                                          department email.

  `phone`                        `varchar(30)`    Yes        None                   `null`                Contact telephone
                                                                                                          number.

  `address`                      `text`           Yes        None                   `null`                Physical supplier
                                                                                                          address.

  `payment_terms`                `varchar(20)`    No         Enum (`Net15`,         `'Net30'`             Commercial
                                                             `Net30`, `Net60`,                            payment terms.
                                                             `DueOnReceipt`)                              

  `bank_account_details`         `text`           Yes        None                   `null`                Supplier IBAN,
                                                                                                          SWIFT, and bank
                                                                                                          routing
                                                                                                          instructions.

  `default_expense_account_id`   `uuid`           Yes        FK $\rightarrow$       `null`                Default GL
                                                             `Account.account_id`                         expense account.

  `currency_code`                `varchar(3)`     No         None                   `'AED'`               Billing currency
                                                                                                          code.

  `is_active`                    `boolean`        No         None                   `true`                Operational
                                                                                                          active status.

  `created_at`                   `timestamp`      No         None                   `CURRENT_TIMESTAMP`   Record creation
                                                                                                          timestamp.
  -------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

#### Entity: `Bill`

- **Domain:** Accounts Payable & Expense Management
- **Purpose:** Vendor purchase invoice or expense bill representing
  liabilities and Input VAT claims.
- **Schema Definition:**

  -------------------------------------------------------------------------------------------------------------------------------------------------------
  Column Name              Data Type         Nullable   Constraint                  Default               Description
  ------------------------ ----------------- ---------- --------------------------- --------------------- -----------------------------------------------
  `bill_id`                `uuid`            No         PK                          `gen_random_uuid()`   Primary unique identifier.

  `bill_number`            `varchar(30)`     No         UK                          None                  Internal bill tracking code (e.g.,
                                                                                                          `BILL-2026-0182`).

  `vendor_id`              `uuid`            No         FK $\rightarrow$            None                  Creditor vendor reference.
                                                        `Vendor.vendor_id`                                

  `journal_entry_id`       `uuid`            Yes        FK $\rightarrow$            `null`                Associated AP General Ledger posting.
                                                        `JournalEntry.journal_id`                         

  `bill_date`              `date`            No         None                        None                  Vendor invoice issuance date.

  `due_date`               `date`            No         Check                       None                  Contractual payment due date.
                                                        (`due_date >= bill_date`)                         

  `fiscal_period_id`       `uuid`            No         FK $\rightarrow$            None                  Associated accounting period.
                                                        `FiscalPeriod.period_id`                          

  `currency_code`          `varchar(3)`      No         None                        `'AED'`               Invoice currency ISO code.

  `exchange_rate`          `numeric(12,6)`   No         Check (`exchange_rate > 0`) `1.000000`            FX rate to functional base currency.

  `subtotal_amount`        `numeric(18,4)`   No         Check                       `0.0000`              Sum of net expense lines.
                                                        (`subtotal_amount >= 0`)                          

  `tax_amount`             `numeric(18,4)`   No         Check (`tax_amount >= 0`)   `0.0000`              Total Input VAT recoverable.

  `total_amount`           `numeric(18,4)`   No         Check (`total_amount >= 0`) `0.0000`              Gross amount payable:
                                                                                                          $\text{subtotal} + \text{tax}$.

  `paid_amount`            `numeric(18,4)`   No         Check (`paid_amount >= 0`)  `0.0000`              Cumulative disbursements allocated.

  `balance_due`            `numeric(18,4)`   No         None                        `0.0000`              Unpaid balance:
                                                                                                          $\text{total\_amount} - \text{paid\_amount}$.

  `payment_status`         `varchar(20)`     No         Enum (`Draft`, `Approved`,  `'Draft'`             Settlement workflow status.
                                                        `PartiallyPaid`, `Paid`,                          
                                                        `Overdue`, `Void`)                                

  `reference_doc_number`   `varchar(50)`     Yes        None                        `null`                External supplier invoice number.

  `notes`                  `text`            Yes        None                        `null`                Internal review notes.

  `created_at`             `timestamp`       No         None                        `CURRENT_TIMESTAMP`   Record creation timestamp.
  -------------------------------------------------------------------------------------------------------------------------------------------------------

- **Business Invariants:**
  1.  Automatic Journal Generation on Bill Approval:
      - **Debit**: `6xxx Operating Expense` (or `15xx Fixed Asset`)
        \[Subtotal\]
      - **Debit**: `2220 Input VAT Recoverable` \[Tax Amount\]
      - **Credit**: `2010 Accounts Payable Trade Creditors` \[Total
        Amount\]

------------------------------------------------------------------------

#### Entity: `BillLine`

- **Domain:** Accounts Payable & Expense Management
- **Purpose:** Itemized expense lines on a vendor bill.
- **Schema Definition:**

  -------------------------------------------------------------------------------------------------------------------------
  Column Name        Data Type         Nullable   Constraint                    Default               Description
  ------------------ ----------------- ---------- ----------------------------- --------------------- ---------------------
  `line_id`          `uuid`            No         PK                            `gen_random_uuid()`   Primary unique
                                                                                                      identifier.

  `bill_id`          `uuid`            No         FK $\rightarrow$              None                  Parent vendor bill.
                                                  `Bill.bill_id` ON DELETE                            
                                                  CASCADE                                             

  `account_id`       `uuid`            No         FK $\rightarrow$              None                  Expense GL account
                                                  `Account.account_id`                                (5000/6000-series).

  `cost_center_id`   `uuid`            Yes        FK $\rightarrow$              `null`                Charged department
                                                  `CostCenter.cost_center_id`                         cost center.

  `line_number`      `integer`         No         Check (`line_number >= 1`)    None                  1-indexed row
                                                                                                      position.

  `description`      `text`            No         None                          None                  Itemized expense
                                                                                                      description.

  `quantity`         `numeric(12,4)`   No         Check (`quantity > 0`)        `1.0000`              Billed units.

  `unit_price`       `numeric(18,4)`   No         Check (`unit_price >= 0`)     `0.0000`              Unit price before
                                                                                                      tax.

  `tax_rate`         `numeric(5,2)`    No         Check (`tax_rate >= 0`)       `5.00`                Input VAT percentage
                                                                                                      rate.

  `tax_amount`       `numeric(18,4)`   No         Check (`tax_amount >= 0`)     `0.0000`              Computed Input VAT
                                                                                                      recoverable.

  `line_total`       `numeric(18,4)`   No         Check (`line_total >= 0`)     `0.0000`              Gross line total
                                                                                                      including tax.
  -------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

### 3.6 Payments, Receipts & Settlement Allocations

#### Entity: `Payment`

- **Domain:** Treasury, Cash Management & Settlements
- **Purpose:** Records money movement (customer receipts or vendor
  disbursements) through cash or bank accounts.
- **Schema Definition:**

  -----------------------------------------------------------------------------------------------------------------------------
  Column Name            Data Type         Nullable   Constraint                      Default               Description
  ---------------------- ----------------- ---------- ------------------------------- --------------------- -------------------
  `payment_id`           `uuid`            No         PK                              `gen_random_uuid()`   Primary unique
                                                                                                            identifier.

  `payment_number`       `varchar(30)`     No         UK                              None                  Payment voucher
                                                                                                            code (e.g.,
                                                                                                            `PAY-2026-0091`).

  `payment_type`         `varchar(30)`     No         Enum (`CustomerReceipt`,        None                  Direction of cash
                                                      `VendorDisbursement`,                                 flow.
                                                      `GeneralRefund`)                                      

  `payment_date`         `date`            No         None                            None                  Value date of cash
                                                                                                            transfer.

  `bank_account_id`      `uuid`            No         FK $\rightarrow$                None                  Disbursing or
                                                      `BankAccount.bank_account_id`                         receiving bank
                                                                                                            account.

  `journal_entry_id`     `uuid`            Yes        FK $\rightarrow$                `null`                Associated General
                                                      `JournalEntry.journal_id`                             Ledger cash
                                                                                                            posting.

  `customer_id`          `uuid`            Yes        FK $\rightarrow$                `null`                Customer reference
                                                      `Customer.customer_id`                                (for receipts).

  `vendor_id`            `uuid`            Yes        FK $\rightarrow$                `null`                Vendor reference
                                                      `Vendor.vendor_id`                                    (for
                                                                                                            disbursements).

  `payment_method`       `varchar(30)`     No         Enum (`BankTransfer`, `Cheque`, `'BankTransfer'`      Payment instrument.
                                                      `CreditCard`, `Cash`)                                 

  `reference_number`     `varchar(50)`     Yes        None                            `null`                Check number or
                                                                                                            wire transaction
                                                                                                            ID.

  `currency_code`        `varchar(3)`      No         None                            `'AED'`               Payment currency
                                                                                                            code.

  `exchange_rate`        `numeric(12,6)`   No         Check (`exchange_rate > 0`)     `1.000000`            FX rate to base
                                                                                                            functional
                                                                                                            currency.

  `amount`               `numeric(18,4)`   No         Check (`amount > 0`)            None                  Total gross payment
                                                                                                            amount.

  `unallocated_amount`   `numeric(18,4)`   No         Check                           `0.0000`              Unapplied advance
                                                      (`unallocated_amount >= 0`)                           cash balance.

  `status`               `varchar(20)`     No         Enum (`Draft`, `Cleared`,       `'Draft'`             Clearing status.
                                                      `Reconciled`, `Bounced`,                              
                                                      `Void`)                                               

  `created_at`           `timestamp`       No         None                            `CURRENT_TIMESTAMP`   Record creation
                                                                                                            timestamp.
  -----------------------------------------------------------------------------------------------------------------------------

- **Business Invariants:**
  1.  Payment Journal Postings:
      - **Customer Receipt**: Debit `1020 Operating Bank`, Credit
        `1110 Accounts Receivable`.
      - **Vendor Disbursement**: Debit `2010 Accounts Payable`, Credit
        `1020 Operating Bank`.

------------------------------------------------------------------------

#### Entity: `PaymentAllocation`

- **Domain:** Settlements & Clearing
- **Purpose:** Many-to-many settlement link allocating payment funds
  against outstanding sales invoices or vendor bills.
- **Schema Definition:**

  -------------------------------------------------------------------------------------------------------------------
  Column Name          Data Type         Nullable   Constraint                 Default               Description
  -------------------- ----------------- ---------- -------------------------- --------------------- ----------------
  `allocation_id`      `uuid`            No         PK                         `gen_random_uuid()`   Primary unique
                                                                                                     identifier.

  `payment_id`         `uuid`            No         FK $\rightarrow$           None                  Originating
                                                    `Payment.payment_id` ON                          payment voucher.
                                                    DELETE CASCADE                                   

  `invoice_id`         `uuid`            Yes        FK $\rightarrow$           `null`                Settled sales
                                                    `Invoice.invoice_id`                             invoice (if
                                                                                                     customer
                                                                                                     receipt).

  `bill_id`            `uuid`            Yes        FK $\rightarrow$           `null`                Settled vendor
                                                    `Bill.bill_id`                                   bill (if vendor
                                                                                                     disbursement).

  `allocated_amount`   `numeric(18,4)`   No         Check                      None                  Principal cash
                                                    (`allocated_amount > 0`)                         amount applied.

  `discount_taken`     `numeric(18,4)`   No         Check                      `0.0000`              Early payment
                                                    (`discount_taken >= 0`)                          discount taken.

  `allocation_date`    `date`            No         None                       None                  Effective
                                                                                                     settlement date.
  -------------------------------------------------------------------------------------------------------------------

- **Business Invariants:**
  1.  Allocation Invariant:
      $\sum\text{allocated\_amount} + \text{unallocated\_amount} \equiv \text{Payment.amount}$.
  2.  Document Settlement Invariant:
      $\text{Invoice.paid\_amount} = \sum\text{allocated\_amount}$.

------------------------------------------------------------------------

### 3.7 Banking, Treasury & Bank Reconciliation

#### Entity: `BankAccount`

- **Domain:** Treasury Management
- **Purpose:** Treasury bank account profiles linked directly to General
  Ledger cash accounts.
- **Schema Definition:**

  -----------------------------------------------------------------------------------------------------------------------
  Column Name                 Data Type         Nullable   Constraint             Default               Description
  --------------------------- ----------------- ---------- ---------------------- --------------------- -----------------
  `bank_account_id`           `uuid`            No         PK                     `gen_random_uuid()`   Primary unique
                                                                                                        identifier.

  `account_id`                `uuid`            No         FK $\rightarrow$       None                  Linked GL cash
                                                           `Account.account_id`                         account (e.g.,
                                                                                                        `1020`).

  `bank_name`                 `varchar(100)`    No         None                   None                  Commercial bank
                                                                                                        name.

  `account_number`            `varchar(50)`     No         None                   None                  Account number.

  `iban`                      `varchar(50)`     Yes        UK                     `null`                International
                                                                                                        Bank Account
                                                                                                        Number.

  `swift_bic`                 `varchar(20)`     Yes        None                   `null`                SWIFT / BIC
                                                                                                        identifier code.

  `currency_code`             `varchar(3)`      No         None                   `'AED'`               Account currency
                                                                                                        denomination.

  `opening_balance`           `numeric(18,4)`   No         None                   `0.0000`              Historical
                                                                                                        opening balance.

  `current_book_balance`      `numeric(18,4)`   No         None                   `0.0000`              Live GL cash book
                                                                                                        balance.

  `last_reconciled_date`      `date`            Yes        None                   `null`                Date of last
                                                                                                        finalized
                                                                                                        reconciliation.

  `last_reconciled_balance`   `numeric(18,4)`   Yes        None                   `null`                Verified bank
                                                                                                        statement ending
                                                                                                        balance.

  `is_active`                 `boolean`         No         None                   `true`                Operational
                                                                                                        active status.

  `created_at`                `timestamp`       No         None                   `CURRENT_TIMESTAMP`   Record creation
                                                                                                        timestamp.
  -----------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

#### Entity: `BankTransaction`

- **Domain:** Treasury & Bank Feeds
- **Purpose:** Unaltered external bank statement lines imported via
  electronic statement feeds (OFX, MT940, CSV).
- **Schema Definition:**

  -------------------------------------------------------------------------------------------------------------------------
  Column Name           Data Type         Nullable   Constraint                      Default               Description
  --------------------- ----------------- ---------- ------------------------------- --------------------- ----------------
  `bank_txn_id`         `uuid`            No         PK                              `gen_random_uuid()`   Primary unique
                                                                                                           identifier.

  `bank_account_id`     `uuid`            No         FK $\rightarrow$                None                  Parent bank
                                                     `BankAccount.bank_account_id`                         account.

  `transaction_date`    `date`            No         None                            None                  Bank statement
                                                                                                           booking date.

  `value_date`          `date`            Yes        None                            `null`                Value date of
                                                                                                           fund
                                                                                                           availability.

  `description`         `text`            No         None                            None                  Raw bank
                                                                                                           narration
                                                                                                           string.

  `reference_number`    `varchar(100)`    Yes        None                            `null`                Bank reference
                                                                                                           or check number.

  `transaction_type`    `varchar(30)`     No         Enum (`Deposit`, `Withdrawal`,  None                  Transaction
                                                     `Transfer`, `Fee`, `Interest`)                        category.

  `amount`              `numeric(18,4)`   No         None                            None                  Signed amount (+
                                                                                                           deposit, -
                                                                                                           withdrawal).

  `running_balance`     `numeric(18,4)`   Yes        None                            `null`                Bank statement
                                                                                                           balance after
                                                                                                           transaction.

  `is_reconciled`       `boolean`         No         None                            `false`               True when
                                                                                                           matched in
                                                                                                           reconciliation
                                                                                                           session.

  `statement_file_id`   `uuid`            Yes        None                            `null`                Import batch
                                                                                                           file reference.

  `created_at`          `timestamp`       No         None                            `CURRENT_TIMESTAMP`   Import creation
                                                                                                           timestamp.
  -------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

#### Entity: `BankReconciliation`

- **Domain:** Treasury & Internal Controls
- **Purpose:** Audit document resolving timing and transaction variances
  between bank statements and General Ledger books.
- **Schema Definition:**

  -----------------------------------------------------------------------------------------------------------------------------------------------
  Column Name                  Data Type         Nullable   Constraint                                       Default               Description
  ---------------------------- ----------------- ---------- ------------------------------------------------ --------------------- --------------
  `reconciliation_id`          `uuid`            No         PK                                               `gen_random_uuid()`   Primary unique
                                                                                                                                   identifier.

  `bank_account_id`            `uuid`            No         FK $\rightarrow$ `BankAccount.bank_account_id`   None                  Treasury bank
                                                                                                                                   account.

  `statement_start_date`       `date`            No         None                                             None                  Opening
                                                                                                                                   statement
                                                                                                                                   date.

  `statement_end_date`         `date`            No         Check                                            None                  Closing
                                                            (`statement_end_date >= statement_start_date`)                         statement
                                                                                                                                   date.

  `statement_ending_balance`   `numeric(18,4)`   No         None                                             None                  Ending balance
                                                                                                                                   on bank
                                                                                                                                   statement.

  `gl_ending_balance`          `numeric(18,4)`   No         None                                             None                  Ending balance
                                                                                                                                   on GL Cash
                                                                                                                                   account.

  `unreconciled_difference`    `numeric(18,4)`   No         None                                             `0.0000`              Unmatched
                                                                                                                                   variance
                                                                                                                                   ($\Delta$).

  `status`                     `varchar(20)`     No         Enum (`InProgress`, `Completed`, `Approved`)     `'InProgress'`        Session state.

  `reconciled_by`              `uuid`            Yes        FK $\rightarrow$ Users                           `null`                Controller
                                                                                                                                   finalizing
                                                                                                                                   session.

  `reconciled_at`              `timestamp`       Yes        None                                             `null`                Finalization
                                                                                                                                   timestamp.
  -----------------------------------------------------------------------------------------------------------------------------------------------

- **Business Invariants:**
  1.  Two-Pane Reconciliation Invariant: Final approval
      (`status = 'Approved'`) requires:

$$\text{Adjusted Bank Balance} \equiv \text{Adjusted GL Book Balance} \Leftrightarrow \text{unreconciled\_difference} = 0.0000$$

------------------------------------------------------------------------

#### Entity: `ReconciliationMatch`

- **Domain:** Treasury & Internal Controls
- **Purpose:** Granular link matching bank feed lines to GL journal
  lines or payment vouchers.
- **Schema Definition:**

  ----------------------------------------------------------------------------------------------------------------------------------
  Column Name           Data Type         Nullable   Constraint                               Default               Description
  --------------------- ----------------- ---------- ---------------------------------------- --------------------- ----------------
  `match_id`            `uuid`            No         PK                                       `gen_random_uuid()`   Primary unique
                                                                                                                    identifier.

  `reconciliation_id`   `uuid`            No         FK $\rightarrow$                         None                  Parent
                                                     `BankReconciliation.reconciliation_id`                         reconciliation
                                                     ON DELETE CASCADE                                              session.

  `bank_txn_id`         `uuid`            Yes        FK $\rightarrow$                         `null`                Cleared bank
                                                     `BankTransaction.bank_txn_id`                                  statement feed
                                                                                                                    line.

  `journal_line_id`     `uuid`            Yes        FK $\rightarrow$ `JournalLine.line_id`   `null`                Cleared GL
                                                                                                                    journal line.

  `payment_id`          `uuid`            Yes        FK $\rightarrow$ `Payment.payment_id`    `null`                Cleared payment
                                                                                                                    record.

  `matched_amount`      `numeric(18,4)`   No         Check (`matched_amount > 0`)             None                  Reconciled
                                                                                                                    monetary volume.

  `match_type`          `varchar(30)`     No         Enum (`ExactOneToOne`, `OneToMany`,      None                  Matching
                                                     `ManyToOne`, `RuleAutoMatched`,                                mechanism.
                                                     `ManualAdjustment`)                                            

  `matched_at`          `timestamp`       No         None                                     `CURRENT_TIMESTAMP`   Timestamp of
                                                                                                                    matching.
  ----------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

### 3.8 Payroll, Human Resources & Compensation

#### Entity: `Employee`

- **Domain:** Workforce & Payroll
- **Purpose:** Staff master record defining compensation contracts, bank
  details for WPS, and statutory pension profiles.
- **Schema Definition:**

  -----------------------------------------------------------------------------------------------------------------------------
  Column Name                Data Type         Nullable   Constraint                     Default               Description
  -------------------------- ----------------- ---------- ------------------------------ --------------------- ----------------
  `employee_id`              `uuid`            No         PK                             `gen_random_uuid()`   Primary unique
                                                                                                               identifier.

  `employee_code`            `varchar(20)`     No         UK                             None                  Staff code
                                                                                                               (e.g.,
                                                                                                               `EMP-0104`).

  `first_name`               `varchar(50)`     No         None                           None                  Given name.

  `last_name`                `varchar(50)`     No         None                           None                  Surname.

  `national_id_or_iqama`     `varchar(50)`     No         UK                             None                  Civil
                                                                                                               identification /
                                                                                                               passport number.

  `department`               `varchar(50)`     No         None                           None                  Functional
                                                                                                               department
                                                                                                               title.

  `job_title`                `varchar(100)`    No         None                           None                  Employment role.

  `cost_center_id`           `uuid`            Yes        FK $\rightarrow$               `null`                Assigned
                                                          `CostCenter.cost_center_id`                          departmental
                                                                                                               cost center.

  `bank_name`                `varchar(100)`    No         None                           None                  Salary
                                                                                                               disbursement
                                                                                                               bank.

  `iban`                     `varchar(50)`     No         None                           None                  Bank IBAN for
                                                                                                               electronic WPS
                                                                                                               transfer.

  `basic_salary`             `numeric(18,4)`   No         Check (`basic_salary > 0`)     None                  Contractual base
                                                                                                               monthly wage.

  `housing_allowance`        `numeric(18,4)`   No         Check                          `0.0000`              Recurring
                                                          (`housing_allowance >= 0`)                           monthly housing
                                                                                                               allowance.

  `transport_allowance`      `numeric(18,4)`   No         Check                          `0.0000`              Recurring
                                                          (`transport_allowance >= 0`)                         monthly
                                                                                                               transport
                                                                                                               allowance.

  `other_allowances`         `numeric(18,4)`   No         Check                          `0.0000`              Utilities,
                                                          (`other_allowances >= 0`)                            telephone, and
                                                                                                               food stipends.

  `social_security_number`   `varchar(50)`     Yes        None                           `null`                Statutory
                                                                                                               pension scheme
                                                                                                               registry ID.

  `is_active`                `boolean`         No         None                           `true`                Active
                                                                                                               employment
                                                                                                               status.

  `hire_date`                `date`            No         None                           None                  Employment start
                                                                                                               date.

  `created_at`               `timestamp`       No         None                           `CURRENT_TIMESTAMP`   Record creation
                                                                                                               timestamp.
  -----------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

#### Entity: `PayrollRun`

- **Domain:** Payroll Processing
- **Purpose:** Monthly batch execution record aggregating gross wages,
  statutory deductions, employer costs, and net salary disbursement.
- **Schema Definition:**

  ---------------------------------------------------------------------------------------------------------------------------------------------
  Column Name                      Data Type         Nullable   Constraint                               Default               Description
  -------------------------------- ----------------- ---------- ---------------------------------------- --------------------- ----------------
  `payroll_run_id`                 `uuid`            No         PK                                       `gen_random_uuid()`   Primary unique
                                                                                                                               identifier.

  `payroll_code`                   `varchar(20)`     No         UK                                       None                  Batch code
                                                                                                                               (e.g.,
                                                                                                                               `PR-2026-08`).

  `fiscal_period_id`               `uuid`            No         FK $\rightarrow$                         None                  Associated
                                                                `FiscalPeriod.period_id`                                       accounting
                                                                                                                               period.

  `pay_period_start`               `date`            No         None                                     None                  Payroll cycle
                                                                                                                               start date.

  `pay_period_end`                 `date`            No         Check                                    None                  Payroll cycle
                                                                (`pay_period_end >= pay_period_start`)                         end date.

  `execution_date`                 `date`            No         None                                     None                  Salary
                                                                                                                               disbursement
                                                                                                                               value date.

  `total_gross`                    `numeric(18,4)`   No         Check (`total_gross >= 0`)               `0.0000`              Aggregated basic
                                                                                                                               salaries.

  `total_allowances`               `numeric(18,4)`   No         Check (`total_allowances >= 0`)          `0.0000`              Aggregated
                                                                                                                               employee
                                                                                                                               allowances.

  `total_deductions`               `numeric(18,4)`   No         Check (`total_deductions >= 0`)          `0.0000`              Total employee
                                                                                                                               deductions
                                                                                                                               withheld.

  `total_employer_contributions`   `numeric(18,4)`   No         Check                                    `0.0000`              Employer
                                                                (`total_employer_contributions >= 0`)                          statutory
                                                                                                                               pension costs.

  `total_net_pay`                  `numeric(18,4)`   No         Check (`total_net_pay >= 0`)             `0.0000`              Total net cash
                                                                                                                               disbursed to
                                                                                                                               staff.

  `journal_entry_id`               `uuid`            Yes        FK $\rightarrow$                         `null`                Automated
                                                                `JournalEntry.journal_id`                                      Payroll GL
                                                                                                                               voucher.

  `wps_sif_file_generated`         `boolean`         No         None                                     `false`               True when SIF
                                                                                                                               bank file is
                                                                                                                               generated.

  `status`                         `varchar(20)`     No         Enum (`Draft`, `Approved`, `Processed`,  `'Draft'`             Payroll batch
                                                                `Paid`, `Cancelled`)                                           state.

  `approved_by`                    `uuid`            Yes        FK $\rightarrow$ Users                   `null`                HR / Finance
                                                                                                                               controller who
                                                                                                                               approved batch.

  `created_at`                     `timestamp`       No         None                                     `CURRENT_TIMESTAMP`   Record creation
                                                                                                                               timestamp.
  ---------------------------------------------------------------------------------------------------------------------------------------------

- **Business Invariants:**
  1.  Automated Monthly Payroll Journal Entry Formulation:
      - **Debit**: `6010 Staff Basic Salaries Expense`
        \[$\sum\text{Basic Salaries}$\]
      - **Debit**: `6020 Staff Allowances Expense`
        \[$\sum\text{Allowances}$\]
      - **Debit**: `6040 Employer Social Security Expense`
        \[$\sum\text{Employer Pension Share}$\]
      - **Credit**: `2110 Accrued Salaries / Net Pay Payable`
        \[$\sum\text{Net Pay}$\]
      - **Credit**: `2120 Social Security Payable`
        \[$\sum\text{Employee} + \text{Employer Pension}$\]
      - **Credit**: `2230 Income Tax Withholding Payable`
        \[$\sum\text{Tax Withheld}$\]

------------------------------------------------------------------------

#### Entity: `Payslip`

- **Domain:** Payroll Processing
- **Purpose:** Individual employee compensation calculation for a
  specific payroll cycle.
- **Schema Definition:**

  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Column Name                         Data Type         Nullable   Constraint                                 Default               Description
  ----------------------------------- ----------------- ---------- ------------------------------------------ --------------------- -------------------------------------
  `payslip_id`                        `uuid`            No         PK                                         `gen_random_uuid()`   Primary unique identifier.

  `payroll_run_id`                    `uuid`            No         FK $\rightarrow$                           None                  Parent payroll batch.
                                                                   `PayrollRun.payroll_run_id` ON DELETE                            
                                                                   CASCADE                                                          

  `employee_id`                       `uuid`            No         FK $\rightarrow$ `Employee.employee_id`    None                  Employee recipient.

  `basic_salary`                      `numeric(18,4)`   No         Check (`basic_salary > 0`)                 None                  Contractual basic wage.

  `total_allowances`                  `numeric(18,4)`   No         Check (`total_allowances >= 0`)            `0.0000`              Housing, transport, and bonuses.

  `gross_salary`                      `numeric(18,4)`   No         Check (`gross_salary >= basic_salary`)     None                  Basic wage plus allowances.

  `employee_social_security`          `numeric(18,4)`   No         Check (`employee_social_security >= 0`)    `0.0000`              Employee statutory pension share.

  `income_tax_withheld`               `numeric(18,4)`   No         Check (`income_tax_withheld >= 0`)         `0.0000`              Statutory income tax withholding.

  `other_deductions`                  `numeric(18,4)`   No         Check (`other_deductions >= 0`)            `0.0000`              Loan repayments, penalties, health.

  `total_deductions`                  `numeric(18,4)`   No         Check (`total_deductions >= 0`)            `0.0000`              Sum of all employee deductions.

  `net_salary`                        `numeric(18,4)`   No         Check (`net_salary >= 0`)                  None                  Take-home pay:
                                                                                                                                    $\text{gross} - \text{deductions}$.

  `employer_social_security`          `numeric(18,4)`   No         Check (`employer_social_security >= 0`)    `0.0000`              Employer statutory pension share.

  `employer_end_of_service_accrual`   `numeric(18,4)`   No         Check                                      `0.0000`              Monthly gratuity provision.
                                                                   (`employer_end_of_service_accrual >= 0`)                         

  `payment_status`                    `varchar(20)`     No         Enum (`Pending`, `Paid`,                   `'Pending'`           Individual payment status.
                                                                   `DirectDepositInitiated`)                                        

  `payment_reference`                 `varchar(50)`     Yes        None                                       `null`                Bank transfer transaction reference.
  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

#### Entity: `PayslipLine`

- **Domain:** Payroll Processing
- **Purpose:** Detailed itemization of salary allowances, overtime
  hours, bonuses, and individual deduction components.
- **Schema Definition:**

  --------------------------------------------------------------------------------------------------------------------
  Column Name         Data Type         Nullable   Constraint             Default               Description
  ------------------- ----------------- ---------- ---------------------- --------------------- ----------------------
  `payslip_line_id`   `uuid`            No         PK                     `gen_random_uuid()`   Primary unique
                                                                                                identifier.

  `payslip_id`        `uuid`            No         FK $\rightarrow$       None                  Parent payslip record.
                                                   `Payslip.payslip_id`                         
                                                   ON DELETE CASCADE                            

  `component_type`    `varchar(30)`     No         Enum (`Allowance`,     None                  Component
                                                   `Deduction`,                                 classification.
                                                   `EmployerCost`,                              
                                                   `Overtime`, `Bonus`)                         

  `component_name`    `varchar(100)`    No         None                   None                  Title (e.g.,
                                                                                                `Housing Allowance`,
                                                                                                `Loan Advance`).

  `amount`            `numeric(18,4)`   No         Check (`amount >= 0`)  None                  Monetary magnitude.

  `is_taxable`        `boolean`         No         None                   `true`                True if subject to tax
                                                                                                and pension
                                                                                                calculation.
  --------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

### 3.9 Tax, VAT & Regulatory Compliance

#### Entity: `TaxPeriod`

- **Domain:** Tax & Statutory Compliance
- **Purpose:** Defines recurring regulatory tax submission windows
  (monthly or quarterly VAT cycles).
- **Schema Definition:**

  ------------------------------------------------------------------------------------------------------------------------
  Column Name         Data Type       Nullable   Constraint                        Default               Description
  ------------------- --------------- ---------- --------------------------------- --------------------- -----------------
  `tax_period_id`     `uuid`          No         PK                                `gen_random_uuid()`   Primary unique
                                                                                                         identifier.

  `period_code`       `varchar(20)`   No         UK                                None                  Code (e.g.,
                                                                                                         `VAT-2026-Q3`).

  `start_date`        `date`          No         None                              None                  Filing window
                                                                                                         start date.

  `end_date`          `date`          No         Check (`end_date >= start_date`)  None                  Filing window end
                                                                                                         date.

  `filing_deadline`   `date`          No         Check                             None                  Statutory
                                                 (`filing_deadline >= end_date`)                         submission due
                                                                                                         date.

  `tax_type`          `varchar(30)`   No         Enum (`StandardVAT`,              `'StandardVAT'`       Statutory tax
                                                 `CorporateIncomeTax`)                                   regime.

  `status`            `varchar(20)`   No         Enum (`Open`, `InPreparation`,    `'Open'`              Filing cycle
                                                 `Filed`, `Settled`)                                     status.

  `created_at`        `timestamp`     No         None                              `CURRENT_TIMESTAMP`   Record creation
                                                                                                         timestamp.
  ------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

#### Entity: `TaxReturn`

- **Domain:** Tax & Statutory Compliance
- **Purpose:** Formal VAT return declaration aggregating Output VAT
  against recoverable Input VAT to compute net tax liability.
- **Schema Definition:**

  -----------------------------------------------------------------------------------------------------------------------------------------------------------
  Column Name                 Data Type         Nullable   Constraint                         Default               Description
  --------------------------- ----------------- ---------- ---------------------------------- --------------------- -----------------------------------------
  `tax_return_id`             `uuid`            No         PK                                 `gen_random_uuid()`   Primary unique identifier.

  `tax_period_id`             `uuid`            No         FK $\rightarrow$                   None                  Parent tax window.
                                                           `TaxPeriod.tax_period_id`                                

  `filing_reference_number`   `varchar(50)`     Yes        UK                                 `null`                Tax authority electronic submission
                                                                                                                    confirmation ID.

  `total_taxable_sales`       `numeric(18,4)`   No         Check (`total_taxable_sales >= 0`) `0.0000`              Net standard-rated sales base.

  `total_output_vat`          `numeric(18,4)`   No         Check (`total_output_vat >= 0`)    `0.0000`              Total tax collected on customer sales.

  `total_taxable_purchases`   `numeric(18,4)`   No         Check                              `0.0000`              Net standard-rated expense base.
                                                           (`total_taxable_purchases >= 0`)                         

  `total_input_vat`           `numeric(18,4)`   No         Check (`total_input_vat >= 0`)     `0.0000`              Total tax credit on vendor purchases.

  `net_vat_payable`           `numeric(18,4)`   No         None                               `0.0000`              Net liability:
                                                                                                                    $\text{Output VAT} - \text{Input VAT}$.

  `settlement_journal_id`     `uuid`            Yes        FK $\rightarrow$                   `null`                Associated Tax Settlement GL voucher.
                                                           `JournalEntry.journal_id`                                

  `filing_date`               `date`            Yes        None                               `null`                Date submitted to tax authority.

  `payment_due_date`          `date`            Yes        None                               `null`                Tax payment settlement deadline.

  `filing_status`             `varchar(20)`     No         Enum (`Draft`, `Submitted`,        `'Draft'`             Return processing status.
                                                           `Accepted`, `Paid`, `Disputed`)                          

  `submitted_by`              `uuid`            Yes        FK $\rightarrow$ Users             `null`                Tax agent / accountant user ID.

  `created_at`                `timestamp`       No         None                               `CURRENT_TIMESTAMP`   Record creation timestamp.
  -----------------------------------------------------------------------------------------------------------------------------------------------------------

- **Business Invariants:**
  1.  VAT Settlement Invariant:

$$\text{net\_vat\_payable} = \text{total\_output\_vat} - \text{total\_input\_vat}$$

- If $\text{net\_vat\_payable} > 0$: Company owes payment to Tax
  Authority (Current Liability).
- If $\text{net\_vat\_payable} < 0$: Company holds refundable tax credit
  (Current Asset).

2.  Tax Settlement Journal Entry:
    - **Debit**: `2210 Output VAT Payable` \[Total Output VAT\]
    - **Credit**: `2220 Input VAT Recoverable` \[Total Input VAT\]
    - **Credit**: `1020 Bank Account` (or `2215 Tax Settlement Payable`)
      \[Net VAT Payable\]

------------------------------------------------------------------------

### 3.10 Fixed Assets & Depreciation Engine

#### Entity: `FixedAsset`

- **Domain:** Fixed Assets & Capital Management
- **Purpose:** Capital asset register tracking historical acquisition
  costs, useful lives, accumulated depreciation, and net book values.
- **Schema Definition:**

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Column Name                   Data Type         Nullable   Constraint                                                    Default               Description
  ----------------------------- ----------------- ---------- ------------------------------------------------------------- --------------------- ----------------------------------------------------------------
  `asset_id`                    `uuid`            No         PK                                                            `gen_random_uuid()`   Primary unique identifier.

  `asset_code`                  `varchar(30)`     No         UK                                                            None                  Asset tag code (e.g., `FA-0082`).

  `asset_name`                  `varchar(150)`    No         None                                                          None                  Descriptive title (e.g., `Dell PowerEdge Server Rack`).

  `category`                    `varchar(50)`     No         Enum (`ITEquipment`, `Vehicles`, `Buildings`, `Machinery`,    None                  Asset asset class.
                                                             `Furniture`)                                                                        

  `cost_center_id`              `uuid`            Yes        FK $\rightarrow$ `CostCenter.cost_center_id`                  `null`                Departmental location of asset.

  `acquisition_date`            `date`            No         None                                                          None                  Date of invoice / purchase.

  `capitalization_date`         `date`            No         Check (`capitalization_date >= acquisition_date`)             None                  In-service accounting date.

  `acquisition_cost`            `numeric(18,4)`   No         Check (`acquisition_cost > 0`)                                None                  Gross historical purchase cost.

  `salvage_value`               `numeric(18,4)`   No         Check                                                         `0.0000`              Estimated residual value at end of life.
                                                             (`salvage_value >= 0 AND salvage_value < acquisition_cost`)                         

  `useful_life_months`          `integer`         No         Check (`useful_life_months > 0`)                              None                  Total economic useful life in months.

  `depreciation_method`         `varchar(30)`     No         Enum (`StraightLine`, `DoubleDecliningBalance`,               `'StraightLine'`      Depreciation mathematical algorithm.
                                                             `SumOfYearsDigits`)                                                                 

  `asset_account_id`            `uuid`            No         FK $\rightarrow$ `Account.account_id`                         None                  Asset GL account (e.g., `1530 IT Equipment`).

  `accum_deprec_account_id`     `uuid`            No         FK $\rightarrow$ `Account.account_id`                         None                  Contra-asset GL account (e.g., `1539`).

  `deprec_expense_account_id`   `uuid`            No         FK $\rightarrow$ `Account.account_id`                         None                  Expense GL account (e.g., `6410 Depreciation Expense`).

  `accumulated_depreciation`    `numeric(18,4)`   No         Check (`accumulated_depreciation >= 0`)                       `0.0000`              Total amortized depreciation to date.

  `current_book_value`          `numeric(18,4)`   No         None                                                          None                  Net Book Value:
                                                                                                                                                 $\text{acquisition\_cost} - \text{accumulated\_depreciation}$.

  `status`                      `varchar(20)`     No         Enum (`Active`, `UnderMaintenance`, `FullyDepreciated`,       `'Active'`            Operational state.
                                                             `Disposed`, `WrittenOff`)                                                           

  `created_at`                  `timestamp`       No         None                                                          `CURRENT_TIMESTAMP`   Record creation timestamp.
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

- **Business Invariants:**
  1.  Net Book Value Invariant:

$$\text{current\_book\_value} \equiv \text{acquisition\_cost} - \text{accumulated\_depreciation}$$

$$\text{current\_book\_value} \geq \text{salvage\_value}\quad(\text{for active assets})$$

------------------------------------------------------------------------

#### Entity: `DepreciationSchedule`

- **Domain:** Fixed Assets & Capital Management
- **Purpose:** Projected periodic amortization plan calculated upon
  asset capitalization.
- **Schema Definition:**

  ----------------------------------------------------------------------------------------------------------------------------------------------------
  Column Name                       Data Type         Nullable   Constraint                               Default               Description
  --------------------------------- ----------------- ---------- ---------------------------------------- --------------------- ----------------------
  `schedule_id`                     `uuid`            No         PK                                       `gen_random_uuid()`   Primary unique
                                                                                                                                identifier.

  `asset_id`                        `uuid`            No         FK $\rightarrow$ `FixedAsset.asset_id`   None                  Parent capital asset.
                                                                 ON DELETE CASCADE                                              

  `period_number`                   `integer`         No         Check (`period_number >= 1`)             None                  Month index in asset
                                                                                                                                useful life.

  `fiscal_period_id`                `uuid`            No         FK $\rightarrow$                         None                  Target accounting
                                                                 `FiscalPeriod.period_id`                                       period.

  `scheduled_date`                  `date`            No         None                                     None                  Projected calculation
                                                                                                                                date.

  `scheduled_depreciation_amount`   `numeric(18,4)`   No         Check                                    None                  Projected monthly
                                                                 (`scheduled_depreciation_amount >= 0`)                         depreciation expense.

  `projected_accum_depreciation`    `numeric(18,4)`   No         None                                     None                  Projected cumulative
                                                                                                                                depreciation.

  `projected_book_value`            `numeric(18,4)`   No         None                                     None                  Projected Net Book
                                                                                                                                Value at month end.

  `is_posted`                       `boolean`         No         None                                     `false`               True when materialized
                                                                                                                                into a posted
                                                                                                                                `DepreciationEntry`.
  ----------------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

#### Entity: `DepreciationEntry`

- **Domain:** Fixed Assets & Capital Management
- **Purpose:** Actual posted depreciation transaction linked to a
  General Ledger journal voucher.
- **Schema Definition:**

  -------------------------------------------------------------------------------------------------------------------------------
  Column Name              Data Type         Nullable   Constraint                           Default               Description
  ------------------------ ----------------- ---------- ------------------------------------ --------------------- --------------
  `entry_id`               `uuid`            No         PK                                   `gen_random_uuid()`   Primary unique
                                                                                                                   identifier.

  `asset_id`               `uuid`            No         FK $\rightarrow$                     None                  Parent capital
                                                        `FixedAsset.asset_id`                                      asset.

  `schedule_id`            `uuid`            Yes        FK $\rightarrow$                     `null`                Associated
                                                        `DepreciationSchedule.schedule_id`                         amortization
                                                                                                                   schedule row.

  `journal_entry_id`       `uuid`            No         FK $\rightarrow$                     None                  Associated
                                                        `JournalEntry.journal_id`                                  Depreciation
                                                                                                                   GL voucher.

  `fiscal_period_id`       `uuid`            No         FK $\rightarrow$                     None                  Associated
                                                        `FiscalPeriod.period_id`                                   fiscal period.

  `depreciation_date`      `date`            No         None                                 None                  Effective
                                                                                                                   posting date.

  `depreciation_amount`    `numeric(18,4)`   No         Check (`depreciation_amount > 0`)    None                  Recognized
                                                                                                                   monthly
                                                                                                                   depreciation
                                                                                                                   expense.

  `accumulated_to_date`    `numeric(18,4)`   No         None                                 None                  Total
                                                                                                                   cumulative
                                                                                                                   depreciation
                                                                                                                   post entry.

  `net_book_value_after`   `numeric(18,4)`   No         None                                 None                  Net Book Value
                                                                                                                   post entry.

  `posted_at`              `timestamp`       No         None                                 `CURRENT_TIMESTAMP`   GL posting
                                                                                                                   timestamp.

  `posted_by`              `uuid`            No         FK $\rightarrow$ Users               None                  User who
                                                                                                                   executed
                                                                                                                   depreciation
                                                                                                                   run.
  -------------------------------------------------------------------------------------------------------------------------------

- **Business Invariants:**
  1.  Depreciation Posting Journal Entry:
      - **Debit**: `6410 Depreciation Expense` \[Depreciation Amount\]
      - **Credit**: `1539 Accumulated Depreciation` \[Depreciation
        Amount\]

------------------------------------------------------------------------

### 3.11 Budgeting, Variance Control & Audit Logging

#### Entity: `Budget`

- **Domain:** Management Accounting & Financial Planning
- **Purpose:** Master fiscal budget plan establishing corporate
  financial targets.
- **Schema Definition:**

  ---------------------------------------------------------------------------------------------------------------------------------
  Column Name                Data Type         Nullable   Constraint                        Default               Description
  -------------------------- ----------------- ---------- --------------------------------- --------------------- -----------------
  `budget_id`                `uuid`            No         PK                                `gen_random_uuid()`   Primary unique
                                                                                                                  identifier.

  `budget_code`              `varchar(20)`     No         UK                                None                  Budget plan code
                                                                                                                  (e.g.,
                                                                                                                  `BUD-2026-V1`).

  `fiscal_year_id`           `uuid`            No         FK $\rightarrow$                  None                  Target fiscal
                                                          `FiscalYear.year_id`                                    year.

  `budget_name`              `varchar(150)`    No         None                              None                  Budget title.

  `description`              `text`            Yes        None                              `null`                Strategic
                                                                                                                  assumptions and
                                                                                                                  notes.

  `total_budgeted_revenue`   `numeric(18,4)`   No         Check                             `0.0000`              Aggregated
                                                          (`total_budgeted_revenue >= 0`)                         planned revenue
                                                                                                                  target.

  `total_budgeted_expense`   `numeric(18,4)`   No         Check                             `0.0000`              Aggregated
                                                          (`total_budgeted_expense >= 0`)                         planned expense
                                                                                                                  ceiling.

  `status`                   `varchar(20)`     No         Enum (`Draft`, `Approved`,        `'Draft'`             Budget approval
                                                          `Active`, `Revised`, `Archived`)                        state.

  `approved_by`              `uuid`            Yes        FK $\rightarrow$ Users            `null`                Executive / Board
                                                                                                                  authorizer.

  `created_at`               `timestamp`       No         None                              `CURRENT_TIMESTAMP`   Record creation
                                                                                                                  timestamp.
  ---------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

#### Entity: `BudgetItem`

- **Domain:** Management Accounting & Variance Analysis
- **Purpose:** Granular monthly or quarterly budget allocations assigned
  to specific GL accounts and cost centers.
- **Schema Definition:**

  ---------------------------------------------------------------------------------------------------------------------------------------------
  Column Name             Data Type         Nullable   Constraint                    Default               Description
  ----------------------- ----------------- ---------- ----------------------------- --------------------- ------------------------------------
  `budget_item_id`        `uuid`            No         PK                            `gen_random_uuid()`   Primary unique identifier.

  `budget_id`             `uuid`            No         FK $\rightarrow$              None                  Parent budget plan.
                                                       `Budget.budget_id` ON DELETE                        
                                                       CASCADE                                             

  `account_id`            `uuid`            No         FK $\rightarrow$              None                  Budgeted GL account.
                                                       `Account.account_id`                                

  `cost_center_id`        `uuid`            Yes        FK $\rightarrow$              `null`                Budgeted department cost center.
                                                       `CostCenter.cost_center_id`                         

  `fiscal_period_id`      `uuid`            No         FK $\rightarrow$              None                  Target fiscal period.
                                                       `FiscalPeriod.period_id`                            

  `budgeted_amount`       `numeric(18,4)`   No         Check                         `0.0000`              Allocated budget ceiling.
                                                       (`budgeted_amount >= 0`)                            

  `actual_spent_amount`   `numeric(18,4)`   No         None                          `0.0000`              Actual GL transaction spend.

  `variance_amount`       `numeric(18,4)`   No         None                          `0.0000`              Dollar variance:
                                                                                                           $\text{actual} - \text{budgeted}$.

  `variance_percentage`   `numeric(7,2)`    No         None                          `0.00`                Percentage deviation from plan.
  ---------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

#### Entity: `AuditLog`

- **Domain:** System Governance, Security & Internal Controls
- **Purpose:** Tamper-evident, immutable audit trail capturing every
  state change, approval, reversal, and transaction event across the
  financial system.
- **Schema Definition:**

  --------------------------------------------------------------------------------------------------
  Column Name     Data Type        Nullable   Constraint     Default               Description
  --------------- ---------------- ---------- -------------- --------------------- -----------------
  `audit_id`      `uuid`           No         PK             `gen_random_uuid()`   Primary unique
                                                                                   identifier.

  `timestamp`     `timestamp`      No         None           `CURRENT_TIMESTAMP`   Precise UTC event
                                                                                   timestamp.

  `user_id`       `uuid`           Yes        None           `null`                Identifier of
                                                                                   executing actor.

  `user_name`     `varchar(100)`   Yes        None           `null`                Display name of
                                                                                   actor.

  `action_type`   `varchar(20)`    No         Enum           None                  Executed
                                              (`CREATE`,                           financial
                                              `UPDATE`,                            operation.
                                              `POST`,                              
                                              `REVERSE`,                           
                                              `APPROVE`,                           
                                              `VOID`,                              
                                              `RECONCILE`,                         
                                              `DELETE`)                            

  `entity_name`   `varchar(50)`    No         None           None                  Target entity
                                                                                   (e.g.,
                                                                                   `JournalEntry`,
                                                                                   `Invoice`,
                                                                                   `TaxReturn`).

  `entity_id`     `uuid`           No         None           None                  Primary key value
                                                                                   of target entity.

  `old_values`    `jsonb`          Yes        None           `null`                JSON snapshot of
                                                                                   entity state
                                                                                   prior to
                                                                                   mutation.

  `new_values`    `jsonb`          Yes        None           `null`                JSON snapshot of
                                                                                   entity state post
                                                                                   mutation.

  `ip_address`    `varchar(45)`    Yes        None           `null`                Client IPv4 or
                                                                                   IPv6 network
                                                                                   address.

  `user_agent`    `text`           Yes        None           `null`                Client browser /
                                                                                   environment
                                                                                   metadata.

  `reason`        `text`           Yes        None           `null`                Mandatory
                                                                                   controller
                                                                                   rationale for
                                                                                   modifications.
  --------------------------------------------------------------------------------------------------

- **Business Invariants:**
  1.  Immutability Invariant: The `AuditLog` table permits `INSERT`
      operations only. `UPDATE`, `DELETE`, and `TRUNCATE` operations are
      strictly blocked by database security rules and triggers.

------------------------------------------------------------------------

## 4. Cross-Domain Business Invariants & Mathematical Formulations

    ====================================================================================================
                   QUICKBOX FINANCIAL SYSTEM — MATHEMATICAL ENGINE SPECIFICATION
    ====================================================================================================

### 4.1 Double-Entry General Ledger Equilibrium Theorem

For every posted `JournalEntry` containing $n$ `JournalLine` records:

$$\sum_{i = 1}^{n}\text{JournalLine.debit\_amount}_{i} \equiv \sum_{i = 1}^{n}\text{JournalLine.credit\_amount}_{i}$$

$$\Delta = \left| \sum_{i = 1}^{n}\text{debit\_amount}_{i} - \sum_{i = 1}^{n}\text{credit\_amount}_{i} \right| = 0.0000$$

If $\Delta \neq 0.0000$, database triggers abort the transaction, raise
an unhandled exception (`ERR_GL_UNBALANCED_ENTRY`), and prevent
insertion into the General Ledger.

------------------------------------------------------------------------

### 4.2 Sales Invoicing & Accounts Receivable Mathematics

For an `Invoice` with $k$ item lines:

$$\text{Line Gross}_{j} = \text{quantity}_{j} \times \text{unit\_price}_{j}$$

$$\text{Line Discount}_{j} = \text{Line Gross}_{j} \times \left( \frac{\text{discount\_percentage}_{j}}{100} \right)$$

$$\text{Line Net}_{j} = \text{Line Gross}_{j} - \text{Line Discount}_{j}$$

$$\text{Line Tax}_{j} = \text{Line Net}_{j} \times \left( \frac{\text{tax\_rate}_{j}}{100} \right)$$

$$\text{Line Total}_{j} = \text{Line Net}_{j} + \text{Line Tax}_{j}$$

$$\text{Invoice.subtotal\_amount} = \sum_{j = 1}^{k}\text{Line Net}_{j}$$

$$\text{Invoice.tax\_amount} = \sum_{j = 1}^{k}\text{Line Tax}_{j}$$

$$\text{Invoice.total\_amount} = \text{Invoice.subtotal\_amount} - \text{Invoice.discount\_amount} + \text{Invoice.tax\_amount}$$

$$\text{Invoice.balance\_due} = \text{Invoice.total\_amount} - \sum\text{PaymentAllocation.allocated\_amount}$$

------------------------------------------------------------------------

### 4.3 Gross-to-Net Payroll Formulation

For each employee `Payslip` in a monthly `PayrollRun`:

$$\text{Gross Salary} = \text{basic\_salary} + \sum\text{allowances} + \text{overtime} + \text{bonuses}$$

$$\text{Total Deductions} = \text{social\_security\_employee} + \text{income\_tax\_withheld} + \text{other\_deductions}$$

$$\text{Net Salary} = \text{Gross Salary} - \text{Total Deductions}$$

$$\text{Total Employer Cost} = \text{Gross Salary} + \text{social\_security\_employer} + \text{end\_of\_service\_accrual}$$

------------------------------------------------------------------------

### 4.4 VAT Settlement & Tax Liability Formulation

For each statutory `TaxPeriod`:

$$\text{Total Output VAT} = \sum(\text{Taxable Standard Sales} \times \text{VAT Rate})$$

$$\text{Total Input VAT} = \sum(\text{Eligible Taxable Purchases} \times \text{VAT Rate})$$

$$\text{Net VAT Payable} = \text{Total Output VAT} - \text{Total Input VAT}$$

------------------------------------------------------------------------

### 4.5 Fixed Asset Depreciation Algorithms

#### 1. Straight-Line Method (Default):

$$\text{Annual Depreciation} = \frac{\text{acquisition\_cost} - \text{salvage\_value}}{\left( \frac{\text{useful\_life\_months}}{12} \right)}$$

$$\text{Monthly Depreciation} = \frac{\text{Annual Depreciation}}{12} = \frac{\text{acquisition\_cost} - \text{salvage\_value}}{\text{useful\_life\_months}}$$

#### 2. Double Declining Balance (DDB) Method:

$$\text{Depreciation Rate} = \left( \frac{1}{\frac{\text{useful\_life\_months}}{12}} \right) \times 2$$

$$\text{Annual Depreciation}_{t} = \min\left( \text{Net Book Value}_{t - 1} \times \text{Depreciation Rate},\mspace{6mu}\text{Net Book Value}_{t - 1} - \text{salvage\_value} \right)$$

------------------------------------------------------------------------

### 4.6 Bank Reconciliation Mathematical Identity

A bank reconciliation session is validated if and only if:

$$\text{Adjusted Bank Balance} \equiv \text{Adjusted Book Balance}$$

Where:

$$\text{Adjusted Bank} = \text{Statement Ending Balance} + \text{Deposits in Transit} - \text{Outstanding Payments} \pm \text{Bank Errors}$$

$$\text{Adjusted Book} = \text{GL Cash Ending Balance} + \text{Direct Bank Collections} - \text{Bank Service Fees} \pm \text{Book Errors}$$

$$\text{unreconciled\_difference} = |\text{Adjusted Bank} - \text{Adjusted Book}| = 0.0000$$

------------------------------------------------------------------------

## 5. Relational Integrity, Security & Audit Governance

### 5.1 Foreign Key Cascade Rules

1.  **Header-to-Line Item Cascades (**`ON DELETE CASCADE`**)**:
    - `JournalEntry` $\rightarrow$ `JournalLine`
    - `Invoice` $\rightarrow$ `InvoiceLine`
    - `Bill` $\rightarrow$ `BillLine`
    - `PayrollRun` $\rightarrow$ `Payslip` $\rightarrow$ `PayslipLine`
    - `FixedAsset` $\rightarrow$ `DepreciationSchedule`
    - `Budget` $\rightarrow$ `BudgetItem`
2.  **Restricted Master References (**`ON DELETE RESTRICT`**)**:
    - `Account` cannot be deleted if referenced in `JournalLine`,
      `InvoiceLine`, `BillLine`, `FixedAsset`, or `BankAccount`.
    - `Customer` cannot be deleted if referenced in `Invoice` or
      `Payment`.
    - `Vendor` cannot be deleted if referenced in `Bill` or `Payment`.
    - `FiscalPeriod` cannot be deleted if referenced in `JournalEntry`.

### 5.2 Concurrency & Optimistic Locking

All core entities maintain a `version integer NOT NULL DEFAULT 1` or an
`updated_at timestamp` column to support optimistic locking. When
concurrent updates are attempted on the same invoice, journal voucher,
or bank reconciliation session, the database validates that
`current_version = expected_version` before executing mutations.

------------------------------------------------------------------------

*QuickBox Financial Management System --- Database Architecture & ERD
Specification v1.0.0*
