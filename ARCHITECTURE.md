# Architecture Documentation

## System Overview

The Decentralized Freelance Marketplace is a full-stack Web3 application that enables trustless freelance work through blockchain technology.

## Technology Stack

### Smart Contracts
- **Language**: Solidity 0.8.20
- **Framework**: Hardhat
- **Libraries**: OpenZeppelin Contracts
- **Networks**: Ethereum, Polygon, Sepolia (testnet)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **API**: GraphQL (Apollo Server)
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT + Wallet Signatures
- **SMS**: Twilio

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + TailwindCSS
- **Web3**: wagmi + viem + RainbowKit
- **State**: Zustand + Apollo Client
- **Notifications**: React Hot Toast

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  Next.js + React + TailwindCSS + RainbowKit                 │
│  - Wallet Connection                                         │
│  - Job Browsing & Posting                                   │
│  - Messaging                                                 │
│  - Profile Management                                        │
└────────────┬────────────────────────────────────────────────┘
             │
             │ HTTP/GraphQL/WebSocket
             │
┌────────────▼────────────────────────────────────────────────┐
│                         Backend                              │
│  Node.js + Express + Apollo GraphQL                         │
│  - Authentication (JWT + Signatures)                        │
│  - Business Logic                                            │
│  - Real-time Messaging (WebSocket)                          │
│  - SMS Verification (Twilio)                                │
└────────┬──────────────────┬─────────────────────────────────┘
         │                  │
         │                  │
┌────────▼─────────┐  ┌────▼──────────────────────────────────┐
│   PostgreSQL     │  │      Blockchain Layer                 │
│   + Prisma ORM   │  │  - Smart Contracts (Solidity)        │
│                  │  │  - Escrow Contract                    │
│  - Users         │  │  - Reputation System                  │
│  - Jobs          │  │  - Payment Handling                   │
│  - Proposals     │  │                                        │
│  - Messages      │  │  Networks:                            │
│  - Reviews       │  │  - Ethereum Mainnet                   │
│  - Skills        │  │  - Polygon                            │
└──────────────────┘  │  - Sepolia (Testnet)                 │
                      └───────────────────────────────────────┘
```

## Core Components

### 1. Smart Contracts

#### FreelanceEscrow.sol
Manages the escrow system for job payments.

**Key Features:**
- 50% upfront deposit
- 50% on completion
- Multi-token support (USDC, USDT, ETH)
- Dispute resolution
- Platform fee collection (2.5%)

**States:**
```
Created → Funded → InProgress → UnderReview → Completed
                      ↓
                  Disputed → Resolved
