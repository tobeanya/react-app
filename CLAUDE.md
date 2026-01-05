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
- Uses custom tab navigator (NOT material-top-tabs due to Windows bug - see Known Issues)
- Three main tabs: Home | Settings | Candidates
- Tab navigation is disabled when modals are open (controlled via `isModalOpen` state in App.tsx)

### State Management
- All state is managed in `App.tsx` and passed down via props
- Key state: `expansionPlans`, `candidates`, `selectedPlanId`, `isModalOpen`
- Pages communicate modal visibility changes via `onModalVisibleChange` callback

### Data Types (src/types/index.ts)

**ExpansionPlan** (full structure):
- id, name, dateCreated, isActive
- region (ERCOT, SPP, MISO, PJM)
- suffix, sourceStudy
- planningHorizonStart, planningHorizonEnd
- settings: ExpansionPlanSettings

**ExpansionPlanSettings**:
- General: unitNameAccountCenter, simulationYearStepSize, baseYear, automatedDecommissioningYearDelay, economicDiscountRate, reliabilityDiscountRate
- Solver: solverType, solutionCriterion, operationsMinDays, operationsMaxDays, weatherYearSelection, loadUncertainty, includeOutages, autoExportResults
- Data: constraints[], escalationInputs[]

**Candidate**: id, expansionPlanId, name, maxCapacity, unitType, startYear, endYear, maxAdditionsPerYear, maxAdditionsOverall, isRetirement

**Enums/Types**:
- Region: ERCOT, SPP, MISO, PJM
- SolverType: Xpress-CP-Fast, Xpress-CP-Standard, Normal, Simple
- SolutionCriterion: Total System Cost Savings, Minimum Cost, Maximum Reliability
- WeatherYearSelection: All, 2020-2024
- LoadUncertainty: All, Low, Medium, High
- UnitType: Solar, Wind, Gas, Nuclear

### File Structure
```
src/
├── types/index.ts           # TypeScript types, constants, DEFAULT_SETTINGS
├── components/
│   └── CollapsibleSection.tsx  # Reusable collapsible UI section
├── navigation/
│   └── TopTabNavigator.tsx  # Tab navigation setup
└── pages/
    ├── HomePage.tsx         # Expansion plan list with CRUD
    ├── SettingsPage.tsx     # Simulation setup (see below)
    └── CandidatesPage.tsx   # Candidate units management
```

### Settings Page Design
The Settings page is designed to match a simulation setup interface with:
1. **Study Configuration**: Source study, planning horizon (year range), expansion plan name, region
2. **Settings**: Two-column layout
   - General: Unit name, simulation year step size, base year, decommissioning delay, discount rates
   - Solver Configuration: Solver type, solution criterion, operations min/max days, weather year, load uncertainty, toggles
3. **Constraints and Escalation Inputs**: Tabbed table interface
4. **Footer**: Cancel, Save Changes, Run Simulation buttons

### Modal Pattern
- Modals are implemented as absolute-positioned overlays (not React Native Modal component) for Windows compatibility
- Each page manages its own modal state but notifies parent via `onModalVisibleChange`

## Platform Notes

- Primary target is Windows (`react-native-windows` v0.81)
- Uses C++ template for Windows native code
- Uses **New Architecture (Fabric)** - `RnwNewArch=true` in `windows/ExperimentalFeatures.props`
- Metro bundler runs on port 8081

## Known Issues (Resolved)

### react-native-pager-view Touch Events Bug on Windows
**Status**: RESOLVED

**Symptom**: TouchableOpacity and TextInput components did not respond to touch/keyboard input on non-initial tabs when using `@react-navigation/material-top-tabs`.

**Root Cause**: `react-native-pager-view` (used internally by material-top-tabs) on Windows only allows touch events on the initial/first tab. All subsequent tabs do not receive touch events properly. This is NOT related to New Architecture - it's a pager-view specific issue.

**Solution**: Replaced `@react-navigation/material-top-tabs` with a custom tab implementation using:
- Simple View + TouchableOpacity for tab bar
- Conditional rendering (`{activeTab === 'TabName' && <Component />}`) for tab content
- No dependency on react-native-pager-view

See `src/navigation/TopTabNavigator.tsx` for implementation.

**Key Learning**: On React Native Windows, avoid `react-native-pager-view` and libraries that depend on it (material-top-tabs, bottom-tabs with lazy loading). Use simple conditional rendering instead.

## Development History (Summary)

1. **Initial Setup**: Created React Native Windows app with three pages (Home, Settings, Candidates)
2. **Navigation**: Implemented material top tabs with tab locking during modal display
3. **Home Page**: Expansion plan list with create, copy, delete functionality; overlay modals for forms
4. **Candidates Page**: Candidate unit management per expansion plan
5. **Settings Page Redesign**: Comprehensive simulation setup form matching provided design mockup
6. **Type System**: Expanded to include full ExpansionPlanSettings with constraints and escalation inputs
7. **Bug Discovery & Resolution**: Found that react-native-pager-view blocks touch events on non-initial tabs on Windows. Replaced material-top-tabs with custom tab navigator using conditional rendering.

## GitHub

Repository: https://github.com/tobetoby/react-app (created via `gh repo create`)
