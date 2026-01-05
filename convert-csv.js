const fs = require('fs');
const path = require('path');

const csvPath = 'C:\\Users\\tobet\\OneDrive\\Documents\\ScreenConnect\\Files\\solver_results.csv';
const outputPath = path.join(__dirname, 'src', 'data', 'solverResults.ts');

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Parse header
const header = lines[0];
const headerFields = [];
let inQuote = false;
let currentField = '';
for (let i = 0; i < header.length; i++) {
  const char = header[i];
  if (char === '"') {
    inQuote = !inQuote;
  } else if (char === ',' && !inQuote) {
    headerFields.push(currentField.trim());
    currentField = '';
  } else {
    currentField += char;
  }
}
headerFields.push(currentField.trim());

console.log('Header fields:', headerFields.length);

// Map CSV columns to our SolverResult type
const columnMapping = {
  'Study': 'study',
  '1 MW Candidate': 'candidate',
  'Iteration': 'iteration',
  'Year': 'year',
  'Status': 'status',
  'Name Plate (MW)': 'namePlate',
  'Energy Margin ($/MW)': 'energyMargin',
  'NPV Energy Margin ($/MW)': 'npvEnergyMargin',
  'Available MW in EUE Hours (MW)': 'availableMwInEueHours',
  'NPV Average Available MW in EUE Hours (MW)': 'npvAvgAvailableMwInEueHours',
  'Fixed Cost ($/MW)': 'fixedCost',
  'Fixed Carrying Cost ($/MW)': 'fixedCarryingCost',
  'Fixed OM Cost ($/MW)': 'fixedOmCost',
  'Total NPV Fixed Cost ($/MW)': 'totalNpvFixedCost',
  'Total NPV Fixed Cost - NPV Energy Margin ($)': 'totalNpvFixedCostMinusNpvEnergyMargin',
  '(Total NPV Fixed Cost - NPV Energy Margin)/NPV Available MW in EUE Hours (MW)': 'totalNpvFixedCostMinusNpvEnergyMarginPerNpvAvailableMw',
  'Total Fixed Cost - Energy Margin ($)': 'totalFixedCostMinusEnergyMargin',
  '(Total Fixed Cost - Energy Margin)/Available MW in EUE Hours (MW)': 'totalFixedCostMinusEnergyMarginPerAvailableMw',
  'LOLE_Capacity': 'loleCapacity',
  'EUE Cap (MW)': 'eueCap',
  'LOLH Cap (Hours)': 'lolhCap',
  'NPV LOLE_Capacity': 'npvLoleCapacity',
  'NPV Total Cost ($)': 'npvTotalCost',
  'Total Annual System Cost ($)': 'totalAnnualSystemCost',
  'Unit Production Cost ($)': 'unitProductionCost',
  'Unit Fuel Cost ($)': 'unitFuelCost',
  'Unit Startup Cost ($)': 'unitStartupCost',
  'Unit Variable OM Cost ($)': 'unitVariableOmCost',
  'Unit Emissions Cost ($)': 'unitEmissionsCost',
  'System Curtailment': 'systemCurtailment',
  'Selection Criteria': 'selectionCriteria',
  'EUE Depth (MW)': 'eueDepth',
  'RPS Generation (MWh)': 'rpsGeneration',
  'Generation (MWh)': 'generation',
  'EUE Benefit (MWh)': 'eueBenefit',
  'Start Attempts': 'startAttempts',
  'Capacity Factor': 'capacityFactor',
  'Hours Online': 'hoursOnline'
};

// Parse a CSV line
function parseCSVLine(line) {
  const fields = [];
  let inQuote = false;
  let currentField = '';
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuote = !inQuote;
    } else if (char === ',' && !inQuote) {
      fields.push(currentField.trim());
      currentField = '';
    } else {
      currentField += char;
    }
  }
  fields.push(currentField.trim());
  return fields;
}

// Parse all data rows
const results = [];
for (let i = 1; i < lines.length; i++) {
  const fields = parseCSVLine(lines[i]);
  if (fields.length < headerFields.length) continue;

  const row = {
    id: `result-${i}`,
    expansionPlanId: 'plan-1'
  };

  for (let j = 0; j < headerFields.length; j++) {
    const csvHeader = headerFields[j];
    const tsField = columnMapping[csvHeader];
    if (tsField) {
      let value = fields[j];
      // Convert numeric fields
      if (['iteration', 'year', 'namePlate', 'energyMargin', 'npvEnergyMargin', 'availableMwInEueHours',
           'npvAvgAvailableMwInEueHours', 'fixedCost', 'fixedCarryingCost', 'fixedOmCost', 'totalNpvFixedCost',
           'totalNpvFixedCostMinusNpvEnergyMargin', 'totalNpvFixedCostMinusNpvEnergyMarginPerNpvAvailableMw',
           'totalFixedCostMinusEnergyMargin', 'totalFixedCostMinusEnergyMarginPerAvailableMw',
           'loleCapacity', 'eueCap', 'lolhCap', 'npvLoleCapacity', 'npvTotalCost', 'totalAnnualSystemCost',
           'unitProductionCost', 'unitFuelCost', 'unitStartupCost', 'unitVariableOmCost', 'unitEmissionsCost',
           'systemCurtailment', 'eueDepth', 'rpsGeneration', 'generation', 'eueBenefit', 'startAttempts',
           'capacityFactor', 'hoursOnline'].includes(tsField)) {
        row[tsField] = parseFloat(value) || 0;
      } else {
        row[tsField] = value;
      }
    }
  }

  results.push(row);
}

console.log(`Parsed ${results.length} rows`);

// Generate TypeScript output
let output = `// Auto-generated from solver_results.csv - ${results.length} entries
import {SolverResult} from '../types';

export const SOLVER_RESULTS_DATA: SolverResult[] = [\n`;

for (const row of results) {
  output += `  ${JSON.stringify(row)},\n`;
}

output += `];\n`;

// Ensure directory exists
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(outputPath, output);
console.log(`Written to ${outputPath}`);
