export function calculatePowerLawAllocation(
  estimatedMinutes: number,
  taskCount: number
): {
  optimal: number;
  min: number;
  max: number;
  exponent: number;
} {
  // Calculate power-law exponent based on task characteristics
  // Higher exponent = benefits more from longer blocks
  const baseExponent = 1.0;
  const complexityFactor = Math.log10(estimatedMinutes / 10);
  const exponent = Math.max(0.5, Math.min(2.5, baseExponent + complexityFactor));
  
  // Apply power-law scaling
  const optimal = Math.round(estimatedMinutes * Math.pow(1.2, exponent - 1));
  const min = Math.round(optimal * 0.6);
  const max = Math.round(optimal * 1.5);
  
  return { optimal, min, max, exponent };
}

export function calculateSwitchCost(
  fromTask: { contextSwitchCost: number } | null,
  toTask: { contextSwitchCost: number }
): number {
  if (!fromTask) return toTask.contextSwitchCost;
  return (fromTask.contextSwitchCost + toTask.contextSwitchCost) / 2;
}

export function calculateConeOfSlippage(
  estimatedMinutes: number,
  historicalAccuracy: number
): {
  lower: number;
  upper: number;
  confidence: number;
} {
  const variance = 1 - historicalAccuracy;
  const lower = Math.round(estimatedMinutes * (1 - variance * 0.3));
  const upper = Math.round(estimatedMinutes * (1 + variance * 0.5));
  const confidence = Math.max(0.5, Math.min(0.95, historicalAccuracy));
  
  return { lower, upper, confidence };
}