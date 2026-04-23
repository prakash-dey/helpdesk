declare namespace Express {
  interface Request {
    userId?: string;
    userEmail?: string;
    userRole?: string;
    orgId?: string;
  }
}
