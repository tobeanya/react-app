# Energy System Expansion Plan Manager - Implementation Task Model

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Specifications](#api-specifications)
6. [Implementation Phases](#implementation-phases)
7. [Frontend Integration](#frontend-integration)
8. [Testing Strategy](#testing-strategy)
9. [Deployment](#deployment)
10. [Timeline Estimates](#timeline-estimates)

---

## Project Overview

### Current State (Updated January 2026)
- React Native Windows desktop application with dual storage modes
- **Local Mode**: AsyncStorage for offline, single-user operation
- **Database Mode**: Connected to SQL Server via ASP.NET Core backend API
- Backend API running on `https://localhost:7087`
- Dynamic database connection configuration from UI

### What's Working
- ✅ Frontend app with all pages (Home, Settings, Candidates, Run, Results)
- ✅ Backend API with Swagger UI at `https://localhost:7087/swagger`
- ✅ Database connection configuration modal (Windows + SQL Server auth)
- ✅ Scenarios CRUD via API (database mode)
- ✅ Results loading from database
- ✅ Units lookup from database
- ✅ Mock data fallback when backend unavailable

### What's Remaining
- ⬜ Authentication (JWT, login/register screens)
- ⬜ Settings page API integration
- ⬜ Candidates page API integration
- ⬜ Source studies/Excel import
- ⬜ Solver integration
- ⬜ Export functionality

### Target State
- Full-stack application with REST API backend
- Persistent database storage (SQL Server)
- Multi-user support with authentication
- Excel import/export capabilities
- Solver integration for expansion planning
- Report generation and export

### Success Criteria
- [ ] Users can create, edit, and delete expansion plans
- [ ] Data persists across sessions
- [ ] Multiple users can work with their own plans
- [ ] Excel files can be imported as source studies
- [ ] Solver can run expansion plan calculations
- [ ] Results can be exported to Excel/PDF

---

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                   React Native Windows App                         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │  │
│  │  │  Pages   │  │  Hooks   │  │  Store   │  │  API Client      │  │  │
│  │  │  (UI)    │→ │ (Logic)  │→ │ (State)  │→ │ (HTTP Service)   │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┬─────────┘  │  │
│  └─────────────────────────────────────────────────────┼─────────────┘  │
└────────────────────────────────────────────────────────┼────────────────┘
                                                         │ HTTPS/REST
                                                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API LAYER                                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                   ASP.NET Core Web API                             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │  │
│  │  │Controllers│→ │ Services │→ │  Repos   │→ │  DbContext       │  │  │
│  │  │(Endpoints)│  │(Business)│  │ (Data)   │  │ (EF Core)        │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┬─────────┘  │  │
│  └─────────────────────────────────────────────────────┼─────────────┘  │
└────────────────────────────────────────────────────────┼────────────────┘
                                                         │
                    ┌────────────────────────────────────┼────────────────┐
                    │                                    │                │
                    ▼                                    ▼                ▼
┌─────────────────────────┐  ┌─────────────────────────┐  ┌──────────────────┐
│      SQL Server         │  │     File Storage        │  │  External APIs   │
│  ┌───────────────────┐  │  │  ┌─────────────────┐    │  │  ┌────────────┐  │
│  │ ExpansionPlans    │  │  │  │ Excel Imports   │    │  │  │ Solver     │  │
│  │ Candidates        │  │  │  │ Report Exports  │    │  │  │ Service    │  │
│  │ SourceStudies     │  │  │  │ Attachments     │    │  │  └────────────┘  │
│  │ Units             │  │  │  └─────────────────┘    │  └──────────────────┘
│  │ Results           │  │  └─────────────────────────┘
│  └───────────────────┘  │
└─────────────────────────┘
```

### Layer Responsibilities

| Layer | Responsibility | Technologies |
|-------|----------------|--------------|
| **Presentation** | UI rendering, user interaction | React Native, TypeScript |
| **State Management** | Client-side state, caching | React Hooks, Context |
| **API Client** | HTTP requests, response handling | Axios/Fetch |
| **Controllers** | Request routing, validation | ASP.NET Core |
| **Services** | Business logic, orchestration | C# |
| **Repositories** | Data access abstraction | Entity Framework Core |
| **Database** | Persistent storage | SQL Server |

---

## Technology Stack

### Backend
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Runtime | .NET | 8.0 LTS | Application runtime |
| Framework | ASP.NET Core | 8.0 | Web API framework |
| ORM | Entity Framework Core | 8.0 | Database access |
| Database | SQL Server | 2022 | Primary data store |
| Authentication | JWT + ASP.NET Identity | - | User auth |
| Validation | FluentValidation | 11.x | Input validation |
| Mapping | AutoMapper | 12.x | Object mapping |
| Logging | Serilog | 3.x | Structured logging |
| Documentation | Swagger/OpenAPI | 6.x | API documentation |

### Frontend
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | React Native | 0.73+ | UI framework |
| Platform | React Native Windows | 0.73+ | Windows desktop |
| Language | TypeScript | 5.x | Type safety |
| HTTP Client | Axios | 1.x | API requests |
| State | React Query | 5.x | Server state management |
| Forms | React Hook Form | 7.x | Form handling |
| Storage | AsyncStorage | - | Local caching |

### DevOps
| Component | Technology | Purpose |
|-----------|------------|---------|
| Source Control | Git/GitHub | Version control |
| CI/CD | GitHub Actions | Automated builds |
| Containerization | Docker | Deployment packaging |
| Hosting | Azure App Service | Cloud hosting |

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     Users       │       │  SourceStudies  │       │    Regions      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ Id (PK)         │       │ Id (PK)         │       │ Id (PK)         │
│ Email           │       │ Name            │       │ Name            │
│ PasswordHash    │       │ Description     │       │ Description     │
│ FirstName       │       │ StartYear       │       │ CreatedAt       │
│ LastName        │       │ EndYear         │       └────────┬────────┘
│ CreatedAt       │       │ FilePath        │                │
│ LastLoginAt     │       │ CreatedById(FK) │                │
└────────┬────────┘       │ CreatedAt       │                │
         │                └────────┬────────┘                │
         │                         │                         │
         │    ┌────────────────────┼─────────────────────────┘
         │    │                    │
         ▼    ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      ExpansionPlans                          │
├─────────────────────────────────────────────────────────────┤
│ Id (PK)                                                      │
│ Name                                                         │
│ Description                                                  │
│ SourceStudyId (FK) ─────────────────────────────────────────┤
│ RegionId (FK) ──────────────────────────────────────────────┤
│ OwnerId (FK) ───────────────────────────────────────────────┤
│ Status (Draft/Active/Completed/Archived)                     │
│ PlanningHorizonStart                                         │
│ PlanningHorizonEnd                                           │
│ CreatedAt                                                    │
│ UpdatedAt                                                    │
└─────────────────────────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────────┐
│                   ExpansionPlanSettings                      │
├─────────────────────────────────────────────────────────────┤
│ Id (PK)                                                      │
│ ExpansionPlanId (FK)                                         │
│ -- General Settings --                                       │
│ SimulationYearStepSize                                       │
│ BaseYear                                                     │
│ AutomatedDecommissioningYearDelay                            │
│ EconomicDiscountRate                                         │
│ ReliabilityDiscountRate                                      │
│ -- Solver Settings --                                        │
│ SolverType (Xpress-CP-Fast/Standard/Normal/Simple)           │
│ SolutionCriterion (TotalSystemCost/MinCost/MaxReliability)   │
│ OperationsMinDays                                            │
│ OperationsMaxDays                                            │
│ WeatherYearSelection                                         │
│ LoadUncertainty                                              │
│ IncludeOutages                                               │
│ AutoExportResults                                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     Units       │       │   Candidates    │       │ ExpansionResults│
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ Id (PK)         │       │ Id (PK)         │       │ Id (PK)         │
│ Name            │       │ ExpansionPlanId │       │ ExpansionPlanId │
│ Description     │       │ UnitId (FK)─────┼──────▶│ BuildCycle      │
│ UnitType        │       │ Name            │       │ Year            │
│ CapacityMax     │       │ StartYear       │       │ Technology      │
│ CapacityMin     │       │ EndYear         │       │ Status          │
│ FixedCost       │       │ MaxCapacity     │       │ AddedCapacity   │
│ FixedOM         │       │ MaxAdditions/Yr │       │ LOLE            │
│ VariableOM      │       │ MaxAdditions    │       │ EUE             │
│ FuelCost        │       │ IsRetirement    │       │ TotalCost       │
│ StartupCost     │       │ IsTransmission  │       │ ... (metrics)   │
│ ...             │       │ CreatedAt       │       │ CreatedAt       │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

### Table Definitions

#### Users
```sql
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL,
    FirstName NVARCHAR(100),
    LastName NVARCHAR(100),
    Role NVARCHAR(50) DEFAULT 'User',
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    LastLoginAt DATETIME2,
    INDEX IX_Users_Email (Email)
);
```

#### Regions
```sql
CREATE TABLE Regions (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(255),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Seed data
INSERT INTO Regions (Name, Description) VALUES
('ERCOT', 'Electric Reliability Council of Texas'),
('SPP', 'Southwest Power Pool'),
('MISO', 'Midcontinent Independent System Operator'),
('PJM', 'PJM Interconnection'),
('Mexico', 'Mexico Grid Region');
```

#### SourceStudies
```sql
CREATE TABLE SourceStudies (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(1000),
    StartYear INT NOT NULL,
    EndYear INT NOT NULL,
    FilePath NVARCHAR(500),
    CreatedById UNIQUEIDENTIFIER REFERENCES Users(Id),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    INDEX IX_SourceStudies_Name (Name)
);
```

#### ExpansionPlans
```sql
CREATE TABLE ExpansionPlans (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(1000),
    SourceStudyId UNIQUEIDENTIFIER REFERENCES SourceStudies(Id),
    RegionId INT REFERENCES Regions(Id),
    OwnerId UNIQUEIDENTIFIER REFERENCES Users(Id),
    Status NVARCHAR(50) DEFAULT 'Draft',
    PlanningHorizonStart INT NOT NULL,
    PlanningHorizonEnd INT NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    INDEX IX_ExpansionPlans_OwnerId (OwnerId),
    INDEX IX_ExpansionPlans_Status (Status)
);
```

#### Units
```sql
CREATE TABLE Units (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    UnitType NVARCHAR(50) NOT NULL,
    CapacityMax DECIMAL(18,2),
    CapacityMin DECIMAL(18,2),
    FixedCost DECIMAL(18,2),
    FixedCarryingCost DECIMAL(18,2),
    FixedOM DECIMAL(18,2),
    VariableOM DECIMAL(18,4),
    FuelCost DECIMAL(18,4),
    StartupCost DECIMAL(18,2),
    HotStartupCost DECIMAL(18,2),
    ColdStartupCost DECIMAL(18,2),
    WarmStartupCost DECIMAL(18,2),
    EFOR DECIMAL(5,4),
    RegionId INT REFERENCES Regions(Id),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    INDEX IX_Units_UnitType (UnitType),
    INDEX IX_Units_RegionId (RegionId)
);
```

#### Candidates
```sql
CREATE TABLE Candidates (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ExpansionPlanId UNIQUEIDENTIFIER NOT NULL REFERENCES ExpansionPlans(Id) ON DELETE CASCADE,
    UnitId INT REFERENCES Units(Id),
    Name NVARCHAR(255) NOT NULL,
    StartYear INT,
    EndYear INT,
    StartMonth INT DEFAULT 1,
    EndMonth INT DEFAULT 12,
    MaxCapacity DECIMAL(18,2),
    MaxAdditionsPerYear INT,
    MaxAdditionsOverall INT,
    IsRetirement BIT DEFAULT 0,
    IsTransmission BIT DEFAULT 0,
    -- Transmission-specific fields
    RegionAId INT REFERENCES Regions(Id),
    RegionBId INT REFERENCES Regions(Id),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    INDEX IX_Candidates_ExpansionPlanId (ExpansionPlanId)
);
```

#### ExpansionResults
```sql
CREATE TABLE ExpansionResults (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    ExpansionPlanId UNIQUEIDENTIFIER NOT NULL REFERENCES ExpansionPlans(Id) ON DELETE CASCADE,
    RunId UNIQUEIDENTIFIER NOT NULL,
    CalculationBasis NVARCHAR(20) NOT NULL, -- 'Yearly' or 'NPV'
    BuildCycle INT NOT NULL,
    Year INT NOT NULL,
    Technology NVARCHAR(255) NOT NULL,
    Status NVARCHAR(100),
    -- Metrics
    AddedCapacity DECIMAL(18,2),
    LOLE DECIMAL(18,4),
    EUE DECIMAL(18,2),
    LOLH DECIMAL(18,4),
    MarketPrice DECIMAL(18,4),
    TotalAnnualSystemCost DECIMAL(18,2),
    EnergyMargin DECIMAL(18,2),
    FixedCost DECIMAL(18,2),
    ProductionCost DECIMAL(18,2),
    FuelCost DECIMAL(18,2),
    StartupCost DECIMAL(18,2),
    VariableOMCost DECIMAL(18,2),
    EmissionCost DECIMAL(18,2),
    CapacityFactor DECIMAL(8,4),
    Generation DECIMAL(18,2),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    INDEX IX_ExpansionResults_PlanId (ExpansionPlanId),
    INDEX IX_ExpansionResults_RunId (RunId),
    INDEX IX_ExpansionResults_Year (Year)
);
```

---

## API Specifications

### Base URL
```
Development: https://localhost:7001/api
Production:  https://api.expansion-planner.com/api
```

### Authentication
All endpoints except `/auth/*` require Bearer token authentication.

```http
Authorization: Bearer <jwt_token>
```

### Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get JWT token |
| POST | `/auth/refresh` | Refresh JWT token |
| POST | `/auth/logout` | Invalidate token |
| GET | `/auth/me` | Get current user info |

#### Expansion Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/expansion-plans` | List all plans (paginated) |
| GET | `/expansion-plans/{id}` | Get plan by ID |
| POST | `/expansion-plans` | Create new plan |
| PUT | `/expansion-plans/{id}` | Update plan |
| DELETE | `/expansion-plans/{id}` | Delete plan |
| POST | `/expansion-plans/{id}/copy` | Duplicate plan |
| POST | `/expansion-plans/{id}/run` | Execute solver |

#### Plan Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/expansion-plans/{id}/settings` | Get plan settings |
| PUT | `/expansion-plans/{id}/settings` | Update settings |

#### Candidates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/expansion-plans/{id}/candidates` | List candidates |
| GET | `/expansion-plans/{id}/candidates/{candidateId}` | Get candidate |
| POST | `/expansion-plans/{id}/candidates` | Add candidate |
| PUT | `/expansion-plans/{id}/candidates/{candidateId}` | Update candidate |
| DELETE | `/expansion-plans/{id}/candidates/{candidateId}` | Remove candidate |
| POST | `/expansion-plans/{id}/candidates/bulk` | Bulk add candidates |

#### Results
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/expansion-plans/{id}/results` | Get results (paginated) |
| GET | `/expansion-plans/{id}/results/summary` | Get results summary |
| GET | `/expansion-plans/{id}/results/export` | Export to Excel |
| DELETE | `/expansion-plans/{id}/results` | Clear results |

#### Source Studies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/source-studies` | List source studies |
| GET | `/source-studies/{id}` | Get study by ID |
| POST | `/source-studies` | Create study |
| POST | `/source-studies/import` | Import from Excel |
| DELETE | `/source-studies/{id}` | Delete study |

#### Units
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/units` | List all units |
| GET | `/units/{id}` | Get unit by ID |
| POST | `/units` | Create unit |
| PUT | `/units/{id}` | Update unit |
| DELETE | `/units/{id}` | Delete unit |

#### Regions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/regions` | List all regions |

#### Database Configuration (Implemented)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/databaseconfig/current` | Get current connection settings (no password) |
| POST | `/databaseconfig/test` | Test connection without saving |
| POST | `/databaseconfig/configure` | Test + save connection |
| POST | `/databaseconfig/disconnect` | Clear connection settings |
| GET | `/databaseconfig/status` | Get connection status |

### Request/Response Examples

#### Create Expansion Plan
```http
POST /api/expansion-plans
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "2024 Expansion Study",
  "description": "Annual expansion planning analysis",
  "sourceStudyId": "550e8400-e29b-41d4-a716-446655440000",
  "regionId": 1,
  "planningHorizonStart": 2030,
  "planningHorizonEnd": 2040
}
```

Response:
```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "name": "2024 Expansion Study",
  "description": "Annual expansion planning analysis",
  "sourceStudy": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Base Case Study"
  },
  "region": {
    "id": 1,
    "name": "ERCOT"
  },
  "status": "Draft",
  "planningHorizonStart": 2030,
  "planningHorizonEnd": 2040,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### Add Candidate
```http
POST /api/expansion-plans/{planId}/candidates
Content-Type: application/json

{
  "unitId": 1,
  "name": "New Solar Installation",
  "startYear": 2030,
  "endYear": 2035,
  "startMonth": 1,
  "endMonth": 12,
  "maxCapacity": 500,
  "maxAdditionsPerYear": 2,
  "maxAdditionsOverall": 10,
  "isRetirement": false
}
```

#### Get Results with Pagination
```http
GET /api/expansion-plans/{planId}/results?page=1&pageSize=50&calculationBasis=Yearly&year=2035
```

Response:
```json
{
  "data": [
    {
      "buildCycle": 0,
      "year": 2035,
      "technology": "Candidate_Adv CC_RestOfSys",
      "status": "Selected 1 Units",
      "addedCapacity": 1083,
      "lole": 27.02,
      "eue": 465439.9,
      "totalAnnualSystemCost": 30410540000
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "totalPages": 10,
    "totalCount": 500
  }
}
```

### Error Responses
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "Validation failed",
  "errors": {
    "name": ["Name is required"],
    "planningHorizonEnd": ["End year must be after start year"]
  }
}
```

---

## Implementation Phases

### Phase 1: Backend Foundation (Core Infrastructure)

#### 1.1 Project Setup
- [x] Create ASP.NET Core Web API project
- [x] Configure project structure (Clean Architecture)
- [x] Set up Entity Framework Core with SQL Server
- [x] Configure dependency injection
- [ ] Set up Serilog logging
- [x] Configure Swagger/OpenAPI documentation
- [ ] Set up development/staging/production environments

#### 1.2 Database Setup
- [x] Create database migrations
- [ ] Implement seed data for regions and sample units
- [x] Set up connection string management (dynamic runtime configuration)
- [ ] Configure database indexes for performance

#### 1.3 Authentication & Authorization
- [ ] Implement ASP.NET Identity
- [ ] Configure JWT token generation
- [ ] Create auth endpoints (register, login, refresh)
- [ ] Implement authorization policies
- [ ] Add role-based access control

**Deliverables:**
- [x] Running API with Swagger UI
- [x] Database with all tables created
- [ ] Authentication working with JWT

---

### Phase 2: Core Domain APIs

#### 2.1 Expansion Plans (Scenarios) CRUD
- [x] Create Scenario entity and DTOs
- [x] Implement ScenariosController with CRUD operations
- [ ] Implement ExpansionPlanService
- [ ] Add validation with FluentValidation
- [ ] Implement copy/duplicate functionality

#### 2.2 Plan Settings
- [ ] Create ExpansionPlanSettings entity
- [ ] Implement settings repository and service
- [ ] Create settings endpoints
- [ ] Add default settings on plan creation

#### 2.3 Candidates Management
- [ ] Create Candidate entity and DTOs
- [ ] Implement CandidateRepository
- [ ] Implement CandidateService
- [ ] Create CandidatesController
- [ ] Add bulk operations support

#### 2.4 Units & Regions
- [x] Create Unit entity and DTOs
- [x] Implement UnitsController
- [ ] Create RegionsController
- [ ] Add filtering and search capabilities

#### 2.5 Results
- [x] Create Results entity and DTOs
- [x] Implement ResultsController with filtering by scenario

**Deliverables:**
- [x] Basic CRUD for scenarios (expansion plans)
- [ ] Candidates management API
- [x] Units lookup API
- [x] Results API

---

### Phase 3: Source Studies & Import

#### 3.1 Source Studies Management
- [ ] Create SourceStudy entity
- [ ] Implement CRUD operations
- [ ] Add file upload support

#### 3.2 Excel Import
- [ ] Install EPPlus or ClosedXML library
- [ ] Create Excel parsing service
- [ ] Implement import validation
- [ ] Create import endpoint with progress tracking
- [ ] Handle large file imports asynchronously

#### 3.3 Data Mapping
- [ ] Create mapping configurations for Excel formats
- [ ] Implement unit matching logic
- [ ] Add error reporting for import issues

**Deliverables:**
- Excel file import working
- Source study management
- Import validation and error reporting

---

### Phase 4: Results & Solver Integration

#### 4.1 Results Storage
- [ ] Create ExpansionResult entity
- [ ] Implement results repository
- [ ] Add efficient bulk insert for results
- [ ] Create results query endpoints with filtering

#### 4.2 Solver Integration
- [ ] Define solver interface/contract
- [ ] Create mock solver for development
- [ ] Implement solver job queue
- [ ] Add progress tracking for long-running jobs
- [ ] Create webhook/SignalR for completion notification

#### 4.3 Results Export
- [ ] Implement Excel export service
- [ ] Create PDF report generation
- [ ] Add export endpoints

**Deliverables:**
- Results storage and retrieval
- Solver integration (mock or real)
- Export functionality

---

### Phase 5: Frontend Integration

#### 5.1 API Client Setup
- [x] Create API client service with Axios (`src/api/client.ts`)
- [x] Implement request/response interceptors
- [ ] Add authentication token management
- [x] Create typed API methods (`src/api/*.api.ts`)

#### 5.2 State Management
- [x] Set up React Query for server state (`useDatabaseScenarios` hook)
- [x] Implement caching strategies
- [ ] Add optimistic updates
- [x] Handle offline scenarios (mock data fallback)

#### 5.3 Replace Mock Data
- [x] Update HomePage to use API (database mode with scenarios)
- [ ] Update SettingsPage to use API
- [ ] Update CandidatesPage to use API
- [x] Update Results pages to use API

#### 5.4 Database Connection UI
- [x] Create DatabaseConnectionSection component
- [x] Create useDatabaseConnection hook
- [x] Add connection modal to HomePage
- [x] Support Windows and SQL Server authentication
- [x] Connection status indicator (green/red)

#### 5.5 Authentication UI
- [ ] Create login screen
- [ ] Create registration screen
- [ ] Implement logout functionality
- [ ] Add session management

**Deliverables:**
- [x] Frontend connected to backend (database mode)
- [ ] Authentication flow working
- [x] Scenarios CRUD operations via API
- [x] Database connection configuration UI

---

### Phase 6: Advanced Features

#### 6.1 Real-time Updates
- [ ] Set up SignalR hub
- [ ] Implement solver progress notifications
- [ ] Add collaborative editing notifications

#### 6.2 Audit Logging
- [ ] Create audit log table
- [ ] Implement audit interceptor
- [ ] Add audit log viewing UI

#### 6.3 Performance Optimization
- [ ] Add Redis caching
- [ ] Implement database query optimization
- [ ] Add API response compression
- [ ] Implement pagination everywhere

#### 6.4 Error Handling & Monitoring
- [ ] Set up Application Insights
- [ ] Implement global error handling
- [ ] Add health check endpoints
- [ ] Create admin dashboard

**Deliverables:**
- Real-time notifications
- Audit trail
- Production-ready performance

---

## Frontend Integration

### API Client Structure

```
src/
├── api/
│   ├── client.ts              # Axios instance configuration
│   ├── auth.api.ts            # Authentication endpoints
│   ├── expansionPlans.api.ts  # Expansion plans endpoints
│   ├── candidates.api.ts      # Candidates endpoints
│   ├── results.api.ts         # Results endpoints
│   ├── sourceStudies.api.ts   # Source studies endpoints
│   ├── units.api.ts           # Units endpoints
│   └── index.ts               # API exports
├── hooks/
│   ├── useAuth.ts             # Authentication hook
│   ├── useExpansionPlans.ts   # Plans query/mutation hooks
│   ├── useCandidates.ts       # Candidates hooks
│   ├── useResults.ts          # Results hooks
│   └── useUnits.ts            # Units hooks
├── types/
│   └── api.ts                 # API request/response types
└── utils/
    └── storage.ts             # Token storage utilities
```

### API Client Example

```typescript
// src/api/client.ts
import axios from 'axios';
import { getToken, removeToken } from '../utils/storage';

const API_BASE_URL = __DEV__
  ? 'https://localhost:7001/api'
  : 'https://api.expansion-planner.com/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await removeToken();
      // Navigate to login
    }
    return Promise.reject(error);
  }
);
```

### React Query Hook Example

```typescript
// src/hooks/useExpansionPlans.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expansionPlansApi } from '../api';
import { ExpansionPlan, CreateExpansionPlanDto } from '../types/api';

export const useExpansionPlans = () => {
  return useQuery({
    queryKey: ['expansionPlans'],
    queryFn: expansionPlansApi.getAll,
  });
};

export const useExpansionPlan = (id: string) => {
  return useQuery({
    queryKey: ['expansionPlans', id],
    queryFn: () => expansionPlansApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateExpansionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpansionPlanDto) =>
      expansionPlansApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expansionPlans'] });
    },
  });
};

export const useDeleteExpansionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expansionPlansApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expansionPlans'] });
    },
  });
};
```

---

## Testing Strategy

### Backend Testing

#### Unit Tests
- Repository tests with in-memory database
- Service tests with mocked repositories
- Validation tests
- Mapping tests

#### Integration Tests
- API endpoint tests
- Database integration tests
- Authentication flow tests

#### Tools
- xUnit for test framework
- Moq for mocking
- FluentAssertions for assertions
- TestContainers for database tests

### Frontend Testing

#### Unit Tests
- Hook tests with React Testing Library
- Component tests
- Utility function tests

#### Integration Tests
- API integration tests with MSW
- Navigation flow tests

#### E2E Tests
- Critical user flows with Detox

### Test Coverage Targets
- Backend: 80% code coverage
- Frontend: 70% code coverage
- Critical paths: 100% coverage

---

## Deployment

### Development Environment
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  api:
    build: ./backend
    ports:
      - "7001:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Server=db;Database=ExpansionPlanner;...
    depends_on:
      - db

  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    ports:
      - "1433:1433"
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong!Passw0rd
```

### Production Deployment

#### Azure Resources
- Azure App Service (API)
- Azure SQL Database
- Azure Blob Storage (file uploads)
- Azure Key Vault (secrets)
- Azure Application Insights (monitoring)

#### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0.x'

      - name: Build
        run: dotnet build --configuration Release

      - name: Test
        run: dotnet test --no-build

      - name: Publish
        run: dotnet publish -c Release -o ./publish

      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'expansion-planner-api'
          publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}
          package: ./publish
```

---

## Timeline Estimates

| Phase | Description | Estimated Effort |
|-------|-------------|------------------|
| Phase 1 | Backend Foundation | 2-3 weeks |
| Phase 2 | Core Domain APIs | 2-3 weeks |
| Phase 3 | Source Studies & Import | 1-2 weeks |
| Phase 4 | Results & Solver | 2-3 weeks |
| Phase 5 | Frontend Integration | 2-3 weeks |
| Phase 6 | Advanced Features | 2-3 weeks |
| **Total** | **Full Implementation** | **11-17 weeks** |

### Milestones

1. **M1 - API Foundation** (End of Phase 1)
   - API running with authentication
   - Database schema complete

2. **M2 - Core Features** (End of Phase 2)
   - Full CRUD operations working
   - Swagger documentation complete

3. **M3 - Data Import** (End of Phase 3)
   - Excel import working
   - Source study management complete

4. **M4 - Solver Ready** (End of Phase 4)
   - Solver integration complete
   - Results storage and export working

5. **M5 - MVP Release** (End of Phase 5)
   - Frontend fully integrated
   - Authentication working end-to-end

6. **M6 - Production Release** (End of Phase 6)
   - All advanced features complete
   - Production deployment ready

---

## Appendix

### A. Project Structure - Backend

```
ExpansionPlanner/
├── src/
│   ├── ExpansionPlanner.Api/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Filters/
│   │   └── Program.cs
│   ├── ExpansionPlanner.Application/
│   │   ├── Services/
│   │   ├── DTOs/
│   │   ├── Validators/
│   │   ├── Mappings/
│   │   └── Interfaces/
│   ├── ExpansionPlanner.Domain/
│   │   ├── Entities/
│   │   ├── Enums/
│   │   └── ValueObjects/
│   └── ExpansionPlanner.Infrastructure/
│       ├── Data/
│       │   ├── DbContext.cs
│       │   ├── Repositories/
│       │   └── Migrations/
│       ├── Identity/
│       └── Services/
├── tests/
│   ├── ExpansionPlanner.UnitTests/
│   └── ExpansionPlanner.IntegrationTests/
└── ExpansionPlanner.sln
```

### B. Environment Variables

```env
# Database
ConnectionStrings__DefaultConnection=Server=localhost;Database=ExpansionPlanner;Trusted_Connection=True;

# JWT
Jwt__Secret=your-256-bit-secret-key-here
Jwt__Issuer=ExpansionPlanner
Jwt__Audience=ExpansionPlannerClients
Jwt__ExpirationMinutes=60

# Azure Storage (for file uploads)
AzureStorage__ConnectionString=your-connection-string
AzureStorage__ContainerName=uploads

# Solver Service
Solver__BaseUrl=https://solver-service.com/api
Solver__ApiKey=your-api-key

# Logging
Serilog__MinimumLevel=Information
```

### C. Glossary

| Term | Definition |
|------|------------|
| **Expansion Plan** | A planning scenario for adding/retiring generation units |
| **Candidate** | A potential unit addition or retirement in a plan |
| **Source Study** | Base case data imported from Excel |
| **Build Cycle** | An iteration of the expansion optimization solver |
| **LOLE** | Loss of Load Expectation - reliability metric |
| **EUE** | Expected Unserved Energy - reliability metric |
| **NPV** | Net Present Value - economic calculation basis |

---

*Document Version: 1.0*
*Last Updated: January 2025*
*Author: Development Team*
