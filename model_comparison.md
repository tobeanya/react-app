# Architecture Comparison: Full-Stack vs Frontend Data Access Layer

This document compares two software architecture approaches and explains when to use each. Written for beginners with detailed explanations of all technical terms.

---

## Table of Contents

1. [Introduction to Software Architecture](#introduction-to-software-architecture)
2. [Glossary of Terms](#glossary-of-terms)
3. [Approach 1: Traditional Full-Stack Architecture](#approach-1-traditional-full-stack-architecture)
4. [Approach 2: Frontend Data Access Layer Architecture](#approach-2-frontend-data-access-layer-architecture)
5. [Side-by-Side Comparison](#side-by-side-comparison)
6. [When to Use Each Approach](#when-to-use-each-approach)
7. [The Hybrid Approach (Recommended)](#the-hybrid-approach-recommended)
8. [Implementation Guide for Hybrid Approach](#implementation-guide-for-hybrid-approach)

---

## Introduction to Software Architecture

### What is Software Architecture?

Software architecture is like a blueprint for building a house. Before construction begins, an architect creates plans that show:
- Where each room will be located
- How rooms connect to each other
- Where plumbing and electrical systems will run
- What materials will be used

Similarly, software architecture defines:
- How code is organized into folders and files
- How different parts of the application communicate
- Where data is stored and how it flows through the system
- What technologies and patterns are used

### Why Does Architecture Matter?

Good architecture provides:

1. **Maintainability**: Easy to fix bugs and add features later
2. **Scalability**: Can handle more users and data as the application grows
3. **Testability**: Can verify code works correctly through automated tests
4. **Team Collaboration**: Multiple developers can work without stepping on each other's toes
5. **Flexibility**: Can swap out technologies without rewriting everything

### The Two Approaches We'll Compare

| Approach | Description |
|----------|-------------|
| **Traditional Full-Stack** | Business logic lives on the server (backend), frontend is simple |
| **Frontend Data Access Layer** | Business logic distributed across frontend layers with abstractions |

---

## Glossary of Terms

Before diving into the architectures, let's understand the terminology.

### General Terms

#### Frontend
The part of the application users see and interact with. This runs in the user's web browser or device.

**Example**: The buttons you click, forms you fill out, and data you see on screen.

**Technologies**: React, Angular, Vue.js, HTML, CSS, JavaScript

#### Backend
The part of the application that runs on a server. Users never see this directly. It handles data storage, security, and business rules.

**Example**: When you click "Submit Order", the backend processes the payment, updates inventory, and sends confirmation emails.

**Technologies**: ASP.NET Core, Node.js, Python/Django, Java/Spring

#### API (Application Programming Interface)
A set of rules that allows the frontend to communicate with the backend. Think of it as a waiter in a restaurant - you (frontend) tell the waiter (API) what you want, and the waiter brings food from the kitchen (backend).

**Example**:
```
Frontend: "GET /api/users/123"
Backend responds: { "id": 123, "name": "John", "email": "john@example.com" }
```

#### Database
A system for storing and organizing data permanently. Like a giant, organized filing cabinet that can quickly find any document.

**Example**: SQL Server, PostgreSQL, MySQL, MongoDB

#### CRUD Operations
The four basic operations for managing data:
- **C**reate - Add new records (e.g., register a new user)
- **R**ead - Retrieve existing records (e.g., view user profile)
- **U**pdate - Modify existing records (e.g., change password)
- **D**elete - Remove records (e.g., delete account)

---

### Backend-Specific Terms

#### Controller
A class that receives incoming requests from the frontend and returns responses. It's the "traffic cop" that directs requests to the right place.

**Example**:
```csharp
// ASP.NET Core Controller
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    [HttpGet("{id}")]
    public User GetUser(int id)
    {
        // Handle GET /api/users/123
        return _userService.GetById(id);
    }
}
```

#### Entity / Model
A class that represents a real-world thing in your application. It defines what data fields exist.

**Example**:
```csharp
// A User entity
public class User
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

#### Database Context (DbContext)
In Entity Framework (Microsoft's database tool), this is the class that manages the connection between your code and the database. It's like a translator that converts C# objects to database records and vice versa.

**Example**:
```csharp
public class AppDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Order> Orders { get; set; }
}
```

#### Stored Procedure
A pre-written SQL query saved in the database. Instead of writing SQL in your code, you call the stored procedure by name. Like having a chef's special recipe that the kitchen already knows how to make.

**Advantages**:
- Faster execution (pre-compiled)
- Security (prevents SQL injection)
- Reusable across applications

**Example**:
```sql
-- Stored Procedure in SQL Server
CREATE PROCEDURE GetUserById
    @UserId INT
AS
BEGIN
    SELECT Id, Name, Email, CreatedAt
    FROM Users
    WHERE Id = @UserId
END
```

#### ORM (Object-Relational Mapping)
A technique that lets you interact with a database using your programming language instead of SQL. The ORM translates your code to SQL automatically.

**Without ORM**:
```csharp
var sql = "SELECT * FROM Users WHERE Id = @id";
// Execute SQL, manually map results to User object
```

**With ORM (Entity Framework)**:
```csharp
var user = dbContext.Users.Find(id);
// Automatically generates SQL and maps to User object
```

---

### Frontend-Specific Terms

#### Component
A reusable piece of UI (User Interface). Like LEGO blocks that you can combine to build a complete interface.

**Example**:
```jsx
// A Button component
function Button({ label, onClick }) {
    return (
        <button onClick={onClick}>
            {label}
        </button>
    );
}

// Used multiple times
<Button label="Save" onClick={handleSave} />
<Button label="Cancel" onClick={handleCancel} />
```

#### Hook (React Hook)
A special function in React that lets you add features to components. Hooks start with "use" (like `useState`, `useEffect`).

**Common Hooks**:
- `useState` - Store and update data in a component
- `useEffect` - Run code when component loads or data changes
- `useCallback` - Optimize functions to prevent unnecessary re-renders
- `useMemo` - Optimize calculations to prevent recalculating on every render

**Example**:
```jsx
function Counter() {
    // useState hook stores the count value
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                Increment
            </button>
        </div>
    );
}
```

#### Custom Hook
A hook you create yourself to share logic between components. Like creating a custom LEGO block from smaller pieces.

**Example**:
```jsx
// Custom hook for fetching users
function useUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/users')
            .then(response => response.json())
            .then(data => {
                setUsers(data);
                setLoading(false);
            });
    }, []);

    return { users, loading };
}

// Used in any component
function UserList() {
    const { users, loading } = useUsers();

    if (loading) return <p>Loading...</p>;
    return <ul>{users.map(u => <li>{u.name}</li>)}</ul>;
}
```

#### State
Data that a component "remembers" and can change over time. When state changes, the component re-renders to show the new data.

**Example**:
- A checkbox's checked/unchecked status
- The items in a shopping cart
- Whether a modal is open or closed

#### Props (Properties)
Data passed from a parent component to a child component. Like handing a recipe card to someone - they can read it but shouldn't write on it.

**Example**:
```jsx
// Parent passes data via props
function Parent() {
    return <Child name="John" age={25} />;
}

// Child receives and uses props
function Child({ name, age }) {
    return <p>{name} is {age} years old</p>;
}
```

---

### Architecture Pattern Terms

#### Repository Pattern
A design pattern that separates data access logic from business logic. The repository acts as a middleman between your application and the data source.

**Without Repository**:
```typescript
// Data access mixed with UI logic
function UserComponent() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // UI component directly calls database
        fetch('/api/users').then(r => r.json()).then(setUsers);
    }, []);
}
```

**With Repository**:
```typescript
// Repository handles data access
class UserRepository {
    async getAll(): Promise<User[]> {
        const response = await fetch('/api/users');
        return response.json();
    }
}

