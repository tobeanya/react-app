export type Region = 'ERCOT' | 'SPP' | 'MISO' | 'PJM';
export type SolverType = 'Normal' | 'Simple';
export type UnitType = 'Solar' | 'Wind' | 'Gas' | 'Nuclear';

export interface ExpansionPlan {
  id: string;
  name: string;
  dateCreated: string;
  isActive: boolean;
  region: Region;
  suffix: string;
  solverType: SolverType;
}

export interface Candidate {
  id: string;
  expansionPlanId: string;
  name: string;
  maxCapacity: number;
  unitType: UnitType;
  startYear: number;
  endYear: number;
  maxAdditionsPerYear: number;
  maxAdditionsOverall: number;
  isRetirement: boolean;
}

export const REGIONS: Region[] = ['ERCOT', 'SPP', 'MISO', 'PJM'];
export const SOLVER_TYPES: SolverType[] = ['Normal', 'Simple'];
export const UNIT_TYPES: UnitType[] = ['Solar', 'Wind', 'Gas', 'Nuclear'];
