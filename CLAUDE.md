# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Energy System Expansion Plan Manager - A React Native Windows application for managing expansion plans/scenarios for energy systems. Supports data from Excel files and databases (MySQL, PostgreSQL, SQL Server).

## First-Time Setup

### Frontend (React Native Windows)
```bash
# Install dependencies
npm install

# Run Windows app (starts Metro bundler and launches app)
npm run windows
```

### Backend (ASP.NET Core)
```bash
# Navigate to backend folder
cd backend/ExpansionPlanApi

# Restore NuGet packages
dotnet restore

# Run the API (builds automatically)
dotnet run
```

The backend API will be available at `https://localhost:7087` with Swagger UI at `https://localhost:7087/swagger`.

## Commands

### Frontend
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

### Backend
```bash
# Run backend API (from backend/ExpansionPlanApi folder)
dotnet run

# Build only (without running)
dotnet build

# Run with hot reload
dotnet watch run
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
├── api/
│   ├── client.ts            # Axios instance configuration
│   ├── databaseConfig.api.ts # Database connection API
│   ├── scenarios.api.ts     # Scenarios CRUD API
│   └── index.ts             # API exports
├── hooks/
│   ├── useDatabaseConnection.ts  # Database connection state management
│   ├── useDatabaseScenarios.ts   # Scenarios query/mutation hooks
│   └── index.ts             # Hook exports
├── components/
│   ├── CollapsibleSection.tsx    # Reusable collapsible UI section
│   ├── ScenarioSelector.tsx      # Scenario dropdown selector
│   └── DatabaseConnectionSection.tsx  # SQL Server connection form
├── data/
│   └── mockScenarios.ts     # Mock scenario data for demo mode
├── navigation/
│   └── TopTabNavigator.tsx  # Tab navigation setup
└── pages/
    ├── HomePage.tsx         # Expansion plan list with CRUD + DB connection modal
    ├── SettingsPage.tsx     # Simulation setup (see below)
    ├── CandidatesPage.tsx   # Candidate units management
    ├── RunPage.tsx          # Run simulation page
    ├── ExpansionPlanResultsPage.tsx  # EP results summary
    ├── NPVResultsPage.tsx   # NPV calculation results
    ├── SolverResultsPage.tsx # Solver iteration results
    ├── UnitAdditionResultsPage.tsx   # Unit additions by year
    └── UnitRetirementResultsPage.tsx # Unit retirements by year
```

### Backend Structure (ASP.NET Core)
```
backend/ExpansionPlanApi/
├── Controllers/
│   ├── DatabaseConfigController.cs  # DB connection endpoints
│   ├── ScenariosController.cs       # Scenarios CRUD
│   ├── ResultsController.cs         # Results endpoints
│   └── UnitsController.cs           # Units lookup
├── Models/
│   ├── DatabaseConnectionConfig.cs  # Connection DTOs
│   └── ... (other DTOs)
├── Services/
│   └── ConnectionStringService.cs   # Build/test SQL connections
├── Data/
│   ├── ExpansionPlanDbContext.cs    # EF Core context
│   └── DynamicDbContextFactory.cs   # Runtime connection switching
└── Program.cs
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

### Storage Modes
The app supports two storage modes, toggled on the Home page:

1. **Local Mode**: Data stored in AsyncStorage, works offline
2. **Database Mode**: Data fetched from SQL Server via backend API

When in Database Mode:
- "Configure Database" button appears in header to open connection modal
- Connection modal allows configuring SQL Server connection (Windows or SQL Server auth)
- Scenarios are loaded from the database instead of local storage
- Green/red indicator shows connection status

### Database Connection Flow
1. User switches to "Database" mode on Home page
2. Clicks "Configure Database" button (shows red indicator when disconnected)
3. Modal opens with connection form (server, database, auth type, credentials)
4. User clicks "Test Connection" to verify
5. User clicks "Save & Connect" to persist and connect
6. Button updates to show "Connected" with green indicator
7. Scenarios load from the connected database

## Development History (Summary)

1. **Initial Setup**: Created React Native Windows app with three pages (Home, Settings, Candidates)
2. **Navigation**: Implemented material top tabs with tab locking during modal display
3. **Home Page**: Expansion plan list with create, copy, delete functionality; overlay modals for forms
4. **Candidates Page**: Candidate unit management per expansion plan
5. **Settings Page Redesign**: Comprehensive simulation setup form matching provided design mockup
6. **Type System**: Expanded to include full ExpansionPlanSettings with constraints and escalation inputs
7. **Bug Discovery & Resolution**: Found that react-native-pager-view blocks touch events on non-initial tabs on Windows. Replaced material-top-tabs with custom tab navigator using conditional rendering.
8. **Results Pages**: Added EP Results, NPV Results, Solver Results, Unit Addition/Retirement Results pages with tabbed navigation
9. **Backend API**: Created ASP.NET Core 8 Web API with Entity Framework Core for SQL Server
10. **Database Connection**: Implemented dynamic SQL Server connection configuration from the UI (supports Windows and SQL Server authentication)

## GitHub

Repository: https://github.com/tobetoby/react-app (created via `gh repo create`)
