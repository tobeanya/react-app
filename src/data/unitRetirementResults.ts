import {UnitRetirementResult} from '../types';

// Empty array to show the "No Retirements Scheduled" state
// Uncomment the data below to test with retirement data
export const UNIT_RETIREMENT_RESULTS_DATA: UnitRetirementResult[] = [];

// Sample retirement data (for testing with data)
export const SAMPLE_RETIREMENT_DATA: UnitRetirementResult[] = [
  {
    id: 'ret-1',
    expansionPlanId: '',
    candidate: 'North Omaha Coal Plant Unit 1',
    technology: 'Coal',
    totalCapacity: 125000,
    yearlyCapacity: {2026: 125000, 2027: 0, 2028: 0, 2029: 0, 2030: 0},
    omCost: 8500000,
    region: 'SPP',
  },
  {
    id: 'ret-2',
    expansionPlanId: '',
    candidate: 'North Omaha Coal Plant Unit 2',
    technology: 'Coal',
    totalCapacity: 125000,
    yearlyCapacity: {2026: 0, 2027: 125000, 2028: 0, 2029: 0, 2030: 0},
    omCost: 8750000,
    region: 'SPP',
  },
  {
    id: 'ret-3',
    expansionPlanId: '',
    candidate: 'Legacy Gas Unit A',
    technology: 'Gas',
    totalCapacity: 75000,
    yearlyCapacity: {2026: 0, 2027: 0, 2028: 75000, 2029: 0, 2030: 0},
    omCost: 4200000,
    region: 'ERCOT',
  },
];
