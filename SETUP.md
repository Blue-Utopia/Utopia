# Setup Guide

Complete setup instructions for the Decentralized Freelance Marketplace.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Redis** (Optional, for caching) ([Download](https://redis.io/download))
- **Git** ([Download](https://git-scm.com/downloads))
- **MetaMask** or compatible Web3 wallet

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd decentralized-freelance-marketplace
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install contract dependencies
cd contracts
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Configuration

#### Backend Environment (.env)

Create `backend/.env`:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/freelance_marketplace
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
BLOCKCHAIN_NETWORK=localhost
TWILIO_ACCOUNT_SID=your-twilio-sid (optional for development)
TWILIO_AUTH_TOKEN=your-twilio-token (optional)
TWILIO_PHONE_NUMBER=+1234567890 (optional)
```

#### Frontend Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_CHAIN_ID=1337
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
```

Get a WalletConnect Project ID from: https://cloud.walletconnect.com/

### 4. Database Setup

```bash
cd backend

# Create database
createdb freelance_marketplace

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

### 5. Deploy Smart Contracts (Local)

Terminal 1 - Start local blockchain:
```bash
cd contracts
npx hardhat node
```

Terminal 2 - Deploy contracts:
```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract addresses to `backend/.env`:
```env
ESCROW_CONTRACT_ADDRESS=0x...
REPUTATION_CONTRACT_ADDRESS=0x...
```

### 6. Start Development Servers

#### Terminal 1: Backend
```bash
cd backend
npm run dev
```
Server will run on http://localhost:4000

#### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

## Testing

### Smart Contract Tests

```bash
cd contracts
npx hardhat test
```

### Backend Tests

```bash
cd backend
npm test
```

## Deployment

### Smart Contracts to Testnet (Sepolia)

1. Add testnet configuration to `.env`:
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-KEY
PRIVATE_KEY=your-private-key
ETHERSCAN_API_KEY=your-etherscan-key
```

2. Deploy:
```bash
cd contracts
npx hardhat run scripts/deploy.js --network sepolia
```

3. Verify contracts:
```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

### Backend Deployment

#### Using Railway/Render/Heroku

1. Create a PostgreSQL database
2. Set environment variables
3. Deploy using Git:
```bash
git push heroku main
```

4. Run migrations:
```bash
heroku run npx prisma migrate deploy
```

### Frontend Deployment (Vercel)

```bash
cd frontend
vercel deploy
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Development Workflow

### Adding a New Feature

1. **Smart Contracts**: Update in `contracts/contracts/`
2. **Backend**: 
   - Update Prisma schema if needed: `backend/prisma/schema.prisma`
   - Add GraphQL types: `backend/src/graphql/schema.ts`
   - Add resolvers: `backend/src/graphql/resolvers/`
3. **Frontend**: 
   - Add pages: `frontend/src/app/`
   - Add components: `frontend/src/components/`

### Database Changes

```bash
cd backend

# Make changes to schema.prisma, then:
npx prisma migrate dev --name describe_your_changes

# Generate Prisma Client
npx prisma generate
```

### Smart Contract Changes

```bash
cd contracts

# Compile contracts
npx hardhat compile

# Test contracts
npx hardhat test

# Deploy
npx hardhat run scripts/deploy.js --network localhost
```

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check connection string in `.env`
- Ensure database exists: `psql -l`

### Smart Contract Errors

- Clear cache: `npx hardhat clean`
- Recompile: `npx hardhat compile`
- Check gas limits and network configuration

### Frontend Build Errors

- Clear Next.js cache: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check that API URL is correct in `.env.local`

### Wallet Connection Issues

- Ensure MetaMask is on the correct network (localhost:8545 for development)
- Check WalletConnect Project ID is set
- Clear browser cache and reconnect wallet

## Production Checklist

- [ ] Change all default secrets and passwords
- [ ] Set up proper database backups
- [ ] Configure proper CORS origins
- [ ] Set up monitoring and logging
- [ ] Audit smart contracts
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting
- [ ] Set up email notifications (optional)
- [ ] Configure Twilio for SMS verification
- [ ] Test on testnet before mainnet deployment

## Support

For issues and questions:
- GitHub Issues: [Link to your repo]
- Discord: [Your Discord server]
- Documentation: [Your docs link]

## License

MIT License - see LICENSE file for details

