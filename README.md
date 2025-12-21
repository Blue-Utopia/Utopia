# Decentralized Freelance Marketplace

A trustless, crypto-powered freelance platform built on blockchain technology.

## 🚀 Features

- **Wallet-Based Authentication**: No passwords, just connect your Web3 wallet
- **Smart Contract Escrow**: Secure payments with 50% upfront, 50% on completion
- **On-Chain Reputation**: Immutable reputation scores stored on blockchain
- **Skill Verification**: Portfolio-based validation, coding tests, no KYC for developers
- **Crypto Payments**: USDT, USDC, ETH support
- **Instant Withdrawals**: Get paid immediately after job completion
- **Minimal Verification**: Phone/SMS for clients only

## 🏗️ Architecture

```
├── contracts/          # Solidity smart contracts
├── backend/           # Node.js API server
├── frontend/          # Next.js React application
└── database/          # Schema and migrations
```

## 📦 Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TailwindCSS
- wagmi & viem (Web3 integration)
- RainbowKit (Wallet connection)

### Backend
- Node.js with Express
- GraphQL (Apollo Server)
- PostgreSQL
- Redis (caching)
- Prisma (ORM)

### Blockchain
- Solidity smart contracts
- Hardhat development environment
- OpenZeppelin contracts
- Chainlink (if needed for oracles)

### Services
- Twilio (SMS verification)
- IPFS (file storage)
- The Graph (blockchain indexing)

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis
- MetaMask or compatible wallet

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd decentralized-freelance-marketplace
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install contract dependencies
cd contracts && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Run database migrations**
```bash
cd backend
npx prisma migrate dev
```

5. **Deploy smart contracts (local)**
```bash
cd contracts
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

6. **Start development servers**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

## 🔐 Security Features

- Smart contract auditing
- Encrypted messaging
- Rate limiting
- Anti-phishing measures
- Secure escrow system

## 📝 User Flows

### For Developers (Freelancers)
1. Complete skill verification
2. Connect wallet → Create profile
3. Browse jobs & submit proposals
4. Get hired & complete work
5. Receive instant crypto payment
6. Build on-chain reputation

### For Clients
1. Verify phone number
2. Connect wallet
3. Post job with details
4. Review proposals & hire developer
5. Deposit 50% to escrow(fixed, biweekly)
6. Review work & release payment
7. Leave rating

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

## 📄 License

MIT License

## ⚠️ Disclaimer

This platform operates with cryptocurrency. Users are responsible for their own due diligence. Always verify the reputation and skills of freelancers before hiring.

