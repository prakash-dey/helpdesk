export type TicketStats = {
  total: number;
  byStatus: Partial<Record<TicketStatus, number>>;
  byPriority: Partial<Record<TicketPriority, number>>;
  avgResolutionMs: number | null;
};

export type SlaStats = {
  total: number;
  breached: number;
  rate: number;
};

export type CsatStats = {
  count: number;
  average: number | null;
  distribution: Partial<Record<1 | 2 | 3 | 4 | 5, number>>;
};

export type TicketStatus =
  | 'NEW'
  | 'OPEN'
  | 'PENDING'
  | 'ON_HOLD'
  | 'SOLVED'
  | 'CLOSED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';