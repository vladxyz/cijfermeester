export interface Course {
  id: string;
  name: string;
  weight: number;
  minGrade: number;
  grade: number | null; // null represents "not yet taken"
}

export interface Module {
  id: string;
  name: string;
  minAverage: number; // The minimum average to pass the module
  targetAverage?: number; // Optional user-defined target
  courses: Course[];
}

export interface CalculationResult {
  currentAverage: number;
  totalWeightAccumulated: number;
  totalWeightPossible: number;
  passed: boolean;
  requiredAverageForRemaining: number | null;
  isImpossible: boolean;
  hasFailedCourse: boolean;
  projectedAverageWith5: number | null;
  minPossibleAverage: number;
  maxPossibleAverage: number;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';