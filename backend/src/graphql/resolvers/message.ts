import { Context } from '../../context';

export const messageResolvers = {
  Query: {
    jobMessages: async (_: any, { jobId }: any, context: Context) => {
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

      return await context.prisma.message.findMany({
        where: { jobId },
        include: {
          sender: true,
          receiver: true,
        },
        orderBy: { createdAt: 'asc' },
      });
    },

    unreadMessageCount: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      return await context.prisma.message.count({
        where: {
          receiverId: context.user.id,
          isRead: false,
        },
      });
    },
  },

  Mutation: {
    sendMessage: async (_: any, { input }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const job = await context.prisma.job.findUnique({
        where: { id: input.jobId },
      });

      if (!job) {
        throw new Error('Job not found');
      }

      if (job.clientId !== context.user.id && job.developerId !== context.user.id) {
        throw new Error('Unauthorized');
      }

      const message = await context.prisma.message.create({
        data: {
          jobId: input.jobId,
          senderId: context.user.id,
          receiverId: input.receiverId,
          content: input.content,
          attachments: input.attachments || [],
        },
        include: {
          sender: true,
          receiver: true,
          job: true,
        },
      });

      // Create notification
      await context.prisma.notification.create({
        data: {
          userId: input.receiverId,
          type: 'message_received',
          title: 'New Message',
          message: `You have a new message about "${job.title}"`,
          link: `/jobs/${job.id}`,
        },
      });

      return message;
    },

    markMessageAsRead: async (_: any, { id }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const message = await context.prisma.message.findUnique({
        where: { id },
      });

      if (!message || message.receiverId !== context.user.id) {
        throw new Error('Message not found or unauthorized');
      }

      return await context.prisma.message.update({
        where: { id },
        data: {
          isRead: true,
          readAt: new Date(),
        },
        include: {
          sender: true,
          receiver: true,
        },
      });
    },
  },

  Message: {
    job: async (parent: any, _: any, context: Context) => {
      return await context.prisma.job.findUnique({
        where: { id: parent.jobId },
      });
    },

    sender: async (parent: any, _: any, context: Context) => {
      return await context.prisma.user.findUnique({
        where: { id: parent.senderId },
      });
    },

    receiver: async (parent: any, _: any, context: Context) => {
      return await context.prisma.user.findUnique({
        where: { id: parent.receiverId },
      });
    },
  },
};

