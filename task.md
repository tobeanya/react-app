# Energy System Expansion Plan Manager

## Overview
App to manage expansion plans/scenarios for energy systems. Data sourced from Excel files or databases (MySQL, PostgreSQL, SQL Server).

## Data Sources
- Excel files
- MySQL
- PostgreSQL
- SQL Server

## Navigation
- **Top Tabs** (Home | Settings | Candidates)

## Pages

### 1. Home
- Display all expansion plans in the system
- Actions per plan:
  - Create new expansion plan
  - Copy existing expansion plan
  - Edit expansion plan
  - Delete expansion plan
- Support multiple expansion plans

**Expansion Plan Properties:**
- Name (study name)
- Region
- Suffix
- Solver Type

### 2. Settings
- Configure settings for each expansion plan
- Settings TBD:
  - ?

### 3. Candidates
- Define/manage candidate units for each expansion plan
- Candidates = potential energy units that can be added to a study

**Candidate Properties:**
- Name
- Max Capacity
- Unit Type (dropdown: Solar, Wind, Gas, Nuclear)
- Start Year
- End Year
- Max Additions Per Year
- Max Additions Overall
- Is Retirement (boolean)

## Dropdown Options

**Solver Types:**
- Normal
- Simple

**Unit Types:**
- Solar
- Wind
- Gas
- Nuclear

**Regions:**
- ERCOT
- SPP
- MISO
- PJM

## Settings Page
- All settings configurable per expansion plan
- Specific settings TBD (needs more work)

## Status

Ready to build:
- [x] Expansion plan properties defined
- [x] Candidate properties defined
- [x] Dropdown options defined
- [ ] Settings page details (TBD - will build placeholder)
