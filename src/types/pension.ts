export interface DelayedScenario {
  years: number;
  pension: number;
  increasePct: number;
}

export interface PensionDetails {
  withSickLeave: number;
  withoutSickLeave: number;
  replacementRate: number;
  vsAveragePension: number;
  finalAveragePension: number;
  finalSalary: number;
  delayedScenarios: DelayedScenario[];
  salaryNeededForExpected: number | null;
}

export interface AccountProgression {
  year: number;
  balanceNominal: number;
  balanceReal: number;
}

export interface PensionResponse {
  nominalPension: PensionDetails;
  realPension: PensionDetails;
  accountProgression: AccountProgression[];
}

export interface PensionRequest {
  age: number;
  sex: 'M' | 'F';
  startYear: number;
  grossSalary: number;
  retirementYear: number;
  expectedPension: number;
  zipCode?: string;
}

export interface PensionCalculationAuditing {
  calculatedAt: string;
  request: PensionRequest;
  response: PensionResponse;
}
