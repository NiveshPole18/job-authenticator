# Job Scheduler & Automation Dashboard

A production-ready full-stack application for creating, managing, and monitoring automated jobs with webhook integration.

## 🎯 Features

- ✅ Create and manage scheduled jobs
- ✅ Real-time job status tracking with Socket.IO
- ✅ Webhook delivery with retry logic and HMAC signing
- ✅ Lavender-themed responsive UI
- ✅ Priority-based job management
- ✅ Job execution simulation with error handling
- ✅ Comprehensive webhook logging
- ✅ Docker support with docker-compose
- ✅ TypeScript throughout
- ✅ Jest + Supertest backend tests
- ✅ CI/CD with GitHub Actions

## 📋 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL 8.0
- **ORM**: Sequelize
- **Language**: TypeScript
- **Real-time**: Socket.IO
- **Validation**: Joi
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: Next.js 14
- **UI Framework**: React 18
- **Styling**: Tailwind CSS 3.4
- **Language**: TypeScript
- **Data Fetching**: SWR + Axios
- **Real-time**: Socket.IO Client

### DevOps
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Linting**: ESLint + Prettier

## 🏗️ Architecture

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  - Dashboard with job listing & filtering               │
│  - Job creation form                                     │
│  - Job detail view with webhook logs                    │
│  - Real-time updates via Socket.IO                      │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP + WebSocket
┌─────────────────▼───────────────────────────────────────┐
│                 Backend (Express)                        │
│  - REST API endpoints                                    │
│  - Job execution engine                                  │
│  - Webhook delivery service                              │
│  - Socket.IO real-time updates                          │
└─────────────────┬───────────────────────────────────────┘
                  │ SQL
┌─────────────────▼───────────────────────────────────────┐
│                   MySQL Database                         │
│  - jobs (id, taskName, payload, priority, status, ...)  │
│  - webhook_logs (jobId, url, attempt, responseStatus)   │
└─────────────────────────────────────────────────────────┘
\`\`\`

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+ (or use Docker Compose)
- npm or yarn

### Local Development Setup

#### 1. Clone Repository
\`\`\`bash
git clone <repo-url>
cd job-scheduler
\`\`\`

#### 2. Backend Setup
\`\`\`bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=jobsdb

# Run migrations
npm run migrate

# Seed sample data
npm run seed

# Start development server
npm run dev
\`\`\`

Backend will be available at `http://localhost:5000`

#### 3. Frontend Setup
\`\`\`bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local (optional)
cp .env.example .env.local

# Start dev server
npm run dev
\`\`\`

Frontend will be available at `http://localhost:3000`

### Using Docker Compose

