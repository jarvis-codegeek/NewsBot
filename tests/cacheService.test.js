import { cache } from '../server/services/cacheService.js';

describe('CacheService Unit Tests (Jest)', () => {
  beforeEach(() => {
    cache.clear();
  });

  test('stores and retrieves a value before TTL expires', () => {
    cache.set('headline_1', { title: 'AI Breakthrough', score: 98 }, 60);
    const retrieved = cache.get('headline_1');
    expect(retrieved).toEqual({ title: 'AI Breakthrough', score: 98 });
  });

  test('returns null for a non-existent key', () => {
    const val = cache.get('unknown_key');
    expect(val).toBeNull();
  });

  test('deletes an existing key', () => {
    cache.set('temp_key', 'temp_value', 60);
    expect(cache.get('temp_key')).toBe('temp_value');
    cache.delete('temp_key');
    expect(cache.get('temp_key')).toBeNull();
  });

  test('clears all cached entries', () => {
    cache.set('k1', 'val1', 60);
    cache.set('k2', 'val2', 60);
    cache.set('k3', 'val3', 60);

    cache.clear();

    expect(cache.get('k1')).toBeNull();
    expect(cache.get('k2')).toBeNull();
    expect(cache.get('k3')).toBeNull();
  });

  test('expires items after TTL passes', async () => {
    cache.set('short_lived', 'expires_fast', 0.05);
    expect(cache.get('short_lived')).toBe('expires_fast');

    await new Promise((resolve) => setTimeout(resolve, 80));

    expect(cache.get('short_lived')).toBeNull();
  });

  test('defaults TTL to 300 seconds if not specified', () => {
    cache.set('default_ttl_key', 'should_live_300s');
    const item = cache.cache.get('default_ttl_key');
    expect(item).toBeDefined();
    expect(item.expiry).toBeGreaterThan(Date.now() + 290 * 1000);
    expect(item.expiry).toBeLessThanOrEqual(Date.now() + 301 * 1000);
  });

  test('overwrites previous value and updates TTL on set', () => {
    cache.set('item', 'v1', 10);
    expect(cache.get('item')).toBe('v1');

    cache.set('item', 'v2', 20);
    expect(cache.get('item')).toBe('v2');
  });

  test('handles null, undefined, boolean, and array values correctly', () => {
    cache.set('bool_key', false, 10);
    expect(cache.get('bool_key')).toBe(false);

    cache.set('num_key', 0, 10);
    expect(cache.get('num_key')).toBe(0);

    cache.set('arr_key', [1, 2, 3], 10);
    expect(cache.get('arr_key')).toEqual([1, 2, 3]);
  });
});
