# Changelog

All notable changes to the Expansion Planning application are documented in this file.

## [Unreleased] - 2026-01-12

### Added
- **EP Results Page - New Dropdowns**
  - "Calculation Basis" dropdown with options: Yearly, NPV
  - "Year" dropdown with options dynamically generated from planning horizon (start to end year, plus "All")
  - When "All" is selected in Year dropdown, a "Year" column appears in the table
  - When Calculation Basis is "NPV", an "Evaluating Year" column appears in the table
  - Report Metric options change based on Calculation Basis:
    - Yearly: Original metrics from EP_DATA
    - NPV: LOLE, Energy Margin, Total Cost, Production Cost, Fuel Cost, Startup Cost, Variable OM Cost, Emission Cost, EUE Cost, Net Purchase Cost, System Fixed Cost, System Fixed Carrying Cost, System Fixed OM Cost
- **Sample NPV Data (expansionPlanNpvData.ts)**
  - Added EP_DATA_NPV with sample data for all 13 NPV metrics
  - Data includes 6 technologies across multiple years and 24 build cycles per year
  - NPV data structure includes year and evaluating year fields
- **Chart Multi-Year Support**
  - When "All" years is selected, charts display separate series for each year
  - Each year's data shows build cycles 0-23 on the x-axis
  - Line chart connects points within each year-technology series
  - Legend shows technology with year suffix in "All" mode (e.g., "Adv CC (2035)")
- Escape key handler to close all dropdowns on EP Results page
- "Show Other Results Table" toggle on EP Results page to show/hide Results Table and NPV Results Table tabs
- CHANGELOG.md to track project changes

### Changed
- **EP Results Page**
  - Moved EP Results tab to appear after Execution Log in navigation
  - Changed header icon from chart emoji to grid icon (⊞) with white color
  - Centered table column headers and values for better alignment
  - Toggle moved to bottom right of the page

- **Navigation Tabs**
  - Renamed "Results" tab to "Results Table"
  - Renamed "NPV Results" tab to "NPV Results Table"
  - Results Table and NPV Results Table tabs are now hidden by default (controlled via toggle)

- **Settings Page - Study Configuration**
  - Removed Expansion Plan dropdown (users now switch plans via header summary only)
  - Added 16px vertical spacing between Expansion Plan row and Source Study row
  - Increased gap between Source Study and Assessment Region dropdowns to 32px (matching Settings section)

- **Settings Page - Constraints**
  - Renamed "LIMIT" column to "VALUE" in table and modal
  - Exceedance Threshold field is now hidden (not just disabled) for constraint variables other than "EUE Depth" and "Max EUE Duration"
  - Exceedance Threshold displays "N/A" in table when value is "0"

- **Charts (EP Results Page)**
  - Bar chart axis area now matches line chart layout with proper grid lines, axis lines, and spacing

### Removed
- Pivot Report page and associated data files (PivotReportPage.tsx, pivotReportData.json, pivotReportData.ts)
- Pivot Report tab from navigation
