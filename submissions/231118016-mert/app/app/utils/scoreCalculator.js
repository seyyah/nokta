export const calculateScore = (answers) => {
  let score = 0;
  if (answers.problem && answers.problem.trim().length > 0) score += 20;
  if (answers.user && answers.user.trim().length > 0) score += 20;
  if (answers.scope && answers.scope.trim().length > 0) score += 20;
  if (answers.constraint && answers.constraint.trim().length > 0) score += 20;
  if (answers.metric && answers.metric.trim().length > 0) score += 20;
  return score;
};

export const getMissingFields = (answers) => {
  const missing = [];
  if (!answers.problem || answers.problem.trim().length === 0) missing.push("Problem");
  if (!answers.user || answers.user.trim().length === 0) missing.push("User");
  if (!answers.scope || answers.scope.trim().length === 0) missing.push("Scope");
  if (!answers.constraint || answers.constraint.trim().length === 0) missing.push("Constraint");
  if (!answers.metric || answers.metric.trim().length === 0) missing.push("Success Metric");
  return missing;
};
