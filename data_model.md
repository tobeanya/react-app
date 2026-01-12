# Data Access Layer & Data Models Architecture

This document outlines the recommended architecture for implementing a proper data access layer (DAL) and data models while adhering to software standards and separation of concerns.

## Recommended Architecture

```
src/
├── models/              # Domain entities (pure data structures)
│   ├── Unit.ts
│   ├── Study.ts
│   ├── Candidate.ts
│   └── index.ts
│
├── data/
│   ├── repositories/    # Data access abstraction (Repository Pattern)
│   │   ├── interfaces/
│   │   │   ├── IUnitRepository.ts
│   │   │   ├── IStudyRepository.ts
│   │   │   └── ICandidateRepository.ts
│   │   ├── UnitRepository.ts
│   │   ├── StudyRepository.ts
│   │   └── CandidateRepository.ts
│   │
│   ├── sources/         # Concrete data sources
│   │   ├── local/       # Local/mock data
│   │   ├── api/         # REST API clients
│   │   └── db/          # Database adapters (SQLite, etc.)
│   │
│   └── mappers/         # DTO <-> Domain model transformation
│       ├── UnitMapper.ts
│       └── StudyMapper.ts
│
├── services/            # Business logic layer
│   ├── UnitService.ts
│   ├── StudyService.ts
│   └── CandidateService.ts
│
├── hooks/               # React state management
│   ├── useUnits.ts
│   ├── useStudies.ts
│   └── useCandidates.ts
│
├── types/               # Shared types, enums, constants
│   └── index.ts
│
└── pages/               # UI components (existing)
```

## Layer Descriptions

### Layer 1: Models (Domain/Entity Layer)
- Pure data structures/interfaces
- No business logic, no data access
- Location: `src/models/`

### Layer 2: Data Access Layer (Repository Pattern)
- Abstracts data source (API, local storage, database)
- Interface-based for easy mocking/testing
- Location: `src/data/repositories/`

### Layer 3: Services (Business Logic Layer)
- Orchestrates data operations
- Contains business rules
- Location: `src/services/`

### Layer 4: Hooks/State Management
- React-specific state management
- Connects UI to services
- Location: `src/hooks/`

---

## Implementation Examples

### 1. Models (Domain Layer)

Pure data structures - no logic, no dependencies:

```typescript
// src/models/Unit.ts
export interface Unit {
  unitId: number;
  unitName: string;
  unitDescription: string;
  originalCapMax: number;
  guiCapMax: number;
  guiCapMin: number;
  startDate: number;
  endDate: number;
  guiEfor: number;
  unitType: string;
  year: number;
  regionId: number;
  regionDescription: string;
  unitActive: boolean;
  debugSelected: boolean;
  unitCategoryDescription: string;
  unitCategoryId: number;
  startMonth: number;
  endMonth: number;
  insvdt: string;
  retirementDate: string;
  handlingCost: number;
  fixedCarryingCost: number;
  fixedCost: number;
  fixedOm: number;
  startupCost: number;
  hotStartupCost: number;
  coldStartupCost: number;
  warmStartupCost: number;
  vomPerMwh: number;
  vomPerHour: number;
  fuel: number;
}

// Factory for defaults
export const createUnit = (partial: Partial<Unit>): Unit => ({
  unitId: 0,
  unitName: '',
  unitDescription: '',
  originalCapMax: 0,
  guiCapMax: 0,
  guiCapMin: 0,
  startDate: 0,
  endDate: 0,
  guiEfor: 0,
  unitType: '',
  year: 0,
  regionId: 0,
  regionDescription: '',
  unitActive: false,
  debugSelected: false,
  unitCategoryDescription: '',
  unitCategoryId: 0,
  startMonth: 0,
  endMonth: 11,
  insvdt: '',
  retirementDate: '',
  handlingCost: 0,
  fixedCarryingCost: 0,
  fixedCost: 0,
  fixedOm: 0,
  startupCost: 0,
  hotStartupCost: 0,
  coldStartupCost: 0,
  warmStartupCost: 0,
  vomPerMwh: 0,
  vomPerHour: 0,
  fuel: 0,
  ...partial,
});
```

