# IssueFlow Ultimate SaaS Platform

## Installation

### 1. Prerequisites
- Node.js (v20+)
- PostgreSQL (running locally or a cloud database)
- pnpm (package manager)

### 2. Setup Monorepo
Run the following from the root to install all dependencies for both frontend and backend:
\`\`\`bash
pnpm install
\`\`\`

### 3. Environment Variables
You need to configure the environment variables for both the backend and frontend apps.

**Backend (\`apps/backend/.env\`):**
Create the file \`apps/backend/.env\` with the following:
\`\`\`env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=issueflow

JWT_SECRET=supersecret
JWT_EXPIRES_IN=15m

PORT=3000
FRONTEND_URL=http://localhost:5173

# Cloudinary Integration (for media uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
\`\`\`

**Frontend (\`apps/frontend/.env\`):**
Create the file \`apps/frontend/.env\` with the following:
\`\`\`env
VITE_API_URL=http://localhost:3000
\`\`\`

### 4. Running the application
You can start both applications using Turborepo (if configured) or manually.
To start manually:

**Start Backend:**
\`\`\`bash
cd apps/backend
pnpm run start:dev
\`\`\`

**Start Frontend:**
\`\`\`bash
cd apps/frontend
pnpm run dev
\`\`\`

The backend swagger documentation will be available at \`http://localhost:3000/api/docs\`.
