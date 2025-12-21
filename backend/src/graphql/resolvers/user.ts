import { Context } from '../../context';
import { verifyMessage } from 'ethers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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
          // For wallet auth, default to DEVELOPER role (users can create separate email account for CLIENT)
          user = await context.prisma.user.create({
            data: {
              walletAddress: walletAddress.toLowerCase(),
              role: 'DEVELOPER',
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

    signup: async (
      _: any,
      { email, password, username, displayName, role }: any,
      context: Context
    ) => {
      try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error('Invalid email format');
        }

        // Validate password strength
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }

        // Validate role - must be provided and must be CLIENT or DEVELOPER
        if (!role) {
          throw new Error('Role is required. Must be CLIENT or DEVELOPER');
        }
        if (!['CLIENT', 'DEVELOPER'].includes(role)) {
          throw new Error('Invalid role. Must be CLIENT or DEVELOPER');
        }

        // Check if user already exists
        const existingUser = await context.prisma.user.findFirst({
          where: {
            OR: [
              { email: email.toLowerCase() },
              ...(username ? [{ username }] : []),
            ],
          },
        });

        if (existingUser) {
          if (existingUser.email === email.toLowerCase()) {
            throw new Error('User with this email already exists');
          }
          if (username && existingUser.username === username) {
            throw new Error('Username already taken');
          }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with role (role is required)
        const user = await context.prisma.user.create({
          data: {
            email: email.toLowerCase(),
            password: hashedPassword,
            username: username || null,
            displayName: displayName || null,
            role: role,
            lastActiveAt: new Date(),
          },
        });

        // Generate JWT token
        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return {
          token,
          user: userWithoutPassword,
        };
      } catch (error: any) {
        console.error('Signup error:', error);
        throw new Error(error.message || 'Signup failed');
      }
    },

    signin: async (
      _: any,
      { email, password }: any,
      context: Context
    ) => {
      try {
        // Find user by email
        const user = await context.prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Check if user has a password (email/password user)
        if (!user.password) {
          throw new Error('Please sign in with your wallet or reset your password');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new Error('Invalid email or password');
        }

        // Update last active
        await context.prisma.user.update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() },
        });

        // Generate JWT token
        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return {
          token,
          user: userWithoutPassword,
        };
      } catch (error: any) {
        console.error('Signin error:', error);
        throw new Error(error.message || 'Signin failed');
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

      // Check if username is being updated and if it's already taken
      if (input.username) {
        const existingUser = await context.prisma.user.findUnique({
          where: { username: input.username },
        });
        
        if (existingUser && existingUser.id !== context.user.id) {
          throw new Error('Username already taken');
        }
      }

      return await context.prisma.user.update({
        where: { id: context.user.id },
        data: {
          ...input,
          updatedAt: new Date(),
        },
      });
    },

    changePassword: async (
      _: any,
      { currentPassword, newPassword }: any,
      context: Context
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      // Get user with password
      const user = await context.prisma.user.findUnique({
        where: { id: context.user.id },
      });

      if (!user || !user.password) {
        throw new Error('Password not set for this account');
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Validate new password
      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      // Hash and update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await context.prisma.user.update({
        where: { id: context.user.id },
        data: { password: hashedPassword },
      });

      return true;
    },

    changeUsername: async (
      _: any,
      { newUsername }: any,
      context: Context
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      // Check if username is already taken
      const existingUser = await context.prisma.user.findUnique({
        where: { username: newUsername },
      });

      if (existingUser) {
        throw new Error('Username already taken');
      }

      return await context.prisma.user.update({
        where: { id: context.user.id },
        data: {
          username: newUsername,
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

