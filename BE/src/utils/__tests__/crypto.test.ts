import { sha256Hex, randomToken, hmacSha256 } from '../crypto';

describe('crypto utils', () => {
  test('sha256Hex produces consistent hash', () => {
    expect(sha256Hex('hello')).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    expect(sha256Hex('hello')).toBe(sha256Hex('hello'));
  });

  test('randomToken produces unique values', () => {
    const t1 = randomToken();
    const t2 = randomToken();
    expect(t1).not.toBe(t2);
    expect(t1.length).toBe(64); // 32 bytes hex
  });

  test('hmacSha256 signature changes with different secrets', () => {
    const sig1 = hmacSha256('payload', 'secret1');
    const sig2 = hmacSha256('payload', 'secret2');
    expect(sig1).not.toBe(sig2);
  });
});
