import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  type User {
    id: ID!
    walletAddress: String!
    username: String
    email: String
    phoneNumber: String
    phoneVerified: Boolean!
    role: UserRole!
    displayName: String
    bio: String
    avatar: String
    location: String
    timezone: String
    isVerified: Boolean!
    verificationStatus: VerificationStatus!
    reputationAddress: String
    createdAt: DateTime!
    updatedAt: DateTime!
    lastActiveAt: DateTime!
    
    # Computed fields
    jobsAsClient: [Job!]!
    jobsAsDeveloper: [Job!]!
    proposals: [Proposal!]!
    skills: [UserSkill!]!
    portfolioItems: [Portfolio!]!
    reviewsGiven: [Review!]!
    reviewsReceived: [Review!]!
    averageRating: Float
    totalJobs: Int!
    completionRate: Float
  }

  type Job {
    id: ID!
    title: String!
    description: String!
    category: String!
    budget: Float!
    currency: String!
    paymentToken: String!
    escrowAddress: String
    blockchainJobId: Int
    estimatedDuration: Int
    deadline: DateTime
    status: JobStatus!
    client: User!
    developer: User
    proposals: [Proposal!]!
    requiredSkills: [JobSkill!]!
    milestones: [Milestone!]!
    messages: [Message!]!
    reviews: [Review!]!
    tags: [String!]!
    attachments: [String!]!
    createdAt: DateTime!
    updatedAt: DateTime!
    publishedAt: DateTime
    startedAt: DateTime
    completedAt: DateTime
    proposalCount: Int!
  }

  type Proposal {
    id: ID!
    job: Job!
    developer: User!
    coverLetter: String!
    proposedBudget: Float!
    proposedDuration: Int
    status: ProposalStatus!
    attachments: [String!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Skill {
    id: ID!
    name: String!
    category: String!
    description: String
    createdAt: DateTime!
  }

  type UserSkill {
    id: ID!
    user: User!
    skill: Skill!
    level: SkillLevel!
    yearsOfExperience: Float
    isVerified: Boolean!
    verifiedAt: DateTime
    createdAt: DateTime!
  }

  type JobSkill {
    id: ID!
    job: Job!
    skill: Skill!
    required: Boolean!
    level: SkillLevel!
  }

  type Portfolio {
    id: ID!
    user: User!
    title: String!
    description: String!
    url: String
    images: [String!]!
    tags: [String!]!
    createdAt: DateTime!
  }

  type SkillTest {
    id: ID!
    user: User!
    skill: Skill!
    score: Float!
    maxScore: Float!
    passed: Boolean!
    takenAt: DateTime!
  }

  type Review {
    id: ID!
    job: Job!
    reviewer: User!
    reviewee: User!
    rating: Int!
    comment: String
    blockchainTxHash: String
    createdAt: DateTime!
  }

  type Milestone {
    id: ID!
    job: Job!
    title: String!
    description: String
    amount: Float!
    status: String!
    dueDate: DateTime
    completedAt: DateTime
    paidAt: DateTime
    createdAt: DateTime!
  }

  type Message {
    id: ID!
    job: Job!
    sender: User!
    receiver: User!
    content: String!
    attachments: [String!]!
    isRead: Boolean!
    readAt: DateTime
    createdAt: DateTime!
  }

  type Notification {
    id: ID!
    user: User!
    type: String!
    title: String!
    message: String!
    link: String
    metadata: JSON
    isRead: Boolean!
    readAt: DateTime
    createdAt: DateTime!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type JobsConnection {
    jobs: [Job!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  enum UserRole {
    DEVELOPER
    CLIENT
    BOTH
  }

  enum VerificationStatus {
    PENDING
    VERIFIED
    REJECTED
  }

  enum JobStatus {
    DRAFT
    OPEN
    IN_PROGRESS
    UNDER_REVIEW
    COMPLETED
    CANCELLED
    DISPUTED
  }

  enum ProposalStatus {
    PENDING
    ACCEPTED
    REJECTED
    WITHDRAWN
  }

  enum SkillLevel {
    BEGINNER
    INTERMEDIATE
    ADVANCED
    EXPERT
  }

  input CreateJobInput {
    title: String!
    description: String!
    category: String!
    budget: Float!
    currency: String!
    paymentToken: String!
    estimatedDuration: Int
    deadline: DateTime
    tags: [String!]
    requiredSkills: [String!]!
  }

  input UpdateJobInput {
    title: String
    description: String
    category: String
    budget: Float
    estimatedDuration: Int
    deadline: DateTime
    tags: [String!]
    requiredSkills: [String!]
  }

  input CreateProposalInput {
    jobId: ID!
    coverLetter: String!
    proposedBudget: Float!
    proposedDuration: Int
  }

  input UpdateProfileInput {
    username: String
    displayName: String
    bio: String
    avatar: String
    location: String
    timezone: String
  }

  input AddSkillInput {
    skillId: ID!
    level: SkillLevel!
    yearsOfExperience: Float
  }

  input CreatePortfolioInput {
    title: String!
    description: String!
    url: String
    images: [String!]
    tags: [String!]
  }

  input SendMessageInput {
    jobId: ID!
    receiverId: ID!
    content: String!
    attachments: [String!]
  }

  input JobFilters {
    category: String
    minBudget: Float
    maxBudget: Float
    skills: [String!]
    status: JobStatus
    search: String
  }

  type Query {
    # User queries
    me: User
    user(id: ID, walletAddress: String): User
    
    # Job queries
    job(id: ID!): Job
    jobs(filters: JobFilters, limit: Int, offset: Int): JobsConnection!
    myJobs(role: String): [Job!]!
    
    # Proposal queries
    proposal(id: ID!): Proposal
    myProposals: [Proposal!]!
    jobProposals(jobId: ID!): [Proposal!]!
    
    # Skill queries
    skills(category: String): [Skill!]!
    skill(id: ID!): Skill
    
    # Message queries
    jobMessages(jobId: ID!): [Message!]!
    unreadMessageCount: Int!
    
    # Notification queries
    myNotifications(limit: Int): [Notification!]!
    unreadNotificationCount: Int!
    
    # Review queries
    userReviews(userId: ID!): [Review!]!
    
    # Portfolio queries
    userPortfolio(userId: ID!): [Portfolio!]!
  }

  type Mutation {
    # Authentication
    authenticateWallet(walletAddress: String!, signature: String!, message: String!): AuthPayload!
    verifyPhone(phoneNumber: String!): Boolean!
    confirmPhoneCode(phoneNumber: String!, code: String!): Boolean!
    
    # Profile management
    updateProfile(input: UpdateProfileInput!): User!
    addSkill(input: AddSkillInput!): UserSkill!
    removeSkill(skillId: ID!): Boolean!
    addPortfolio(input: CreatePortfolioInput!): Portfolio!
    deletePortfolio(id: ID!): Boolean!
    
    # Job management
    createJob(input: CreateJobInput!): Job!
    updateJob(id: ID!, input: UpdateJobInput!): Job!
    publishJob(id: ID!): Job!
    deleteJob(id: ID!): Boolean!
    cancelJob(id: ID!): Job!
    
    # Proposal management
    createProposal(input: CreateProposalInput!): Proposal!
    withdrawProposal(id: ID!): Proposal!
    acceptProposal(id: ID!): Proposal!
    rejectProposal(id: ID!): Proposal!
    
    # Job workflow
    startJob(jobId: ID!): Job!
    submitWork(jobId: ID!): Job!
    approveWork(jobId: ID!): Job!
    requestRevision(jobId: ID!, message: String!): Job!
    
    # Messaging
    sendMessage(input: SendMessageInput!): Message!
    markMessageAsRead(id: ID!): Message!
    
    # Reviews
    createReview(jobId: ID!, revieweeId: ID!, rating: Int!, comment: String): Review!
    
    # Notifications
    markNotificationAsRead(id: ID!): Notification!
    markAllNotificationsAsRead: Boolean!
    
    # Skill verification
    takeSkillTest(skillId: ID!): SkillTest!
    
    # Dispute
    initiateDispute(jobId: ID!, reason: String!): Job!
  }

  type Subscription {
    messageReceived(jobId: ID!): Message!
    notificationReceived: Notification!
    jobUpdated(jobId: ID!): Job!
  }
`;

