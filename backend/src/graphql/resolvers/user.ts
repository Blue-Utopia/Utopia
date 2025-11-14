import { Context } from '../../context';
import { verifyMessage } from 'ethers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      
      return await context.prisma.user.findUnique({
        where: { id: context.user.id },
      });
    },
    
    user: async (_: any, { id, walletAddress }: any, context: Context) => {
      const where = id ? { id } : { walletAddress };
      
      return await context.prisma.user.findUnique({
        where,
      });
    },
  },

  Mutation: {
    authenticateWallet: async (
      _: any,
      { walletAddress, signature, message }: any,
      context: Context
    ) => {
      try {
        // Verify the signature
        const recoveredAddress = verifyMessage(message, signature);
        
        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
          throw new Error('Invalid signature');
        }

        // Find or create user
        let user = await context.prisma.user.findUnique({
          where: { walletAddress: walletAddress.toLowerCase() },
        });

        if (!user) {
          user = await context.prisma.user.create({
            data: {
              walletAddress: walletAddress.toLowerCase(),
              lastActiveAt: new Date(),
            },
          });
        } else {
          // Update last active
          user = await context.prisma.user.update({
            where: { id: user.id },
            data: { lastActiveAt: new Date() },
          });
        }

        // Generate JWT token
        const token = jwt.sign(
          { 
            userId: user.id, 
            walletAddress: user.walletAddress 
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return {
          token,
          user,
        };
      } catch (error) {
        console.error('Authentication error:', error);
        throw new Error('Authentication failed');
      }
    },

    updateProfile: async (
      _: any,
      { input }: any,
      context: Context
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      return await context.prisma.user.update({
        where: { id: context.user.id },
        data: {
          ...input,
          updatedAt: new Date(),
        },
      });
    },

    addSkill: async (
      _: any,
      { input }: any,
      context: Context
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      return await context.prisma.userSkill.create({
        data: {
          userId: context.user.id,
          skillId: input.skillId,
          level: input.level,
          yearsOfExperience: input.yearsOfExperience,
        },
        include: {
          user: true,
          skill: true,
        },
      });
    },

    removeSkill: async (
      _: any,
      { skillId }: any,
      context: Context
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      await context.prisma.userSkill.deleteMany({
        where: {
          userId: context.user.id,
          skillId,
        },
      });

      return true;
    },

    addPortfolio: async (
      _: any,
      { input }: any,
      context: Context
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      return await context.prisma.portfolio.create({
        data: {
          userId: context.user.id,
          ...input,
        },
        include: {
          user: true,
        },
      });
    },

    deletePortfolio: async (
      _: any,
      { id }: any,
      context: Context
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const portfolio = await context.prisma.portfolio.findUnique({
        where: { id },
      });

      if (!portfolio || portfolio.userId !== context.user.id) {
        throw new Error('Portfolio not found or unauthorized');
      }

      await context.prisma.portfolio.delete({
        where: { id },
      });

      return true;
    },
  },

  User: {
    jobsAsClient: async (parent: any, _: any, context: Context) => {
      return await context.prisma.job.findMany({
        where: { clientId: parent.id },
        orderBy: { createdAt: 'desc' },
      });
    },

    jobsAsDeveloper: async (parent: any, _: any, context: Context) => {
      return await context.prisma.job.findMany({
        where: { developerId: parent.id },
        orderBy: { createdAt: 'desc' },
      });
    },

    proposals: async (parent: any, _: any, context: Context) => {
      return await context.prisma.proposal.findMany({
        where: { developerId: parent.id },
        orderBy: { createdAt: 'desc' },
      });
    },

    skills: async (parent: any, _: any, context: Context) => {
      return await context.prisma.userSkill.findMany({
        where: { userId: parent.id },
        include: { skill: true },
      });
    },

    portfolioItems: async (parent: any, _: any, context: Context) => {
      return await context.prisma.portfolio.findMany({
        where: { userId: parent.id },
        orderBy: { createdAt: 'desc' },
      });
    },

    reviewsGiven: async (parent: any, _: any, context: Context) => {
      return await context.prisma.review.findMany({
        where: { reviewerId: parent.id },
        orderBy: { createdAt: 'desc' },
      });
    },

    reviewsReceived: async (parent: any, _: any, context: Context) => {
      return await context.prisma.review.findMany({
        where: { revieweeId: parent.id },
        orderBy: { createdAt: 'desc' },
      });
    },

    averageRating: async (parent: any, _: any, context: Context) => {
      const result = await context.prisma.review.aggregate({
        where: { revieweeId: parent.id },
        _avg: { rating: true },
      });
      
      return result._avg.rating || 0;
    },

    totalJobs: async (parent: any, _: any, context: Context) => {
      const asClient = await context.prisma.job.count({
        where: { clientId: parent.id, status: 'COMPLETED' },
      });
      
      const asDeveloper = await context.prisma.job.count({
        where: { developerId: parent.id, status: 'COMPLETED' },
      });
      
      return asClient + asDeveloper;
    },

    completionRate: async (parent: any, _: any, context: Context) => {
      const total = await context.prisma.job.count({
        where: { developerId: parent.id },
      });
      
      if (total === 0) return 0;
      
      const completed = await context.prisma.job.count({
        where: { 
          developerId: parent.id,
          status: 'COMPLETED',
        },
      });
      
      return (completed / total) * 100;
    },
  },
};