```typescript
// src/models/Study.ts
export interface Study {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  dateCreated: string;
  dateModified: string;
  regions: Region[];
}

export const createStudy = (partial: Partial<Study>): Study => ({
  id: '',
  name: '',
  startYear: new Date().getFullYear(),
  endYear: new Date().getFullYear() + 10,
  dateCreated: new Date().toISOString(),
  dateModified: new Date().toISOString(),
  regions: [],
  ...partial,
});
```

```typescript
// src/models/index.ts
export * from './Unit';
export * from './Study';
export * from './Candidate';
```

---

### 2. Repository Interface (Contract)

Defines what operations are available - not how:

```typescript
// src/data/repositories/interfaces/IUnitRepository.ts
import { Unit } from '../../../models/Unit';

export interface IUnitRepository {
  getAll(): Promise<Unit[]>;
  getById(id: number): Promise<Unit | null>;
  getByRegion(regionId: number): Promise<Unit[]>;
  getByCategory(categoryId: number): Promise<Unit[]>;
  getActive(): Promise<Unit[]>;
  create(unit: Omit<Unit, 'unitId'>): Promise<Unit>;
  update(unit: Unit): Promise<Unit>;
  delete(id: number): Promise<void>;
}
```

```typescript
// src/data/repositories/interfaces/IStudyRepository.ts
import { Study } from '../../../models/Study';

export interface IStudyRepository {
  getAll(): Promise<Study[]>;
  getById(id: string): Promise<Study | null>;
  getByRegion(region: string): Promise<Study[]>;
  create(study: Omit<Study, 'id'>): Promise<Study>;
  update(study: Study): Promise<Study>;
  delete(id: string): Promise<void>;
}
```

```typescript
// src/data/repositories/interfaces/ICandidateRepository.ts
import { GenerationCandidate, TransmissionCandidate } from '../../../models/Candidate';

export interface IGenerationCandidateRepository {
  getAll(): Promise<GenerationCandidate[]>;
  getByExpansionPlan(planId: string): Promise<GenerationCandidate[]>;
  getById(id: string): Promise<GenerationCandidate | null>;
  create(candidate: Omit<GenerationCandidate, 'id'>): Promise<GenerationCandidate>;
  update(candidate: GenerationCandidate): Promise<GenerationCandidate>;
  delete(id: string): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
}

export interface ITransmissionCandidateRepository {
  getAll(): Promise<TransmissionCandidate[]>;
  getByExpansionPlan(planId: string): Promise<TransmissionCandidate[]>;
  getById(id: string): Promise<TransmissionCandidate | null>;
  create(candidate: Omit<TransmissionCandidate, 'id'>): Promise<TransmissionCandidate>;
  update(candidate: TransmissionCandidate): Promise<TransmissionCandidate>;
  delete(id: string): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
}
```

---

### 3. Repository Implementation

Concrete implementation - swappable:

```typescript
// src/data/repositories/UnitRepository.ts
import { IUnitRepository } from './interfaces/IUnitRepository';
import { Unit } from '../../models/Unit';
import { LocalUnitDataSource } from '../sources/local/LocalUnitDataSource';
// import { ApiUnitDataSource } from '../sources/api/ApiUnitDataSource';

export class UnitRepository implements IUnitRepository {
  private dataSource: LocalUnitDataSource;

  constructor(dataSource?: LocalUnitDataSource) {
    this.dataSource = dataSource ?? new LocalUnitDataSource();
  }

  async getAll(): Promise<Unit[]> {
    return this.dataSource.fetchAll();
  }

  async getById(id: number): Promise<Unit | null> {
    return this.dataSource.fetchById(id);
  }

  async getByRegion(regionId: number): Promise<Unit[]> {
    const units = await this.dataSource.fetchAll();
    return units.filter(u => u.regionId === regionId);
  }

  async getByCategory(categoryId: number): Promise<Unit[]> {
    const units = await this.dataSource.fetchAll();
    return units.filter(u => u.unitCategoryId === categoryId);
  }

  async getActive(): Promise<Unit[]> {
    const units = await this.dataSource.fetchAll();
    return units.filter(u => u.unitActive);
  }

  async create(unit: Omit<Unit, 'unitId'>): Promise<Unit> {
    return this.dataSource.create(unit);
  }

  async update(unit: Unit): Promise<Unit> {
    return this.dataSource.update(unit);
  }

  async delete(id: number): Promise<void> {
    return this.dataSource.delete(id);
  }
}
```

