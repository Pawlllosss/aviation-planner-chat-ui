export interface RetirementFormData {
  age?: number;
  sex?: 'M' | 'F';
  grossSalary?: number;
  startYear?: number;
  retirementYear?: number;
  desiredAmount?: number;
  expectedPension?: number;
  zipCode?: string;
  currentStep?: string;
  includeSickLeave?: boolean;
  avgSickDaysPerYear?: number;
}