// UI component uses repository
function UserComponent() {
    const userRepo = new UserRepository();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        userRepo.getAll().then(setUsers);
    }, []);
}
```

**Benefits**:
- Easy to swap data sources (API → local storage → mock data)
- Easier to test (can mock the repository)
- Cleaner code separation

#### Service Layer
A layer that contains business logic - the rules and calculations that make your application work. Services use repositories to get data, then apply business rules.

**Example**:
```typescript
class OrderService {
    constructor(private orderRepo: OrderRepository) {}

    async calculateTotal(orderId: string): Promise<number> {
        const order = await this.orderRepo.getById(orderId);

        // Business logic: calculate total with tax and discounts
        let total = order.items.reduce((sum, item) =>
            sum + (item.price * item.quantity), 0);

        // Apply 10% discount for orders over $100
        if (total > 100) {
            total = total * 0.9;
        }

        // Add 8% tax
        total = total * 1.08;

        return total;
    }
}
```

#### DTO (Data Transfer Object)
A simple object used to transfer data between layers or systems. DTOs don't have any logic - they just carry data.

**Why use DTOs?**
- The database model might have fields you don't want to expose (passwords, internal IDs)
- The frontend might need data in a different format
- API responses might use different naming conventions (snake_case vs camelCase)

**Example**:
```typescript
// Database Entity (internal)
interface UserEntity {
    user_id: number;
    user_name: string;
    password_hash: string;  // Don't expose this!
    created_at: Date;
}

// DTO (what API returns)
interface UserDTO {
    id: number;
    name: string;
    createdAt: string;
    // No password field - it's hidden
}
```

#### Mapper
A function or class that converts between different object types (like Entity to DTO or vice versa).

**Example**:
```typescript
class UserMapper {
    // Convert database entity to DTO
    static toDTO(entity: UserEntity): UserDTO {
        return {
            id: entity.user_id,
            name: entity.user_name,
            createdAt: entity.created_at.toISOString(),
        };
    }

    // Convert DTO to database entity
    static toEntity(dto: CreateUserDTO): Partial<UserEntity> {
        return {
            user_name: dto.name,
        };
    }
}
```

#### Dependency Injection (DI)
A technique where objects receive their dependencies from outside rather than creating them internally. Like a chef receiving ingredients instead of growing their own vegetables.

**Without DI**:
```typescript
class OrderService {
    private repo = new OrderRepository();  // Creates its own dependency

    // Hard to test - always uses real OrderRepository
}
```

**With DI**:
```typescript
class OrderService {
    constructor(private repo: IOrderRepository) {}  // Receives dependency

    // Easy to test - can pass a mock repository
}

// Production
const service = new OrderService(new OrderRepository());

// Testing
const service = new OrderService(new MockOrderRepository());
```

#### Interface
A contract that defines what methods a class must have, without defining how they work. Like a job description that lists required skills without saying how to do the job.

**Example**:
```typescript
// Interface (contract)
interface IUserRepository {
    getAll(): Promise<User[]>;
    getById(id: number): Promise<User | null>;
    create(user: User): Promise<User>;
}

// Implementation (how it's done)
class ApiUserRepository implements IUserRepository {
    async getAll() {
        return fetch('/api/users').then(r => r.json());
    }
    // ... other methods
}

// Different implementation (same interface)
class MockUserRepository implements IUserRepository {
    private users = [{ id: 1, name: 'Test User' }];

    async getAll() {
        return this.users;
    }
    // ... other methods
}
```

#### Separation of Concerns (SoC)
A design principle where each part of the code has one specific job. Like a restaurant where chefs cook, servers deliver food, and cashiers handle payment - each focuses on their specialty.

**Bad (everything mixed together)**:
```typescript
function UserPage() {
    // Data fetching
    // Business logic calculations
    // Form validation
    // UI rendering
    // Error handling
    // All in one 500-line function!
}
```

**Good (separated)**:
```typescript
// Data fetching - useUsers hook
// Business logic - UserService
// Form validation - validateUser function
// UI rendering - UserPage component
// Error handling - ErrorBoundary component
```

---

## Approach 1: Traditional Full-Stack Architecture

### Overview

This approach puts most logic on the server (backend). The frontend is relatively simple - it just displays data and sends user actions to the backend.

### Folder Structure

```
full_stack_app/
├── api/                          # Backend (ASP.NET Core)
│   ├── Controllers/              # Receive requests, return responses
│   │   ├── UsersController.cs
│   │   ├── OrdersController.cs
│   │   └── ProductsController.cs
│   │
│   ├── Models/                   # Data structures (entities)
│   │   ├── User.cs
│   │   ├── Order.cs
│   │   └── Product.cs
│   │
│   ├── Data/                     # Database connection
│   │   └── AppDbContext.cs
│   │
│   ├── StoredProcedures/         # SQL scripts
│   │   ├── GetUserById.sql
│   │   ├── CreateOrder.sql
│   │   └── CalculateOrderTotal.sql
│   │
│   └── Program.cs                # Application startup
│
├── client/                       # Frontend (React)
│   ├── src/
│   │   ├── components/           # UI pieces
│   │   │   ├── UserList.jsx
│   │   │   ├── OrderForm.jsx
│   │   │   └── ProductCard.jsx
│   │   │
│   │   ├── services/             # API calls
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx               # Main component
│   │   └── main.jsx              # Entry point
│   │
│   └── vite.config.js            # Build configuration
│
└── docs/                         # Documentation
```

### How It Works

#### Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER INTERACTION                           │
│                     (Clicks button, fills form)                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         REACT COMPONENT                              │
│                    (Captures user action)                            │
│                                                                      │
│   function OrderForm() {                                             │
│       const handleSubmit = async () => {                             │
│           await api.post('/orders', orderData);                      │
│       };                                                             │
│   }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API SERVICE                                 │
│                    (Sends HTTP request)                              │
│                                                                      │
│   // services/api.js                                                 │
│   export const api = {                                               │
│       post: (url, data) => fetch(url, {                              │
│           method: 'POST',                                            │
│           body: JSON.stringify(data)                                 │
│       })                                                             │
│   };                                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                          HTTP Request over Network
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         ASP.NET CONTROLLER                           │
│                    (Receives request, calls SP)                      │
│                                                                      │
│   [HttpPost]                                                         │
│   public async Task<Order> CreateOrder(OrderRequest request) {       │
│       return await _context.Database                                 │
│           .ExecuteSqlRawAsync("EXEC CreateOrder @params");           │
│   }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        STORED PROCEDURE                              │
│              (Contains business logic and data access)               │
│                                                                      │
│   CREATE PROCEDURE CreateOrder                                       │
│       @CustomerId INT,                                               │
│       @ProductId INT,                                                │
│       @Quantity INT                                                  │
│   AS BEGIN                                                           │
│       -- Validate inventory                                          │
│       -- Calculate price with discounts                              │
│       -- Insert order record                                         │
│       -- Update inventory                                            │
│       -- Return created order                                        │
│   END                                                                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           DATABASE                                   │
│                    (Stores data permanently)                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Code Examples

#### Backend Controller

```csharp
// api/Controllers/UsersController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Constructor - receives database context via DI
        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/users
        // Returns all users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET /api/users/5
        // Returns specific user by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            // Call stored procedure
            var user = await _context.Users
                .FromSqlRaw("EXEC GetUserById @UserId = {0}", id)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();  // Returns 404 status
            }

            return user;
        }

        // POST /api/users
        // Creates a new user
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            // Simple validation
            if (string.IsNullOrEmpty(user.Name))
            {
                return BadRequest("Name is required");
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Returns 201 Created with the new user
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }
    }
}
```

#### Backend Stored Procedure

```sql
-- api/StoredProcedures/CreateOrder.sql

CREATE PROCEDURE CreateOrder
    @CustomerId INT,
    @ProductId INT,
    @Quantity INT
