import { cleanRuleManager, getManagerInfo, setRuleActivation } from '../manager/ruleManager';
import { getRule, getRules } from '../domain/rule';
import { internalLoadById } from '../database/middleware';

const ruleResolvers = {
  Query: {
    rule: (_, { id }) => getRule(id),
    rules: () => getRules(),
    ruleManagerInfo: (_, __, { user }) => getManagerInfo(user),
  },
  Inference: {
    rule: (inf) => getRule(inf.rule),
    explanation: (inf, _, { user }) => inf.explanation.map((e) => internalLoadById(user, e)),
  },
  Mutation: {
    ruleSetActivation: (_, { id, enable }, { user }) => setRuleActivation(user, id, enable),
    ruleManagerClean: (_, { eventId }, { user }) => cleanRuleManager(user, eventId),
  },
};

export default ruleResolvers;
