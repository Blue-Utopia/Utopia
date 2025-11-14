import { Context } from '../../context';

export const notificationResolvers = {
  Query: {
    myNotifications: async (_: any, { limit = 50 }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      return await context.prisma.notification.findMany({
        where: { userId: context.user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    },

    unreadNotificationCount: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      return await context.prisma.notification.count({
        where: {
          userId: context.user.id,
          isRead: false,
        },
      });
    },
  },

  Mutation: {
    markNotificationAsRead: async (_: any, { id }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const notification = await context.prisma.notification.findUnique({
        where: { id },
      });

      if (!notification || notification.userId !== context.user.id) {
        throw new Error('Notification not found or unauthorized');
      }

      return await context.prisma.notification.update({
        where: { id },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    },

    markAllNotificationsAsRead: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      await context.prisma.notification.updateMany({
        where: {
          userId: context.user.id,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return true;
    },
  },

  Notification: {
    user: async (parent: any, _: any, context: Context) => {
      return await context.prisma.user.findUnique({
        where: { id: parent.userId },
      });
    },
  },
};

