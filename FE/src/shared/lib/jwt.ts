export type JwtClaims = {
  sub: string;
  email: string;
  role: string;
  orgId?: string;
  iat: number;
  exp: number;
};

export function decodeJwt(token: string): JwtClaims {
  const payload = token.split('.')[1];
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');

  return JSON.parse(window.atob(normalized)) as JwtClaims;
}