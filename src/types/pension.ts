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