```typescript
// src/data/repositories/StudyRepository.ts
import { IStudyRepository } from './interfaces/IStudyRepository';
import { Study } from '../../models/Study';
import { LocalStudyDataSource } from '../sources/local/LocalStudyDataSource';

export class StudyRepository implements IStudyRepository {
  private dataSource: LocalStudyDataSource;

  constructor(dataSource?: LocalStudyDataSource) {
    this.dataSource = dataSource ?? new LocalStudyDataSource();
  }

  async getAll(): Promise<Study[]> {
    return this.dataSource.fetchAll();
  }

  async getById(id: string): Promise<Study | null> {
    return this.dataSource.fetchById(id);
  }

  async getByRegion(region: string): Promise<Study[]> {
    const studies = await this.dataSource.fetchAll();
    return studies.filter(s => s.regions.includes(region as any));
  }

  async create(study: Omit<Study, 'id'>): Promise<Study> {
    return this.dataSource.create(study);
  }

  async update(study: Study): Promise<Study> {
    return this.dataSource.update(study);
  }

  async delete(id: string): Promise<void> {
    return this.dataSource.delete(id);
  }
}
```

---

### 4. Data Source (Swappable Backend)

```typescript
// src/data/sources/local/LocalUnitDataSource.ts
import { Unit } from '../../../models/Unit';
import { SEED_UNITS } from './seedData';

export class LocalUnitDataSource {
  private units: Unit[] = [...SEED_UNITS];
  private nextId: number = Math.max(...SEED_UNITS.map(u => u.unitId)) + 1;

  async fetchAll(): Promise<Unit[]> {
    // Simulate async operation
    return Promise.resolve([...this.units]);
  }

  async fetchById(id: number): Promise<Unit | null> {
    const unit = this.units.find(u => u.unitId === id);
    return Promise.resolve(unit ?? null);
  }

  async create(unit: Omit<Unit, 'unitId'>): Promise<Unit> {
    const newUnit: Unit = {
      ...unit,
      unitId: this.nextId++,
    };
    this.units.push(newUnit);
    return Promise.resolve(newUnit);
  }

  async update(unit: Unit): Promise<Unit> {
    const index = this.units.findIndex(u => u.unitId === unit.unitId);
    if (index === -1) {
      throw new Error(`Unit with id ${unit.unitId} not found`);
    }
    this.units[index] = unit;
    return Promise.resolve(unit);
  }

  async delete(id: number): Promise<void> {
    const index = this.units.findIndex(u => u.unitId === id);
    if (index !== -1) {
      this.units.splice(index, 1);
    }
    return Promise.resolve();
  }
}
```

```typescript
// src/data/sources/local/seedData.ts
import { Unit } from '../../../models/Unit';
import { Study } from '../../../models/Study';

export const SEED_UNITS: Unit[] = [
  {
    unitId: 1,
    unitName: 'Adv CC',
    unitDescription: 'Advanced Combined Cycle Gas Turbine',
    originalCapMax: 1083,
    guiCapMax: 1083,
    guiCapMin: 325,
    // ... rest of unit data
  },
  // ... more units
];

export const SEED_STUDIES: Study[] = [
  {
    id: 'study-1',
    name: 'InterregionalLoad_BaseEmissionLimit_2025',
    startYear: 2025,
    endYear: 2045,
    dateCreated: '2024-06-15T10:30:00Z',
    dateModified: '2024-12-20T14:45:00Z',
    regions: ['ERCOT', 'SPP'],
  },
  // ... more studies
];
```

