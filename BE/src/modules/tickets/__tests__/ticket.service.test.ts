// Unit tests for the ticket status machine
import { TicketStatus } from '@prisma/client';

const VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.NEW]: [TicketStatus.OPEN, TicketStatus.PENDING, TicketStatus.ON_HOLD, TicketStatus.CLOSED],
  [TicketStatus.OPEN]: [TicketStatus.PENDING, TicketStatus.ON_HOLD, TicketStatus.SOLVED, TicketStatus.CLOSED],
  [TicketStatus.PENDING]: [TicketStatus.OPEN, TicketStatus.ON_HOLD, TicketStatus.SOLVED, TicketStatus.CLOSED],
  [TicketStatus.ON_HOLD]: [TicketStatus.OPEN, TicketStatus.PENDING, TicketStatus.SOLVED],
  [TicketStatus.SOLVED]: [TicketStatus.CLOSED, TicketStatus.OPEN],
  [TicketStatus.CLOSED]: [TicketStatus.OPEN],
};

function isValidTransition(from: TicketStatus, to: TicketStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

describe('Ticket Status Machine', () => {
  test('NEW can transition to OPEN', () => {
    expect(isValidTransition(TicketStatus.NEW, TicketStatus.OPEN)).toBe(true);
  });

  test('NEW can transition to CLOSED directly', () => {
    expect(isValidTransition(TicketStatus.NEW, TicketStatus.CLOSED)).toBe(true);
  });

  test('SOLVED can be re-opened', () => {
    expect(isValidTransition(TicketStatus.SOLVED, TicketStatus.OPEN)).toBe(true);
  });

  test('CLOSED can be re-opened', () => {
    expect(isValidTransition(TicketStatus.CLOSED, TicketStatus.OPEN)).toBe(true);
  });

  test('ON_HOLD cannot transition to CLOSED directly', () => {
    expect(isValidTransition(TicketStatus.ON_HOLD, TicketStatus.CLOSED)).toBe(false);
  });

  test('CLOSED cannot transition to PENDING', () => {
    expect(isValidTransition(TicketStatus.CLOSED, TicketStatus.PENDING)).toBe(false);
  });

  test('all statuses have defined transitions', () => {
    Object.values(TicketStatus).forEach((status) => {
      expect(VALID_TRANSITIONS[status]).toBeDefined();
    });
  });
});