AS
BEGIN
    -- Start transaction (all-or-nothing operation)
    BEGIN TRANSACTION;

    BEGIN TRY
        -- Step 1: Check if product exists and has enough inventory
        DECLARE @CurrentStock INT;
        DECLARE @Price DECIMAL(10,2);

        SELECT @CurrentStock = StockQuantity, @Price = Price
        FROM Products
        WHERE Id = @ProductId;

        IF @CurrentStock IS NULL
        BEGIN
            RAISERROR('Product not found', 16, 1);
            RETURN;
        END

        IF @CurrentStock < @Quantity
        BEGIN
            RAISERROR('Insufficient inventory', 16, 1);
            RETURN;
        END

        -- Step 2: Calculate total with business rules
        DECLARE @Subtotal DECIMAL(10,2) = @Price * @Quantity;
        DECLARE @Discount DECIMAL(10,2) = 0;
        DECLARE @Tax DECIMAL(10,2);
        DECLARE @Total DECIMAL(10,2);

        -- Apply 10% discount for orders over $100
        IF @Subtotal > 100
            SET @Discount = @Subtotal * 0.10;

        -- Calculate 8% tax
        SET @Tax = (@Subtotal - @Discount) * 0.08;
        SET @Total = @Subtotal - @Discount + @Tax;

        -- Step 3: Create the order
        INSERT INTO Orders (CustomerId, ProductId, Quantity, Subtotal, Discount, Tax, Total, CreatedAt)
        VALUES (@CustomerId, @ProductId, @Quantity, @Subtotal, @Discount, @Tax, @Total, GETDATE());

        DECLARE @OrderId INT = SCOPE_IDENTITY();

        -- Step 4: Update inventory
        UPDATE Products
        SET StockQuantity = StockQuantity - @Quantity
        WHERE Id = @ProductId;

        -- Commit transaction
        COMMIT TRANSACTION;

        -- Return the created order
        SELECT * FROM Orders WHERE Id = @OrderId;

    END TRY
    BEGIN CATCH
        -- Something went wrong - undo all changes
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
```

#### Frontend API Service

```javascript
// client/src/services/api.js

// Base URL for all API calls
const BASE_URL = 'https://localhost:5001/api';

// Helper function to handle responses
async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `HTTP error: ${response.status}`);
    }
    return response.json();
}

// API client object with methods for each HTTP verb
export const api = {
    // GET request - retrieve data
    get: async (endpoint) => {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        return handleResponse(response);
    },

    // POST request - create new data
    post: async (endpoint, data) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // PUT request - update existing data
    put: async (endpoint, data) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // DELETE request - remove data
    delete: async (endpoint) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    },
};
```

#### Frontend Component

```jsx
// client/src/components/UserList.jsx
import { useState, useEffect } from 'react';
import { api } from '../services/api';

