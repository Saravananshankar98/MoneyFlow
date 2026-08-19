# MoneyFlow

MoneyFlow is a local-first personal finance tracker for React Native and Expo. It helps users manage accounts, record income and spending, transfer money between accounts, review monthly activity, and back up their data without requiring an online account.

The application is private and currently stores its financial data on the device with AsyncStorage. It runs through Expo on Android, iOS, and the web.

## What Works Today

### Dashboard

- Shows total balance, current-month income, expenses, savings, recent transactions, and account summaries.
- Provides quick actions for income, expenses, and transfers.
- Displays credit-card statement and payment reminders when applicable.

### Accounts

- Create, edit, and delete accounts.
- Supported account types are Savings, Current, Cash, Credit Card, Wallet, Investment, Loan, UPI, and Other.
- Store an account name, type, color, balance, and timestamps.
- Credit-card accounts also store a credit limit, billing-cycle dates, due day, and outstanding amount.

### Transactions

- Record income, expenses, and transfers.
- Edit and delete existing transactions.
- Capture amount, details, account, destination account for transfers, category, payment type, notes, date, and optional attachment metadata.
- Search transactions and filter by transaction type.
- Sort the transaction list by date.

Payment types include Cash, UPI, Debit Card, Credit Card, Net Banking, Cheque, and Wallet.

### Categories

- Create, edit, and delete custom income and expense categories.
- Set a category name, icon, color, and type (`expense`, `income`, or `both`).
- Reject duplicate category names.

### Reports

- Browse transactions by month.
- View monthly income, expenses, savings/net activity, transaction counts, expense-by-category breakdowns, account activity, and credit-card information.
- CSV and PDF export helpers exist in `src/services/reportExportService.ts`, but they are not currently wired to visible Reports screen actions.

### Backup And Restore

- Export accounts, transactions, and categories as a versioned MoneyFlow JSON backup.
- Import a validated MoneyFlow JSON backup.
- Download files in the browser or share them through the native platform share sheet.

### Settings

- Choose system, light, or dark theme mode.
- The settings store defines INR, USD, EUR, and GBP currency options, although the current Settings screen does not expose a currency selector and several screens still format values as INR.
- Refresh locally stored data.
- Export/import a backup and delete all account, category, and transaction data.

The settings store also contains state for PIN, biometrics, notifications, and offline sync. These are persistence settings and are not yet a complete authentication, notification, or cloud-sync implementation.

## Balance Rules

Transaction balance updates are centralized in `src/store/transactionStore.ts`:

```text
Income:   account balance + amount
Expense:  account balance - amount
Transfer: source account balance - amount
          destination account balance + amount
```

When a transaction is edited, the previous effect is reversed before the new effect is applied. Deleting a transaction reverses its effect. The store validates all affected accounts before applying changes, preventing regular accounts from becoming negative.

Credit cards use different accounting: spending increases outstanding debt, while a positive cash-flow delta reduces outstanding debt. Credit-card transactions are also checked against the available limit.

## Technology

| Technology | Role |
| --- | --- |
| React Native 0.81 | Cross-platform UI |
| Expo 54 | Runtime and development tooling |
| Expo Router | File-based navigation |
| TypeScript 5.9 | Static typing with strict mode enabled |
| Zustand | Application state and business operations |
| React Native Paper | Components, themes, dialogs, and feedback |
| React Hook Form + Zod | Form state and validation |
| AsyncStorage | Local persistence |
| NativeWind | Tailwind-compatible styling configuration |
| Expo FileSystem, Document Picker, Sharing | Backup and report file workflows |
| React Native Paper Dates | Date and time selection |

`firebase` is present in the dependency list, but the current financial-data path is local and does not provide cloud synchronization.

## Application Structure

