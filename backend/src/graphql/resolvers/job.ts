import { Context } from '../../context';

export const jobResolvers = {
  Query: {
    job: async (_: any, { id }: any, context: Context) => {
      return await context.prisma.job.findUnique({
        where: { id },
        include: {
          client: true,
          developer: true,
          requiredSkills: {
            include: { skill: true },
          },
        },
      });
    },

    jobs: async (_: any, { filters, limit = 20, offset = 0 }: any, context: Context) => {
      const where: any = {};

      if (filters) {
        if (filters.category) {
          where.category = filters.category;
        }
        
        if (filters.status) {
          where.status = filters.status;
        } else {
          where.status = 'OPEN'; // Default to open jobs
        }
        
        if (filters.minBudget || filters.maxBudget) {
          where.budget = {};
          if (filters.minBudget) where.budget.gte = filters.minBudget;
          if (filters.maxBudget) where.budget.lte = filters.maxBudget;
        }
        
        if (filters.search) {
          where.OR = [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ];
        }
      } else {
        where.status = 'OPEN';
      }

      const [jobs, totalCount] = await Promise.all([
        context.prisma.job.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { createdAt: 'desc' },
          include: {
            client: true,
            requiredSkills: {
              include: { skill: true },
            },
          },
        }),
        context.prisma.job.count({ where }),
      ]);

      return {
        jobs,
        totalCount,
        hasMore: offset + limit < totalCount,
      };
    },

    myJobs: async (_: any, { role }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const where: any = {};
      
      if (role === 'client') {
        where.clientId = context.user.id;
      } else if (role === 'developer') {
        where.developerId = context.user.id;
      } else {
        where.OR = [
          { clientId: context.user.id },
          { developerId: context.user.id },
        ];
      }

      return await context.prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          client: true,
          developer: true,
          requiredSkills: {
            include: { skill: true },
          },
        },
      });
    },
  },

  Mutation: {
    createJob: async (_: any, { input }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const job = await context.prisma.job.create({
        data: {
          clientId: context.user.id,
          title: input.title,
          description: input.description,
          category: input.category,
          budget: input.budget,
          currency: input.currency,
          paymentToken: input.paymentToken,
          estimatedDuration: input.estimatedDuration,
          deadline: input.deadline,
          tags: input.tags || [],
          status: 'DRAFT',
        },
      });

      // Add required skills
      if (input.requiredSkills && input.requiredSkills.length > 0) {
        await Promise.all(
          input.requiredSkills.map((skillId: string) =>
            context.prisma.jobSkill.create({
              data: {
                jobId: job.id,
                skillId,
                required: true,
                level: 'INTERMEDIATE',
              },
            })
          )
        );
      }

      return await context.prisma.job.findUnique({
        where: { id: job.id },
        include: {
          client: true,
          requiredSkills: {
            include: { skill: true },
          },
        },
      });
    },

    updateJob: async (_: any, { id, input }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const job = await context.prisma.job.findUnique({
        where: { id },
      });

      if (!job || job.clientId !== context.user.id) {
        throw new Error('Job not found or unauthorized');
      }

      return await context.prisma.job.update({
        where: { id },
        data: {
          ...input,
          updatedAt: new Date(),
        },
        include: {
          client: true,
          developer: true,
          requiredSkills: {
            include: { skill: true },
          },
        },
      });
    },

    publishJob: async (_: any, { id }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const job = await context.prisma.job.findUnique({
        where: { id },
      });

      if (!job || job.clientId !== context.user.id) {
        throw new Error('Job not found or unauthorized');
      }

      return await context.prisma.job.update({
        where: { id },
        data: {
          status: 'OPEN',
          publishedAt: new Date(),
        },
        include: {
          client: true,
          requiredSkills: {
            include: { skill: true },
          },
        },
      });
    },

    deleteJob: async (_: any, { id }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const job = await context.prisma.job.findUnique({
        where: { id },
      });

      if (!job || job.clientId !== context.user.id) {
        throw new Error('Job not found or unauthorized');
      }

      if (job.status !== 'DRAFT' && job.status !== 'OPEN') {
        throw new Error('Cannot delete job in current status');
      }

      await context.prisma.job.delete({
        where: { id },
      });

      return true;
    },

    cancelJob: async (_: any, { id }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const job = await context.prisma.job.findUnique({
        where: { id },
      });

      if (!job) {
        throw new Error('Job not found');
      }

      if (job.clientId !== context.user.id && job.developerId !== context.user.id) {
        throw new Error('Unauthorized');
      }

      return await context.prisma.job.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          client: true,
          developer: true,
        },
      });
    },

    startJob: async (_: any, { jobId }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const job = await context.prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!job || job.developerId !== context.user.id) {
        throw new Error('Job not found or unauthorized');
      }

      return await context.prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
        include: {
          client: true,
          developer: true,
        },
      });
    },

    submitWork: async (_: any, { jobId }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const job = await context.prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!job || job.developerId !== context.user.id) {
        throw new Error('Job not found or unauthorized');
      }

      return await context.prisma.job.update({
        where: { id: jobId },
        data: { status: 'UNDER_REVIEW' },
        include: {
          client: true,
          developer: true,
        },
      });
    },

    approveWork: async (_: any, { jobId }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const job = await context.prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!job || job.clientId !== context.user.id) {
        throw new Error('Job not found or unauthorized');
      }

      return await context.prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
        include: {
          client: true,
          developer: true,
        },
      });
    },

    requestRevision: async (_: any, { jobId, message }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const job = await context.prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!job || job.clientId !== context.user.id) {
        throw new Error('Job not found or unauthorized');
      }

      // Send message to developer
      await context.prisma.message.create({
        data: {
          jobId,
          senderId: context.user.id,
          receiverId: job.developerId!,
          content: `Revision requested: ${message}`,
        },
      });

      return await context.prisma.job.update({
        where: { id: jobId },
        data: { status: 'IN_PROGRESS' },
        include: {
          client: true,
          developer: true,
        },
      });
    },

    initiateDispute: async (_: any, { jobId, reason }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const job = await context.prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        throw new Error('Job not found');
      }

      if (job.clientId !== context.user.id && job.developerId !== context.user.id) {
        throw new Error('Unauthorized');
      }

      return await context.prisma.job.update({
        where: { id: jobId },
        data: { status: 'DISPUTED' },
        include: {
          client: true,
          developer: true,
        },
      });
    },
  },

  Job: {
    client: async (parent: any, _: any, context: Context) => {
      return await context.prisma.user.findUnique({
        where: { id: parent.clientId },
      });
    },

    developer: async (parent: any, _: any, context: Context) => {
      if (!parent.developerId) return null;
      
      return await context.prisma.user.findUnique({
        where: { id: parent.developerId },
      });
    },

    proposals: async (parent: any, _: any, context: Context) => {
      return await context.prisma.proposal.findMany({
        where: { jobId: parent.id },
        include: { developer: true },
        orderBy: { createdAt: 'desc' },
      });
    },

    requiredSkills: async (parent: any, _: any, context: Context) => {
      return await context.prisma.jobSkill.findMany({
        where: { jobId: parent.id },
        include: { skill: true },
      });
    },

    milestones: async (parent: any, _: any, context: Context) => {
      return await context.prisma.milestone.findMany({
        where: { jobId: parent.id },
        orderBy: { createdAt: 'asc' },
      });
    },

    messages: async (parent: any, _: any, context: Context) => {
      return await context.prisma.message.findMany({
        where: { jobId: parent.id },
        include: {
          sender: true,
          receiver: true,
        },
        orderBy: { createdAt: 'asc' },
      });
    },

    reviews: async (parent: any, _: any, context: Context) => {
      return await context.prisma.review.findMany({
        where: { jobId: parent.id },
        include: {
          reviewer: true,
          reviewee: true,
        },
      });
    },

    proposalCount: async (parent: any, _: any, context: Context) => {
      return await context.prisma.proposal.count({
        where: { jobId: parent.id },
      });
    },
  },
};