function UserList() {
    // State for storing users
    const [users, setUsers] = useState([]);
    // State for loading indicator
    const [loading, setLoading] = useState(true);
    // State for error messages
    const [error, setError] = useState(null);

    // Fetch users when component loads
    useEffect(() => {
        async function fetchUsers() {
            try {
                const data = await api.get('/users');
                setUsers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, []);  // Empty array = run once on mount

    // Render loading state
    if (loading) {
        return <p>Loading users...</p>;
    }

    // Render error state
    if (error) {
        return <p>Error: {error}</p>;
    }

    // Render users
    return (
        <div>
            <h1>Users</h1>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        {user.name} - {user.email}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UserList;
```

### Advantages of Traditional Full-Stack

| Advantage | Explanation |
|-----------|-------------|
| **Simpler Frontend** | React components just display data and call APIs. Less code to maintain. |
| **Centralized Logic** | All business rules in one place (stored procedures). Easy to understand flow. |
| **Security** | Sensitive logic runs on server, not exposed to browser. |
| **Performance** | Stored procedures are pre-compiled and optimized by database. |
| **Transaction Support** | Database handles complex operations atomically (all succeed or all fail). |
| **Team Familiarity** | Traditional pattern most developers already know. |

### Disadvantages of Traditional Full-Stack

| Disadvantage | Explanation |
|--------------|-------------|
| **Difficult to Test** | Stored procedures require database to test. Can't easily mock. |
| **Vendor Lock-in** | SQL syntax varies between databases. Hard to switch from SQL Server to PostgreSQL. |
| **Versioning Challenges** | Database changes require migrations. Hard to roll back. |
| **Limited Reusability** | Stored procedure logic can't be shared with mobile apps or other frontends. |
| **Debugging Difficulty** | Errors in stored procedures harder to trace than code errors. |
| **Offline Not Possible** | Frontend completely depends on backend being available. |

---

## Approach 2: Frontend Data Access Layer Architecture

### Overview

This approach creates multiple layers of abstraction in the frontend. Each layer has a specific job, making the code more modular and testable.

### Folder Structure

```
src/
├── models/                       # Pure data structures
│   ├── User.ts                   # User interface
│   ├── Order.ts                  # Order interface
│   ├── Product.ts                # Product interface
│   └── index.ts                  # Export all models
│
├── data/
│   ├── repositories/             # Data access abstraction
│   │   ├── interfaces/           # Contracts (what methods exist)
│   │   │   ├── IUserRepository.ts
│   │   │   ├── IOrderRepository.ts
│   │   │   └── IProductRepository.ts
│   │   │
│   │   ├── UserRepository.ts     # Implementation
│   │   ├── OrderRepository.ts
│   │   └── ProductRepository.ts
│   │
│   ├── sources/                  # Where data actually comes from
│   │   ├── local/                # Mock/local data
│   │   │   ├── LocalUserDataSource.ts
│   │   │   └── seedData.ts
│   │   │
│   │   ├── api/                  # Real API calls
│   │   │   ├── ApiUserDataSource.ts
│   │   │   └── ApiClient.ts
│   │   │
│   │   └── db/                   # Direct database (SQLite, etc.)
│   │       └── DbUserDataSource.ts
│   │
│   └── mappers/                  # Transform between formats
│       ├── UserMapper.ts
│       └── OrderMapper.ts
│
├── services/                     # Business logic
│   ├── UserService.ts
│   ├── OrderService.ts
│   └── ProductService.ts
│
├── hooks/                        # React state management
│   ├── useUsers.ts
│   ├── useOrders.ts
│   └── useProducts.ts
│
├── types/                        # Shared types and constants
│   └── index.ts
│
└── pages/                        # UI components
    ├── UserListPage.tsx
    ├── OrderFormPage.tsx
    └── ProductDetailPage.tsx
```

### How It Works

#### Layer Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                              UI LAYER                                │
│                        (React Components)                            │
│                                                                      │
│   What it does:                                                      │
│   - Renders user interface                                           │
│   - Handles user interactions                                        │
│   - Displays loading/error states                                    │
│                                                                      │
│   What it DOESN'T do:                                                │
│   - Fetch data directly                                              │
│   - Contain business logic                                           │
│   - Know where data comes from                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                              Uses hooks
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            HOOKS LAYER                               │
│                    (React Custom Hooks)                              │
│                                                                      │
│   What it does:                                                      │
│   - Manages React state (loading, error, data)                       │
│   - Calls services to get/update data                                │
│   - Provides clean API to components                                 │
│                                                                      │
│   What it DOESN'T do:                                                │
│   - Contain business logic                                           │
│   - Know about data sources                                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                             Uses services
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          SERVICE LAYER                               │
│                      (Business Logic)                                │
│                                                                      │
│   What it does:                                                      │
│   - Implements business rules                                        │
│   - Validates data                                                   │
│   - Orchestrates multiple repository calls                           │
│   - Calculates derived values                                        │
│                                                                      │
│   What it DOESN'T do:                                                │
│   - Know about React                                                 │
│   - Know about specific data sources                                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                           Uses repositories
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        REPOSITORY LAYER                              │
│                    (Data Access Abstraction)                         │
│                                                                      │
│   What it does:                                                      │
│   - Defines standard methods (getAll, getById, create, etc.)         │
│   - Delegates to data sources                                        │
│   - Can switch between data sources                                  │
│                                                                      │
│   What it DOESN'T do:                                                │
│   - Contain business logic                                           │
│   - Know about UI or React                                           │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                          Uses data sources
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATA SOURCE LAYER                              │
│               (Actual Data Fetching/Storage)                         │
│                                                                      │
│   Options:                                                           │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│   │   Local     │  │    API      │  │  Database   │                 │
│   │  (Mock)     │  │   (REST)    │  │  (SQLite)   │                 │
│   └─────────────┘  └─────────────┘  └─────────────┘                 │
│                                                                      │
│   What it does:                                                      │
│   - Actually fetches or stores data                                  │
│   - Handles network requests                                         │
│   - Manages local storage                                            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         MAPPER LAYER                                 │
│              (Data Transformation)                                   │
│                                                                      │
│   What it does:                                                      │
│   - Converts API response format to app format                       │
│   - Handles naming convention differences                            │
│   - Filters out sensitive fields                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Code Examples

#### Model (Pure Data Structure)

```typescript
// src/models/User.ts

// Interface defines the shape of a User object
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'guest';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Type for creating a new user (no id yet)
export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

// Type for updating a user (all fields optional except id)
export type UpdateUserInput = Partial<User> & { id: number };

// Factory function to create a User with defaults
export function createUser(input: Partial<User>): User {
    return {
        id: 0,
        name: '',
        email: '',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...input,
    };
}
```

#### Repository Interface (Contract)

```typescript
// src/data/repositories/interfaces/IUserRepository.ts
import { User, CreateUserInput, UpdateUserInput } from '../../../models/User';

/**
 * IUserRepository defines WHAT operations are available for users.
 * It does NOT define HOW they are implemented.
 *
 * Any class that implements this interface MUST provide these methods.
 * This allows us to swap implementations (API vs Local vs Mock).
 */
export interface IUserRepository {
    /**
     * Get all users
     * @returns Promise that resolves to array of Users
     */
    getAll(): Promise<User[]>;

    /**
     * Get a single user by ID
     * @param id - The user's unique identifier
     * @returns Promise that resolves to User or null if not found
     */
    getById(id: number): Promise<User | null>;

    /**
     * Search users by criteria
     * @param criteria - Object with optional filter fields
     * @returns Promise that resolves to matching Users
     */
    search(criteria: Partial<User>): Promise<User[]>;

    /**
     * Create a new user
     * @param input - The user data (without id)
     * @returns Promise that resolves to the created User (with id)
     */
    create(input: CreateUserInput): Promise<User>;

    /**
     * Update an existing user
     * @param input - The fields to update (must include id)
     * @returns Promise that resolves to the updated User
     */
    update(input: UpdateUserInput): Promise<User>;

    /**
     * Delete a user
     * @param id - The user's unique identifier
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
}
```

#### Repository Implementation

```typescript
// src/data/repositories/UserRepository.ts
import { IUserRepository } from './interfaces/IUserRepository';
import { User, CreateUserInput, UpdateUserInput } from '../../models/User';
import { LocalUserDataSource } from '../sources/local/LocalUserDataSource';
import { ApiUserDataSource } from '../sources/api/ApiUserDataSource';

/**
 * UserRepository implements the IUserRepository interface.
 * It delegates actual data operations to a data source.
 *
 * This class doesn't know or care WHERE the data comes from.
 * You can swap LocalUserDataSource for ApiUserDataSource
 * without changing any code that uses UserRepository.
 */
export class UserRepository implements IUserRepository {
    private dataSource: LocalUserDataSource | ApiUserDataSource;

    constructor(dataSource?: LocalUserDataSource | ApiUserDataSource) {
        // Default to local data source if none provided
        this.dataSource = dataSource ?? new LocalUserDataSource();
    }

    async getAll(): Promise<User[]> {
        return this.dataSource.fetchAll();
    }

    async getById(id: number): Promise<User | null> {
        return this.dataSource.fetchById(id);
    }

    async search(criteria: Partial<User>): Promise<User[]> {
        const allUsers = await this.dataSource.fetchAll();

        // Filter users based on criteria
        return allUsers.filter(user => {
            for (const [key, value] of Object.entries(criteria)) {
                if (user[key as keyof User] !== value) {
                    return false;
                }
            }
            return true;
        });
    }

    async create(input: CreateUserInput): Promise<User> {
        return this.dataSource.create(input);
    }

    async update(input: UpdateUserInput): Promise<User> {
        return this.dataSource.update(input);
    }

    async delete(id: number): Promise<void> {
        return this.dataSource.delete(id);
    }
}
```

#### Data Source - Local (Mock Data)

```typescript
// src/data/sources/local/LocalUserDataSource.ts
import { User, CreateUserInput, UpdateUserInput } from '../../../models/User';
import { SEED_USERS } from './seedData';

/**
 * LocalUserDataSource stores data in memory.
 * Useful for:
 * - Development without a backend
 * - Testing
 * - Demos
 *
 * Data is lost when the page refreshes!
 */
export class LocalUserDataSource {
    // Start with seed data
    private users: User[] = [...SEED_USERS];
    // Track next available ID
    private nextId: number = Math.max(...SEED_USERS.map(u => u.id)) + 1;

    /**
     * Simulate async operation with a small delay.
     * Real APIs have network latency, so this makes
     * local behavior more realistic.
     */
    private async simulateDelay(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, 100));
    }

    async fetchAll(): Promise<User[]> {
        await this.simulateDelay();
        // Return a copy to prevent external mutations
        return [...this.users];
    }

    async fetchById(id: number): Promise<User | null> {
        await this.simulateDelay();
        const user = this.users.find(u => u.id === id);
        // Return a copy or null
        return user ? { ...user } : null;
    }

    async create(input: CreateUserInput): Promise<User> {
        await this.simulateDelay();

        // Create new user with generated ID and timestamps
        const newUser: User = {
            ...input,
            id: this.nextId++,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.users.push(newUser);
        return { ...newUser };
    }

    async update(input: UpdateUserInput): Promise<User> {
        await this.simulateDelay();

        const index = this.users.findIndex(u => u.id === input.id);
        if (index === -1) {
            throw new Error(`User with id ${input.id} not found`);
        }

        // Merge existing user with updates
        const updatedUser: User = {
            ...this.users[index],
            ...input,
            updatedAt: new Date(),
        };

        this.users[index] = updatedUser;
        return { ...updatedUser };
    }

    async delete(id: number): Promise<void> {
        await this.simulateDelay();

        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
            this.users.splice(index, 1);
        }
    }
}
```

#### Data Source - API (Real Backend)

```typescript
// src/data/sources/api/ApiUserDataSource.ts
import { User, CreateUserInput, UpdateUserInput } from '../../../models/User';
import { UserMapper } from '../../mappers/UserMapper';

// What the API returns (might be different from our model)
interface UserDTO {
    user_id: number;
    user_name: string;
    user_email: string;
    user_role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * ApiUserDataSource fetches data from a real API.
 * It handles:
 * - HTTP requests
 * - Response parsing
 * - Data transformation (API format → App format)
 * - Error handling
 */
export class ApiUserDataSource {
    private baseUrl: string;
    private headers: HeadersInit;

    constructor(baseUrl: string, authToken?: string) {
        this.baseUrl = baseUrl;
        this.headers = {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        };
    }

    /**
     * Generic request handler with error handling
     */
    private async request<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: this.headers,
            ...options,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(
                `API Error ${response.status}: ${errorBody || response.statusText}`
            );
        }

        return response.json();
    }

    async fetchAll(): Promise<User[]> {
        // Get DTOs from API
        const dtos = await this.request<UserDTO[]>('/users');
        // Transform each DTO to our model format
        return dtos.map(dto => UserMapper.toDomain(dto));
    }

    async fetchById(id: number): Promise<User | null> {
        try {
            const dto = await this.request<UserDTO>(`/users/${id}`);
            return UserMapper.toDomain(dto);
        } catch (error) {
            // If 404, return null instead of throwing
            if (error instanceof Error && error.message.includes('404')) {
                return null;
            }
            throw error;
        }
    }

    async create(input: CreateUserInput): Promise<User> {
        // Transform our format to API format
        const dto = UserMapper.toCreateDTO(input);

        // Send to API
        const responseDto = await this.request<UserDTO>('/users', {
            method: 'POST',
            body: JSON.stringify(dto),
        });

        // Transform response back to our format
        return UserMapper.toDomain(responseDto);
    }

    async update(input: UpdateUserInput): Promise<User> {
        const dto = UserMapper.toUpdateDTO(input);

        const responseDto = await this.request<UserDTO>(`/users/${input.id}`, {
            method: 'PUT',
            body: JSON.stringify(dto),
        });

        return UserMapper.toDomain(responseDto);
    }

    async delete(id: number): Promise<void> {
        await this.request(`/users/${id}`, {
            method: 'DELETE',
        });
    }
}
```

#### Mapper (Data Transformation)

```typescript
// src/data/mappers/UserMapper.ts
import { User, CreateUserInput, UpdateUserInput } from '../../models/User';

// API Data Transfer Object format
interface UserDTO {
    user_id: number;
    user_name: string;
    user_email: string;
    user_role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface CreateUserDTO {
    user_name: string;
    user_email: string;
    user_role: string;
    is_active: boolean;
}

interface UpdateUserDTO {
    user_id: number;
    user_name?: string;
    user_email?: string;
    user_role?: string;
    is_active?: boolean;
}

/**
 * UserMapper transforms data between formats.
 *
 * Why is this needed?
 * 1. API uses snake_case, our app uses camelCase
 * 2. API returns dates as strings, we want Date objects
 * 3. API might have extra fields we don't need
 * 4. We might combine data from multiple API calls
 */
export class UserMapper {
    /**
     * Transform API format → App format
     */
    static toDomain(dto: UserDTO): User {
        return {
            id: dto.user_id,
            name: dto.user_name,
            email: dto.user_email,
            role: dto.user_role as User['role'],
            isActive: dto.is_active,
            createdAt: new Date(dto.created_at),
            updatedAt: new Date(dto.updated_at),
        };
    }

    /**
     * Transform App format → API format (for creating)
     */
    static toCreateDTO(input: CreateUserInput): CreateUserDTO {
        return {
            user_name: input.name,
            user_email: input.email,
            user_role: input.role,
            is_active: input.isActive,
        };
    }

    /**
     * Transform App format → API format (for updating)
     */
    static toUpdateDTO(input: UpdateUserInput): UpdateUserDTO {
        const dto: UpdateUserDTO = {
            user_id: input.id,
        };

        // Only include fields that are being updated
        if (input.name !== undefined) dto.user_name = input.name;
        if (input.email !== undefined) dto.user_email = input.email;
        if (input.role !== undefined) dto.user_role = input.role;
        if (input.isActive !== undefined) dto.is_active = input.isActive;

        return dto;
    }

    /**
     * Transform multiple DTOs
     */
    static toDomainList(dtos: UserDTO[]): User[] {
        return dtos.map(dto => this.toDomain(dto));
    }
}
```

#### Service (Business Logic)

```typescript
// src/services/UserService.ts
import { IUserRepository } from '../data/repositories/interfaces/IUserRepository';
import { User, CreateUserInput, UpdateUserInput } from '../models/User';

/**
 * UserService contains business logic for user operations.
 *
 * Business logic = rules that define HOW your business works.
 * Examples:
 * - "Admins can only be created by other admins"
 * - "Users must verify email before becoming active"
 * - "Usernames must be unique"
 */
export class UserService {
    constructor(private userRepo: IUserRepository) {}

    /**
     * Get all active users
     * Business rule: Inactive users are usually hidden from listings
     */
    async getActiveUsers(): Promise<User[]> {
        const allUsers = await this.userRepo.getAll();
        return allUsers.filter(user => user.isActive);
    }

    /**
     * Get all admin users
     */
    async getAdmins(): Promise<User[]> {
        return this.userRepo.search({ role: 'admin' });
    }

    /**
     * Get user by ID with validation
     */
    async getUserById(id: number): Promise<User> {
        const user = await this.userRepo.getById(id);

        if (!user) {
            throw new Error(`User with id ${id} not found`);
        }

        return user;
    }

    /**
     * Create a new user with business validation
     */
    async createUser(input: CreateUserInput): Promise<User> {
        // Business validation rules
        this.validateUserInput(input);

        // Check for duplicate email
        const existingUsers = await this.userRepo.search({ email: input.email });
        if (existingUsers.length > 0) {
            throw new Error('A user with this email already exists');
        }

        // Business rule: New users start as inactive until email verified
        const userToCreate: CreateUserInput = {
            ...input,
            isActive: false,  // Override to false
        };

        return this.userRepo.create(userToCreate);
    }

    /**
     * Update user with validation
     */
    async updateUser(input: UpdateUserInput): Promise<User> {
        // Verify user exists
        await this.getUserById(input.id);

        // Validate fields being updated
        if (input.email) {
            this.validateEmail(input.email);

            // Check if new email is already taken by another user
            const existingUsers = await this.userRepo.search({ email: input.email });
            const takenByOther = existingUsers.some(u => u.id !== input.id);
            if (takenByOther) {
                throw new Error('This email is already in use');
            }
        }

        if (input.name) {
            this.validateName(input.name);
        }

        return this.userRepo.update(input);
    }

    /**
     * Deactivate user instead of deleting
     * Business rule: We don't actually delete users, we deactivate them
     * This preserves historical data and allows reactivation
     */
    async deactivateUser(id: number): Promise<User> {
        return this.userRepo.update({ id, isActive: false });
    }

    /**
     * Hard delete user (admin only operation)
     * Business rule: Only for GDPR compliance requests
     */
    async permanentlyDeleteUser(id: number, requestedByAdminId: number): Promise<void> {
        // Verify requester is an admin
        const admin = await this.getUserById(requestedByAdminId);
        if (admin.role !== 'admin') {
            throw new Error('Only admins can permanently delete users');
        }

        // Verify target user exists
        await this.getUserById(id);

        // Prevent deleting yourself
        if (id === requestedByAdminId) {
            throw new Error('You cannot delete your own account');
        }

        await this.userRepo.delete(id);
    }

    /**
     * Promote user to admin
     * Business rule: Only existing admins can promote others
     */
    async promoteToAdmin(userId: number, promotedByAdminId: number): Promise<User> {
        const admin = await this.getUserById(promotedByAdminId);
        if (admin.role !== 'admin') {
            throw new Error('Only admins can promote users');
        }

        return this.userRepo.update({ id: userId, role: 'admin' });
    }

    // ==================== Private Validation Methods ====================

    private validateUserInput(input: CreateUserInput): void {
        this.validateName(input.name);
        this.validateEmail(input.email);
    }

    private validateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new Error('Name is required');
        }
        if (name.length < 2) {
            throw new Error('Name must be at least 2 characters');
        }
        if (name.length > 100) {
            throw new Error('Name must be less than 100 characters');
        }
    }

    private validateEmail(email: string): void {
        if (!email || email.trim().length === 0) {
            throw new Error('Email is required');
        }

        // Simple email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
    }
}
```

#### Hook (React Integration)

```typescript
// src/hooks/useUsers.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { User, CreateUserInput, UpdateUserInput } from '../models/User';
import { UserService } from '../services/UserService';
import { UserRepository } from '../data/repositories/UserRepository';

/**
 * Return type for the useUsers hook.
 * Defines everything the hook provides to components.
 */
interface UseUsersReturn {
    // Data
    users: User[];

    // Loading and error states
    loading: boolean;
    error: Error | null;

    // Actions
    createUser: (input: CreateUserInput) => Promise<User>;
    updateUser: (input: UpdateUserInput) => Promise<User>;
    deactivateUser: (id: number) => Promise<void>;

    // Utilities
    getUserById: (id: number) => User | undefined;
    refresh: () => Promise<void>;
}

/**
 * useUsers hook provides user data and operations to React components.
 *
 * This hook:
 * - Manages loading and error states
 * - Caches user data in component state
 * - Provides methods to create, update, delete users
 * - Automatically refreshes data after mutations
 *
 * Components using this hook don't need to know about:
 * - How data is fetched
 * - Where data comes from
 * - How business rules are enforced
 */
export function useUsers(): UseUsersReturn {
    // ==================== State ====================

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // ==================== Services ====================

    // Create service instance once (memoized)
    const userService = useMemo(() => {
        const repository = new UserRepository();
        return new UserService(repository);
    }, []);

    // ==================== Data Fetching ====================

    /**
     * Fetch all active users from the service
     */
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await userService.getActiveUsers();
            setUsers(data);

        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch users');
            setError(error);
            console.error('Error fetching users:', error);

        } finally {
            setLoading(false);
        }
    }, [userService]);

    // Fetch users on mount
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // ==================== Actions ====================

    /**
     * Create a new user
     */
    const createUser = useCallback(async (input: CreateUserInput): Promise<User> => {
        const newUser = await userService.createUser(input);

        // Refresh the list to include the new user
        await fetchUsers();

        return newUser;
    }, [userService, fetchUsers]);

    /**
     * Update an existing user
     */
    const updateUser = useCallback(async (input: UpdateUserInput): Promise<User> => {
        const updatedUser = await userService.updateUser(input);

        // Update local state immediately for better UX
        setUsers(currentUsers =>
            currentUsers.map(user =>
                user.id === updatedUser.id ? updatedUser : user
            )
        );

        return updatedUser;
    }, [userService]);

    /**
     * Deactivate a user (soft delete)
     */
    const deactivateUser = useCallback(async (id: number): Promise<void> => {
        await userService.deactivateUser(id);

        // Remove from local state since we only show active users
        setUsers(currentUsers =>
            currentUsers.filter(user => user.id !== id)
        );
    }, [userService]);

    // ==================== Utilities ====================

    /**
     * Find a user by ID from the cached data
     */
    const getUserById = useCallback((id: number): User | undefined => {
        return users.find(user => user.id === id);
    }, [users]);

    // ==================== Return ====================

    return {
        users,
        loading,
        error,
        createUser,
        updateUser,
        deactivateUser,
        getUserById,
        refresh: fetchUsers,
    };
}
```

#### Component Using Hook

```tsx
// src/pages/UserListPage.tsx
import React, { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { CreateUserInput } from '../models/User';

/**
 * UserListPage displays a list of users and allows CRUD operations.
 *
 * Notice how simple this component is!
 * - No fetch logic
 * - No error handling logic
 * - No business validation
 *
 * All that complexity is hidden in the useUsers hook.
 */
function UserListPage() {
    // Get everything we need from the hook
    const {
        users,
        loading,
        error,
        createUser,
        deactivateUser,
        refresh
    } = useUsers();

    // Local state for the "add user" form
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [formError, setFormError] = useState<string | null>(null);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        try {
            const input: CreateUserInput = {
                name: formData.name,
                email: formData.email,
                role: 'user',
                isActive: true,
            };

            await createUser(input);

            // Reset form on success
            setFormData({ name: '', email: '' });
            setShowForm(false);

        } catch (err) {
            // Show error from service (e.g., "Email already exists")
            setFormError(err instanceof Error ? err.message : 'Failed to create user');
        }
    };

    // Handle deactivate button click
    const handleDeactivate = async (userId: number) => {
        if (window.confirm('Are you sure you want to deactivate this user?')) {
            try {
                await deactivateUser(userId);
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Failed to deactivate user');
            }
        }
    };

    // Render loading state
    if (loading) {
        return (
            <div className="loading">
                <p>Loading users...</p>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="error">
                <p>Error: {error.message}</p>
                <button onClick={refresh}>Try Again</button>
            </div>
        );
    }

    // Render main content
    return (
        <div className="user-list-page">
            <header>
                <h1>Users</h1>
                <button onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : 'Add User'}
                </button>
            </header>

            {/* Add User Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="add-user-form">
                    <h2>Add New User</h2>

                    {formError && (
                        <div className="form-error">{formError}</div>
                    )}

                    <div className="form-field">
                        <label htmlFor="name">Name</label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                            required
                        />
                    </div>

                    <button type="submit">Create User</button>
                </form>
            )}

            {/* User List */}
            {users.length === 0 ? (
                <p className="empty-state">No users found.</p>
            ) : (
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                    <button onClick={() => handleDeactivate(user.id)}>
                                        Deactivate
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default UserListPage;
```

### Advantages of Frontend Data Access Layer

| Advantage | Explanation |
|-----------|-------------|
| **Highly Testable** | Each layer can be tested independently. Mock repositories for unit tests. |
| **Swappable Data Sources** | Change from API to local storage without touching UI code. |
| **Offline Support** | Can implement local caching and sync later. |
| **Clean Separation** | Each layer has one job. Easy to understand and maintain. |
| **Reusable Logic** | Services can be shared across components. |
| **Type Safety** | Full TypeScript support catches errors at compile time. |

### Disadvantages of Frontend Data Access Layer

| Disadvantage | Explanation |
|--------------|-------------|
| **More Code** | Many files and layers to create and maintain. |
| **Learning Curve** | Developers need to understand patterns like Repository and DI. |
| **Over-Engineering Risk** | Might be overkill for simple CRUD applications. |
| **Duplication** | Business logic might exist in both frontend and backend. |
| **Complexity** | More abstractions = more places for bugs to hide. |

---

## Side-by-Side Comparison

### Architecture Comparison Table

| Aspect | Traditional Full-Stack | Frontend DAL |
|--------|----------------------|--------------|
| **Lines of Code** | Less frontend code | More frontend code |
| **Files** | Fewer files | Many small files |
| **Learning Curve** | Lower (familiar patterns) | Higher (design patterns) |
| **Testing** | Harder (need database) | Easier (mockable) |
| **Flexibility** | Lower (tied to backend) | Higher (swappable) |
| **Offline Support** | Not possible | Possible |
| **Security** | Better (logic on server) | Worse (logic exposed) |
| **Performance** | Generally better (SPs) | Depends on implementation |
| **Team Size** | Good for small teams | Better for large teams |
| **Maintenance** | Easier short-term | Easier long-term |

### Where Business Logic Lives

```
TRADITIONAL FULL-STACK:

    Frontend          Backend              Database
    ────────         ────────             ────────
    │      │         │      │             │      │
    │  UI  │ ──────► │ API  │ ──────────► │  SP  │ ◄── Business Logic HERE
    │      │         │      │             │      │
    ────────         ────────             ────────

    - Frontend is "dumb" - just displays data
    - API is thin - just routes requests
    - Stored Procedures contain all the rules


FRONTEND DAL:

    Frontend
    ────────────────────────────────────────────────────────────────
    │                                                               │
    │   Component ──► Hook ──► Service ──► Repository ──► Source   │
    │                            │                                  │
    │                    Business Logic HERE                        │
    │                                                               │
    ────────────────────────────────────────────────────────────────
                                    │
                                    ▼
                               Backend (API)
                               ────────────
                               │   CRUD    │  ◄── Just data operations
                               │   only    │
                               ────────────

    - Frontend layers handle business rules
    - Backend is simple CRUD API
    - More code but more flexible
```

### Testing Comparison

```
TRADITIONAL FULL-STACK - Testing a business rule:

    ┌─────────────────────────────────────────────────────────┐
    │  To test: "Orders over $100 get 10% discount"           │
    │                                                         │
    │  Requirements:                                          │
    │  ✗ Running database server                              │
    │  ✗ Test data in database                                │
    │  ✗ Network connection                                   │
    │  ✗ Stored procedure deployed                            │
    │                                                         │
    │  Test speed: Slow (seconds)                             │
    │  Test isolation: Poor (shared database)                 │
    └─────────────────────────────────────────────────────────┘


FRONTEND DAL - Testing a business rule:

    ┌─────────────────────────────────────────────────────────┐
    │  To test: "Orders over $100 get 10% discount"           │
    │                                                         │
    │  Requirements:                                          │
    │  ✓ Just the OrderService file                           │
    │  ✓ Mock repository (fake data)                          │
    │                                                         │
    │  Test speed: Fast (milliseconds)                        │
    │  Test isolation: Perfect (no shared state)              │
    │                                                         │
    │  // Example test                                        │
    │  test('applies 10% discount for orders over $100', () =>│
    │      const mockRepo = new MockOrderRepository();        │
    │      const service = new OrderService(mockRepo);        │
    │      const total = service.calculateTotal(150);         │
    │      expect(total).toBe(135); // 150 - 10%              │
    │  });                                                    │
    └─────────────────────────────────────────────────────────┘
```

### Changing Data Sources Comparison

```
TRADITIONAL - Switching from SQL Server to PostgreSQL:

    Files to modify:
    ├── All stored procedures (rewrite SQL syntax)
    ├── DbContext configuration
    ├── Connection strings
    └── Potentially controller code

    Effort: HIGH - SQL syntax differences, testing all SPs
    Risk: HIGH - might break existing functionality


FRONTEND DAL - Switching from API to Local Storage:

    Files to modify:
    └── Create LocalStorageDataSource.ts
    └── Update Repository constructor

    Effort: LOW - just add new data source
    Risk: LOW - existing code unchanged

    // Before
    const repo = new UserRepository(new ApiDataSource());

    // After
    const repo = new UserRepository(new LocalStorageDataSource());

    // Service, Hooks, Components - NO CHANGES!
```

---

## When to Use Each Approach

### Use Traditional Full-Stack When:

| Scenario | Why Traditional Works |
|----------|----------------------|
| **Simple CRUD app** | Don't need all the abstraction layers |
| **Small team (1-3 devs)** | Less coordination needed |
| **Tight deadline** | Faster to build initially |
| **Complex transactions** | Database handles better |
| **Security-critical** | Logic hidden on server |
| **Backend team is strong** | Leverage SQL expertise |
| **No offline requirement** | Don't need local data layer |

### Use Frontend DAL When:

| Scenario | Why Frontend DAL Works |
|----------|----------------------|
| **Large application** | Better organization at scale |
| **Large team (5+ devs)** | Clear boundaries, parallel work |
| **Multiple data sources** | API + local + cache |
| **Offline-first app** | Local data with sync |
| **High test coverage needed** | Easy to mock and test |
| **Frequent requirement changes** | Easier to modify layers |
| **Multiple frontends** | Share service logic |

### Decision Flowchart

```
START
  │
  ▼
┌─────────────────────────────────┐
│ Is offline support required?    │
└─────────────────────────────────┘
  │           │
  YES         NO
  │           │
  ▼           ▼
Frontend    ┌─────────────────────────────────┐
  DAL       │ Do you have multiple data       │
            │ sources (API + cache + local)?  │
            └─────────────────────────────────┘
              │           │
              YES         NO
              │           │
              ▼           ▼
           Frontend    ┌─────────────────────────────────┐
             DAL       │ Is high test coverage a         │
                       │ priority?                       │
                       └─────────────────────────────────┘
                         │           │
                         YES         NO
                         │           │
                         ▼           ▼
                      Frontend    ┌─────────────────────────────────┐
                        DAL       │ Is the team experienced with    │
                                  │ design patterns?                │
                                  └─────────────────────────────────┘
                                    │           │
                                    YES         NO
                                    │           │
                                    ▼           ▼
                              Either/Hybrid   Traditional
                                               Full-Stack
```

---

## The Hybrid Approach (Recommended)

### Overview

The Hybrid Approach combines the best of both worlds:
- **Backend**: ASP.NET Core with stored procedures (handles complex transactions, security)
- **Frontend**: Simplified data layer with hooks (clean code, testable, good UX)

This approach acknowledges that:
1. You already have a backend that works well
2. You don't need all the abstraction of full DAL
3. You still want clean, organized frontend code

### Hybrid Architecture

```
src/
├── models/                  # TypeScript interfaces (mirror backend models)
│   ├── User.ts
│   ├── Order.ts
│   └── index.ts
│
├── api/                     # API client layer
│   ├── client.ts            # Base HTTP client (fetch wrapper)
│   ├── userApi.ts           # User-specific endpoints
│   ├── orderApi.ts          # Order-specific endpoints
│   └── index.ts             # Export all APIs
│
├── hooks/                   # React hooks (state + API calls)
│   ├── useUsers.ts
│   ├── useOrders.ts
│   └── index.ts
│
├── types/                   # Shared types, enums, constants
│   └── index.ts
│
└── pages/                   # React components
    ├── UserListPage.tsx
    └── OrderFormPage.tsx
```

### What's Different from Full DAL?

| Full DAL Has | Hybrid Approach |
|--------------|-----------------|
| Repositories | ✗ Removed - API client is enough |
| Data Sources | ✗ Removed - only one source (API) |
| Mappers | ✗ Removed - API returns correct format |
| Services | ⚠️ Optional - only if needed |
| Hooks | ✓ Kept - clean React integration |
| Models | ✓ Kept - type safety |

### Why This Works

```
TRADITIONAL:
    Component → API Service → Backend

    Problem: Components get messy with loading states, error handling


FULL DAL:
    Component → Hook → Service → Repository → DataSource → Backend

    Problem: Too many layers for simple operations


HYBRID:
    Component → Hook → API Client → Backend

    Benefits:
    ✓ Hooks handle React state (loading, error, data)
    ✓ API client handles HTTP details
    ✓ Backend handles business logic
    ✓ Just enough abstraction, not too much
```

---

## Implementation Guide for Hybrid Approach

### Step 1: Create Models

Models define the shape of your data. They should match what your API returns.

```typescript
// src/models/User.ts

/**
 * User model - matches the API response format.
 *
 * If your API returns snake_case, you have two options:
 * 1. Use snake_case here too (simpler)
 * 2. Transform in the API client (cleaner TypeScript)
 *
 * We'll use camelCase and transform in the API client.
 */
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'guest';
    isActive: boolean;
    createdAt: string;  // ISO date string from API
    updatedAt: string;
}

/**
 * Input for creating a user.
 * Uses Omit to exclude auto-generated fields.
 */
export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Input for updating a user.
 * Uses Partial to make all fields optional, but id is required.
 */
export type UpdateUserInput = Partial<User> & { id: number };
```

```typescript
// src/models/index.ts

// Export all models from one place
export * from './User';
export * from './Order';
export * from './Product';
```

### Step 2: Create API Client

The API client handles all HTTP communication with your backend.

```typescript
// src/api/client.ts

/**
 * API Client Configuration
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5001/api';

/**
 * Custom error class for API errors.
 * Includes status code and response body for debugging.
 */
export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public body?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Type for request options
 */
interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
}

