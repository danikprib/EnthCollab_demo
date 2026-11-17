

# EnthCollab




## 1. Overview & DBMS Choice
- **DBMS**: PostgreSQL 16+ (Relational OLTP).
- **Justification**: PostgreSQL was chosen for its robust relational integrity, native support for complex foreign key constraints, check constraints, and seamless integration with Entity Framework Core (EF Core) using code-first migrations. It handles concurrent user actions, relational mappings (users to projects, projects to tickets, likes, and tags), and secure credential storage efficiently.

## 2. Data Dictionary

### Table: `Users`
Stores registered user accounts, authentication hashes, and user roles.
| Column | Data Type | Key / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `SERIAL` (int) | Primary Key (`PK`) | Unique identifier for the user. |
| `Username` | `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | Unique display handle. |
| `Email` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | User email for login and identification. |
| `PasswordHash` | `VARCHAR(255)` | `NOT NULL` | Securely hashed password (BCrypt). |
| `Role` | `VARCHAR(20)` | `DEFAULT 'User'`, `CHECK` ('User', 'Admin') | Authorization role. |
| `CreatedAt` | `TIMESTAMP` | `NOT NULL` | Account registration timestamp. |

### Table: `Projects`
Stores projects created by users, tracking their visibility and workflow status.
| Column | Data Type | Key / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `SERIAL` (int) | Primary Key (`PK`) | Unique project identifier. |
| `Name` | `VARCHAR(250)` | `NOT NULL` | Title of the project. |
| `Status` | `VARCHAR(20)` | `CHECK` ('WIP', 'Finished', 'Cancelled', 'Frozen') | Current project lifecycle status. |
| `Visibility` | `VARCHAR(20)` | `CHECK` ('Public', 'Private') | Access control setting. |
| `Description` | `TEXT` | `NOT NULL` | Detailed project scope. |
| `Hazard` | `TEXT` | `NULL` | Safety/technical warnings if applicable. |
| `CreatedByUserId` | `INT` | Foreign Key (`FK`) -> `Users(Id)`, `CASCADE` | Creator/owner of the project. |

### Table: `Tickets`
Stores tasks associated with projects that contributors can apply for.
| Column | Data Type | Key / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `SERIAL` (int) | Primary Key (`PK`) | Unique ticket identifier. |
| `ProjectId` | `INT` | Foreign Key (`FK`) -> `Projects(Id)`, `CASCADE` | Parent project. |
| `Title` | `VARCHAR(250)` | `NOT NULL` | Task title. |
| `Description` | `TEXT` | `NOT NULL` | Task requirements. |
| `Status` | `VARCHAR(20)` | `CHECK` ('Open', 'Taken', 'Done') | Task completion status. |
| `Difficulty` | `VARCHAR(20)` | `CHECK` ('Easy', 'Medium', 'Hard', 'Advanced') | Skill level required. |

### Table: `Tags` & `ProjectTag`
Enables categorization and skill-matching via many-to-many relationship.
- **`Tags`**: `Id` (PK), `Name` (UNIQUE, NOT NULL).
- **`ProjectTag` (Join Table)**: `ProjectsId` (FK), `TagsId` (FK).

### Table: `ProjectLikes`
Tracks user likes on projects (Composite Primary Key).
- `UserId` (FK -> `Users.Id`), `ProjectId` (FK -> `Projects.Id`). Primary Key is `(UserId, ProjectId)`.

### Table: `RefreshTokens`
Manages JWT token rotation and session persistence.
- `Id` (PK), `UserId` (FK), `TokenHash` (UNIQUE), `ExpiresAt`, `RevokedAt`.

---

## 3. Data Integrity and Transaction Handling
- **Constraints**: Enforced via Entity Framework CoreFluent API and database-level checks (`UNIQUE`, `NOT NULL`, `CHECK` constraints on `Status`, `Visibility`, `Role`, and `Difficulty`).
- **Referential Integrity**: Foreign keys enforce cascading deletes where appropriate (e.g., deleting a project deletes its tickets and tags mapping).
- **Transactions**: Entity Framework Core wraps multi-table operations (such as project creation with associated tags or user registration with token issuance) inside automatic transactions (`SaveChangesAsync()`), ensuring atomicity.
- **Security & Access**: 
  - Passwords are strictly hashed using BCrypt (`AuthConstants.BcryptWorkFactor`). Plaintext storage is prohibited.
  - The application connects via a standard database role with DML permissions (`app_read`, `app_write`), avoiding superuser execution in production configurations.
  - Schema modifications are strictly managed via automated EF Core migrations tracked in version control (Git).
  
## 4. How to launch
cd backend
dotnet ef database update --project EnthCollab.Data --startup-project EnthCollab.Api

then seed the database '.\database\scripts\seed\seed_db.sql'

then frontend
cd frontend
npm install
ng serve