\`\`\`bash
# Start all services
docker-compose up

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:5000
# - MySQL: localhost:3306
# - Adminer (DB UI): http://localhost:8080

# Run migrations inside container
docker-compose exec backend npm run db:setup

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
\`\`\`

## 📚 API Documentation

### Base URL
- Local: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

### Authentication
Not required for this demo. To enable JWT:
1. Uncomment auth middleware in `backend/src/middleware/auth.ts`
2. Add `JWT_SECRET` to `.env`

### Endpoints

#### 1. Create Job
\`\`\`http
POST /api/jobs
Content-Type: application/json

{
  "taskName": "Send Email",
  "payload": {
    "recipient": "user@example.com",
    "subject": "Hello"
  },
  "priority": "High"
}
\`\`\`

Response:
\`\`\`json
{
  "id": 1,
  "taskName": "Send Email",
  "payload": {...},
  "priority": "High",
  "status": "pending",
  "attempts": 0,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
\`\`\`

#### 2. List Jobs
\`\`\`http
GET /api/jobs?status=pending&priority=High&limit=20&offset=0&sort=createdAt:desc
\`\`\`

Response:
\`\`\`json
{
  "jobs": [...],
  "total": 50,
  "limit": 20,
  "offset": 0
}
\`\`\`

#### 3. Get Job Detail
\`\`\`http
GET /api/jobs/1
\`\`\`

Response:
\`\`\`json
{
  "job": {...},
  "webhookLogs": [...]
}
\`\`\`

#### 4. Run Job
\`\`\`http
POST /api/jobs/1/run
\`\`\`

Response: Updated job object

#### 5. Webhook Test Receiver
\`\`\`http
POST /api/webhook-test
X-Signature: <hmac-sha256>

{
  "jobId": 1,
  "taskName": "Send Email",
  ...
}
\`\`\`

### Curl Examples

\`\`\`bash
# Create a job
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "taskName": "Generate Report",
    "payload": {"format": "PDF"},
    "priority": "Medium"
  }'

# List jobs
curl "http://localhost:5000/api/jobs?status=pending&limit=10"

# Get job detail
curl "http://localhost:5000/api/jobs/1"

# Run a job
curl -X POST "http://localhost:5000/api/jobs/1/run"
\`\`\`

## 🔄 Webhook Integration

### How It Works

1. **Job Completion**: When a job finishes, the backend triggers a webhook POST request
2. **Retry Logic**: Up to 3 retries with exponential backoff (1s, 2s, 4s) + jitter
3. **HMAC Signing**: All requests include `X-Signature` header with HMAC-SHA256
4. **Logging**: Each attempt is logged in `webhook_logs` table

### Webhook Payload

\`\`\`json
{
  "jobId": 1,
  "taskName": "Send Email",
  "priority": "High",
  "status": "completed",
  "payload": {...},
  "completedAt": "2024-01-15T10:00:05Z",
  "runDurationMs": 3254
}
\`\`\`

### Signature Verification

\`\`\`javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const expected = hmac.digest('hex');
  return signature === expected;
}
\`\`\`

### Testing with Webhook.site

1. Visit [webhook.site](https://webhook.site)
2. Copy your unique URL (e.g., `https://webhook.site/12abc-def`)
3. Add to backend `.env`:
   \`\`\`
   OUTBOUND_WEBHOOK=https://webhook.site/12abc-def
   \`\`\`
4. Create and run a job
5. Check webhook.site to see the delivery

## 📊 Database Schema

### jobs Table
\`\`\`sql
CREATE TABLE jobs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  taskName VARCHAR(255) NOT NULL,
  payload JSON,
  priority ENUM('Low','Medium','High') DEFAULT 'Low',
  status ENUM('pending','running','completed','failed') DEFAULT 'pending',
  attempts INT DEFAULT 0,
  lastError TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  startedAt DATETIME,
  completedAt DATETIME,
  runDurationMs INT,
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_createdAt (createdAt)
);
\`\`\`

### webhook_logs Table
\`\`\`sql
CREATE TABLE webhook_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  jobId INT NOT NULL REFERENCES jobs(id),
  url VARCHAR(500),
  requestBody JSON,
  responseStatus INT,
  responseBody TEXT,
  attempt INT,
  error TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_jobId (jobId),
  INDEX idx_createdAt (createdAt)
);
\`\`\`

## 🧪 Testing

### Backend Tests
\`\`\`bash
cd backend

# Run all tests
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
\`\`\`

Tests cover:
- Job creation and validation
- Job listing with filters
- Job detail retrieval
- Job execution flow
- Error handling

### Frontend Tests
\`\`\`bash
cd frontend

# Run tests
npm test

# Watch mode
npm test -- --watch
\`\`\`

### E2E Tests
\`\`\`bash
cd frontend

# Run Playwright E2E tests
npm run test:e2e

# Headed mode (see browser)
npm run test:e2e -- --headed
\`\`\`

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
\`\`\`bash
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=jobsdb
DB_USER=root
DB_PASSWORD=password

# Frontend
FRONTEND_URL=http://localhost:3000

# Webhook
OUTBOUND_WEBHOOK=https://webhook.site/your-id
WEBHOOK_SECRET=your-secret

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Testing
SIMULATE_JOB_FAILURE=false
\`\`\`

#### Frontend (.env.local)
\`\`\`bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
\`\`\`

## 📦 Project Structure

\`\`\`
job-scheduler/
├── backend/
│   ├── src/
│   │   ├── index.ts                 # Entry point
│   │   ├── database/
│   │   │   ├── connection.ts        # Sequelize config
│   │   │   ├── migrate.ts           # Migration runner
│   │   │   └── seed.ts              # Sample data seeder
│   │   ├── models/
│   │   │   ├── Job.ts               # Job model
│   │   │   └── WebhookLog.ts        # Webhook log model
│   │   ├── controllers/
│   │   │   └── jobController.ts     # Job handlers
│   │   ├── services/
│   │   │   └── webhookService.ts    # Webhook delivery
│   │   ├── routes/
│   │   │   ├── jobRoutes.ts
│   │   │   └── webhookRoutes.ts
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   ├── requestLogger.ts
│   │   │   └── rateLimiter.ts
│   │   └── validators/
│   │       └── jobValidator.ts
│   ├── __tests__/
│   │   └── jobs.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                 # Dashboard
│   │   ├── jobs/
│   │   │   ├── new/page.tsx         # Create job
│   │   │   └── [id]/page.tsx        # Job detail
│   │   ├── layout.tsx
│   │   └── globals.css              # Tailwind + theme
│   ├── components/
│   │   ├── Navigation.tsx
│   │   ├── JobTable.tsx
│   │   ├── JobCard.tsx
│   │   ├── FilterBar.tsx
│   │   ├── JobForm.tsx
│   │   ├── JobDetailView.tsx
│   │   ├── JSONViewer.tsx
│   │   └── Toast.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.mjs
│   ├── .env.example
│   └── Dockerfile
│
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci.yml
└── README.md
\`\`\`

## 🚀 Deployment

### Vercel (Frontend)
\`\`\`bash
# Connect repo to Vercel
# Add environment variables in Vercel dashboard:
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
\`\`\`

### Render (Backend)
\`\`\`bash
# 1. Connect repo to Render
# 2. Create PostgreSQL service (MySQL also supported)
# 3. Set environment variables:
DATABASE_URL=mysql://user:password@host:port/dbname
FRONTEND_URL=https://your-frontend.vercel.app
OUTBOUND_WEBHOOK=https://webhook.site/your-id
\`\`\`

### Self-hosted (Docker)
\`\`\`bash
# Production docker-compose.yml
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose logs -f

# Scale backend
docker-compose up -d --scale backend=3
\`\`\`

## 🐛 Troubleshooting

### Database Connection Failed
\`\`\`
Error: connect ECONNREFUSED 127.0.0.1:3306
\`\`\`
**Solution**: Ensure MySQL is running and credentials are correct in `.env`

### Port Already in Use
\`\`\`
Error: listen EADDRINUSE: address already in use :::5000
\`\`\`
**Solution**: Change PORT in `.env` or kill the process using the port

### Webhook Not Triggering
**Checklist**:
1. ✅ Verify `OUTBOUND_WEBHOOK` URL in `.env`
2. ✅ Check webhook.site for received requests
3. ✅ Verify job status changed to 'completed' or 'failed'
4. ✅ Check backend logs for webhook errors

### Real-time Updates Not Working
**Solution**: Ensure Socket.IO is properly configured
\`\`\`javascript
// Check connection in browser console
io.on('connect', () => console.log('Connected!'));
\`\`\`

## 📈 Performance Considerations

- **Database**: Add indexes on `status`, `priority`, `createdAt` (already configured)
- **Polling**: Fallback polling set to 5s; adjust in frontend code if needed
- **Webhook Retries**: Max 3 attempts with exponential backoff
- **Rate Limiting**: 100 requests per 15 minutes on `/run-job`

## 🔐 Security

- ✅ HMAC-SHA256 signature verification for webhooks
- ✅ Input validation with Joi
- ✅ SQL injection prevention via Sequelize ORM
- ✅ Rate limiting on sensitive endpoints
- ✅ CORS enabled for frontend origin
- ✅ Environment variables for secrets

**Next Steps for Production**:
- [ ] Enable JWT authentication
- [ ] Add HTTPS/TLS
- [ ] Implement request logging and monitoring
- [ ] Add database backups
- [ ] Setup alerting for failed jobs

## 📝 Commits & History

Meaningful commit messages (follow conventional commits):
- `feat: add job creation endpoint`
- `fix: webhook retry logic with backoff`
- `docs: update API documentation`
- `test: add job controller tests`
- `refactor: extract webhook service`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open PR

## 📄 License

MIT License - see LICENSE file

## 📞 Support

For issues, questions, or suggestions:
- Open a GitHub Issue
- Email: support@example.com
- Discord: [Join server](https://discord.gg/example)

---

**Last Updated**: January 2025
**Maintained By**: Development Team
**Status**: Production Ready ✅
\`\`\`

## ENV FILES
