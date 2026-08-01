import { CostStandard, LinkSpeed } from './types';

/** IEEE 802.1D Short (16-bit) Path Cost Table */
export const SHORT_COST_TABLE: Record<LinkSpeed, number> = {
  '10M': 100,
  '100M': 19,
  '1G': 4,
  '10G': 2,
  '40G': 1,
  '100G': 1,
};

/** IEEE 802.1t Long (32-bit) Path Cost Table */
export const LONG_COST_TABLE: Record<LinkSpeed, number> = {
  '10M': 2000000,
  '100M': 200000,
  '1G': 20000,
  '10G': 2000,
  '40G': 500,
  '100G': 200,
};

export function getLinkCost(speed: LinkSpeed, standard: CostStandard): number {
  if (standard === 'short') {
    return SHORT_COST_TABLE[speed] ?? 19;
  }
  return LONG_COST_TABLE[speed] ?? 200000;
}

export function formatCost(cost: number): string {
  return cost.toLocaleString('en-US');
}
