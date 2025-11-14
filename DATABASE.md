# Database Documentation

## Overview

The platform uses **PostgreSQL** as the primary database with **Prisma** as the ORM.

## Schema Design

### Entity Relationship Diagram

```
User
├── jobsAsClient (1:many → Job)
├── jobsAsDeveloper (1:many → Job)
├── proposals (1:many → Proposal)
├── skills (1:many → UserSkill)
├── portfolioItems (1:many → Portfolio)
├── reviewsGiven (1:many → Review)
├── reviewsReceived (1:many → Review)
├── sentMessages (1:many → Message)
├── receivedMessages (1:many → Message)
└── notifications (1:many → Notification)

Job
├── client (many:1 → User)
├── developer (many:1 → User)
├── proposals (1:many → Proposal)
├── requiredSkills (1:many → JobSkill)
├── milestones (1:many → Milestone)
├── messages (1:many → Message)
└── reviews (1:many → Review)
```

## Core Tables

### User Table

Stores user profiles and authentication data.

```prisma
model User {
  id                String   @id @default(cuid())
  walletAddress     String   @unique
  username          String?  @unique
  phoneNumber       String?  @unique
  phoneVerified     Boolean  @default(false)
  role              UserRole @default(BOTH)
  displayName       String?
  bio               String?
  avatar            String?
  isVerified        Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

**Indexes:**
- `walletAddress` (unique)
- `username` (unique)
- `phoneNumber` (unique)

**Key Fields:**
- `walletAddress`: Primary identifier (Ethereum address)
- `role`: DEVELOPER | CLIENT | BOTH
- `phoneVerified`: Required for clients
- `isVerified`: Skill verification status

### Job Table

Stores job postings and their details.

```prisma
model Job {
  id                String     @id @default(cuid())
  title             String
  description       String
  category          String
  budget            Float
  currency          String     @default("USDC")
  paymentToken      String
  status            JobStatus  @default(DRAFT)
  clientId          String
  developerId       String?
  createdAt         DateTime   @default(now())
}
```

**Indexes:**
- `clientId`
- `developerId`
- `status`
- `category`
- `createdAt`

**Status Flow:**
```
DRAFT → OPEN → IN_PROGRESS → UNDER_REVIEW → COMPLETED
                    ↓
                CANCELLED
                    ↓
                DISPUTED
