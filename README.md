# MoneyFlow

MoneyFlow is a personal finance tracking application built with React
Native, Expo, Expo Router, TypeScript, Zustand, React Native Paper,
React Hook Form, Zod, and local persistence.

The goal of MoneyFlow is to provide a simple way to manage multiple
accounts, record income and expenses, automatically maintain account
balances, and review transaction history.

------------------------------------------------------------------------

## Table of Contents

-   [Overview](#overview)
-   [Features](#features)
-   [Technology Stack](#technology-stack)
-   [Requirements](#requirements)
-   [Project Structure](#project-structure)
-   [Architecture](#architecture)
-   [Data Flow](#data-flow)
-   [Accounts](#accounts)
-   [Transactions](#transactions)
-   [Expense Flow](#expense-flow)
-   [Income Flow](#income-flow)
-   [Balance Calculation](#balance-calculation)
-   [Transaction Edit](#transaction-edit)
-   [Transaction Delete](#transaction-delete)
-   [Validation](#validation)
-   [Navigation](#navigation)
-   [Shared Components](#shared-components)
-   [Local Persistence](#local-persistence)
-   [Installation](#installation)
-   [Run the Project](#run-the-project)
-   [Android Development](#android-development)
-   [Web Development](#web-development)
-   [TypeScript Checks](#typescript-checks)
-   [Expo Doctor](#expo-doctor)
-   [Cache and Clean Commands](#cache-and-clean-commands)
-   [Troubleshooting](#troubleshooting)
-   [Development Workflow](#development-workflow)
-   [Current Status](#current-status)
-   [Roadmap](#roadmap)

------------------------------------------------------------------------

# Overview

MoneyFlow is designed for manual personal-finance tracking.

Example:

``` text
Starting balance
HDFC Savings       ₹10,000
SBI Savings         ₹5,000
IDFC Account        ₹8,000

Expense
Breakfast             ₹100
HDFC Savings        -₹100

New HDFC balance     ₹9,900
```

The application keeps transactions and account balances synchronized.

------------------------------------------------------------------------

# Features

## Account Management

-   Add account
-   Edit account
-   Delete account
-   View account balance
-   Multiple accounts
-   Account type
-   Account color
-   Opening balance
-   Created and updated timestamps

Example:

``` text
HDFC Savings     ₹10,000
SBI Savings       ₹5,000
IDFC Savings      ₹8,000
```

## Income

-   Add income
-   Select account
-   Payment type
-   Category
-   Notes
-   Automatic balance increase
-   Transaction history

Example:

``` text
Salary
₹50,000
HDFC Savings
Bank Transfer
Salary
```

## Expense

-   Add expense
-   Select account
-   Payment type
-   Category
-   Notes
-   Automatic balance decrease
-   Prevent spending more than the available account balance
-   Transaction history

Example:

``` text
Breakfast
₹100
HDFC Savings
UPI
Food
```

## Transactions

-   View transaction history
-   Income and expense display
-   Account name
-   Category
-   Payment type
-   Date
-   Amount
-   Edit transaction
-   Delete transaction
-   Delete confirmation
-   Balance recalculation

------------------------------------------------------------------------

# Technology Stack

  Technology                Purpose
  ------------------------- -----------------------------------
  React Native              Mobile UI
  Expo                      React Native development platform
  Expo Router               File-based navigation
  TypeScript                Type safety
  Zustand                   Application state management
  React Native Paper        UI components
  React Hook Form           Form state
  Zod                       Form validation
  AsyncStorage              Local persistence
  React Native Reanimated   Animations
  Expo Vector Icons         Icons

Current project versions are managed through `package.json` and should
be installed using Expo-compatible commands.

------------------------------------------------------------------------

# Requirements

Recommended environment:

-   Windows
-   Node.js 22 LTS
-   npm
-   Android device or Android emulator
-   Android Studio for native Android builds
-   USB debugging enabled for a physical Android device
-   Expo CLI through the local project

Check Node:

``` powershell
node -v
```

Check npm:

``` powershell
npm -v
```

------------------------------------------------------------------------

# Project Structure

The project follows a feature-oriented structure.

``` text
MoneyFlow/
│
├── app/
│   ├── _layout.tsx
│   │
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx
│       ├── transactions.tsx
│       ├── accounts.tsx
│       ├── reports.tsx
│       └── settings.tsx
│
├── src/
│   │
│   ├── core/
│   │   └── database/
│   │       ├── database.ts
│   │       └── index.ts
│   │
│   ├── features/
│   │   │
│   │   ├── accounts/
│   │   │   ├── components/
│   │   │   ├── screens/
│   │   │   ├── types/
│   │   │   └── validation/
│   │   │
│   │   └── transactions/
│   │       ├── components/
│   │       │   ├── ExpenseModal.tsx
│   │       │   └── IncomeModal.tsx
│   │       ├── screens/
│   │       ├── types/
│   │       └── validation/
│   │
│   ├── repositories/
│   │   ├── account.ts
│   │   └── transaction.ts
│   │
│   ├── shared/
│   │   └── components/
│   │       └── inputs/
│   │           └── AppSelect.tsx
│   │
│   └── store/
│       ├── accountStore.ts
│       └── transactionStore.ts
│
├── assets/
│
├── android/
│
├── app.json
├── package.json
├── tsconfig.json
├── babel.config.js (if present)
└── README.md
```

> The exact contents of folders can grow as new features are added.

------------------------------------------------------------------------

# Architecture

MoneyFlow uses four main layers.

``` text
UI / Screens
     ↓
Zustand Stores
     ↓
Repositories
     ↓
Local Persistence
```

## UI Layer

Examples:

``` text
app/(tabs)/index.tsx
app/(tabs)/transactions.tsx
src/features/transactions/components/ExpenseModal.tsx
src/features/transactions/components/IncomeModal.tsx
```

The UI collects user input and displays application state.

## Store Layer

``` text
src/store/accountStore.ts
src/store/transactionStore.ts
```

Zustand stores handle application state and business operations.

## Repository Layer

``` text
src/repositories/account.ts
src/repositories/transaction.ts
```

Repositories provide the persistence interface used by the stores.

## Core Layer

``` text
src/core/database/
```

Contains database-related infrastructure used by the application.

------------------------------------------------------------------------

# Data Flow

## Add Expense

``` text
User
 ↓
ExpenseModal
 ↓
React Hook Form
 ↓
Zod validation
 ↓
transactionStore.addTransaction()
 ↓
Find account
 ↓
Check balance
 ↓
Reduce account balance
 ↓
Save transaction
 ↓
Refresh transaction state
 ↓
Close modal
```

## Add Income

``` text
User
 ↓
IncomeModal
 ↓
React Hook Form
 ↓
Zod validation
 ↓
transactionStore.addTransaction()
 ↓
Find account
 ↓
Increase account balance
 ↓
Save transaction
 ↓
Refresh transaction state
 ↓
Close modal
```

------------------------------------------------------------------------

# Accounts

An account represents a source of money.

Example:

``` text
{
  id: "1",
  name: "HDFC Savings",
  balance: 10000,
  color: "#2563EB",
  type: "Savings",
  createdAt: "...",
  updatedAt: "..."
}
```

Account operations:

``` text
addAccount()
updateAccount()
deleteAccount()
loadAccounts()
```

The account store is located at:

``` text
src/store/accountStore.ts
```

------------------------------------------------------------------------

# Transactions

A transaction represents either:

``` text
income
```

or:

``` text
expense
```

Typical transaction data:

``` text
id
type
amount
details
accountId
paymentType
category
notes
date
createdAt
updatedAt
```

Transaction operations:

``` text
addTransaction()
updateTransaction()
deleteTransaction()
loadTransactions()
```

The transaction store is located at:

``` text
src/store/transactionStore.ts
```

------------------------------------------------------------------------

# Expense Flow

Example:

``` text
Account balance
₹10,000
```

User creates:

``` text
Type: Expense
Amount: ₹100
Details: Breakfast
Account: HDFC Savings
Payment Type: UPI
Category: Breakfast
```

Result:

``` text
₹10,000 - ₹100 = ₹9,900
```

The transaction is saved as:

``` text
Breakfast
-₹100
```

------------------------------------------------------------------------

# Income Flow

Example:

``` text
Account balance
₹10,000
```

User creates:

``` text
Type: Income
Amount: ₹5,000
Details: Salary
Account: HDFC Savings
Payment Type: Bank Transfer
Category: Salary
```

Result:

``` text
₹10,000 + ₹5,000 = ₹15,000
```

The transaction is saved as:

``` text
Salary
+₹5,000
```

------------------------------------------------------------------------

# Balance Calculation

The transaction store is responsible for updating balances.

## Expense

``` text
newBalance =
  account.balance - transaction.amount
```

## Income

``` text
newBalance =
  account.balance + transaction.amount
```

------------------------------------------------------------------------

# Insufficient Balance

Expenses cannot reduce an account below zero.

Example:

``` text
Account balance: ₹500
Expense: ₹700
```

The transaction is rejected.

Expected error:

``` text
Insufficient balance in HDFC Savings
```

No transaction should be saved.

------------------------------------------------------------------------

# Transaction Edit

Editing a transaction must not create a duplicate.

The existing transaction is updated.

## Same Account

Example:

``` text
Old expense: ₹100
New expense: ₹250
```

Starting balance:

``` text
₹9,900
```

First reverse the old transaction:

``` text
₹9,900 + ₹100
= ₹10,000
```

Then apply the new transaction:

``` text
₹10,000 - ₹250
= ₹9,750
```

Final:

``` text
Account balance: ₹9,750
Transaction: ₹250
```

------------------------------------------------------------------------

# Changing Account During Edit

Example:

``` text
Old account:
HDFC ₹9,000

New account:
SBI ₹5,000

Expense:
₹1,000
```

If the transaction is moved from HDFC to SBI:

``` text
HDFC
₹9,000 + ₹1,000
= ₹10,000

SBI
₹5,000 - ₹1,000
= ₹4,000
```

This prevents the old account from keeping an incorrect balance.

------------------------------------------------------------------------

# Transaction Delete

Deleting a transaction must also update the account balance.

## Delete Expense

``` text
Account:
₹9,900

Expense:
₹100
```

Delete:

``` text
₹9,900 + ₹100
= ₹10,000
```

## Delete Income

``` text
Account:
₹15,000

Income:
₹5,000
```

Delete:

``` text
₹15,000 - ₹5,000
= ₹10,000
```

A delete confirmation is shown before deletion.

------------------------------------------------------------------------

# Validation

Forms use:

``` text
React Hook Form
+
Zod
```

Expense validation includes:

-   Amount must be greater than zero
-   Details required
-   Account required
-   Payment type required
-   Date required

Example:

``` text
Amount
₹100

Details
Breakfast

Account
HDFC Savings

Payment Type
UPI

Category
Breakfast

Notes
Optional
```

------------------------------------------------------------------------

# ExpenseModal

Location:

``` text
src/features/transactions/components/ExpenseModal.tsx
```

The same modal supports:

``` text
Add Expense
```

and:

``` text
Edit Expense
```

Mode is determined by the presence of:

``` text
transaction
```

Add mode:

``` text
transaction = null
```

Edit mode:

``` text
transaction = existing transaction
```

------------------------------------------------------------------------

# IncomeModal

Location:

``` text
src/features/transactions/components/IncomeModal.tsx
```

Used for creating income transactions.

Flow:

``` text
FAB
 ↓
Income
 ↓
IncomeModal
 ↓
Validate
 ↓
addTransaction()
 ↓
Account balance increases
```

------------------------------------------------------------------------

# Navigation

Expo Router is used for navigation.

Main tab routes:

``` text
Dashboard
Transactions
Accounts
Reports
Settings
```

Route files:

``` text
app/(tabs)/index.tsx
app/(tabs)/transactions.tsx
app/(tabs)/accounts.tsx
app/(tabs)/reports.tsx
app/(tabs)/settings.tsx
```

Tab configuration:

``` text
app/(tabs)/_layout.tsx
```

Root layout:

``` text
app/_layout.tsx
```

------------------------------------------------------------------------

# Dashboard

The dashboard contains the main financial overview.

The Floating Action Button provides:

``` text
+
├── Expense
└── Income
```

Expense opens:

``` text
ExpenseModal
```

Income opens:

``` text
IncomeModal
```

------------------------------------------------------------------------

# Transactions Screen

Location:

``` text
app/(tabs)/transactions.tsx
```

Displays:

``` text
Transaction details
Category
Account
Payment type
Date
Amount
```

Transaction menu:

``` text
⋮
├── Edit
└── Delete
```

Delete displays a confirmation dialog.

------------------------------------------------------------------------

# Shared Components

Reusable UI components should be kept under:

``` text
src/shared/components/
```

Example:

``` text
AppSelect
```

The select component provides consistent account/payment/category
selection across Web and Android.

------------------------------------------------------------------------

# Local Persistence

MoneyFlow is designed around local data persistence.

Repositories abstract storage operations:

``` text
src/repositories/account.ts
src/repositories/transaction.ts
```

This keeps persistence logic separate from UI components.

The application should not directly manipulate storage from screens.

Preferred flow:

``` text
Screen
 ↓
Store
 ↓
Repository
 ↓
Storage
```

------------------------------------------------------------------------

# Installation

Open PowerShell:

``` powershell
cd D:\projects\MoneyFlow
```

Install dependencies:

``` powershell
npm install
```

Synchronize Expo dependencies:

``` powershell
npx expo install --fix
```

Run health check:

``` powershell
npx expo-doctor
```

Run TypeScript:

``` powershell
npx tsc --noEmit
```

------------------------------------------------------------------------

# Run the Project

## Start Expo

``` powershell
npx expo start
```

Useful Expo shortcuts:

``` text
w = Web
a = Android
```

For normal JavaScript/TypeScript development, start the appropriate
target from the Expo development server.

------------------------------------------------------------------------

# Web Development

Run:

``` powershell
npx expo start --web
```

Or:

``` powershell
npx expo start
```

then press:

``` text
w
```

Web is useful for:

-   UI development
-   Form testing
-   Navigation testing
-   State testing
-   Quick debugging

Some native modules behave differently on Web than Android.

------------------------------------------------------------------------

# Android Development

MoneyFlow uses native React Native/Expo modules, so Android should be
tested separately from Web.

For an Android development build:

``` powershell
npx expo install expo-dev-client
```

Generate native Android files:

``` powershell
npx expo prebuild
```

Connect an Android device with USB debugging enabled.

Check:

``` powershell
adb devices
```

Expected:

``` text
XXXXXXXX    device
```

Build and install:

``` powershell
npx expo run:android --device
```

Then start Metro:

``` powershell
npx expo start --dev-client
```

------------------------------------------------------------------------

# Android Device Checklist

Before running on a physical Android phone:

-   USB debugging enabled
-   USB cable connected
-   Android debugging permission accepted
-   `adb devices` shows the phone
-   Development build installed
-   Metro server running

Check device:

``` powershell
adb devices
```

If the device is:

``` text
unauthorized
```

accept the debugging permission on the phone.

------------------------------------------------------------------------

# Expo Go

Expo Go availability depends on the Expo SDK supported by the installed
Expo Go application.

For this project, when using native functionality that requires a
development build, prefer:

``` powershell
npx expo install expo-dev-client
npx expo prebuild
npx expo run:android --device
```

Do not change the project architecture just to work around Expo Go
limitations.

------------------------------------------------------------------------

# TypeScript Checks

Run:

``` powershell
npx tsc --noEmit
```

No output generally means TypeScript passed.

Do not use:

``` tsx
// @ts-nocheck
```

to hide errors.

For JSX files, use:

``` text
.tsx
```

not:

``` text
.ts
```

Example:

``` text
ExpenseModal.tsx
IncomeModal.tsx
```

------------------------------------------------------------------------

# TSConfig

The project should use an Expo-compatible TypeScript configuration.

Example:

``` json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "jsx": "react-native",
    "noEmit": true
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

If VS Code incorrectly reports:

``` text
Cannot use JSX unless the '--jsx' flag is provided
```

check:

1.  File extension is `.tsx`
2.  `tsconfig.json`
3.  TypeScript server
4.  `npx tsc --noEmit`

In VS Code:

``` text
Ctrl + Shift + P
```

then:

``` text
TypeScript: Restart TS Server
```

------------------------------------------------------------------------

# Expo Doctor

Run:

``` powershell
npx expo-doctor
```

This checks common dependency and configuration issues.

If Expo reports missing peer dependencies, use:

``` powershell
npx expo install <package-name>
```

rather than manually selecting incompatible versions.

------------------------------------------------------------------------

# Cache and Clean Commands

## Clear Metro/Expo cache

``` powershell
npx expo start -c
```

## Reinstall node_modules

PowerShell:

``` powershell
Remove-Item -Recurse -Force node_modules
```

Remove lock file only when a clean dependency installation is
intentionally required:

``` powershell
Remove-Item -Force package-lock.json
```

Then:

``` powershell
npm install
```

Synchronize Expo dependencies:

``` powershell
npx expo install --fix
```

Check:

``` powershell
npx expo-doctor
```

------------------------------------------------------------------------

# Common Troubleshooting

## JSX flag error

Error:

``` text
Cannot use JSX unless the '--jsx' flag is provided
```

Check:

``` text
ExpenseModal.tsx
```

not:

``` text
ExpenseModal.ts
```

Then check:

``` text
tsconfig.json
```

and run:

``` powershell
npx tsc --noEmit
```

------------------------------------------------------------------------

## Expo Metro ENOENT Watch Error

If Metro reports an error similar to:

``` text
ENOENT: no such file or directory, watch ...
node_modules\.expo-...
```

Stop Expo:

``` text
Ctrl + C
```

Clear the cache:

``` powershell
npx expo start -c
```

If the issue persists, reinstall dependencies:

``` powershell
Remove-Item -Recurse -Force node_modules
npm install
```

Then:

``` powershell
npx expo install --fix
```

------------------------------------------------------------------------

## `accounts.map is not a function`

Expected account state:

``` text
accounts = []
```

The state must always be an array.

Check:

``` tsx
console.log(accounts);
console.log(Array.isArray(accounts));
```

The repository should return an array from `getAll()`.

------------------------------------------------------------------------

## MMKV Type Error

If using:

``` text
react-native-mmkv
```

make sure the installed version and API match the code being used.

Do not assume an API from an older MMKV version.

Check:

``` powershell
npm list react-native-mmkv
```

------------------------------------------------------------------------

## Expo SQLite Web WASM Error

If Web reports a missing file similar to:

``` text
wa-sqlite.wasm
```

this indicates a Web-specific Expo SQLite bundling issue.

Do not modify the Android architecture to fix a Web-only SQLite issue.

First check:

``` powershell
npx expo install --fix
npx expo-doctor
```

Then test Android separately.

------------------------------------------------------------------------

# Development Workflow

Recommended daily workflow:

``` text
Open project
    ↓
npm install (only when dependencies changed)
    ↓
npx tsc --noEmit
    ↓
npx expo-doctor
    ↓
Start Web / Android
    ↓
Develop feature
    ↓
Test feature
    ↓
npx tsc --noEmit
```

For Android native dependency changes:

``` text
Change dependency
      ↓
npx expo install <package>
      ↓
npx expo prebuild
      ↓
npx expo run:android --device
```

------------------------------------------------------------------------

# Code Guidelines

## Keep business logic in stores

Prefer:

``` text
Component
 ↓
Store
 ↓
Repository
```

Avoid putting balance calculations directly inside UI components.

## Keep persistence in repositories

Do not directly manipulate local storage from screens.

## Reuse components

For example:

``` text
AppSelect
```

should be reused for:

-   Account
-   Payment type
-   Category

## Avoid duplicate transaction logic

Balance calculations belong in:

``` text
src/store/transactionStore.ts
```

not in:

``` text
ExpenseModal.tsx
IncomeModal.tsx
```

------------------------------------------------------------------------

# Current Status

## Completed

-   [x] Expo project
-   [x] TypeScript
-   [x] Expo Router
-   [x] Tab navigation
-   [x] Dashboard
-   [x] Accounts screen
-   [x] Add account
-   [x] Edit account
-   [x] Delete account
-   [x] Account balance
-   [x] Expense modal
-   [x] Income modal
-   [x] Expense creation
-   [x] Income creation
-   [x] Transaction history
-   [x] Transaction edit
-   [x] Transaction delete
-   [x] Delete confirmation
-   [x] Expense balance update
-   [x] Income balance update
-   [x] Expense balance restore on delete
-   [x] Income balance restore on delete
-   [x] Balance recalculation during edit
-   [x] Account change during transaction edit
-   [x] Form validation
-   [x] Android/Web compatible selection component
-   [x] README documentation

------------------------------------------------------------------------

# Roadmap

## Transactions

-   [ ] Income edit UI
-   [ ] Transaction search
-   [ ] Transaction filters
-   [ ] Income/expense filter
-   [ ] Account filter
-   [ ] Category filter
-   [ ] Payment type filter
-   [ ] Date range filter
-   [ ] Transaction sorting

## Accounts

-   [ ] Account details screen
-   [ ] Account transaction history
-   [ ] Account transfer
-   [ ] Opening balance adjustment
-   [ ] Account archive

## Categories

-   [ ] Custom categories
-   [ ] Category icons
-   [ ] Category colors
-   [ ] Category management

## Dashboard

-   [ ] Total balance
-   [ ] Total income
-   [ ] Total expenses
-   [ ] Monthly summary
-   [ ] Recent transactions
-   [ ] Category summary
-   [ ] Spending chart

## Reports

-   [ ] Monthly report
-   [ ] Income report
-   [ ] Expense report
-   [ ] Category report
-   [ ] Account report
-   [ ] Charts
-   [ ] Date range reports

## Data

-   [ ] Backup
-   [ ] Restore
-   [ ] JSON export
-   [ ] CSV export
-   [ ] PDF export
-   [ ] Import data

## Advanced Features

-   [ ] Recurring transactions
-   [ ] Scheduled expenses
-   [ ] Budget management
-   [ ] Spending limits
-   [ ] Notifications
-   [ ] Dark mode
-   [ ] App settings
-   [ ] Security / app lock

------------------------------------------------------------------------

# Project Philosophy

MoneyFlow should remain:

-   Simple
-   Fast
-   Local-first
-   Easy to maintain
-   Type-safe
-   Reusable
-   Android-friendly
-   Web-friendly

Business logic should remain separated from presentation, and existing
architecture should be extended rather than unnecessarily replaced.

------------------------------------------------------------------------

# Quick Start

For an already-configured project:

``` powershell
cd D:\projects\MoneyFlow

npx tsc --noEmit

npx expo-doctor

npx expo start
```

For Web:

``` powershell
npx expo start --web
```

For Android development build:

``` powershell
npx expo start --dev-client
```

For a native Android rebuild:

``` powershell
npx expo run:android --device
```

------------------------------------------------------------------------

# License

This project is currently a personal/private project.

Add a license here if the project is later made public.