/**
 * Makes an HTTP request to the API.
 *
 * Features:
 * - Automatic JSON parsing
 * - Error handling with custom ApiError
 * - Content-Type header for JSON requests
 * - Generic type parameter for response typing
 *
 * @param endpoint - API endpoint (e.g., '/users')
 * @param options - Request options (method, body, headers)
 * @returns Promise resolving to the parsed response
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    // Build request configuration
    const config: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            // Add auth token if available
            // 'Authorization': `Bearer ${getAuthToken()}`,
            ...headers,
        },
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
    }

    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle errors
    if (!response.ok) {
        let errorBody: unknown;
        try {
            errorBody = await response.json();
        } catch {
            errorBody = await response.text();
        }

        throw new ApiError(
            `API request failed: ${response.status} ${response.statusText}`,
            response.status,
            errorBody
        );
    }

    // Parse and return JSON response
    // Handle empty responses (204 No Content)
    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

/**
 * API client object with convenience methods.
 *
 * Usage:
 *   const users = await api.get<User[]>('/users');
 *   const user = await api.post<User>('/users', { name: 'John' });
 */
export const api = {
    /**
     * GET request - retrieve data
     */
    get: <T>(endpoint: string) =>
        request<T>(endpoint, { method: 'GET' }),

    /**
     * POST request - create new resource
     */
    post: <T>(endpoint: string, body: unknown) =>
        request<T>(endpoint, { method: 'POST', body }),

    /**
     * PUT request - replace entire resource
     */
    put: <T>(endpoint: string, body: unknown) =>
        request<T>(endpoint, { method: 'PUT', body }),

    /**
     * PATCH request - partial update
     */
    patch: <T>(endpoint: string, body: unknown) =>
        request<T>(endpoint, { method: 'PATCH', body }),

    /**
     * DELETE request - remove resource
     */
    delete: <T = void>(endpoint: string) =>
        request<T>(endpoint, { method: 'DELETE' }),
};
```

### Step 3: Create Domain-Specific API Modules

Each domain (users, orders, etc.) gets its own API module.

```typescript
// src/api/userApi.ts
import { api } from './client';
import { User, CreateUserInput, UpdateUserInput } from '../models';

