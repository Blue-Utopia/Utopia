import { Context } from '../../context';

export const skillResolvers = {
  Query: {
    skills: async (_: any, { category }: any, context: Context) => {
      const where = category ? { category } : {};
      
      return await context.prisma.skill.findMany({
        where,
        orderBy: { name: 'asc' },
      });
    },

    skill: async (_: any, { id }: any, context: Context) => {
      return await context.prisma.skill.findUnique({
        where: { id },
      });
    },
  },

  Mutation: {
    takeSkillTest: async (_: any, { skillId }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      // In a real implementation, this would:
      // 1. Fetch test questions from a database
      // 2. Present them to the user
      // 3. Calculate score
      // For now, we'll just create a mock result

      const skill = await context.prisma.skill.findUnique({
        where: { id: skillId },
      });

      if (!skill) {
        throw new Error('Skill not found');
      }

      // Mock score (in real app, this would be calculated from answers)
      const score = 75;
      const passed = score >= 70;

      const skillTest = await context.prisma.skillTest.create({
        data: {
          userId: context.user.id,
          skillId,
          score,
          maxScore: 100,
          passed,
          testData: JSON.stringify({ /* test questions and answers */ }),
        },
        include: {
          user: true,
          skill: true,
        },
      });

      // If passed, update user skill to verified
      if (passed) {
        await context.prisma.userSkill.updateMany({
          where: {
            userId: context.user.id,
            skillId,
          },
          data: {
            isVerified: true,
            verifiedAt: new Date(),
          },
        });
      }

      return skillTest;
    },
  },

  Skill: {
    // Add any field resolvers if needed
  },
};

