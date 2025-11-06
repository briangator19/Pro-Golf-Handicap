import { getUseCount } from '../services/handicapService';

describe('handicapService getUseCount mapping', () => {
  test('returns expected values', () => {
    expect(getUseCount(20)).toBe(8);
    expect(getUseCount(19)).toBe(7);
    expect(getUseCount(10)).toBe(3);
    expect(getUseCount(5)).toBe(1);
    expect(getUseCount(3)).toBe(0);
  });
});
