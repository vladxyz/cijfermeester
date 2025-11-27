import { Module, Course, CalculationResult } from './types';

export const generateId = (): string => Math.random().toString(36).substr(2, 9);

export const calculateModuleStats = (module: Module): CalculationResult => {
  let weightedSum = 0;
  let totalWeightTaken = 0;
  let totalWeightAll = 0;
  let hasFailedCourse = false;

  module.courses.forEach((course) => {
    totalWeightAll += course.weight;
    if (course.grade !== null) {
      weightedSum += course.grade * course.weight;
      totalWeightTaken += course.weight;
      
      // Check if individual course requirement is met
      if (course.grade < course.minGrade) {
        hasFailedCourse = true;
      }
    }
  });

  const currentAverage = totalWeightTaken > 0 ? weightedSum / totalWeightTaken : 0;
  
  // Target is either the user's wish or the minimum requirement
  const target = module.targetAverage ?? module.minAverage;

  // Math to find required grade(s)
  // Target * TotalWeight = (CurrentWeightedSum) + (RequiredGrade * RemainingWeight)
  const remainingWeight = totalWeightAll - totalWeightTaken;
  
  let requiredAverageForRemaining: number | null = null;
  let isImpossible = false;
  let projectedAverageWith5: number | null = null;

  // Calculate Min/Max possible scenarios
  // Min scenario: getting 1.0 for all remaining
  const minPossibleScore = weightedSum + (1.0 * remainingWeight);
  const minPossibleAverage = totalWeightAll > 0 ? parseFloat((minPossibleScore / totalWeightAll).toFixed(2)) : 1.0;

  // Max scenario: getting 10.0 for all remaining
  const maxPossibleScore = weightedSum + (10.0 * remainingWeight);
  const maxPossibleAverage = totalWeightAll > 0 ? parseFloat((maxPossibleScore / totalWeightAll).toFixed(2)) : 10.0;

  if (remainingWeight > 0) {
    const totalScoreNeeded = target * totalWeightAll;
    const scoreNeededFromRemaining = totalScoreNeeded - weightedSum;
    requiredAverageForRemaining = scoreNeededFromRemaining / remainingWeight;

    // Soft check for impossibility (e.g. needing a 12 out of 10)
    if (requiredAverageForRemaining > 10 || requiredAverageForRemaining < 0) {
        // Technically not impossible to calculate, but impossible to achieve in standard Dutch grading 1-10
        // We keep the number but flag it visually later, unless it's strictly > 10
        if (requiredAverageForRemaining > 10) isImpossible = true;
    }

    // If required average is below 5.0, calculate what the final average would be if the user gets exactly 5.0
    if (requiredAverageForRemaining < 5.0) {
      const projectedTotalScore = weightedSum + (5.0 * remainingWeight);
      projectedAverageWith5 = parseFloat((projectedTotalScore / totalWeightAll).toFixed(2));
    }
  }

  const averagePassed = currentAverage >= module.minAverage;

  return {
    currentAverage: parseFloat(currentAverage.toFixed(2)),
    totalWeightAccumulated: totalWeightTaken,
    totalWeightPossible: totalWeightAll,
    passed: averagePassed && !hasFailedCourse,
    requiredAverageForRemaining: requiredAverageForRemaining !== null ? parseFloat(requiredAverageForRemaining.toFixed(2)) : null,
    isImpossible,
    hasFailedCourse,
    projectedAverageWith5,
    minPossibleAverage,
    maxPossibleAverage
  };
};

export const createEmptyCourse = (): Course => ({
  id: generateId(),
  name: 'Nieuw Vak',
  weight: 1,
  minGrade: 5.0,
  grade: null,
});

export const createEmptyModule = (): Module => ({
  id: generateId(),
  name: 'Nieuwe Module',
  minAverage: 5.8,
  courses: [createEmptyCourse()],
});