# Contributing to Decentralized Freelance Marketplace

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Maintain professional communication

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/decentralized-freelance-marketplace.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit: `git commit -m "Add: description of changes"`
7. Push: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Project Structure

```
├── contracts/          # Smart contracts (Solidity)
├── backend/           # Node.js backend API
│   ├── src/
│   │   ├── graphql/   # GraphQL schema & resolvers
│   │   ├── routes/    # REST API routes
│   │   └── middleware/ # Auth, validation, etc.
│   └── prisma/        # Database schema
├── frontend/          # Next.js frontend
│   ├── src/
│   │   ├── app/       # Pages (App Router)
│   │   ├── components/ # React components
│   │   ├── hooks/     # Custom hooks
│   │   └── lib/       # Utilities
└── docs/              # Documentation
```

## Contribution Areas

### 1. Smart Contracts
- Gas optimization
- Security improvements
- New features (milestone-based payments, etc.)
- Additional token support

### 2. Backend
- API endpoints
- GraphQL queries/mutations
- Performance optimization
- Bug fixes

### 3. Frontend
- UI/UX improvements
- New pages/components
- Responsive design
- Accessibility

### 4. Documentation
- Setup guides
- API documentation
- Architecture diagrams
- Tutorials

### 5. Testing
- Unit tests
- Integration tests
- Smart contract tests
- E2E tests

## Coding Standards

### Smart Contracts (Solidity)
```solidity
// Use clear, descriptive names
// Add NatSpec comments
// Follow Solidity style guide
// Use SafeMath/SafeERC20

/**
 * @notice Creates a new job
 * @param _developer Developer address
 * @param _amount Payment amount
 * @return jobId The created job ID
 */
function createJob(address _developer, uint256 _amount) external returns (uint256) {
    // Implementation
}
```

### Backend (TypeScript)
```typescript
// Use TypeScript strictly
// Add JSDoc comments for functions
// Follow ESLint rules
// Use async/await

/**
 * Create a new job
 * @param input Job creation data
 * @param context GraphQL context with user info
 * @returns Created job
 */
async function createJob(input: CreateJobInput, context: Context): Promise<Job> {
  // Implementation
}
```

### Frontend (React/TypeScript)
```typescript
// Use functional components
// Add TypeScript types
// Use descriptive variable names
// Extract reusable logic to hooks

interface JobCardProps {
  job: Job;
  onApply: (jobId: string) => void;
}

export function JobCard({ job, onApply }: JobCardProps) {
  // Implementation
}
```

## Commit Message Guidelines

Use conventional commits:

```
feat: Add user profile page
fix: Resolve wallet connection issue
docs: Update setup instructions
style: Format code with prettier
refactor: Simplify job creation logic
test: Add tests for escrow contract
chore: Update dependencies
```

## Pull Request Process

1. **Title**: Clear, descriptive title
2. **Description**: Explain what and why
3. **Testing**: Describe how you tested
4. **Screenshots**: If UI changes, include screenshots
5. **Breaking Changes**: Highlight any breaking changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing done

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No new warnings
```

## Testing Requirements

### Before Submitting PR

1. **Smart Contracts**: Run all tests
   ```bash
   cd contracts
   npx hardhat test
   ```

2. **Backend**: Ensure no TypeScript errors
   ```bash
   cd backend
   npm run type-check
   npm test
   ```

3. **Frontend**: Build succeeds
   ```bash
   cd frontend
   npm run build
   ```

## Bug Reports

Use GitHub Issues with the following information:

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 12.0]
- Browser: [e.g., Chrome 96]
- Wallet: [e.g., MetaMask 10.0]
- Network: [e.g., Sepolia]

## Screenshots
If applicable

## Additional Context
Any other relevant information
```

## Feature Requests

Use GitHub Issues with:

```markdown
## Feature Description
Clear description of the feature

## Problem It Solves
What problem does this address?

## Proposed Solution
How would it work?

## Alternatives Considered
Other approaches you've thought about

## Additional Context
Any other information
```

## Review Process

1. Maintainers will review within 3-5 business days
2. Address feedback in comments
3. Make requested changes
4. Update PR description if scope changes
5. Once approved, maintainers will merge

## Community

- **Discord**: [Your Discord server]
- **Twitter**: [Your Twitter]
- **GitHub Discussions**: [Link to discussions]

## Recognition

Contributors will be:
- Listed in README
- Mentioned in release notes
- Given credit in documentation

Thank you for contributing! 🚀

## Contributors
James Balmeo Prince