```text
MoneyFlow/
|-- app/                         Expo Router routes
|   |-- _layout.tsx              Root providers and navigation
|   |-- index.tsx                Entry route
|   |-- categories.tsx           Category management
|   `-- (tabs)/                  Dashboard, transactions, accounts,
|       |                        reports, and settings
|
|-- src/
|   |-- core/                    Providers, storage, theme
|   |-- features/                Feature components, screens, types,
|   |                            validation, and account utilities
|   |-- repositories/            AsyncStorage persistence adapters
|   |-- services/                Backup, report export, and reset flows
|   |-- shared/                  Reusable UI components and shared types
|   `-- store/                   Zustand stores
|
|-- assets/                      Static application assets
|-- app.json                     Expo configuration
|-- package.json                 Dependencies and scripts
|-- tsconfig.json                Strict TypeScript configuration
`-- tailwind.config.js           NativeWind content configuration
```

The main data path is:

```text
Expo Router screens/components
          -> Zustand stores
          -> repositories and services
          -> AsyncStorage or platform file APIs
```

Important modules include:

- `src/store/accountStore.ts`: account CRUD through the local account repository.
- `src/store/transactionStore.ts`: transaction CRUD and balance calculations.
- `src/store/categoryStore.ts`: category CRUD and duplicate-name validation.
- `src/store/settingsStore.ts`: theme, currency, and persisted preference state.
- `src/repositories/`: storage adapters that keep persistence out of screens.
- `src/services/backupService.ts`: JSON backup creation, validation, import, and export.
- `src/services/reportExportService.ts`: CSV and simple one-page PDF export helpers; currently not connected to visible report actions.

## Getting Started

### Prerequisites

- Node.js and npm.
- An Expo-compatible environment for the target platform.
- For Android native development: Android Studio, an emulator or USB-debuggable device, and an authorized `adb` connection.

### Install

```powershell
npm install
```

The project is private and does not currently define a test script. Check the TypeScript project after installation:

```powershell
npx tsc --noEmit
```

### Start Development

```powershell
npm start
```

Useful commands:

```powershell
npm run start:go             # Expo Go
npm run web                  # Web browser
npm run android              # Android through Expo
npm run ios                  # iOS through Expo Go
npm run start:tunnel         # Tunnel connection
npm run start:dev-client     # Development client
npm run android:dev-client   # Android development client
```

For a native Android development build:

```powershell
npx expo prebuild
npx expo run:android --device
npm run start:dev-client
```

## Persistence And Backup Format

The local repositories use these AsyncStorage keys:

```text
moneyflow_accounts
moneyflow_transactions
moneyflow_categories
```

Backups contain the following shape and are versioned for future compatibility:

```json
{
  "app": "MoneyFlow",
  "version": 1,
  "createdAt": "ISO-8601 timestamp",
  "data": {
    "accounts": [],
    "transactions": [],
    "categories": []
  }
}
```

Import accepts only backups identified as MoneyFlow with a numeric version and array data for all three collections. Import/export does not include settings or other preference state.

## Current Limitations And Next Steps

- No automated test suite or test command is configured yet.
- `npx tsc --noEmit` currently reports missing style definitions used by the credit-card section of `app/(tabs)/reports.tsx`; this is an existing application issue, not a README issue.
- The app has no implemented cloud sync or backend account system.
- PIN and biometric fields are persisted state, not an enforced lock screen.
- Notification and offline-sync fields do not currently provide a full device notification or synchronization workflow.
- Attachment fields store URI/name metadata; there is no attachment preview workflow.
- Reports are monthly summaries rather than charts or configurable date-range analytics.
- The CSV/PDF export helpers are not yet exposed from the Reports screen; the PDF generator is intentionally simple and limited to one page of report lines.
- Currency preference state is only partially integrated; visible dashboard and transaction formatting currently uses INR.
- Account detail/history, archiving, opening-balance adjustments, and CSV/PDF polish remain natural follow-up areas.

## Development Guidelines

- Keep transaction accounting in `transactionStore`.
- Keep AsyncStorage access inside repositories or services.
- Reuse components from `src/shared/components`.
- Use the existing Zod schemas for new forms.
- Keep route files focused on screen composition and navigation.
- Validate changes with `npx tsc --noEmit`; test native file and sharing flows on the target device.

## License

MoneyFlow is currently a private/personal project and does not yet declare an open-source license.
