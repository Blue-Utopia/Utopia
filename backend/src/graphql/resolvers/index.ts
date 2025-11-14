import { userResolvers } from './user';
import { jobResolvers } from './job';
import { proposalResolvers } from './proposal';
import { messageResolvers } from './message';
import { reviewResolvers } from './review';
import { skillResolvers } from './skill';
import { notificationResolvers } from './notification';
import { GraphQLScalarType, Kind } from 'graphql';

const dateScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: any) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    throw Error('GraphQL Date Scalar serializer expected a `Date` object');
  },
  parseValue(value: any) {
    if (typeof value === 'string') {
      return new Date(value);
    }
    throw new Error('GraphQL Date Scalar parser expected a `string`');
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value: any) {
    return value;
  },
  parseValue(value: any) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.OBJECT) {
      return ast;
    }
    return null;
  },
});

export const resolvers = {
  DateTime: dateScalar,
  JSON: jsonScalar,
  Query: {
    ...userResolvers.Query,
    ...jobResolvers.Query,
    ...proposalResolvers.Query,
    ...messageResolvers.Query,
    ...reviewResolvers.Query,
    ...skillResolvers.Query,
    ...notificationResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...jobResolvers.Mutation,
    ...proposalResolvers.Mutation,
    ...messageResolvers.Mutation,
    ...reviewResolvers.Mutation,
    ...skillResolvers.Mutation,
    ...notificationResolvers.Mutation,
  },
  User: userResolvers.User,
  Job: jobResolvers.Job,
  Proposal: proposalResolvers.Proposal,
  Message: messageResolvers.Message,
  Review: reviewResolvers.Review,
  Skill: skillResolvers.Skill,
};

