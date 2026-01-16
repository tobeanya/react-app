// Mock database scenarios for development/demo mode
// These simulate what would come from the ep_scenario_master table

export interface DatabaseScenario {
  epScenarioId: number;
  epScenarioDescription: string;
  // Additional display info (would come from related tables in real DB)
  region?: string;
  planningHorizonStart?: number;
  planningHorizonEnd?: number;
  createdDate?: string;
  status?: 'completed' | 'running' | 'pending';
}

export const MOCK_DATABASE_SCENARIOS: DatabaseScenario[] = [
  {
    epScenarioId: 1,
    epScenarioDescription: 'ERCOT Base Case 2030-2040',
    region: 'ERCOT',
    planningHorizonStart: 2030,
    planningHorizonEnd: 2040,
    createdDate: '2024-01-15',
    status: 'completed',
  },
  {
    epScenarioId: 2,
    epScenarioDescription: 'ERCOT High Renewables Scenario',
    region: 'ERCOT',
    planningHorizonStart: 2030,
    planningHorizonEnd: 2040,
    createdDate: '2024-02-20',
    status: 'completed',
  },
  {
    epScenarioId: 3,
    epScenarioDescription: 'SPP Mexico Integration Study',
    region: 'SPP',
    planningHorizonStart: 2028,
    planningHorizonEnd: 2038,
    createdDate: '2024-03-10',
    status: 'completed',
  },
  {
    epScenarioId: 4,
    epScenarioDescription: 'MISO Decarbonization Path',
    region: 'MISO',
    planningHorizonStart: 2025,
    planningHorizonEnd: 2045,
    createdDate: '2024-04-05',
    status: 'completed',
  },
  {
    epScenarioId: 5,
    epScenarioDescription: 'PJM Capacity Expansion 2035',
    region: 'PJM',
    planningHorizonStart: 2030,
    planningHorizonEnd: 2035,
    createdDate: '2024-05-12',
    status: 'completed',
  },
  {
    epScenarioId: 6,
    epScenarioDescription: 'ERCOT Battery Storage Analysis',
    region: 'ERCOT',
    planningHorizonStart: 2030,
    planningHorizonEnd: 2040,
    createdDate: '2024-06-01',
    status: 'running',
  },
  {
    epScenarioId: 7,
    epScenarioDescription: 'SPP Wind Integration 2030',
    region: 'SPP',
    planningHorizonStart: 2025,
    planningHorizonEnd: 2030,
    createdDate: '2024-06-15',
    status: 'pending',
  },
];

// Helper to get status color
export const getScenarioStatusColor = (status?: string) => {
  switch (status) {
    case 'completed':
      return {bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399', border: 'rgba(52, 211, 153, 0.3)'};
    case 'running':
      return {bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)'};
    case 'pending':
      return {bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)'};
    default:
      return {bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)'};
  }
};

// Helper to get region color
export const getRegionColor = (region?: string) => {
  switch (region) {
    case 'ERCOT':
      return {bg: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.4)'};
    case 'SPP':
      return {bg: 'rgba(168, 85, 247, 0.2)', text: '#a78bfa', border: 'rgba(168, 85, 247, 0.4)'};
    case 'MISO':
      return {bg: 'rgba(52, 211, 153, 0.2)', text: '#34d399', border: 'rgba(52, 211, 153, 0.4)'};
    case 'PJM':
      return {bg: 'rgba(251, 146, 60, 0.2)', text: '#fb923c', border: 'rgba(251, 146, 60, 0.4)'};
    default:
      return {bg: 'rgba(148, 163, 184, 0.2)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.4)'};
  }
};