```

#### ReputationSystem.sol
Manages immutable on-chain reputation.

**Key Features:**
- Job completion tracking
- Rating system (1-5 stars)
- Skill badges
- Dispute history
- Earnings/spending tracking

**Data Stored:**
- Total jobs completed
- Average rating
- Completion rate
- Dispute rate
- Total earnings
- Skill badges

### 2. Backend API

#### GraphQL Schema

**Core Types:**
- User
- Job
- Proposal
- Message
- Review
- Skill
- Notification

**Main Queries:**
```graphql
me: User
jobs(filters: JobFilters): JobsConnection
job(id: ID!): Job
myJobs(role: String): [Job!]
```

**Main Mutations:**
```graphql
authenticateWallet(walletAddress, signature, message): AuthPayload
createJob(input: CreateJobInput): Job
createProposal(input: CreateProposalInput): Proposal
sendMessage(input: SendMessageInput): Message
createReview(jobId, revieweeId, rating, comment): Review
```

#### Authentication Flow

1. User connects wallet (MetaMask/WalletConnect)
2. Frontend requests nonce from backend
3. User signs nonce with wallet
4. Backend verifies signature
5. Backend issues JWT token
6. Token used for authenticated requests

#### Database Schema

**Core Tables:**
- `User` - User profiles and wallet info
- `Job` - Job postings
- `Proposal` - Developer proposals
- `Message` - Job-related messages
- `Review` - Ratings and reviews
- `Skill` - Available skills
- `UserSkill` - User's skills and verification
- `Portfolio` - Work samples
- `Notification` - In-app notifications

### 3. Frontend Application

#### Page Structure

```
/                    - Landing page
/jobs                - Browse jobs
/jobs/[id]           - Job details
/post-job            - Create new job
/my-jobs             - User's jobs (client/developer)
/profile/[address]   - User profile
/messages            - Messaging interface
/notifications       - Notifications
/settings            - User settings
```

#### State Management

**Global State (Zustand):**
- User authentication status
- Wallet connection
- Active job filters

**Server State (Apollo Client):**
- Jobs
- Proposals
- Messages
- User data

**Blockchain State (wagmi):**
- Wallet connection
- Network status
- Contract interactions
- Transaction status

## Data Flow

### Job Creation Flow

1. Client connects wallet & authenticates
2. Client fills job form (frontend)
3. Frontend sends GraphQL mutation to backend
4. Backend creates job in database (status: DRAFT)
5. Client publishes job
6. Backend updates status to OPEN
7. Job appears in marketplace

### Proposal & Hiring Flow

1. Developer browses jobs
2. Developer submits proposal
3. Backend creates proposal in database
4. Client receives notification
5. Client reviews proposals
6. Client accepts proposal
7. Backend:
   - Updates job with developer
   - Rejects other proposals
   - Sends notification to developer

### Escrow & Payment Flow

1. Client deposits 50% to smart contract
2. Smart contract emits event
3. Backend updates job status (FUNDED)
4. Developer starts work
5. Developer submits work
6. Client reviews and approves
7. Client deposits remaining 50%
8. Smart contract:
   - Deducts platform fee (2.5%)
   - Transfers payment to developer
9. Backend updates job status (COMPLETED)
10. Both parties leave reviews

### Dispute Resolution

1. Either party initiates dispute
2. Job status changes to DISPUTED
3. Platform admin/DAO reviews case
4. Admin calls smart contract dispute resolution
5. Smart contract splits escrowed funds
6. Funds distributed according to decision

## Security Considerations

### Smart Contract Security
- ReentrancyGuard for all fund transfers
- SafeERC20 for token operations
- Access control with Ownable
- Input validation
- Emergency pause functionality

### Backend Security
- JWT token authentication
- Rate limiting (100 req/15min)
- Input sanitization
- SQL injection prevention (Prisma)
- CORS configuration
- Helmet.js for headers

### Frontend Security
- No private keys stored
- Wallet signature verification
- XSS prevention
- CSRF protection
- Secure WebSocket connections

## Scalability

### Current Limitations
- Single backend server
- PostgreSQL primary database
- WebSocket connections per server

### Scaling Strategies

**Horizontal Scaling:**
- Multiple backend instances behind load balancer
- Redis for session sharing
- Message queue (RabbitMQ/Redis Pub/Sub)

**Database Scaling:**
- Read replicas for queries
- Connection pooling
- Caching layer (Redis)
- Index optimization

**Frontend Scaling:**
- CDN for static assets (Vercel/Cloudflare)
- Image optimization
- Code splitting
- Lazy loading

**Blockchain Scaling:**
- Layer 2 solutions (Polygon, Arbitrum)
- Batch transactions
- Gas optimization

## Monitoring & Observability

### Metrics to Track
- API response times
- Database query performance
- Smart contract gas usage
- User registration/authentication
- Job posting rate
- Proposal submission rate
- Transaction success/failure rates

### Tools
- Backend: Morgan (logging), custom metrics
- Frontend: Vercel Analytics, Web Vitals
- Blockchain: Etherscan, The Graph
- Errors: Sentry (recommended)

## Future Enhancements

### Phase 2
- Video calls integration
- Advanced skill tests
- DAO governance for disputes
- Multi-milestone jobs
- Subscription tiers

### Phase 3
- Mobile app (React Native)
- AI job matching
- Reputation NFTs
- Cross-chain support
- Decentralized storage (IPFS)

## Deployment Architecture

### Production Stack

```
Frontend (Vercel)
     ↓
API Gateway/Load Balancer
     ↓
Backend Instances (Railway/Render)
     ↓
PostgreSQL (Managed - RDS/Supabase)
     ↓
Redis (Managed - Redis Cloud)
     ↓
Blockchain (Ethereum/Polygon)
```

## License

MIT License - See LICENSE file for details