/**
 * User API module.
 *
 * Contains all API calls related to users.
 * Each method corresponds to a backend endpoint.
 */
export const userApi = {
    /**
     * Get all users
     * GET /api/users
     */
    getAll: () =>
        api.get<User[]>('/users'),

    /**
     * Get a single user by ID
     * GET /api/users/:id
     */
    getById: (id: number) =>
        api.get<User>(`/users/${id}`),

    /**
     * Search users with filters
     * GET /api/users?role=admin&isActive=true
     */
    search: (params: Partial<User>) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, String(value));
            }
        });
        return api.get<User[]>(`/users?${searchParams.toString()}`);
    },

    /**
     * Create a new user
     * POST /api/users
     */
    create: (input: CreateUserInput) =>
        api.post<User>('/users', input),

    /**
     * Update an existing user
     * PUT /api/users/:id
     */
    update: (input: UpdateUserInput) =>
        api.put<User>(`/users/${input.id}`, input),

    /**
     * Delete a user
     * DELETE /api/users/:id
     */
    delete: (id: number) =>
        api.delete(`/users/${id}`),

    /**
     * Activate a user
     * POST /api/users/:id/activate
     */
    activate: (id: number) =>
        api.post<User>(`/users/${id}/activate`, {}),

    /**
     * Deactivate a user
     * POST /api/users/:id/deactivate
     */
    deactivate: (id: number) =>
        api.post<User>(`/users/${id}/deactivate`, {}),
};
```

```typescript
// src/api/index.ts

