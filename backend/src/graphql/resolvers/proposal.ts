import { Context } from '../../context';

export const proposalResolvers = {
  Query: {
    proposal: async (_: any, { id }: any, context: Context) => {
      return await context.prisma.proposal.findUnique({
        where: { id },
        include: {
          job: true,
          developer: true,
        },
      });
    },

    myProposals: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      return await context.prisma.proposal.findMany({
        where: { developerId: context.user.id },
        include: {
          job: {
            include: {
              client: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    jobProposals: async (_: any, { jobId }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const job = await context.prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!job || job.clientId !== context.user.id) {
        throw new Error('Job not found or unauthorized');
      }

      return await context.prisma.proposal.findMany({
        where: { jobId },
        include: {
          developer: {
            include: {
              skills: {
                include: { skill: true },
              },
              reviewsReceived: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  },

  Mutation: {
    createProposal: async (_: any, { input }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const job = await context.prisma.job.findUnique({
        where: { id: input.jobId },
      });

      if (!job) {
        throw new Error('Job not found');
      }

      if (job.status !== 'OPEN') {
        throw new Error('Job is not open for proposals');
      }

      if (job.clientId === context.user.id) {
        throw new Error('Cannot propose to your own job');
      }

      // Check if already proposed
      const existing = await context.prisma.proposal.findUnique({
        where: {
          jobId_developerId: {
            jobId: input.jobId,
            developerId: context.user.id,
          },
        },
      });

      if (existing) {
        throw new Error('Already submitted a proposal for this job');
      }

      const proposal = await context.prisma.proposal.create({
        data: {
          jobId: input.jobId,
          developerId: context.user.id,
          coverLetter: input.coverLetter,
          proposedBudget: input.proposedBudget,
          proposedDuration: input.proposedDuration,
          status: 'PENDING',
        },
        include: {
          job: true,
          developer: true,
        },
      });

      // Create notification for client
      await context.prisma.notification.create({
        data: {
          userId: job.clientId,
          type: 'proposal_received',
          title: 'New Proposal Received',
          message: `You received a new proposal for "${job.title}"`,
          link: `/jobs/${job.id}`,
        },
      });

      return proposal;
    },

    withdrawProposal: async (_: any, { id }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const proposal = await context.prisma.proposal.findUnique({
        where: { id },
      });

      if (!proposal || proposal.developerId !== context.user.id) {
        throw new Error('Proposal not found or unauthorized');
      }

      if (proposal.status !== 'PENDING') {
        throw new Error('Cannot withdraw proposal in current status');
      }

      return await context.prisma.proposal.update({
        where: { id },
        data: { status: 'WITHDRAWN' },
        include: {
          job: true,
          developer: true,
        },
      });
    },

    acceptProposal: async (_: any, { id }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const proposal = await context.prisma.proposal.findUnique({
        where: { id },
        include: { job: true },
      });

      if (!proposal) {
        throw new Error('Proposal not found');
      }

      if (proposal.job.clientId !== context.user.id) {
        throw new Error('Unauthorized');
      }

      // Update proposal status
      const updatedProposal = await context.prisma.proposal.update({
        where: { id },
        data: { status: 'ACCEPTED' },
        include: {
          job: true,
          developer: true,
        },
      });

      // Update job with developer
      await context.prisma.job.update({
        where: { id: proposal.jobId },
        data: {
          developerId: proposal.developerId,
          budget: proposal.proposedBudget,
        },
      });

      // Reject other proposals
      await context.prisma.proposal.updateMany({
        where: {
          jobId: proposal.jobId,
          id: { not: id },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      });

      // Create notification for developer
      await context.prisma.notification.create({
        data: {
          userId: proposal.developerId,
          type: 'proposal_accepted',
          title: 'Proposal Accepted!',
          message: `Your proposal for "${proposal.job.title}" has been accepted`,
          link: `/jobs/${proposal.job.id}`,
        },
      });

      return updatedProposal;
    },

    rejectProposal: async (_: any, { id }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const proposal = await context.prisma.proposal.findUnique({
        where: { id },
        include: { job: true },
      });

      if (!proposal) {
        throw new Error('Proposal not found');
      }

      if (proposal.job.clientId !== context.user.id) {
        throw new Error('Unauthorized');
      }

      return await context.prisma.proposal.update({
        where: { id },
        data: { status: 'REJECTED' },
        include: {
          job: true,
          developer: true,
        },
      });
    },
  },

  Proposal: {
    job: async (parent: any, _: any, context: Context) => {
      return await context.prisma.job.findUnique({
        where: { id: parent.jobId },
        include: { client: true },
      });
    },

    developer: async (parent: any, _: any, context: Context) => {
      return await context.prisma.user.findUnique({
        where: { id: parent.developerId },
      });
    },
  },
};

