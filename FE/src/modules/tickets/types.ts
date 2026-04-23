export type TicketStatus = 'NEW' | 'OPEN' | 'PENDING' | 'ON_HOLD' | 'SOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketChannel = 'WEB' | 'EMAIL' | 'API';

export interface TicketUser {
  id: string;
  name: string;
  email: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  channel: TicketChannel;
  slaBreachAt?: string;
  createdAt: string;
  updatedAt: string;
  requester: TicketUser;
  assignee?: TicketUser;
  team?: { id: string; name: string };
}

export interface Comment {
  id: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
  author: TicketUser & { role: string };
}