// Export all API modules
export { api, ApiError } from './client';
export { userApi } from './userApi';
export { orderApi } from './orderApi';
export { productApi } from './productApi';
```

### Step 4: Create React Hooks

Hooks connect your React components to the API.

```typescript
// src/hooks/useUsers.ts
import { useState, useEffect, useCallback } from 'react';
import { User, CreateUserInput, UpdateUserInput } from '../models';
import { userApi, ApiError } from '../api';

/**
 * Hook return type
 */
interface UseUsersReturn {
    // Data
    users: User[];

    // Status
    loading: boolean;
    error: string | null;

    // Actions
    createUser: (input: CreateUserInput) => Promise<User>;
    updateUser: (input: UpdateUserInput) => Promise<User>;
    deleteUser: (id: number) => Promise<void>;

    // Utilities
    refresh: () => Promise<void>;
    clearError: () => void;
}

/**
 * useUsers hook - manages user data and operations.
 *
 * Features:
 * - Fetches users on mount
 * - Provides loading and error states
 * - Methods for CRUD operations
 * - Automatic refresh after mutations
 *
 * @param autoFetch - Whether to fetch users on mount (default: true)
 */
export function useUsers(autoFetch = true): UseUsersReturn {
    // State
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(autoFetch);
    const [error, setError] = useState<string | null>(null);

    /**
     * Handle errors consistently
     */
    const handleError = useCallback((err: unknown): string => {
        if (err instanceof ApiError) {
            // Extract message from API error response
            const body = err.body as { message?: string } | undefined;
            return body?.message || err.message;
        }
        if (err instanceof Error) {
            return err.message;
        }
        return 'An unexpected error occurred';
    }, []);

    /**
     * Fetch all users
     */
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await userApi.getAll();
            setUsers(data);
        } catch (err) {
            setError(handleError(err));
        } finally {
            setLoading(false);
        }
    }, [handleError]);

    /**
     * Create a new user
     */
    const createUser = useCallback(async (input: CreateUserInput): Promise<User> => {
        try {
            setError(null);
            const newUser = await userApi.create(input);
            // Add to local state
            setUsers(prev => [...prev, newUser]);
            return newUser;
        } catch (err) {
            const message = handleError(err);
            setError(message);
            throw new Error(message);
        }
    }, [handleError]);

    /**
     * Update an existing user
     */
    const updateUser = useCallback(async (input: UpdateUserInput): Promise<User> => {
        try {
            setError(null);
            const updatedUser = await userApi.update(input);
            // Update in local state
            setUsers(prev =>
                prev.map(u => u.id === updatedUser.id ? updatedUser : u)
            );
            return updatedUser;
        } catch (err) {
            const message = handleError(err);
            setError(message);
            throw new Error(message);
        }
    }, [handleError]);

    /**
     * Delete a user
     */
    const deleteUser = useCallback(async (id: number): Promise<void> => {
        try {
            setError(null);
            await userApi.delete(id);
            // Remove from local state
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            const message = handleError(err);
            setError(message);
            throw new Error(message);
        }
    }, [handleError]);

    /**
     * Clear error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Fetch on mount if autoFetch is true
    useEffect(() => {
        if (autoFetch) {
            fetchUsers();
        }
    }, [autoFetch, fetchUsers]);

    return {
        users,
        loading,
        error,
        createUser,
        updateUser,
        deleteUser,
        refresh: fetchUsers,
        clearError,
    };
}
```

```typescript
// src/hooks/index.ts

// Export all hooks
export { useUsers } from './useUsers';
export { useOrders } from './useOrders';
export { useProducts } from './useProducts';
```

### Step 5: Use in Components

Now your components are clean and simple.

```tsx
// src/pages/UserListPage.tsx
import React, { useState } from 'react';
import { useUsers } from '../hooks';
import { CreateUserInput } from '../models';

function UserListPage() {
    const { users, loading, error, createUser, deleteUser, clearError } = useUsers();

    const [formData, setFormData] = useState({ name: '', email: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createUser({
                name: formData.name,
                email: formData.email,
                role: 'user',
                isActive: true,
            });
            setFormData({ name: '', email: '' });
        } catch {
            // Error is already set in hook state
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1>Users</h1>

            {error && (
                <div className="error">
                    {error}
                    <button onClick={clearError}>Dismiss</button>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <input
                    placeholder="Name"
                    value={formData.name}
                    onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                />
                <input
                    placeholder="Email"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                />
                <button type="submit">Add User</button>
            </form>

            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        {user.name} ({user.email})
                        <button onClick={() => deleteUser(user.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UserListPage;
```

### Summary: Hybrid Approach Benefits

| Benefit | How Hybrid Achieves It |
|---------|----------------------|
| **Simple** | Only 3 layers: Models → API → Hooks |
| **Type-Safe** | TypeScript throughout |
| **Testable** | Can mock API client in tests |
| **Clean Components** | Hooks handle all state logic |
| **Backend Unchanged** | Works with existing ASP.NET + SPs |
| **Familiar** | Standard React patterns |
| **Flexible** | Easy to add caching, offline later |

### Migration Path

If you later need more features, you can evolve from Hybrid to Full DAL:

```
STEP 1 (Current - Hybrid):
    Component → Hook → API Client → Backend

STEP 2 (Add Services when business logic grows):
    Component → Hook → Service → API Client → Backend

STEP 3 (Add Repositories if you need multiple data sources):
    Component → Hook → Service → Repository → API Client → Backend
                                           → Local Storage
                                           → Cache
```

The Hybrid approach gives you a solid foundation that can grow with your needs without requiring a complete rewrite.
