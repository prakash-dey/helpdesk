export type TicketStatus =
  | 'NEW'
  | 'OPEN'
  | 'PENDING'
  | 'ON_HOLD'
  | 'SOLVED'
  | 'CLOSED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TicketChannel = 'WEB' | 'EMAIL' | 'API';

export type TicketUser = {
  id: string;
  name: string;
  email: string;
};

export type TicketTeam = {
  id: string;
  name: string;
};

export type Ticket = {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  channel: TicketChannel;
  createdAt: string;
  updatedAt: string;
  slaBreachAt: string | null;
  requester: TicketUser;
  assignee: TicketUser | null;
  team: TicketTeam | null;
};

export type CursorPage<T> = {
  data: T[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
};

export type TicketListParams = {
  status?: TicketStatus;
  priority?: TicketPriority;
  channel?: TicketChannel;
  cursor?: string;
  limit?: number;
};
export type CreateTicketPayload = {
  subject: string;
  description: string;
  priority: TicketPriority;
  channel: TicketChannel;
};