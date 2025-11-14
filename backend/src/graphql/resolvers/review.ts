import { Context } from '../../context';

export const reviewResolvers = {
  Query: {
    userReviews: async (_: any, { userId }: any, context: Context) => {
      return await context.prisma.review.findMany({
        where: { revieweeId: userId },
        include: {
          reviewer: true,
          reviewee: true,
          job: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  },

  Mutation: {
    createReview: async (
      _: any,
      { jobId, revieweeId, rating, comment }: any,
      context: Context
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
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

      if (job.status !== 'COMPLETED') {
        throw new Error('Can only review completed jobs');
      }

      // Check if already reviewed
      const existing = await context.prisma.review.findUnique({
        where: {
          jobId_reviewerId: {
            jobId,
            reviewerId: context.user.id,
          },
        },
      });

      if (existing) {
        throw new Error('Already reviewed this job');
      }

      const review = await context.prisma.review.create({
        data: {
          jobId,
          reviewerId: context.user.id,
          revieweeId,
          rating,
          comment,
        },
        include: {
          reviewer: true,
          reviewee: true,
          job: true,
        },
      });

      // Create notification
      await context.prisma.notification.create({
        data: {
          userId: revieweeId,
          type: 'review_received',
          title: 'New Review',
          message: `You received a ${rating}-star review`,
          link: `/profile/${revieweeId}`,
        },
      });

      return review;
    },
  },

  Review: {
    job: async (parent: any, _: any, context: Context) => {
      return await context.prisma.job.findUnique({
        where: { id: parent.jobId },
      });
    },

    reviewer: async (parent: any, _: any, context: Context) => {
      return await context.prisma.user.findUnique({
        where: { id: parent.reviewerId },
      });
    },

    reviewee: async (parent: any, _: any, context: Context) => {
      return await context.prisma.user.findUnique({
        where: { id: parent.revieweeId },
      });
    },
  },
};