```typescript
// src/data/sources/api/ApiUnitDataSource.ts (future implementation)
import { Unit } from '../../../models/Unit';

interface UnitDTO {
  unit_id: number;
  unit_name: string;
  unit_description: string;
  gui_capmax: number;
  // ... API response format
}

export class ApiUnitDataSource {
  constructor(private baseUrl: string, private apiKey?: string) {}

  private get headers(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  async fetchAll(): Promise<UnitDTO[]> {
    const response = await fetch(`${this.baseUrl}/units`, {
      headers: this.headers,
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  }

  async fetchById(id: number): Promise<UnitDTO | null> {
    const response = await fetch(`${this.baseUrl}/units/${id}`, {
      headers: this.headers,
    });
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  }

  async create(unit: Omit<UnitDTO, 'unit_id'>): Promise<UnitDTO> {
    const response = await fetch(`${this.baseUrl}/units`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(unit),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  }

  async update(unit: UnitDTO): Promise<UnitDTO> {
    const response = await fetch(`${this.baseUrl}/units/${unit.unit_id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(unit),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/units/${id}`, {
      method: 'DELETE',
      headers: this.headers,
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
  }
}
```

---

### 5. Data Mappers (DTO <-> Domain)

```typescript
// src/data/mappers/UnitMapper.ts
import { Unit } from '../../models/Unit';

// API DTO format (snake_case from backend)
interface UnitDTO {
  unit_id: number;
  unit_name: string;
  unit_description: string;
  original_capmax: number;
  gui_capmax: number;
  gui_capmin: number;
  start_date: number;
  end_date: number;
  gui_efor: number;
  unit_type: string;
  year: number;
  region_id: number;
  region_description: string;
  unit_active: boolean;
  debug_selected: boolean;
  unit_category_description: string;
  unit_category_id: number;
  start_month: number;
  end_month: number;
  insvdt: string;
  retirement_date: string;
  handling_cost: number;
  fixed_carrying_cost: number;
  fixed_cost: number;
  fixed_om: number;
  startup_cost: number;
  hot_startup_cost: number;
  cold_startup_cost: number;
  warm_startup_cost: number;
  vom_per_mwh: number;
  vom_per_hour: number;
  fuel: number;
}

export class UnitMapper {
  static toDomain(dto: UnitDTO): Unit {
    return {
      unitId: dto.unit_id,
      unitName: dto.unit_name,
      unitDescription: dto.unit_description,
      originalCapMax: dto.original_capmax,
      guiCapMax: dto.gui_capmax,
      guiCapMin: dto.gui_capmin,
      startDate: dto.start_date,
      endDate: dto.end_date,
      guiEfor: dto.gui_efor,
      unitType: dto.unit_type,
      year: dto.year,
      regionId: dto.region_id,
      regionDescription: dto.region_description,
      unitActive: dto.unit_active,
      debugSelected: dto.debug_selected,
      unitCategoryDescription: dto.unit_category_description,
      unitCategoryId: dto.unit_category_id,
      startMonth: dto.start_month,
      endMonth: dto.end_month,
      insvdt: dto.insvdt,
      retirementDate: dto.retirement_date,
      handlingCost: dto.handling_cost,
      fixedCarryingCost: dto.fixed_carrying_cost,
      fixedCost: dto.fixed_cost,
      fixedOm: dto.fixed_om,
      startupCost: dto.startup_cost,
      hotStartupCost: dto.hot_startup_cost,
      coldStartupCost: dto.cold_startup_cost,
      warmStartupCost: dto.warm_startup_cost,
      vomPerMwh: dto.vom_per_mwh,
      vomPerHour: dto.vom_per_hour,
      fuel: dto.fuel,
    };
  }

  static toDTO(unit: Unit): UnitDTO {
    return {
      unit_id: unit.unitId,
      unit_name: unit.unitName,
      unit_description: unit.unitDescription,
      original_capmax: unit.originalCapMax,
      gui_capmax: unit.guiCapMax,
      gui_capmin: unit.guiCapMin,
      start_date: unit.startDate,
      end_date: unit.endDate,
      gui_efor: unit.guiEfor,
      unit_type: unit.unitType,
      year: unit.year,
      region_id: unit.regionId,
      region_description: unit.regionDescription,
      unit_active: unit.unitActive,
      debug_selected: unit.debugSelected,
      unit_category_description: unit.unitCategoryDescription,
      unit_category_id: unit.unitCategoryId,
      start_month: unit.startMonth,
      end_month: unit.endMonth,
      insvdt: unit.insvdt,
      retirement_date: unit.retirementDate,
      handling_cost: unit.handlingCost,
      fixed_carrying_cost: unit.fixedCarryingCost,
      fixed_cost: unit.fixedCost,
      fixed_om: unit.fixedOm,
      startup_cost: unit.startupCost,
      hot_startup_cost: unit.hotStartupCost,
      cold_startup_cost: unit.coldStartupCost,
      warm_startup_cost: unit.warmStartupCost,
      vom_per_mwh: unit.vomPerMwh,
      vom_per_hour: unit.vomPerHour,
      fuel: unit.fuel,
    };
  }

  static toDomainList(dtos: UnitDTO[]): Unit[] {
    return dtos.map(dto => this.toDomain(dto));
  }

  static toDTOList(units: Unit[]): UnitDTO[] {
    return units.map(unit => this.toDTO(unit));
  }
}
```

---

### 6. Service Layer (Business Logic)

```typescript
// src/services/UnitService.ts
import { IUnitRepository } from '../data/repositories/interfaces/IUnitRepository';
import { Unit } from '../models/Unit';

export class UnitService {
  constructor(private unitRepo: IUnitRepository) {}

  async getAvailableUnits(): Promise<Unit[]> {
    const units = await this.unitRepo.getAll();
    return units.filter(u => u.unitActive);
  }

  async getUnitsByIds(unitIds: number[]): Promise<Unit[]> {
    const units = await this.unitRepo.getAll();
    return units.filter(u => unitIds.includes(u.unitId));
  }

  async calculateTotalCapacity(unitIds: number[]): Promise<number> {
    const units = await this.getUnitsByIds(unitIds);
    return units.reduce((sum, u) => sum + u.guiCapMax, 0);
  }

  async calculateTotalFixedCost(unitIds: number[]): Promise<number> {
    const units = await this.getUnitsByIds(unitIds);
    return units.reduce((sum, u) => sum + u.fixedOm, 0);
  }

  async getUnitsByCategory(categoryId: number): Promise<Unit[]> {
    return this.unitRepo.getByCategory(categoryId);
  }

  async getUnitsByRegion(regionId: number): Promise<Unit[]> {
    return this.unitRepo.getByRegion(regionId);
  }

  async createUnit(unit: Omit<Unit, 'unitId'>): Promise<Unit> {
    // Business validation
    if (!unit.unitName.trim()) {
      throw new Error('Unit name is required');
    }
    if (unit.guiCapMax < unit.guiCapMin) {
      throw new Error('Max capacity must be greater than min capacity');
    }
    return this.unitRepo.create(unit);
  }

  async updateUnit(unit: Unit): Promise<Unit> {
    // Business validation
    const existing = await this.unitRepo.getById(unit.unitId);
    if (!existing) {
      throw new Error(`Unit with id ${unit.unitId} not found`);
    }
    return this.unitRepo.update(unit);
  }

  async deleteUnit(id: number): Promise<void> {
    const existing = await this.unitRepo.getById(id);
    if (!existing) {
      throw new Error(`Unit with id ${id} not found`);
    }
    return this.unitRepo.delete(id);
  }
}
```

```typescript
// src/services/StudyService.ts
import { IStudyRepository } from '../data/repositories/interfaces/IStudyRepository';
import { Study } from '../models/Study';

export class StudyService {
  constructor(private studyRepo: IStudyRepository) {}

  async getAllStudies(): Promise<Study[]> {
    return this.studyRepo.getAll();
  }

  async getStudyById(id: string): Promise<Study | null> {
    return this.studyRepo.getById(id);
  }

  async getStudiesByRegion(region: string): Promise<Study[]> {
    return this.studyRepo.getByRegion(region);
  }

  async getPlanningHorizon(studyId: string): Promise<{ start: number; end: number } | null> {
    const study = await this.studyRepo.getById(studyId);
    if (!study) return null;
    return {
      start: study.startYear,
      end: study.endYear,
    };
  }

  async getYearOptions(studyId: string): Promise<string[]> {
    const horizon = await this.getPlanningHorizon(studyId);
    if (!horizon) return [];

    const years: string[] = [];
    for (let y = horizon.start; y <= horizon.end; y++) {
      years.push(String(y));
    }
    years.push('All');
    return years;
  }

  async createStudy(study: Omit<Study, 'id'>): Promise<Study> {
    // Business validation
    if (!study.name.trim()) {
      throw new Error('Study name is required');
    }
    if (study.endYear < study.startYear) {
      throw new Error('End year must be after start year');
    }
    if (study.regions.length === 0) {
      throw new Error('At least one region is required');
    }
    return this.studyRepo.create(study);
  }
}
```

```typescript
// src/services/CandidateService.ts
import { IGenerationCandidateRepository } from '../data/repositories/interfaces/ICandidateRepository';
import { GenerationCandidate } from '../models/Candidate';
import { UnitService } from './UnitService';

export class CandidateService {
  constructor(
    private candidateRepo: IGenerationCandidateRepository,
    private unitService: UnitService
  ) {}

  async getCandidatesByPlan(planId: string): Promise<GenerationCandidate[]> {
    return this.candidateRepo.getByExpansionPlan(planId);
  }

  async createCandidate(
    planId: string,
    unitIds: number[],
    options: {
      startMonth: string;
      startYear: number;
      endYear: number;
      maxAdditionsPerYear: number | null;
      maxAdditionsOverall: number | null;
      isRetirement: boolean;
      lifetime: number;
    }
  ): Promise<GenerationCandidate> {
    // Get units and calculate totals
    const units = await this.unitService.getUnitsByIds(unitIds);
    const unitNames = units.map(u => u.unitName);
    const totalCapacity = units.reduce((sum, u) => sum + u.guiCapMax, 0);
    const totalFixedCost = units.reduce((sum, u) => sum + u.fixedOm, 0);

    return this.candidateRepo.create({
      expansionPlanId: planId,
      units: unitNames,
      capacity: totalCapacity,
      fixedCost: totalFixedCost,
      ...options,
    });
  }

  async deleteMultiple(ids: string[]): Promise<void> {
    return this.candidateRepo.deleteMany(ids);
  }
}
```

---

### 7. React Hooks (UI Integration)

```typescript
// src/hooks/useUnits.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Unit } from '../models/Unit';
import { UnitService } from '../services/UnitService';
import { UnitRepository } from '../data/repositories/UnitRepository';

interface UseUnitsReturn {
  units: Unit[];
  loading: boolean;
  error: Error | null;
  getUnitsByIds: (ids: number[]) => Unit[];
  calculateTotalCapacity: (ids: number[]) => number;
  calculateTotalFixedCost: (ids: number[]) => number;
  refresh: () => Promise<void>;
}

export function useUnits(): UseUnitsReturn {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const unitService = useMemo(
    () => new UnitService(new UnitRepository()),
    []
  );

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await unitService.getAvailableUnits();
      setUnits(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch units'));
    } finally {
      setLoading(false);
    }
  }, [unitService]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const getUnitsByIds = useCallback(
    (ids: number[]) => units.filter(u => ids.includes(u.unitId)),
    [units]
  );

  const calculateTotalCapacity = useCallback(
    (ids: number[]) => getUnitsByIds(ids).reduce((sum, u) => sum + u.guiCapMax, 0),
    [getUnitsByIds]
  );

  const calculateTotalFixedCost = useCallback(
    (ids: number[]) => getUnitsByIds(ids).reduce((sum, u) => sum + u.fixedOm, 0),
    [getUnitsByIds]
  );

  return {
    units,
    loading,
    error,
    getUnitsByIds,
    calculateTotalCapacity,
    calculateTotalFixedCost,
    refresh: fetchUnits,
  };
}
```

```typescript
// src/hooks/useStudies.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Study } from '../models/Study';
import { StudyService } from '../services/StudyService';
import { StudyRepository } from '../data/repositories/StudyRepository';

interface UseStudiesReturn {
  studies: Study[];
  loading: boolean;
  error: Error | null;
  getStudyById: (id: string) => Study | undefined;
  getYearOptions: (studyId: string) => Promise<string[]>;
  refresh: () => Promise<void>;
}

export function useStudies(): UseStudiesReturn {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const studyService = useMemo(
    () => new StudyService(new StudyRepository()),
    []
  );

  const fetchStudies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studyService.getAllStudies();
      setStudies(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch studies'));
    } finally {
      setLoading(false);
    }
  }, [studyService]);

  useEffect(() => {
    fetchStudies();
  }, [fetchStudies]);

  const getStudyById = useCallback(
    (id: string) => studies.find(s => s.id === id),
    [studies]
  );

  const getYearOptions = useCallback(
    async (studyId: string) => studyService.getYearOptions(studyId),
    [studyService]
  );

  return {
    studies,
    loading,
    error,
    getStudyById,
    getYearOptions,
    refresh: fetchStudies,
  };
}
```

```typescript
// src/hooks/useCandidates.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { GenerationCandidate } from '../models/Candidate';
import { CandidateService } from '../services/CandidateService';
import { GenerationCandidateRepository } from '../data/repositories/CandidateRepository';
import { UnitService } from '../services/UnitService';
import { UnitRepository } from '../data/repositories/UnitRepository';

interface UseCandidatesReturn {
  candidates: GenerationCandidate[];
  loading: boolean;
  error: Error | null;
  createCandidate: (params: CreateCandidateParams) => Promise<GenerationCandidate>;
  updateCandidate: (candidate: GenerationCandidate) => Promise<void>;
  deleteCandidates: (ids: string[]) => Promise<void>;
  refresh: () => Promise<void>;
}

interface CreateCandidateParams {
  planId: string;
  unitIds: number[];
  startMonth: string;
  startYear: number;
  endYear: number;
  maxAdditionsPerYear: number | null;
  maxAdditionsOverall: number | null;
  isRetirement: boolean;
  lifetime: number;
}

export function useCandidates(planId: string | null): UseCandidatesReturn {
  const [candidates, setCandidates] = useState<GenerationCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const candidateService = useMemo(
    () => new CandidateService(
      new GenerationCandidateRepository(),
      new UnitService(new UnitRepository())
    ),
    []
  );

  const fetchCandidates = useCallback(async () => {
    if (!planId) {
      setCandidates([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await candidateService.getCandidatesByPlan(planId);
      setCandidates(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch candidates'));
    } finally {
      setLoading(false);
    }
  }, [planId, candidateService]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const createCandidate = useCallback(
    async (params: CreateCandidateParams) => {
      const candidate = await candidateService.createCandidate(
        params.planId,
        params.unitIds,
        {
          startMonth: params.startMonth,
          startYear: params.startYear,
          endYear: params.endYear,
          maxAdditionsPerYear: params.maxAdditionsPerYear,
          maxAdditionsOverall: params.maxAdditionsOverall,
          isRetirement: params.isRetirement,
          lifetime: params.lifetime,
        }
      );
      await fetchCandidates();
      return candidate;
    },
    [candidateService, fetchCandidates]
  );

  const deleteCandidates = useCallback(
    async (ids: string[]) => {
      await candidateService.deleteMultiple(ids);
      await fetchCandidates();
    },
    [candidateService, fetchCandidates]
  );

  return {
    candidates,
    loading,
    error,
    createCandidate,
    updateCandidate: async () => {}, // TODO: implement
    deleteCandidates,
    refresh: fetchCandidates,
  };
}
```

---

## Migration Strategy

| Phase | Action | Description |
|-------|--------|-------------|
| 1 | Create `models/` | Move interfaces from `types/index.ts` to individual model files |
| 2 | Create `data/sources/local/` | Move SAMPLE_* data to seedData.ts |
| 3 | Create repository interfaces | Define contracts in `data/repositories/interfaces/` |
| 4 | Implement local repositories | Create concrete implementations using local data sources |
| 5 | Create services | Implement business logic layer |
| 6 | Create hooks | Replace prop drilling with custom hooks |
| 7 | Refactor pages | Update pages to use new hooks |

---

## Benefits

| Benefit | Description |
|---------|-------------|
| **Testability** | Mock repositories for unit tests without touching real data |
| **Flexibility** | Swap local → API → DB without changing UI code |
| **Maintainability** | Clear boundaries, single responsibility per layer |
| **Scalability** | Add caching, offline sync, optimistic updates at repository level |
| **Type Safety** | Full TypeScript support across all layers |
| **Separation of Concerns** | UI doesn't know about data sources, services don't know about UI |

---

## Dependency Injection Pattern

For easier testing and flexibility, consider using a simple DI container:

```typescript
// src/di/container.ts
import { UnitRepository } from '../data/repositories/UnitRepository';
import { StudyRepository } from '../data/repositories/StudyRepository';
import { UnitService } from '../services/UnitService';
import { StudyService } from '../services/StudyService';

class Container {
  private static instance: Container;

  private unitRepository?: UnitRepository;
  private studyRepository?: StudyRepository;
  private unitService?: UnitService;
  private studyService?: StudyService;

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  getUnitRepository(): UnitRepository {
    if (!this.unitRepository) {
      this.unitRepository = new UnitRepository();
    }
    return this.unitRepository;
  }

  getStudyRepository(): StudyRepository {
    if (!this.studyRepository) {
      this.studyRepository = new StudyRepository();
    }
    return this.studyRepository;
  }

  getUnitService(): UnitService {
    if (!this.unitService) {
      this.unitService = new UnitService(this.getUnitRepository());
    }
    return this.unitService;
  }

  getStudyService(): StudyService {
    if (!this.studyService) {
      this.studyService = new StudyService(this.getStudyRepository());
    }
    return this.studyService;
  }

  // For testing - allows replacing dependencies
  reset(): void {
    this.unitRepository = undefined;
    this.studyRepository = undefined;
    this.unitService = undefined;
    this.studyService = undefined;
  }
}

export const container = Container.getInstance();
```

Usage in hooks:
```typescript
// src/hooks/useUnits.ts
import { container } from '../di/container';

export function useUnits(): UseUnitsReturn {
  const unitService = useMemo(() => container.getUnitService(), []);
  // ...
}
```

---

## Future Considerations

### Caching Layer
```typescript
// src/data/cache/CacheManager.ts
export class CacheManager<T> {
  private cache: Map<string, { data: T; timestamp: number }> = new Map();
  private ttl: number;

  constructor(ttlMs: number = 5 * 60 * 1000) { // 5 minutes default
    this.ttl = ttlMs;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}
```

### Offline Support
- Use AsyncStorage or SQLite for persistent local storage
- Implement sync queue for pending changes
- Add conflict resolution strategy

### API Error Handling
```typescript
// src/data/sources/api/ApiError.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static isNotFound(error: unknown): boolean {
    return error instanceof ApiError && error.statusCode === 404;
  }

  static isUnauthorized(error: unknown): boolean {
    return error instanceof ApiError && error.statusCode === 401;
  }
}
```