```

### Proposal Table

Developer proposals for jobs.

```prisma
model Proposal {
  id                String         @id @default(cuid())
  jobId             String
  developerId       String
  coverLetter       String
  proposedBudget    Float
  status            ProposalStatus @default(PENDING)
  createdAt         DateTime       @default(now())
  
  @@unique([jobId, developerId])
}
```

**Business Rules:**
- One proposal per developer per job
- Status: PENDING | ACCEPTED | REJECTED | WITHDRAWN
- Only PENDING proposals can be accepted/withdrawn

### Message Table

Job-related communication.

```prisma
model Message {
  id          String   @id @default(cuid())
  jobId       String
  senderId    String
  receiverId  String
  content     String
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

**Indexes:**
- `jobId`
- `senderId`
- `receiverId`
- `createdAt`

### Review Table

Ratings and reviews after job completion.

```prisma
model Review {
  id          String   @id @default(cuid())
  jobId       String
  reviewerId  String
  revieweeId  String
  rating      Int      // 1-5 stars
  comment     String?
  createdAt   DateTime @default(now())
  
  @@unique([jobId, reviewerId])
}
```

**Business Rules:**
- One review per person per job
- Can only review after job completion
- Rating must be 1-5

### Skill & UserSkill Tables

Skill tracking and verification.

```prisma
model Skill {
  id          String   @id @default(cuid())
  name        String   @unique
  category    String
  description String?
}

model UserSkill {
  id                String     @id @default(cuid())
  userId            String
  skillId           String
  level             SkillLevel @default(INTERMEDIATE)
  isVerified        Boolean    @default(false)
  
  @@unique([userId, skillId])
}
```

**Skill Levels:**
- BEGINNER
- INTERMEDIATE
- ADVANCED
- EXPERT

## Database Queries

### Common Queries

#### Get Open Jobs with Filters

```typescript
const jobs = await prisma.job.findMany({
  where: {
    status: 'OPEN',
    category: 'Development',
    budget: {
      gte: 1000,
      lte: 5000,
    },
  },
  include: {
    client: true,
    requiredSkills: {
      include: { skill: true },
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
});
```

#### Get User's Completed Jobs

```typescript
const completedJobs = await prisma.job.count({
  where: {
    developerId: userId,
    status: 'COMPLETED',
  },
});
```

#### Calculate Average Rating

```typescript
const avgRating = await prisma.review.aggregate({
  where: { revieweeId: userId },
  _avg: { rating: true },
});
```

#### Get Unread Message Count

```typescript
const unreadCount = await prisma.message.count({
  where: {
    receiverId: userId,
    isRead: false,
  },
});
```

## Migrations

### Creating a Migration

```bash
cd backend
npx prisma migrate dev --name add_milestone_table
```

### Applying Migrations (Production)

```bash
npx prisma migrate deploy
```

### Resetting Database (Development)

```bash
npx prisma migrate reset
```

## Seeding

Create `backend/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create skills
  const skills = await prisma.skill.createMany({
    data: [
      { name: 'React', category: 'Frontend' },
      { name: 'Node.js', category: 'Backend' },
      { name: 'Solidity', category: 'Blockchain' },
    ],
  });

  // Create test users
  const user = await prisma.user.create({
    data: {
      walletAddress: '0x1234567890123456789012345678901234567890',
      username: 'testuser',
      role: 'DEVELOPER',
    },
  });

  console.log('Seeded:', { skills, user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:
```bash
npx prisma db seed
```

## Backup & Restore

### Backup Database

```bash
pg_dump freelance_marketplace > backup.sql
```

### Restore Database

```bash
psql freelance_marketplace < backup.sql
```

## Performance Optimization

### Indexes

Add indexes for frequently queried fields:

```prisma
@@index([status, createdAt])
@@index([clientId, status])
@@index([category, budget])
```

### Query Optimization

1. Use `select` to limit fields:
```typescript
const jobs = await prisma.job.findMany({
  select: {
    id: true,
    title: true,
    budget: true,
  },
});
```

2. Use `include` sparingly:
```typescript
// Good: Only include what you need
include: { client: { select: { username: true } } }

// Bad: Include everything
include: { client: true, proposals: true, messages: true }
```

3. Use pagination:
```typescript
const jobs = await prisma.job.findMany({
  take: 20,
  skip: offset,
});
```

### Connection Pooling

Configure in `DATABASE_URL`:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/db?connection_limit=10"
```

## Monitoring

### Query Logging

Enable in development:

```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### Slow Query Detection

Monitor queries taking > 1 second.

## Security

### Best Practices

1. **Never store private keys** in database
2. **Hash sensitive data** (if storing any)
3. **Use parameterized queries** (Prisma does this)
4. **Limit query results** (prevent DoS)
5. **Validate input** before database operations
6. **Use transactions** for multi-step operations

### Transactions Example

```typescript
await prisma.$transaction(async (tx) => {
  const proposal = await tx.proposal.update({
    where: { id: proposalId },
    data: { status: 'ACCEPTED' },
  });

  await tx.job.update({
    where: { id: proposal.jobId },
    data: { developerId: proposal.developerId },
  });

  await tx.proposal.updateMany({
    where: {
      jobId: proposal.jobId,
      id: { not: proposalId },
    },
    data: { status: 'REJECTED' },
  });
});
```

## Troubleshooting

### Connection Issues

Check:
1. PostgreSQL is running
2. DATABASE_URL is correct
3. Database exists
4. User has permissions

### Migration Conflicts

Reset and reapply:
```bash
npx prisma migrate reset
npx prisma migrate deploy
```

### Schema Drift

Sync schema without migration:
```bash
npx prisma db push
```

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Optimization Guide](https://www.prisma.io/docs/guides/performance-and-optimization)

