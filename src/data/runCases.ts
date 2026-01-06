import {RunCase} from '../types';

export const SAMPLE_RUN_CASES: RunCase[] = [
  {
    id: 'run-1',
    expansionPlanId: '',
    expansionPlanName: 'Base_Case_2035_v1',
    study: 'Grid_Expansion_A',
    region: 'SPP',
    status: 'Running',
    cycle: 27,
    caseRunning: 1,
    totalCapacityBuilt: '1250 MW',
    totalCapacityRetired: '500 MW',
    horizon: '2025-2035',
  },
  {
    id: 'run-2',
    expansionPlanId: '',
    expansionPlanName: 'High_Load_2035_v1',
    study: 'Grid_Expansion_B',
    region: 'ERCOT',
    status: 'Paused',
    cycle: 11,
    caseRunning: 0,
    totalCapacityBuilt: '800 MW',
    totalCapacityRetired: '0 MW',
    horizon: '2025-2035',
  },
  {
    id: 'run-3',
    expansionPlanId: '',
    expansionPlanName: 'High_Load_2035_v2',
    study: 'Grid_Expansion_B',
    region: 'ERCOT',
    status: 'Inactive',
    cycle: 0,
    caseRunning: 0,
    totalCapacityBuilt: '0 MW',
    totalCapacityRetired: '0 MW',
    horizon: '2025-2035',
  },
  {
    id: 'run-4',
    expansionPlanId: '',
    expansionPlanName: 'Low_Load_2035_v1',
    study: 'Grid_Expansion_C',
    region: 'MISO',
    status: 'Error',
    cycle: 5,
    caseRunning: 0,
    totalCapacityBuilt: '450 MW',
    totalCapacityRetired: '0 MW',
    horizon: '2025-2035',
  },
];

// Empty array for initial state
export const RUN_CASES_DATA: RunCase[] = SAMPLE_RUN_CASES;
