# Config

## Purpose
Centralized configuration module that establishes and manages database connections for the backend application.

## Responsibility Boundary
**Responsible for:**
- Initializing MongoDB connections using Mongoose
- Managing DNS settings for reliable database connectivity
- Exporting connection initialization functions

**NOT responsible for:**
- User authentication or authorization
- Data validation or transformation
- Business logic
- API routing

## Contents

| File | Type | Purpose |
|------|------|---------|
| `db.js` | Module | MongoDB connection handler using Mongoose |

## How It Works

```
1. Import Mongoose and DNS modules
2. Configure DNS servers (Google's 8.8.8.8 and 8.8.4.4) for reliability
3. Define connectDB() async function that:
   - Connects to MongoDB using MONGO_URI environment variable
   - Logs successful connection with host information
   - Catches and logs errors, then exits process if connection fails
4. Export connectDB for use in main server initialization
```

## Key Design Decisions

- **Separate config module**: Isolates database setup from main server logic, making it testable and reusable
- **Async function pattern**: Uses async/await to handle asynchronous MongoDB connection operation
- **DNS hardcoding to Google's nameservers**: Ensures reliable DNS resolution in environments where DNS might be unstable (e.g., restricted networks, cloud deployments)
- **Process exit on failure**: Treats database connection failures as fatal — the app cannot run without the database, so failing fast is appropriate
- **Environment variable for URI**: Keeps sensitive connection strings out of code, enabling different environments (dev/prod) via `.env` files

## Data Flow

**Trigger:** Server startup (when `connectDB()` is called from server.js)

**Input:**
- `process.env.MONGO_URI` — MongoDB connection string from environment

**Process:**
1. Set DNS servers to Google's public DNS
2. Attempt Mongoose connection to MONGO_URI
3. Log result (success or error)

**Output:**
- Success: MongoDB connection object, console log with host name
- Failure: Console error message, process exit with code 1

## Dependencies

### Depends On:
- `mongoose` — Database ORM for MongoDB connection and management
- `node:dns` — Node.js built-in DNS module for custom DNS configuration
- `.env` file with `MONGO_URI` — MongoDB connection string (managed externally)

### Depended On By:
- `server.js` — Main entry point that calls `connectDB()` during startup
- All models and controllers — Indirectly depend on successful database connection

## Common Mistakes / Gotchas

1. **Forgetting to call connectDB()**: If `connectDB()` is never called, the app will run but database operations will fail silently
2. **Missing MONGO_URI environment variable**: Connection will fail because `process.env.MONGO_URI` will be undefined
3. **Network/firewall issues**: Google's DNS might not be accessible in some corporate networks; change DNS servers if connection fails
4. **Running before environment setup**: Ensure `.env` file is loaded (via `dotenv`) BEFORE importing this module
5. **Multiple connection attempts**: Calling `connectDB()` multiple times without proper cleanup can cause connection pool issues

## Extension Points

### Adding additional MongoDB connections:
- Create a new file (e.g., `cache.js`) following the same pattern
- Define a new async function with its own connection URI
- Export it for use in server.js

### Switching databases:
- Replace Mongoose imports with another ORM (e.g., `prisma`, `typeorm`)
- Update the connection logic in `connectDB()`
- Adjust error handling if needed

### Adding connection pooling or retry logic:
- Modify the `connectDB()` function to accept configuration options (pool size, retry count, etc.)
- Add retry loop with exponential backoff before process.exit()
