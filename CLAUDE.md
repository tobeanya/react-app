# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Energy System Expansion Plan Manager - A React Native Windows application for managing expansion plans/scenarios for energy systems. Supports data from Excel files and databases (MySQL, PostgreSQL, SQL Server).

## Commands

```bash
# Run Windows app (starts Metro bundler and launches app)
npm run windows

# Start Metro bundler only
npm start

# Run tests
npm test

# Run Windows-specific tests
npm run test:windows

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

## Architecture

### Navigation
- Uses `@react-navigation/material-top-tabs` for top tab navigation
- Three main tabs: Home | Settings | Candidates
- Tab navigation is disabled when modals are open (controlled via `isModalOpen` state in App.tsx)

### State Management
- All state is managed in `App.tsx` and passed down via props
- Key state: `expansionPlans`, `candidates`, `selectedPlanId`, `isModalOpen`
- Pages communicate modal visibility changes via `onModalVisibleChange` callback

### Data Types (src/types/index.ts)
- **ExpansionPlan**: id, name, dateCreated, isActive, region, suffix, solverType
- **Candidate**: id, expansionPlanId, name, maxCapacity, unitType, startYear, endYear, maxAdditionsPerYear, maxAdditionsOverall, isRetirement
- Enums: Region (ERCOT, SPP, MISO, PJM), SolverType (Normal, Simple), UnitType (Solar, Wind, Gas, Nuclear)

### File Structure
```
src/
├── types/index.ts           # TypeScript types and constants
├── navigation/
│   └── TopTabNavigator.tsx  # Tab navigation setup
└── pages/
    ├── HomePage.tsx         # Expansion plan list with CRUD
    ├── SettingsPage.tsx     # Plan settings (region, solver, suffix)
    └── CandidatesPage.tsx   # Candidate units management
```

### Modal Pattern
- Modals are implemented as absolute-positioned overlays (not React Native Modal component) for Windows compatibility
- Each page manages its own modal state but notifies parent via `onModalVisibleChange`

## Platform Notes

- Primary target is Windows (`react-native-windows`)
- Uses C++ template for Windows native code
- Metro bundler runs on port 8081
