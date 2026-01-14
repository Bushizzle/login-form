import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { signIn } from './client';

describe('auth client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call fetch with correct endpoint and payload', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );

    const result = await signIn('demo@example.com', 'password123');

    expect(result.success).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(vi.mocked(globalThis.fetch).mock.calls[0]?.[0]).toMatch(/api\/auth\/sign-in$/);

    const init = vi.mocked(globalThis.fetch).mock.calls[0]?.[1];
    expect(init?.method).toBe('POST');
    expect(init?.headers).toEqual({ 'content-type': 'application/json' });
    expect(init?.body).toBe(JSON.stringify({ email: 'demo@example.com', password: 'password123' }));
  });

  it('should return invalid credentials when server responds with INVALID_CREDENTIALS', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: false, error: 'INVALID_CREDENTIALS' }), { status: 401 })
    );

    const result = await signIn('wrong@example.com', 'wrongpassword');

    expect(result).toEqual({ success: false, error: 'INVALID_CREDENTIALS' });
  });

  it('should map fetch rejection to NETWORK_ERROR', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new TypeError('Network error'));

    const result = await signIn('demo@example.com', 'password123');

    expect(result).toEqual({ success: false, error: 'NETWORK_ERROR' });
  });

  it('should map non-JSON / unexpected error payload to NETWORK_ERROR', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response('nope', { status: 500 }));

    const result = await signIn('demo@example.com', 'password123');

    expect(result).toEqual({ success: false, error: 'NETWORK_ERROR' });
  });
});

